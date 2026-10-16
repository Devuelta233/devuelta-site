// Paiement en ligne (Paystack : cartes du monde entier et Mobile Money).
// Actif seulement quand la clé secrète PAYSTACK_SECRET_KEY est posée sur le
// Worker (secret Cloudflare, jamais dans le code). Sans elle, l'outil dit que
// le paiement en ligne n'est pas encore activé et rien d'autre ne change.
//
// Les prix sont en euros ; Paystack débite dans la devise du compte (cedis par
// défaut) : on convertit au taux du jour, gardé en base et rafraîchi chaque jour.

import { emailPaiementRecu } from '../shared/emails';
import { CHEMIN_PAIEMENT_RECU } from '../shared/paiement';
import { SITE_URL } from '../shared/site';
import { isLang, type Lang } from '../shared/vocab';
import { newId, randomBytes, toHex } from './crypto';
import { getParam, journal, setParam } from './db';
import { envoyerCourriel } from './email';
import { notifier } from './push';
import { HttpError, json, nowIso, type Env } from './util';

const API = 'https://api.paystack.co';

export type TypePaiement = 'ouverture' | 'solde';

export function paiementActif(env: Env): boolean {
  return !!env.PAYSTACK_SECRET_KEY;
}

export function devise(env: Env): string {
  return (env.PAIEMENT_DEVISE || 'GHS').toUpperCase();
}

/** Taux du jour : 1 € = x unités de la devise de paiement. */
export async function tauxDuJour(env: Env, d = devise(env)): Promise<number> {
  if (d === 'EUR') return 1;
  const cle = `taux_eur_${d.toLowerCase()}`;
  const garde = await getParam(env.DB, cle, '');
  const [valeur, le] = garde.split('|');
  const recent = le && Date.now() - Date.parse(le) < 36 * 3600 * 1000;
  if (valeur && recent) return Number(valeur);
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/EUR', { cf: { cacheTtl: 3600 } } as RequestInit);
    const j = (await r.json()) as { result?: string; rates?: Record<string, number> };
    const t = j.rates?.[d];
    if (j.result === 'success' && t && t > 0) {
      await setParam(env.DB, cle, `${t}|${nowIso()}`);
      return t;
    }
  } catch {
    /* on garde le dernier taux connu */
  }
  if (valeur) return Number(valeur);
  throw new HttpError(503, 'taux-indisponible');
}

interface Demande {
  dossierId: string;
  ref: string;
  lang: Lang;
  email: string;
  type: TypePaiement;
  montantEur: number;
  utilisateurId?: string | null;
}

export interface LienPaiement {
  lien: string;
  montantEur: number;
  devise: string;
  montantDevise: number;
}

/** Crée (ou reprend) le lien de paiement d'un dossier. Null si le paiement n'est pas activé. */
export async function lienPaiement(env: Env, p: Demande): Promise<LienPaiement | null> {
  if (!paiementActif(env)) return null;
  if (!(p.montantEur > 0)) throw new HttpError(400, 'montant-invalide');
  const existant = await env.DB.prepare(
    "SELECT lien, montant_eur, devise, montant_devise FROM paiements WHERE dossier_id = ? AND type = ? AND statut = 'en-attente' AND montant_eur = ? AND cree_le > ? ORDER BY cree_le DESC LIMIT 1",
  )
    .bind(p.dossierId, p.type, p.montantEur, new Date(Date.now() - 20 * 3600 * 1000).toISOString())
    .first<{ lien: string; montant_eur: number; devise: string; montant_devise: number }>();
  if (existant?.lien) {
    return { lien: existant.lien, montantEur: existant.montant_eur, devise: existant.devise, montantDevise: existant.montant_devise };
  }
  const d = devise(env);
  const taux = await tauxDuJour(env, d);
  const montantDevise = Math.round(p.montantEur * taux * 100); // centimes ou pesewas
  const reference = `${p.ref}-${p.type === 'ouverture' ? 'O' : 'S'}-${toHex(randomBytes(3))}`;
  const r = await fetch(`${API}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: p.email,
      amount: montantDevise,
      currency: d,
      reference,
      callback_url: `${SITE_URL}${CHEMIN_PAIEMENT_RECU[p.lang]}`,
      metadata: { dossier: p.ref, type: p.type, montant_eur: p.montantEur, cancel_action: SITE_URL },
    }),
  });
  const j = (await r.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: { authorization_url?: string } };
  const lien = j.data?.authorization_url;
  if (!r.ok || !j.status || !lien) {
    await journal(env.DB, { action: 'paiement-erreur', objet: 'dossier', objet_id: p.dossierId, dossier_id: p.dossierId, details: { http: r.status, message: j.message ?? null } });
    throw new HttpError(502, 'paiement-indisponible');
  }
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO paiements (id, dossier_id, type, reference, montant_eur, devise, montant_devise, taux, lien, statut, cree_le, cree_par)
       VALUES (?,?,?,?,?,?,?,?,?,'en-attente',?,?)`,
    ).bind(newId(), p.dossierId, p.type, reference, p.montantEur, d, montantDevise, taux, lien, nowIso(), p.utilisateurId ?? null),
  ]);
  await journal(env.DB, {
    utilisateur_id: p.utilisateurId ?? null,
    action: 'paiement-demande',
    objet: 'dossier',
    objet_id: p.dossierId,
    dossier_id: p.dossierId,
    details: { type: p.type, montant_eur: p.montantEur, devise: d },
  });
  return { lien, montantEur: p.montantEur, devise: d, montantDevise };
}

