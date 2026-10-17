// Robot Telegram de Devuelta : POST /api/telegram (webhook).
// Actif seulement quand la clé TELEGRAM_BOT_TOKEN est posée sur le Worker
// (secret Cloudflare, jamais dans le code). Sans elle, la route n'existe pas.
//
// Le robot accueille la personne avec des textes fixes (aucune IA), pose
// quelques questions à boutons, puis crée la demande dans l'outil par le même
// chemin que le formulaire du site (même table, même attribution par langue,
// même alerte à l'équipe). Ensuite, chaque vraie réponse est écrite et envoyée
// par une personne de l'équipe, depuis l'outil.
// Aucune image n'est téléchargée ni gardée : seulement les textes, les réponses
// aux boutons et l'identifiant de la conversation.

import { emailDemandeRecue } from '../shared/emails';
import { CONSENTEMENT_VERSION, LANGS, isLang, isSituation, type Lang, type Situation } from '../shared/vocab';
import { extraireLiens } from '../src/outil/liens';
import { newId, sha256Hex, timingSafeEqualStr } from './crypto';
import { getParamInt } from './db';
import { enregistrerDemande, lienGuide } from './intake';
import { notifier } from './push';
import { ACCUEIL, LIENS_SEULEMENT_3, NOM_LANGUE, TEXTES_TELEGRAM, boutonsSituation, lienDiagnostic } from './telegram-textes';
import { HttpError, addDays, addMinutes, json, normalizeUrl, nowIso, type Env } from './util';

const API = 'https://api.telegram.org';
/** Longueur maximale d'un message gardé (Telegram en accepte 4096). */
export const LONGUEUR_MAX = 4000;
const LIENS_MAX = 30;

// Ce que Telegram nous envoie (seulement les champs utilisés).
interface TgUtilisateur {
  id: number;
  first_name?: string;
  username?: string;
}
interface TgChat {
  id: number;
  type: string;
}
interface TgMessage {
  chat?: TgChat;
  from?: TgUtilisateur;
  text?: string;
  [champ: string]: unknown;
}
interface TgRappel {
  id: string;
  from?: TgUtilisateur;
  message?: { chat?: TgChat };
  data?: string;
}
export interface TgMiseAJour {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgRappel;
}

/** Tout ce qui n'est pas du texte : jamais téléchargé, jamais gardé. */
const NON_TEXTE = ['photo', 'video', 'document', 'voice', 'audio', 'sticker', 'animation', 'video_note', 'contact', 'location', 'venue', 'poll', 'dice', 'story', 'paid_media'];

export function robotActif(env: Env): boolean {
  return !!env.TELEGRAM_BOT_TOKEN;
}

/**
 * Secret attendu dans l'en-tête X-Telegram-Bot-Api-Secret-Token : dérivé de la
 * clé du robot, calculé de la même façon par la mise en ligne (setWebhook).
 */
export async function secretWebhook(token: string): Promise<string> {
  return (await sha256Hex(`devuelta-telegram:${token}`)).slice(0, 48);
}

export interface ReponseTelegram {
  ok: boolean;
  status: number;
  description?: string;
}

