// Formulaire public « Renoncer au contrat ici » : POST /api/retractation
// Obligatoire dans l'UE depuis le 19 juin 2026 pour les contrats conclus en
// ligne (article 11 bis de la directive 2011/83/UE). On enregistre le nom, le
// contrat concerné et où envoyer l'accusé de réception, avec la date et l'heure.
// L'équipe est prévenue tout de suite et envoie l'accusé depuis le tableau de bord.

import { sujetAccuse } from '../shared/emails';
import { texteAccuse } from '../shared/retractation';
import { isLang } from '../shared/vocab';
import { envoyerCourriel } from './email';
import { newId } from './crypto';
import { journal, nextRef } from './db';
import { ipHash } from './intake';
import { notifier } from './push';
import {
  HttpError,
  addMinutes,
  cleanEmail,
  cleanPhone,
  cleanText,
  clientIp,
  json,
  memeOrigine,
  nowIso,
  readJson,
  type Env,
} from './util';

const REF_DOSSIER = /^DV-\d{4}-\d{1,6}$/;

/** « dv 2026 12 » ou « DV-2026-0012 » : même dossier. */
export function normaliserRefDossier(v: string | null): string | null {
  if (!v) return null;
  const m = v.toUpperCase().match(/DV\D*(\d{4})\D*(\d{1,6})/);
  if (!m) return v.replace(/\s+/g, ' ').slice(0, 40);
  return `DV-${m[1]}-${m[2].padStart(4, '0')}`;
}

export async function recevoirRetractation(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  if (!memeOrigine(request)) throw new HttpError(403, 'origine-refusee');

  const body = await readJson(request, 8_000);
  // Champ piège invisible : un robot le remplit, un humain non.
  if (typeof body.site_web === 'string' && body.site_web.trim() !== '') {
    return json({ ok: true, ref: 'R-0000-0000', recue_le: nowIso() });
  }
  // Le bouton « Confirmer la rétractation » envoie cette valeur : rien ne part sans lui.
  if (body.confirme !== true) throw new HttpError(400, 'confirmation-requise');

  const langue = isLang(body.langue) ? body.langue : 'fr';
  const nom = cleanText(body.nom, 80, { required: true })!;
  const dossierRef = normaliserRefDossier(cleanText(body.dossier, 40));
  const contactMode = body.contact_mode === 'whatsapp' ? 'whatsapp' : body.contact_mode === 'email' ? 'email' : null;
  if (!contactMode) throw new HttpError(400, 'contact-invalide');
  const contactValeur = contactMode === 'email' ? cleanEmail(body.contact_valeur)! : cleanPhone(body.contact_valeur)!;
  const message = cleanText(body.message, 1000, { multiline: true });

  const hash = await ipHash(env, clientIp(request));
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM retractations WHERE ip_hash = ? AND recue_le > ?')
    .bind(hash, addMinutes(nowIso(), -60))
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= 5) throw new HttpError(429, 'trop-de-demandes');

  const dossier =
    dossierRef && REF_DOSSIER.test(dossierRef)
      ? await env.DB.prepare('SELECT id, assigne_a FROM dossiers WHERE ref = ?')
          .bind(dossierRef)
          .first<{ id: string; assigne_a: string | null }>()
      : null;

  const id = newId();
  const ref = await nextRef(env.DB, 'R');
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO retractations (id, ref, recue_le, langue, nom, dossier_ref, dossier_id, contact_mode, contact_valeur, message, ip_hash)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  )
    .bind(id, ref, now, langue, nom, dossierRef, dossier?.id ?? null, contactMode, contactValeur, message, hash)
    .run();
  await journal(env.DB, {
    action: 'retractation-recue',
    objet: 'retractation',
    objet_id: id,
    dossier_id: dossier?.id ?? null,
    details: { ref, dossier_ref: dossierRef },
  });
  // Alerte immédiate : la personne qui suit le dossier, sinon les admins.
  ctx.waitUntil(notifier(env.DB, [dossier?.assigne_a]).catch(() => 0));
  // Accusé de réception automatique (support durable) quand la personne a choisi l'e-mail.
  let accuse = false;
  if (contactMode === 'email') {
    const r = { ref, recue_le: now, nom, dossier_ref: dossierRef, contact_mode: 'email' as const, contact_valeur: contactValeur, message };
    accuse = await envoyerCourriel(env, contactValeur, { sujet: sujetAccuse(ref, langue), texte: texteAccuse(r, langue) }, {
      type: 'accuse-retractation',
      objet: 'retractation',
      objet_id: id,
      dossier_id: dossier?.id ?? null,
    });
    if (accuse) await env.DB.prepare('UPDATE retractations SET accuse_le = ? WHERE id = ?').bind(nowIso(), id).run();
  }
  return json({ ok: true, ref, recue_le: now, accuse });
}