async function hmacSha512Hex(cle: string, texte: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(cle), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(texte)));
}

/**
 * Notification de Paystack (POST /api/paiement/paystack). On vérifie la
 * signature, puis on revérifie la transaction auprès de Paystack avant de la
 * marquer payée. Réponse 200 rapide, sinon Paystack renvoie la notification.
 */
export async function webhookPaystack(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  if (!env.PAYSTACK_SECRET_KEY) throw new HttpError(404, 'introuvable');
  const brut = await request.text();
  if (brut.length > 200_000) throw new HttpError(413, 'trop-gros');
  const signature = request.headers.get('x-paystack-signature') ?? '';
  if (signature !== (await hmacSha512Hex(env.PAYSTACK_SECRET_KEY, brut))) throw new HttpError(401, 'signature-invalide');
  const evt = JSON.parse(brut) as { event?: string; data?: { reference?: string } };
  if (evt.event === 'charge.success' && evt.data?.reference) ctx.waitUntil(confirmer(env, evt.data.reference).catch(() => undefined));
  return json({ ok: true });
}

async function confirmer(env: Env, reference: string): Promise<void> {
  const p = await env.DB.prepare(
    `SELECT p.id, p.dossier_id, p.type, p.montant_eur, p.devise, p.montant_devise, p.statut,
            d.ref, d.langue, d.client_pseudo, d.client_email, d.assigne_a
       FROM paiements p JOIN dossiers d ON d.id = p.dossier_id WHERE p.reference = ?`,
  )
    .bind(reference)
    .first<{
      id: string;
      dossier_id: string;
      type: TypePaiement;
      montant_eur: number;
      devise: string;
      montant_devise: number;
      statut: string;
      ref: string;
      langue: string;
      client_pseudo: string;
      client_email: string | null;
      assigne_a: string | null;
    }>();
  if (!p || p.statut === 'paye') return;
  // Double vérification auprès de Paystack : statut, montant et devise.
  const r = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });
  const j = (await r.json().catch(() => ({}))) as { data?: { status?: string; amount?: number; currency?: string; channel?: string } };
  const t = j.data;
  if (!t || t.status !== 'success' || t.amount !== p.montant_devise || (t.currency ?? '').toUpperCase() !== p.devise) {
    await journal(env.DB, { action: 'paiement-anomalie', objet: 'dossier', objet_id: p.dossier_id, dossier_id: p.dossier_id, details: { reference } });
    return;
  }
  const now = nowIso();
  const res = await env.DB.prepare("UPDATE paiements SET statut = 'paye', paye_le = ?, canal = ? WHERE id = ? AND statut != 'paye'")
    .bind(now, t.channel ?? null, p.id)
    .run();
  if ((res.meta?.changes ?? 0) === 0) return;
  await journal(env.DB, {
    action: 'paiement-recu',
    objet: 'dossier',
    objet_id: p.dossier_id,
    dossier_id: p.dossier_id,
    details: { type: p.type, montant_eur: p.montant_eur, canal: t.channel ?? null },
  });
  const lang: Lang = isLang(p.langue) ? p.langue : 'fr';
  await Promise.all([
    notifier(env.DB, [p.assigne_a]).catch(() => 0),
    envoyerCourriel(env, p.client_email, emailPaiementRecu({ pseudo: p.client_pseudo, ref: p.ref, montantEur: p.montant_eur, type: p.type }, lang), {
      type: 'paiement-recu',
      objet: 'dossier',
      objet_id: p.dossier_id,
      dossier_id: p.dossier_id,
    }),
  ]);
}
