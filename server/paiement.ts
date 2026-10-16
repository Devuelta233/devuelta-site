// Paiement en ligne (Paystack : cartes du monde entier et Mobile Money).
// Actif seulement quand la clé secrète PAYSTACK_SECRET_KEY est posée sur le
// Worker (secret Cloudflare, jamais dans le code). Sans elle, l'outil dit que
// le paiement en ligne n'est pas encore activé et rien d'autre ne change.
//
// Clé de test (sk_test_…) : tout fonctionne avec les cartes de test de Paystack,
// sans vrai argent. Les paiements sont alors marqués « test », et aucun lien ne
// part tout seul vers un client : seul le bouton de l'outil en crée.
//
// Les prix sont en euros ; Paystack débite dans la devise du compte (cedis par
// défaut) : on convertit au taux du jour, gardé en base et rafraîchi chaque jour.
//
// Un paiement n'est marqué « payé » qu'après l'avoir redemandé à Paystack (on ne
// croit jamais le navigateur). Trois occasions : la notification de Paystack
// (webhook), le retour du client sur la page « paiement reçu », et chaque matin
// pour les liens encore en attente (si une notification s'est perdue).

import { emailPaiementRecu } from '../shared/emails';
import { CHEMIN_PAIEMENT_RECU } from '../shared/paiement';
import { SITE_URL } from '../shared/site';
import { isLang, type Lang } from '../shared/vocab';
import { newId, randomBytes, toHex } from './crypto';
import { getParam, journal, setParam } from './db';
import { envoyerCourriel } from './email';
import { notifier } from './push';
import { HttpError, addDays, json, nowIso, type Env } from './util';

const API = 'https://api.paystack.co';

export type TypePaiement = 'ouverture' | 'solde';

/** État d'un paiement vu de l'extérieur (page de retour) : rien d'autre n'est dit. */
export type EtatPaiement = 'paye' | 'en-attente' | 'inconnu';

/** Références créées par lienPaiement (dossier-O|S-hex), et rien d'autre. */
const REFERENCE_VALIDE = /^[A-Za-z0-9._=-]{6,100}$/;

export function paiementActif(env: Env): boolean {
  return !!env.PAYSTACK_SECRET_KEY;
}

/** Clé de test Paystack (sk_test_…) : paiements fictifs, avec les cartes de test de Paystack. */
export function modeTest(env: Env): boolean {
  return (env.PAYSTACK_SECRET_KEY ?? '').startsWith('sk_test_');
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
  const test = modeTest(env) ? 1 : 0;
  const existant = await env.DB.prepare(
    "SELECT lien, montant_eur, devise, montant_devise FROM paiements WHERE dossier_id = ? AND type = ? AND statut = 'en-attente' AND test = ? AND montant_eur = ? AND cree_le > ? ORDER BY cree_le DESC LIMIT 1",
  )
    .bind(p.dossierId, p.type, test, p.montantEur, new Date(Date.now() - 20 * 3600 * 1000).toISOString())
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
      `INSERT INTO paiements (id, dossier_id, type, reference, montant_eur, devise, montant_devise, taux, lien, statut, cree_le, cree_par, test)
       VALUES (?,?,?,?,?,?,?,?,?,'en-attente',?,?,?)`,
    ).bind(newId(), p.dossierId, p.type, reference, p.montantEur, d, montantDevise, taux, lien, nowIso(), p.utilisateurId ?? null, test),
  ]);
  await journal(env.DB, {
    utilisateur_id: p.utilisateurId ?? null,
    action: 'paiement-demande',
    objet: 'dossier',
    objet_id: p.dossierId,
    dossier_id: p.dossierId,
    details: { type: p.type, montant_eur: p.montantEur, devise: d, ...(test ? { test: true } : {}) },
  });
  return { lien, montantEur: p.montantEur, devise: d, montantDevise };
}

async function hmacSha512Hex(cle: string, texte: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(cle), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(texte)));
}

