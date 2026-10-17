// Formulaire public « Confier mon dossier » : POST /api/demande
// Reçoit le minimum nécessaire pour recontacter la personne. Aucune image.
// Le robot Telegram crée ses demandes par le même chemin (enregistrerDemande).

import { CONSENTEMENT_VERSION, isLang, isPays, isSituation, type Lang, type Situation } from '../shared/vocab';
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
import { emailDemandeRecue } from '../shared/emails';
import { SITE_URL } from '../shared/site';
import { calculerPrix, zoneDuPays } from '../shared/tarifs';
import { situationPath } from '../src/i18n/routes';
import { envoyerCourriel } from './email';

const PLATEFORME_OK = /^[a-z0-9-]{2,30}$/;

export async function ipHash(env: Env, ip: string): Promise<string> {
  // L'adresse IP n'est jamais stockée : seulement une empreinte salée,
  // utile pour limiter les envois abusifs, effacée avec la demande.
  let sel = await getParam(env.DB, 'sel_ip', '');
  if (!sel) {
    await env.DB.prepare('INSERT OR IGNORE INTO parametres (cle, valeur) VALUES (?, ?)').bind('sel_ip', toHex(randomBytes(16))).run();
    sel = await getParam(env.DB, 'sel_ip', '');
  }
  return sha256Hex(`${sel}:${ip}`);
}

/** Le guide gratuit qui correspond à la situation (aucun pour « autre situation »). */
export function lienGuide(situation: Situation, langue: Lang): string | null {
  return situation !== 'autre' ? `${SITE_URL}${situationPath(situation, langue)}` : null;
}

/** Une demande, d'où qu'elle vienne : le formulaire du site ou le robot Telegram. */
export interface NouvelleDemande {
  source: 'site' | 'telegram';
  langue: Lang;
  situation: Situation;
  pays: string | null;
  plateformes: string[];
  liens: string[];
  message: string | null;
  pseudo: string;
  contactMode: 'email' | 'whatsapp' | 'telegram';
  contactValeur: string;
  menace: boolean;
  dejaSignale: boolean;
  publieParSoi: 0 | 1 | null;
  ipHash: string | null;
  /** Conversation Telegram où l'équipe répond (demandes venues du robot). */
  telegramChatId?: string | null;
  /** Texte d'accord accepté (par défaut : celui du formulaire du site). */
  consentementVersion?: string;
}

/**
 * Enregistre la demande, l'attribue selon la langue et prévient tout de suite
 * la personne désignée (ou les admins). Même chemin pour le site et Telegram.
 */
export async function enregistrerDemande(env: Env, ctx: ExecutionContext, d: NouvelleDemande): Promise<{ id: string; ref: string }> {
  const id = newId();
  const ref = await nextRef(env.DB, 'D');
  const now = nowIso();
  const assigne = await assigneePourLangue(env.DB, d.langue);
  await env.DB.prepare(
    `INSERT INTO demandes (id, ref, recue_le, langue, pays, situation, plateformes, liens, message, pseudo,
      contact_mode, contact_valeur, menace, deja_signale, publie_par_soi, consentement_version, consentement_le,
      statut, assigne_a, ip_hash, source, telegram_chat_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'nouvelle',?,?,?,?)`,
  )
    .bind(
      id,
      ref,
      now,
      d.langue,
      d.pays,
      d.situation,
      JSON.stringify(d.plateformes),
      JSON.stringify(d.liens),
      d.message,
      d.pseudo,
      d.contactMode,
      d.contactValeur,
      d.menace ? 1 : 0,
      d.dejaSignale ? 1 : 0,
      d.publieParSoi,
      d.consentementVersion ?? CONSENTEMENT_VERSION,
      now,
      assigne,
      d.ipHash,
      d.source,
      d.telegramChatId ?? null,
    )
    .run();
  await journal(env.DB, { action: 'demande-recue', objet: 'demande', objet_id: id, details: { ref, langue: d.langue, situation: d.situation, source: d.source } });
  // Alerte immédiate sur le téléphone de la personne désignée (ou des admins).
  ctx.waitUntil(
    Promise.all([notifier(env.DB, [assigne]), compterEvenement(env.DB, 'demande')]).catch(() => undefined),
  );
  return { id, ref };
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

  const { id, ref } = await enregistrerDemande(env, ctx, {
    source: 'site',
    langue,
    situation,
    pays,
    plateformes,
    liens,
    message,
    pseudo,
    contactMode,
    contactValeur,
    menace: bool(body.menace),
    dejaSignale: bool(body.deja_signale),
    publieParSoi,
    ipHash: hash,
  });
  // Accusé de réception automatique, dans la langue choisie : le guide gratuit qui
  // correspond à la situation et un prix indicatif (confirmé ensuite par l'équipe).
  const zone = zoneDuPays(pays) ?? 'standard';
  const p = calculerPrix(liens.length, 0, zone);
  const estimation = { liens: liens.length, total: p.total, ouverture: p.ouverture, aPartirDe: calculerPrix(1, 0, zone).total ?? 0 };
  const guide = lienGuide(situation, langue);
  const confirmation =
    contactMode === 'email' &&
    (await envoyerCourriel(env, contactValeur, emailDemandeRecue({ pseudo, ref, menace: bool(body.menace), guide, estimation }, langue), {
      type: 'demande-recue',
      objet: 'demande',
      objet_id: id,
    }));
  return json({ ok: true, ref, confirmation });
}