/** Appel à l'API Telegram. La clé n'apparaît jamais dans le journal ni dans les erreurs. */
export async function appelTelegram(env: Env, methode: string, corps: Record<string, unknown>): Promise<ReponseTelegram> {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, status: 0 };
  try {
    const r = await fetch(`${API}/bot${env.TELEGRAM_BOT_TOKEN}/${methode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; description?: unknown };
    return { ok: r.ok && j.ok === true, status: r.status, description: typeof j.description === 'string' ? j.description.slice(0, 200) : undefined };
  } catch {
    return { ok: false, status: 0 };
  }
}

export interface Bouton {
  texte: string;
  valeur: string;
}

/** Message en texte simple, sans aperçu de lien (discrétion), avec des boutons éventuels. */
export function envoyerMessage(env: Env, chatId: string, texte: string, lignes?: Bouton[][]): Promise<ReponseTelegram> {
  return appelTelegram(env, 'sendMessage', {
    chat_id: chatId,
    text: texte.slice(0, 4096),
    link_preview_options: { is_disabled: true },
    ...(lignes ? { reply_markup: { inline_keyboard: lignes.map((l) => l.map((b) => ({ text: b.texte, callback_data: b.valeur }))) } } : {}),
  });
}

// Le parcours ----------------------------------------------------------------------

export type Etape = 'langue' | 'age' | 'situation' | 'menace' | 'texte' | 'ouverte' | 'mineur';
const ETAPES: readonly Etape[] = ['langue', 'age', 'situation', 'menace', 'texte', 'ouverte', 'mineur'];

export interface Conversation {
  etape: Etape;
  langue: Lang | null;
  reponses: { situation?: Situation; menace?: boolean };
  demande_id: string | null;
  /** Dernier « bien reçu » envoyé (une fois par heure au plus). */
  accuse_le: string | null;
  /** Dernière consigne « liens seulement » (une fois par minute au plus). */
  media_le: string | null;
}

export type Entree = { type: 'start' } | { type: 'texte'; texte: string } | { type: 'bouton'; valeur: string } | { type: 'media' };

export interface Envoi {
  texte: string;
  boutons?: Bouton[][];
}

export interface Decision {
  /** Nouvel état de la conversation (null : inchangé). */
  etat: Conversation | null;
  envois: Envoi[];
  /** Dernière réponse : créer la demande avec ce texte. */
  creer?: string;
  /** Message suivant, à ajouter à la demande (et l'équipe est prévenue). */
  ajouter?: string;
}

function nouvelle(): Conversation {
  return { etape: 'langue', langue: null, reponses: {}, demande_id: null, accuse_le: null, media_le: null };
}

function accueil(): Envoi {
  return { texte: ACCUEIL, boutons: [LANGS.map((l) => ({ texte: NOM_LANGUE[l], valeur: `l:${l}` }))] };
}

/** La question de chaque étape, avec ses boutons. */
export function question(etape: Etape, lang: Lang): Envoi {
  const t = TEXTES_TELEGRAM[lang];
  if (etape === 'age') return { texte: t.age, boutons: [[{ texte: t.oui, valeur: 'a:oui' }, { texte: t.non, valeur: 'a:non' }]] };
  if (etape === 'situation') return { texte: t.situation, boutons: boutonsSituation(lang).map((s) => [{ texte: s.texte, valeur: `s:${s.valeur}` }]) };
  if (etape === 'menace') return { texte: t.menace, boutons: [[{ texte: t.oui, valeur: 'm:oui' }, { texte: t.non, valeur: 'm:non' }]] };
  if (etape === 'texte') return { texte: t.liens };
  return accueil();
}

const RIEN: Decision = { etat: null, envois: [] };

/**
 * Le cœur du robot, sans base ni réseau : à partir de l'état de la conversation
 * et de ce que la personne vient d'envoyer, ce qu'il faut répondre et retenir.
 */
export function decider(conv: Conversation | null, e: Entree, contexte: { maintenant: string; ref?: string | null; spam?: boolean }): Decision {
  const { maintenant } = contexte;
  if (e.type === 'media') {
    if (conv?.etape === 'ouverte' && contexte.spam) return RIEN;
    // Un album de photos arrive en plusieurs messages : une seule consigne par minute.
    if (conv?.media_le && conv.media_le > addMinutes(maintenant, -1)) return RIEN;
    const texte = conv?.langue ? TEXTES_TELEGRAM[conv.langue].liensSeulement : LIENS_SEULEMENT_3;
    return { etat: { ...(conv ?? nouvelle()), media_le: maintenant }, envois: [{ texte }] };
  }

  // Demande déjà ouverte : chaque message rejoint le dossier, sans nouveau parcours.
  if (conv?.etape === 'ouverte') {
    if (contexte.spam || e.type === 'bouton') return RIEN;
    const t = TEXTES_TELEGRAM[conv.langue ?? 'fr'];
    const accuser = !conv.accuse_le || conv.accuse_le <= addMinutes(maintenant, -60);
    const etat = accuser ? { ...conv, accuse_le: maintenant } : null;
    if (e.type === 'start') return accuser ? { etat, envois: [{ texte: t.dejaOuverte.replace('{ref}', contexte.ref ?? '') }] } : RIEN;
    return { etat, envois: accuser ? [{ texte: t.recu }] : [], ajouter: e.texte };
  }

  if (e.type === 'start') return { etat: { ...nouvelle(), media_le: conv?.media_le ?? null }, envois: [accueil()] };

  if (e.type === 'texte') {
    // Pas de parcours en cours : l'accueil, dans les trois langues.
    if (!conv || conv.etape === 'mineur') return { etat: { ...nouvelle(), media_le: conv?.media_le ?? null }, envois: [accueil()] };
    if (conv.etape === 'texte') return { etat: { ...conv, etape: 'ouverte' }, envois: [], creer: e.texte };
    // Une question à boutons attend sa réponse : on la repose.
    return { etat: null, envois: [question(conv.etape, conv.langue ?? 'fr')] };
  }

  // Boutons.
  const [cle, valeur] = [e.valeur.slice(0, e.valeur.indexOf(':')), e.valeur.slice(e.valeur.indexOf(':') + 1)];
  if (cle === 'l' && isLang(valeur)) {
    return {
      etat: { ...(conv ?? nouvelle()), etape: 'age', langue: valeur, reponses: {} },
      envois: [{ texte: TEXTES_TELEGRAM[valeur].information }, question('age', valeur)],
    };
  }
  if (!conv?.langue) return RIEN;
  const lang = conv.langue;
  const t = TEXTES_TELEGRAM[lang];
  if (cle === 'a' && conv.etape === 'age') {
    if (valeur === 'oui') return { etat: { ...conv, etape: 'situation' }, envois: [question('situation', lang)] };
    // Personne mineure : l'aide officielle gratuite, et aucune demande n'est créée.
    if (valeur === 'non') return { etat: { ...conv, etape: 'mineur', reponses: {} }, envois: [{ texte: t.mineur }] };
  }
  if (cle === 's' && conv.etape === 'situation' && isSituation(valeur)) {
    return { etat: { ...conv, etape: 'menace', reponses: { ...conv.reponses, situation: valeur } }, envois: [question('menace', lang)] };
  }
  if (cle === 'm' && conv.etape === 'menace' && (valeur === 'oui' || valeur === 'non')) {
    const menace = valeur === 'oui';
    return {
      etat: { ...conv, etape: 'texte', reponses: { ...conv.reponses, menace } },
      envois: [...(menace ? [{ texte: t.conseilsMenace }] : []), question('texte', lang)],
    };
  }
  // Ancien bouton, déjà utilisé : rien.
  return RIEN;
}

// Base de données ----------------------------------------------------------------

type ConversationLue = Conversation & { dernier_update: number | null };

async function lireConversation(db: D1Database, chatId: string): Promise<ConversationLue | null> {
  const r = await db.prepare('SELECT * FROM telegram_conversations WHERE chat_id = ?').bind(chatId).first<Record<string, unknown>>();
  if (!r) return null;
  let brut: { situation?: unknown; menace?: unknown } = {};
  try {
    brut = JSON.parse(String(r.reponses ?? '{}'));
  } catch {
    brut = {};
  }
  const reponses: Conversation['reponses'] = {};
  if (isSituation(brut.situation)) reponses.situation = brut.situation;
  if (typeof brut.menace === 'boolean') reponses.menace = brut.menace;
  return {
    etape: (ETAPES as readonly string[]).includes(String(r.etape)) ? (r.etape as Etape) : 'langue',
    langue: isLang(r.langue) ? r.langue : null,
    reponses,
    demande_id: (r.demande_id as string | null) ?? null,
    accuse_le: (r.accuse_le as string | null) ?? null,
    media_le: (r.media_le as string | null) ?? null,
    dernier_update: r.dernier_update === null || r.dernier_update === undefined ? null : Number(r.dernier_update),
  };
}

/**
 * Enregistre le nouvel état, seulement si personne ne l'a changé entre-temps
 * (deux appuis rapides sur un bouton ne font avancer qu'une fois).
 */
async function sauver(db: D1Database, chatId: string, avant: Etape | null, c: Conversation, updateId: number): Promise<boolean> {
  const now = nowIso();
  const valeurs = [c.etape, c.langue, JSON.stringify(c.reponses), c.demande_id, c.accuse_le, c.media_le, updateId];
  const r =
    avant === null
      ? await db
          .prepare(
            `INSERT INTO telegram_conversations (etape, langue, reponses, demande_id, accuse_le, media_le, dernier_update, chat_id, cree_le, maj_le)
             VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(chat_id) DO NOTHING`,
          )
          .bind(...valeurs, chatId, now, now)
          .run()
      : await db
          .prepare(
            `UPDATE telegram_conversations SET etape = ?, langue = ?, reponses = ?, demande_id = ?, accuse_le = ?, media_le = ?, dernier_update = ?, maj_le = ?
              WHERE chat_id = ? AND etape = ?`,
          )
          .bind(...valeurs, now, chatId, avant)
          .run();
  return (r.meta?.changes ?? 0) > 0;
}

/** Nettoie un texte reçu : caractères de contrôle retirés, longueur bornée. */
export function nettoyer(v: string, max: number): string {
  return v
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);
}

/** Les liens d'un message (30 au plus) et le reste du texte, s'il dit autre chose. */
export function lireLiens(texte: string): { liens: string[]; message: string | null } {
  const bruts = extraireLiens(texte);
  const liens: string[] = [];
  for (const b of bruts) {
    const u = normalizeUrl(b);
    if (u && !liens.includes(u)) liens.push(u);
    if (liens.length >= LIENS_MAX) break;
  }
  let reste = texte;
  for (const b of bruts) reste = reste.split(b).join(' ');
  return { liens, message: /[\p{L}\p{N}]/u.test(reste) ? texte : null };
}

interface DemandeLiee {
  id: string;
  ref: string;
  statut: string;
  assigne_a: string | null;
  dossier_id: string | null;
  dossier_assigne: string | null;
}

async function creerDemande(env: Env, ctx: ExecutionContext, chatId: string, conv: Conversation, texte: string, de?: TgUtilisateur) {
  const langue = conv.langue ?? 'fr';
  const situation = conv.reponses.situation ?? 'autre';
  const menace = conv.reponses.menace === true;
  const { liens, message } = lireLiens(texte);
  const username = (de?.username ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 40);
  const prenom = nettoyer(de?.first_name ?? '', 60).replace(/\n/g, ' ');
  const pseudo = prenom || (username ? `@${username}` : 'Telegram');
  const { id, ref } = await enregistrerDemande(env, ctx, {
    source: 'telegram',
    langue,
    situation,
    pays: null,
    plateformes: [],
    liens,
    message,
    pseudo,
    contactMode: 'telegram',
    contactValeur: username ? `@${username}` : 'Telegram',
    menace,
    dejaSignale: false,
    publieParSoi: null,
    ipHash: null,
    telegramChatId: chatId,
    // Accord donné en continuant après le message d'information du robot (pas une case à cocher).
    consentementVersion: `telegram-${CONSENTEMENT_VERSION}`,
  });
  // Le même accusé de réception que l'e-mail du site, sans prix (le pays n'est
  // pas encore connu : l'équipe le confirme), avec le diagnostic gratuit.
  const accuse = emailDemandeRecue({ pseudo, ref, menace, guide: lienGuide(situation, langue), estimation: null, diagnostic: lienDiagnostic(langue) }, langue, 'telegram');
  return { id, accuse: accuse.texte };
}

/** Message suivant d'une demande ouverte : rejoint le dossier ; l'équipe est prévenue. */
async function ajouterMessage(env: Env, ctx: ExecutionContext, d: DemandeLiee, texte: string): Promise<void> {
  const now = nowIso();
  // Une rafale de messages ne réveille l'équipe qu'une fois (10 minutes).
  const precedent = await env.DB.prepare("SELECT MAX(le) AS le FROM telegram_messages WHERE demande_id = ? AND sens = 'client'")
    .bind(d.id)
    .first<{ le: string | null }>();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO telegram_messages (id, demande_id, sens, texte, le) VALUES (?, ?, 'client', ?, ?)").bind(newId(), d.id, texte, now),
    ...(d.dossier_id ? [env.DB.prepare('UPDATE dossiers SET maj_le = ? WHERE id = ?').bind(now, d.dossier_id)] : []),
  ]);
  if (!precedent?.le || precedent.le <= addMinutes(now, -10)) {
    ctx.waitUntil(notifier(env.DB, [d.dossier_assigne ?? d.assigne_a]).catch(() => 0));
  }
}

async function avancer(env: Env, ctx: ExecutionContext, chatId: string, updateId: number, entree: Entree, de?: TgUtilisateur): Promise<void> {
  let conv = await lireConversation(env.DB, chatId);
  // Telegram renvoie parfois la même mise à jour : traitée une seule fois.
  if (conv?.dernier_update !== null && conv?.dernier_update !== undefined && updateId <= conv.dernier_update) return;
  let demande: DemandeLiee | null = null;
  if (conv?.demande_id) {
    demande = await env.DB.prepare(
      `SELECT dm.id, dm.ref, dm.statut, dm.assigne_a, dm.dossier_id, d.assigne_a AS dossier_assigne
         FROM demandes dm LEFT JOIN dossiers d ON d.id = dm.dossier_id WHERE dm.id = ?`,
    )
      .bind(conv.demande_id)
      .first<DemandeLiee>();
    if (!demande) {
      // Demande supprimée entre-temps : on repart de zéro.
      await env.DB.prepare('DELETE FROM telegram_conversations WHERE chat_id = ?').bind(chatId).run();
      conv = null;
    }
  }
  const decision = decider(conv, entree, { maintenant: nowIso(), ref: demande?.ref ?? null, spam: demande?.statut === 'spam' });
  if (decision.etat) {
    if (!(await sauver(env.DB, chatId, conv ? conv.etape : null, decision.etat, updateId))) return;
  } else if (conv) {
    await env.DB.prepare('UPDATE telegram_conversations SET dernier_update = ? WHERE chat_id = ?').bind(updateId, chatId).run();
  }
  if (decision.creer !== undefined && decision.etat) {
    try {
      const { id, accuse } = await creerDemande(env, ctx, chatId, decision.etat, decision.creer, de);
      await env.DB.prepare('UPDATE telegram_conversations SET demande_id = ?, maj_le = ? WHERE chat_id = ?').bind(id, nowIso(), chatId).run();
      decision.envois.push({ texte: accuse });
    } catch (e) {
      // La demande n'a pas pu être créée : la personne pourra renvoyer son message.
      await env.DB.prepare("UPDATE telegram_conversations SET etape = 'texte' WHERE chat_id = ? AND demande_id IS NULL").bind(chatId).run();
      throw e;
    }
  }
  if (decision.ajouter !== undefined && demande) await ajouterMessage(env, ctx, demande, decision.ajouter);
  for (const m of decision.envois) await envoyerMessage(env, chatId, m.texte, m.boutons);
}

async function traiter(env: Env, ctx: ExecutionContext, u: TgMiseAJour): Promise<void> {
  if (typeof u.update_id !== 'number') return;
  const q = u.callback_query;
  if (q) {
    // Toujours répondre à l'appui, sinon le bouton reste « en chargement ».
    await appelTelegram(env, 'answerCallbackQuery', { callback_query_id: String(q.id) });
    const chat = q.message?.chat;
    if (chat?.type !== 'private' || typeof q.data !== 'string') return;
    return avancer(env, ctx, String(chat.id), u.update_id, { type: 'bouton', valeur: q.data.slice(0, 64) }, q.from);
  }
  const m = u.message;
  // Uniquement les conversations privées : groupes et canaux sont ignorés.
  if (!m || m.chat?.type !== 'private') return;
  const chatId = String(m.chat.id);
  if (typeof m.text === 'string') {
    const texte = nettoyer(m.text, LONGUEUR_MAX);
    if (!texte) return;
    const entree: Entree = /^\/start(@\w+)?(\s|$)/i.test(texte) ? { type: 'start' } : { type: 'texte', texte };
    return avancer(env, ctx, chatId, u.update_id, entree, m.from);
  }
  if (NON_TEXTE.some((k) => k in m)) return avancer(env, ctx, chatId, u.update_id, { type: 'media' }, m.from);
}

/**
 * Point d'entrée : POST /api/telegram. Le secret de l'en-tête est vérifié ;
 * ensuite, Telegram reçoit toujours « 200 », même si quelque chose échoue
 * (sinon il renverrait la même mise à jour en boucle).
 */
export async function webhookTelegram(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new HttpError(404, 'introuvable');
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  const recu = request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '';
  if (!timingSafeEqualStr(recu, await secretWebhook(env.TELEGRAM_BOT_TOKEN))) throw new HttpError(401, 'secret-invalide');
  try {
    const brut = await request.text();
    if (brut.length <= 100_000) await traiter(env, ctx, JSON.parse(brut) as TgMiseAJour);
  } catch (e) {
    console.error('Robot Telegram', e instanceof Error ? e.name : 'erreur');
  }
  return json({ ok: true });
}

/**
 * Purge du matin : une conversation qui n'a pas abouti à une demande (parcours
 * abandonné, personne mineure) est supprimée après le même délai qu'une demande
 * sans suite. Les autres partent avec leur demande.
 */
export async function purgerConversations(db: D1Database): Promise<number> {
  const jours = await getParamInt(db, 'retention_demande_jours', 30);
  const r = await db.batch([
    db.prepare('DELETE FROM telegram_conversations WHERE demande_id IS NULL AND maj_le <= ?').bind(addDays(nowIso(), -jours)),
    db.prepare('DELETE FROM telegram_conversations WHERE demande_id IS NOT NULL AND demande_id NOT IN (SELECT id FROM demandes)'),
    db.prepare('DELETE FROM telegram_messages WHERE demande_id NOT IN (SELECT id FROM demandes)'),
  ]);
  return Number(r[0]?.meta?.changes ?? 0);
}