/** Comparaison à temps constant : la durée ne trahit pas où les textes diffèrent. */
function egaux(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Signature Paystack : HMAC SHA-512 du corps brut, avec la clé secrète. */
export async function signatureValide(cle: string, brut: string, signature: string | null): Promise<boolean> {
  if (!cle || !signature) return false;
  return egaux(signature.trim().toLowerCase(), await hmacSha512Hex(cle, brut));
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
  if (!(await signatureValide(env.PAYSTACK_SECRET_KEY, brut, request.headers.get('x-paystack-signature')))) {
    throw new HttpError(401, 'signature-invalide');
  }
  let evt: { event?: string; data?: { reference?: string } };
  try {
    evt = JSON.parse(brut);
  } catch {
    throw new HttpError(400, 'json-invalide');
  }
  if (evt.event === 'charge.success' && evt.data?.reference) ctx.waitUntil(confirmer(env, evt.data.reference).catch(() => undefined));
  return json({ ok: true });
}

/**
 * Retour du client après paiement (GET /api/paiement/verifier?reference=…).
 * Paystack ajoute la référence à l'adresse de retour ; on redemande l'état à
 * Paystack, et la réponse ne dit que « payé » ou « en attente ».
 */
export async function verifierRetour(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') throw new HttpError(405, 'methode-non-autorisee');
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || '';
  let statut: EtatPaiement = 'inconnu';
  if (paiementActif(env) && REFERENCE_VALIDE.test(reference)) {
    statut = await confirmer(env, reference).catch((): EtatPaiement => 'en-attente');
  }
  return json({ statut });
}

/** Filet de sécurité du matin : redemande l'état des liens récents encore en attente. */
export async function verifierEnAttente(env: Env): Promise<{ verifies: number; payes: number }> {
  if (!paiementActif(env)) return { verifies: 0, payes: 0 };
  const r = await env.DB.prepare("SELECT reference FROM paiements WHERE statut = 'en-attente' AND test = ? AND cree_le > ? ORDER BY cree_le DESC LIMIT 25")
    .bind(modeTest(env) ? 1 : 0, addDays(nowIso(), -10))
    .all<{ reference: string }>();
  let payes = 0;
  for (const { reference } of r.results) {
    if ((await confirmer(env, reference).catch(() => 'en-attente')) === 'paye') payes++;
  }
  return { verifies: r.results.length, payes };
}

async function confirmer(env: Env, reference: string): Promise<EtatPaiement> {
  const p = await env.DB.prepare(
    `SELECT p.id, p.dossier_id, p.type, p.montant_eur, p.devise, p.montant_devise, p.statut, p.test,
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
      test: number;
      ref: string;
      langue: string;
      client_pseudo: string;
      client_email: string | null;
      assigne_a: string | null;
    }>();
  if (!p) return 'inconnu';
  if (p.statut === 'paye') return 'paye';
  // « anomalie » : une personne de l'équipe vérifie dans Paystack, rien d'automatique.
  if (p.statut !== 'en-attente') return 'en-attente';
  // Un lien de test ne se vérifie qu'avec la clé de test, et un vrai lien qu'avec la vraie clé.
  if (!!p.test !== modeTest(env)) return 'en-attente';
  // Double vérification auprès de Paystack : statut, montant et devise.
  const r = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });
  const j = (await r.json().catch(() => ({}))) as { data?: { status?: string; amount?: number; currency?: string; channel?: string } };
  const t = j.data;
  // Pas encore payé (abandonné, en cours, refusé…) : on attend, sans rien noter.
  if (!t || t.status !== 'success') return 'en-attente';
  if (t.amount !== p.montant_devise || (t.currency ?? '').toUpperCase() !== p.devise) {
    // Payé, mais pas le montant ou la devise prévus : on le signale une seule fois.
    const marque = await env.DB.prepare("UPDATE paiements SET statut = 'anomalie' WHERE id = ? AND statut = 'en-attente'").bind(p.id).run();
    if ((marque.meta?.changes ?? 0) > 0) {
      await journal(env.DB, {
        action: 'paiement-anomalie',
        objet: 'dossier',
        objet_id: p.dossier_id,
        dossier_id: p.dossier_id,
        details: { reference, attendu: p.montant_devise, recu: t.amount ?? null, devise: t.currency ?? null },
      });
      await notifier(env.DB, [p.assigne_a]).catch(() => 0);
    }
    return 'en-attente';
  }
  const now = nowIso();
  const res = await env.DB.prepare("UPDATE paiements SET statut = 'paye', paye_le = ?, canal = ? WHERE id = ? AND statut = 'en-attente'")
    .bind(now, t.channel ?? null, p.id)
    .run();
  // Déjà confirmé au même instant par une autre voie (notification ou retour du client).
  if ((res.meta?.changes ?? 0) === 0) return 'paye';
  await journal(env.DB, {
    action: 'paiement-recu',
    objet: 'dossier',
    objet_id: p.dossier_id,
    dossier_id: p.dossier_id,
    details: { type: p.type, montant_eur: p.montant_eur, canal: t.channel ?? null, ...(p.test ? { test: true } : {}) },
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
  return 'paye';
}
