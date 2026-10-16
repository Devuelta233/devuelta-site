// Page publique de signature : POST /api/signature/lire et /api/signature/signer.
// Le jeton (dans l'adresse, après #) n'est jamais stocké : seulement son empreinte.

import { emailSigne } from '../shared/emails';
import { dateHeureGmt } from '../shared/retractation';
import { documentSigne, type ResumeDevis } from '../shared/signature';
import { euros } from '../shared/tarifs';
import { isLang, type Lang } from '../shared/vocab';
import { sha256Hex } from './crypto';
import { journalStmt } from './db';
import { envoyerCourriel } from './email';
import { lienPaiement, modeTest, type LienPaiement } from './paiement';
import { ipHash } from './intake';
import { notifier } from './push';
import { HttpError, cleanText, clientIp, json, memeOrigine, nowIso, readJson, type Env } from './util';

interface LigneSignature {
  id: string;
  dossier_id: string;
  langue: string;
  document: string;
  resume: string;
  representant: string;
  expire_le: string;
  annule_le: string | null;
  signe_le: string | null;
  document_signe: string | null;
}

async function charger(env: Env, request: Request): Promise<{ s: LigneSignature; body: Record<string, unknown> }> {
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  if (!memeOrigine(request)) throw new HttpError(403, 'origine-refusee');
  const body = await readJson(request, 4_000);
  const jeton = typeof body.jeton === 'string' ? body.jeton.trim() : '';
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(jeton)) throw new HttpError(404, 'lien-introuvable');
  const s = await env.DB.prepare(
    'SELECT id, dossier_id, langue, document, resume, representant, expire_le, annule_le, signe_le, document_signe FROM signatures WHERE jeton_hash = ?',
  )
    .bind(await sha256Hex(jeton))
    .first<LigneSignature>();
  if (!s) throw new HttpError(404, 'lien-introuvable');
  return { s, body };
}

function etat(s: LigneSignature): 'signe' | 'annule' | 'expire' | 'a-signer' {
  if (s.signe_le) return 'signe';
  if (s.annule_le) return 'annule';
  if (s.expire_le <= nowIso()) return 'expire';
  return 'a-signer';
}

export async function lireSignature(request: Request, env: Env): Promise<Response> {
  const { s } = await charger(env, request);
  const statut = etat(s);
  return json({
    ok: true,
    statut,
    langue: s.langue,
    document: statut === 'a-signer' ? s.document : null,
    resume: statut === 'a-signer' ? (JSON.parse(s.resume) as ResumeDevis) : null,
    document_signe: statut === 'signe' ? s.document_signe : null,
    signe_le: s.signe_le,
  });
}

export async function signer(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { s, body } = await charger(env, request);
  const statut = etat(s);
  if (statut === 'signe') throw new HttpError(409, 'deja-signe');
  if (statut !== 'a-signer') throw new HttpError(410, statut === 'expire' ? 'lien-expire' : 'lien-annule');
  if (body.cgv !== true) throw new HttpError(400, 'cgv-requises');
  const nom = cleanText(body.nom, 120, { required: true })!;
  if (nom.replace(/[^\p{L}]/gu, '').length < 3) throw new HttpError(400, 'nom-invalide');
  const debutImmediat = body.debut_immediat === true;
  const lang: Lang = isLang(s.langue) ? s.langue : 'fr';
  const now = nowIso();
  const signeTexte = documentSigne(
    s.document,
    { nom, signeLe: now, quand: dateHeureGmt(now, lang), debutImmediat, representant: s.representant },
    lang,
  );
  const hash = await ipHash(env, clientIp(request));
  const dossier = await env.DB.prepare(
    `SELECT d.id, d.ref, d.client_pseudo, d.client_email, d.assigne_a, u.nom AS assigne_nom, u.whatsapp AS assigne_whatsapp
       FROM dossiers d LEFT JOIN utilisateurs u ON u.id = d.assigne_a WHERE d.id = ?`,
  )
    .bind(s.dossier_id)
    .first<{
      id: string;
      ref: string;
      client_pseudo: string;
      client_email: string | null;
      assigne_a: string | null;
      assigne_nom: string | null;
      assigne_whatsapp: string | null;
    }>();
  if (!dossier) throw new HttpError(404, 'lien-introuvable');
  const res = await env.DB.batch([
    env.DB.prepare(
      'UPDATE signatures SET signe_le = ?, nom_signe = ?, debut_immediat = ?, document_signe = ?, ip_hash = ? WHERE id = ? AND signe_le IS NULL AND annule_le IS NULL',
    ).bind(now, nom, debutImmediat ? 1 : 0, signeTexte, hash, s.id),
    env.DB.prepare('UPDATE dossiers SET mandat_signe_le = ?, client_nom = COALESCE(client_nom, ?), maj_le = ? WHERE id = ?').bind(
      now.slice(0, 10),
      nom,
      now,
      dossier.id,
    ),
    journalStmt(env.DB, {
      action: 'mandat-signe-en-ligne',
      objet: 'dossier',
      objet_id: dossier.id,
      dossier_id: dossier.id,
      details: { document_hash: await sha256Hex(s.document), debut_immediat: debutImmediat },
    }),
  ]);
  if ((res[0].meta?.changes ?? 1) === 0) throw new HttpError(409, 'deja-signe');
  // Alerte immédiate pour la personne qui suit le dossier.
  ctx.waitUntil(notifier(env.DB, [dossier.assigne_a]).catch(() => 0));
  // Copie signée par e-mail (support durable), avec le WhatsApp de la personne qui suit le dossier
  // et, si le paiement en ligne est activé, le lien de paiement d'ouverture.
  // Clé de test : aucun lien fictif ne part tout seul vers un client.
  const resume = JSON.parse(s.resume) as ResumeDevis;
  let paiement: LienPaiement | null = null;
  if (dossier.client_email && !modeTest(env)) {
    paiement = await lienPaiement(env, {
      dossierId: dossier.id,
      ref: dossier.ref,
      lang,
      email: dossier.client_email,
      type: 'ouverture',
      montantEur: resume.ouverture,
    }).catch(() => null);
  }
  const copie = emailSigne(
    {
      pseudo: dossier.client_pseudo,
      ref: dossier.ref,
      documentSigne: signeTexte,
      prenom: dossier.assigne_nom,
      whatsapp: dossier.assigne_whatsapp,
      ouverture: euros(resume.ouverture, lang),
      debutImmediat,
      lienPaiement: paiement?.lien ?? null,
      devise: paiement?.devise ?? null,
    },
    lang,
  );
  const copieEnvoyee = await envoyerCourriel(env, dossier.client_email, copie, {
    type: 'signe',
    objet: 'dossier',
    objet_id: dossier.id,
    dossier_id: dossier.id,
  });
  return json({ ok: true, signe_le: now, document_signe: signeTexte, copie_envoyee: copieEnvoyee });
}
