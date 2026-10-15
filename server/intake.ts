// Formulaire public « Confier mon dossier » : POST /api/demande
// Reçoit le minimum nécessaire pour recontacter la personne. Aucune image.

import { CONSENTEMENT_VERSION, isLang, isPays, isSituation } from '../shared/vocab';
import { randomBytes, sha256Hex, toHex, newId } from './crypto';
import { assigneePourLangue, getParam, journal, nextRef } from './db';
import { notifier } from './push';
import { compterEvenement } from './stats';
import {
  HttpError,
  addMinutes,
  bool,
  cleanEmail,
  cleanPhone,
  cleanText,
  cleanUrls,
  clientIp,
  json,
  memeOrigine,
  nowIso,
  readJson,
  type Env,
} from './util';

const PLATEFORME_OK = /^[a-z0-9-]{2,30}$/;

async function ipHash(env: Env, ip: string): Promise<string> {
  // L'adresse IP n'est jamais stockée : seulement une empreinte salée,
  // utile pour limiter les envois abusifs, effacée avec la demande.
  let sel = await getParam(env.DB, 'sel_ip', '');
  if (!sel) {
    await env.DB.prepare('INSERT OR IGNORE INTO parametres (cle, valeur) VALUES (?, ?)').bind('sel_ip', toHex(randomBytes(16))).run();
    sel = await getParam(env.DB, 'sel_ip', '');
  }
  return sha256Hex(`${sel}:${ip}`);
}

export async function recevoirDemande(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  if (!memeOrigine(request)) throw new HttpError(403, 'origine-refusee');

  const body = await readJson(request, 20_000);

  // Champ piège invisible : un robot le remplit, un humain non.
  if (typeof body.site_web === 'string' && body.site_web.trim() !== '') {
    return json({ ok: true, ref: 'D-0000-0000' });
  }
  if (bool(body.mineur)) throw new HttpError(400, 'mineur');
  if (body.consentement !== true) throw new HttpError(400, 'consentement-requis');

  const langue = isLang(body.langue) ? body.langue : 'fr';
  const situation = isSituation(body.situation) ? body.situation : 'autre';
  const pays = isPays(body.pays) ? body.pays : null;
  const pseudo = cleanText(body.pseudo, 60, { required: true })!;
  const contactMode = body.contact_mode === 'whatsapp' ? 'whatsapp' : body.contact_mode === 'email' ? 'email' : null;
  if (!contactMode) throw new HttpError(400, 'contact-invalide');
  const contactValeur = contactMode === 'email' ? cleanEmail(body.contact_valeur)! : cleanPhone(body.contact_valeur)!;
  const liens = cleanUrls(body.liens, 30);
  const message = cleanText(body.message, 2000, { multiline: true });
  const plateformes = Array.isArray(body.plateformes)
    ? body.plateformes.filter((p): p is string => typeof p === 'string' && PLATEFORME_OK.test(p)).slice(0, 20)
    : [];
  const publieParSoi = body.publie_par_soi === true ? 1 : body.publie_par_soi === false ? 0 : null;

  const hash = await ipHash(env, clientIp(request));
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM demandes WHERE ip_hash = ? AND recue_le > ?')
    .bind(hash, addMinutes(nowIso(), -60))
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= 5) throw new HttpError(429, 'trop-de-demandes');

  const id = newId();
  const ref = await nextRef(env.DB, 'D');
  const now = nowIso();
  const assigne = await assigneePourLangue(env.DB, langue);
  await env.DB.prepare(
    `INSERT INTO demandes (id, ref, recue_le, langue, pays, situation, plateformes, liens, message, pseudo,
      contact_mode, contact_valeur, menace, deja_signale, publie_par_soi, consentement_version, consentement_le,
      statut, assigne_a, ip_hash)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'nouvelle',?,?)`,
  )
    .bind(
      id,
      ref,
      now,
      langue,
      pays,
      situation,
      JSON.stringify(plateformes),
      JSON.stringify(liens),
      message,
      pseudo,
      contactMode,
      contactValeur,
      bool(body.menace) ? 1 : 0,
      bool(body.deja_signale) ? 1 : 0,
      publieParSoi,
      CONSENTEMENT_VERSION,
      now,
      assigne,
      hash,
    )
    .run();
  await journal(env.DB, { action: 'demande-recue', objet: 'demande', objet_id: id, details: { ref, langue, situation } });
  // Alerte immédiate sur le téléphone de la personne désignée (ou des admins).
  ctx.waitUntil(
    Promise.all([notifier(env.DB, [assigne]), compterEvenement(env.DB, 'demande')]).catch(() => undefined),
  );
  return json({ ok: true, ref });
}
