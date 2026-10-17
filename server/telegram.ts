// Robot Telegram officiel de Devuelta : POST /api/telegram (webhook).
//
// Accueil automatique en trois langues, trois questions en boutons (18 ans ou
// plus, situation, menace), accord explicite, puis la demande arrive dans
// l'outil comme une demande du site. L'équipe répond depuis l'outil, dans la
// même conversation. Messages automatiques fixes (jamais d'IA). Aucune image ni
// aucun fichier n'est accepté : ils sont retirés de la conversation, sans être
// gardés. Personne mineure : aide officielle gratuite, rien n'est gardé.
//
// Le robot ne fonctionne que si la clé TELEGRAM_BOT_TOKEN est posée (secret
// Cloudflare, copié depuis les secrets GitHub à la mise en ligne). Telegram
// signe chaque envoi avec une clé dérivée de celle du robot (en-tête
// X-Telegram-Bot-Api-Secret-Token) : un envoi sans cette clé est refusé.

import urgencesData from '../shared/urgences.json';
import { SITE_URL } from '../shared/site';
import { typo } from '../shared/typo';
import { CONSENTEMENT_VERSION, LANGS, SITUATIONS, SITUATION_LABEL, isLang, isSituation, type Lang } from '../shared/vocab';
import { NOM_LANGUE } from '../src/config';
import { C } from '../src/i18n/commun';
import { page, situationPath } from '../src/i18n/routes';
import { SITUATIONS_TEXTE } from '../src/i18n/situations';
import { extraireLiens } from '../src/outil/liens';
import { TEXTES_DIAGNOSTIC } from '../src/scripts/diagnostic-textes';
import { newId, sha256Hex, timingSafeEqualStr } from './crypto';
import { assigneePourLangue, journalStmt, nextRef } from './db';
import { notifier } from './push';
import { compterEvenement } from './stats';
import { TEXTES_ROBOT } from './telegram-textes';
import { HttpError, addDays, addMinutes, json, normalizeUrl, nowIso, type Env } from './util';

// Types Telegram (seulement ce dont le robot se sert) ------------------------------

interface TgUtilisateur {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  language_code?: string;
}
interface TgMessage {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUtilisateur;
  text?: string;
}

/** Ce que le robot refuse : images, vidéos, fichiers, sons, numéros, positions, sondages. */
const FICHIERS = ['photo', 'video', 'document', 'animation', 'voice', 'video_note', 'audio', 'contact', 'location', 'venue', 'poll', 'story', 'paid_media'];
interface TgBouton {
  id: string;
  from: TgUtilisateur;
  message?: TgMessage;
  data?: string;
}
interface TgEnvoi {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgBouton;
}
interface InfosWebhook {
  url?: string;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
}

type Etape = 'age' | 'situation' | 'menace' | 'accord' | 'demande';
interface Conversation {
  chat_id: string;
  langue: Lang;
  etape: Etape;
  situation: string | null;
  menace: number | null;
  texte_attente: string | null;
  demande_id: string | null;
  bloque: number;
  accuse_le: string | null;
  notifie_le: string | null;
}
type Bouton = { text: string; url?: string; callback_data?: string };
type Clavier = Bouton[][];

// Appels à Telegram ------------------------------------------------------------------

export const URL_WEBHOOK = `${SITE_URL}/api/telegram`;
/** Seuls ces envois sont demandés à Telegram (messages et appuis sur un bouton). */
export const ENVOIS_DEMANDES = ['message', 'callback_query'];

export class ErreurTelegram extends Error {
  constructor(
    public code: number,
    public description: string,
  ) {
    // Jamais la clé du robot dans un message d'erreur.
    super(`telegram ${code} ${description}`);
  }
}

export async function telegram<T = unknown>(env: Env, methode: string, params: Record<string, unknown> = {}): Promise<T> {
  const cle = env.TELEGRAM_BOT_TOKEN;
  if (!cle) throw new ErreurTelegram(0, 'robot inactif');
  let r: Response;
  try {
    r = await fetch(`https://api.telegram.org/bot${cle}/${methode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    throw new ErreurTelegram(0, 'reseau');
  }
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; result?: T; error_code?: number; description?: string };
  if (!r.ok || !j.ok) throw new ErreurTelegram(Number(j.error_code ?? r.status), String(j.description ?? 'erreur').slice(0, 200));
  return j.result as T;
}

/** Clé que Telegram joint à chaque envoi : dérivée de la clé du robot (même calcul dans la mise en ligne). */
export function cleWebhook(cleRobot: string): Promise<string> {
  return sha256Hex(`devuelta-telegram:${cleRobot}`);
}

export async function brancherWebhook(env: Env): Promise<void> {
  await telegram(env, 'setWebhook', {
    url: URL_WEBHOOK,
    secret_token: await cleWebhook(env.TELEGRAM_BOT_TOKEN ?? ''),
    allowed_updates: ENVOIS_DEMANDES,
    // Un envoi à la fois : les messages d'une même personne sont traités dans l'ordre.
    max_connections: 1,
  });
}

export interface EtatRobot {
  actif: boolean;
  robot?: string;
  branche?: boolean;
  en_attente?: number;
  derniere_erreur?: string | null;
  derniere_erreur_le?: string | null;
}

export async function etatRobot(env: Env): Promise<EtatRobot> {
  if (!env.TELEGRAM_BOT_TOKEN) return { actif: false };
  const [moi, info] = await Promise.all([telegram<{ username?: string }>(env, 'getMe'), telegram<InfosWebhook>(env, 'getWebhookInfo')]);
  return {
    actif: true,
    robot: moi.username ?? '',
    branche: info.url === URL_WEBHOOK,
    en_attente: info.pending_update_count ?? 0,
    derniere_erreur: info.last_error_message ?? null,
    derniere_erreur_le: info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
  };
}

/** Contrôle du matin : rebranche le robot si besoin, signale une erreur récente aux administrateurs. */
export async function controleTelegram(env: Env): Promise<unknown> {
  if (!env.TELEGRAM_BOT_TOKEN) return 'inactif';
  const e = await etatRobot(env);
  if (!e.branche) {
    await brancherWebhook(env);
    return { rebranche: true };
  }
  if (e.derniere_erreur && e.derniere_erreur_le && e.derniere_erreur_le > addDays(nowIso(), -1)) {
    throw new Error(`Telegram n'arrive plus à joindre le site : ${e.derniere_erreur}`);
  }
  return { en_attente: e.en_attente ?? 0 };
}

async function envoyer(env: Env, chatId: string, texte: string, clavier?: Clavier): Promise<boolean> {
  try {
    await telegram(env, 'sendMessage', {
      chat_id: chatId,
      text: texte.slice(0, 4096),
      link_preview_options: { is_disabled: true },
      ...(clavier ? { reply_markup: { inline_keyboard: clavier } } : {}),
    });
    return true;
  } catch (e) {
    if (e instanceof ErreurTelegram && e.code === 403) await marquerBloque(env.DB, chatId);
    return false;
  }
}

async function marquerBloque(db: D1Database, chatId: string): Promise<void> {
  await db.prepare('UPDATE telegram_conversations SET bloque = 1 WHERE chat_id = ?').bind(chatId).run();
}

/** Réponse de l'équipe, écrite dans l'outil : envoyée telle quelle dans la conversation. */
export async function repondreSurTelegram(env: Env, chatId: string, texte: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new HttpError(503, 'telegram-inactif');
  try {
    await telegram(env, 'sendMessage', { chat_id: chatId, text: texte, link_preview_options: { is_disabled: true } });
  } catch (e) {
    if (e instanceof ErreurTelegram && e.code === 403) {
      await marquerBloque(env.DB, chatId);
      throw new HttpError(409, 'telegram-bloque');
    }
    if (e instanceof ErreurTelegram && e.code === 400) throw new HttpError(409, 'telegram-introuvable');
    throw new HttpError(503, 'telegram-indisponible');
  }
}

// Petits outils ----------------------------------------------------------------------

const lien = (chemin: string) => `${SITE_URL}${chemin}`;
const choix = (text: string, callback_data: string): Bouton => ({ text, callback_data });
const adresse = (text: string, url: string): Bouton => ({ text, url });
const T = (l: Lang) => TEXTES_ROBOT[l];

/** Langue de l'application Telegram de la personne (anglais par défaut). */
export function langueTelegram(code?: string | null): Lang {
  const c = (code ?? '').toLowerCase();
  if (c.startsWith('fr')) return 'fr';
  if (c.startsWith('es')) return 'es';
  return 'en';
}

function nettoyer(texte: string, max: number): string {
  return texte
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);
}

function prenom(v: string | undefined): string {
  const p = nettoyer((v ?? '').replace(/\s+/g, ' '), 60);
  return p || 'Telegram';
}

/** Liens trouvés dans un message, prêts à être ajoutés à la demande. */
export function liensDuTexte(texte: string): string[] {
  const out: string[] = [];
  for (const brut of extraireLiens(texte)) {
    const u = normalizeUrl(brut);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

const TAKE_IT_DOWN =
  (urgencesData as { international?: Array<{ nom: string; url?: string }> }).international?.find((r) => r.nom.startsWith('Take It Down'))?.url ??
  'https://takeitdown.ncmec.org/';

function question(etape: Etape, lang: Lang): { texte: string; clavier: Clavier } | null {
  const t = T(lang);
  if (etape === 'age') return { texte: t.qAge, clavier: [[choix(t.ageOui, 'a:o')], [choix(t.ageNon, 'a:n')]] };
  if (etape === 'situation') return { texte: t.qSituation, clavier: SITUATIONS.map((s) => [choix(SITUATION_LABEL[s][lang], `s:${s}`)]) };
  if (etape === 'menace') return { texte: t.qMenace, clavier: [[choix(t.oui, 'm:o'), choix(t.non, 'm:n')]] };
  if (etape === 'accord') {
    return {
      texte: t.qAccord,
      clavier: [[choix(t.accordOui, 'c:o')], [choix(t.accordNon, 'c:n')], [adresse(t.boutonConfidentialite, lien(page('confidentialite', lang)))]],
    };
  }
  return null;
}

function conseilsMenace(lang: Lang): string {
  const premiers = SITUATIONS_TEXTE.chantage[lang].premiers.map((p) => `– ${p}`);
  const texte = [T(lang).menaceTitre, '', ...premiers].join('\n');
  return lang === 'fr' ? typo(texte) : texte;
}

function aideMineur(lang: Lang): string {
  const d = TEXTES_DIAGNOSTIC[lang];
  return [d.mineurTitre, '', d.mineurIntro, '', d.mineurNote, '', T(lang).rienGarde].join('\n');
}

// Base de données --------------------------------------------------------------------

async function lireConversation(db: D1Database, chatId: string): Promise<Conversation | null> {
  const c = await db.prepare('SELECT * FROM telegram_conversations WHERE chat_id = ?').bind(chatId).first<Conversation>();
  if (c && !isLang(c.langue)) c.langue = 'en';
  return c;
}

async function nouvelleConversation(db: D1Database, chatId: string, langue: Lang, texte: string | null = null): Promise<void> {
  const now = nowIso();
  await db
    .prepare(
      `INSERT INTO telegram_conversations (chat_id, langue, etape, texte_attente, cree_le, maj_le) VALUES (?, ?, 'age', ?, ?, ?)
       ON CONFLICT(chat_id) DO UPDATE SET langue = excluded.langue, etape = 'age', situation = NULL, menace = NULL,
         texte_attente = excluded.texte_attente, demande_id = NULL, bloque = 0, maj_le = excluded.maj_le`,
    )
    .bind(chatId, langue, texte, now, now)
    .run();
}

async function oublier(db: D1Database, chatId: string): Promise<void> {
  await db.prepare('DELETE FROM telegram_conversations WHERE chat_id = ?').bind(chatId).run();
}

/** Passe à l'étape suivante seulement si la conversation en est bien là (un double appui ne compte qu'une fois). */
async function avancer(db: D1Database, chatId: string, de: Etape, vers: Etape, champs: Record<string, unknown> = {}): Promise<boolean> {
  const cols = Object.keys(champs);
  const r = await db
    .prepare(`UPDATE telegram_conversations SET etape = ?, maj_le = ?${cols.map((c) => `, ${c} = ?`).join('')} WHERE chat_id = ? AND etape = ?`)
    .bind(vers, nowIso(), ...cols.map((c) => champs[c]), chatId, de)
    .run();
  return Number(r.meta?.changes ?? 0) > 0;
}

interface DemandeLiee {
  id: string;
  ref: string;
  statut: string;
  assigne_a: string | null;
  liens: string | null;
  dossier_id: string | null;
  dossier_assigne: string | null;
}

async function demandeLiee(db: D1Database, id: string): Promise<DemandeLiee | null> {
  return db
    .prepare(
      `SELECT dm.id, dm.ref, dm.statut, dm.assigne_a, dm.liens, dm.dossier_id, d.assigne_a AS dossier_assigne
         FROM demandes dm LEFT JOIN dossiers d ON d.id = dm.dossier_id WHERE dm.id = ?`,
    )
    .bind(id)
    .first<DemandeLiee>();
}

// Accueil et questions ---------------------------------------------------------------

async function accueillir(env: Env, chatId: string, lang: Lang): Promise<void> {
  const autres = LANGS.filter((l) => l !== lang).map((l) => choix(NOM_LANGUE[l], `l:${l}`));
  await envoyer(env, chatId, T(lang).accueil, [autres]);
  const q = question('age', lang)!;
  await envoyer(env, chatId, q.texte, q.clavier);
}

async function reposer(env: Env, chatId: string, etape: Etape, lang: Lang): Promise<void> {
  const q = question(etape, lang);
  if (q) await envoyer(env, chatId, q.texte, q.clavier);
}

// Messages écrits --------------------------------------------------------------------

function commande(texte: string): { nom: string; arg: string } | null {
  const m = texte.trim().match(/^\/([a-z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/i);
  return m ? { nom: m[1].toLowerCase(), arg: (m[2] ?? '').trim() } : null;
}

async function surMessage(env: Env, exec: ExecutionContext, m: TgMessage): Promise<void> {
  const db = env.DB;
  const chatId = String(m.chat.id);
  // Le robot ne parle qu'en tête-à-tête : ajouté à un groupe, il en sort.
  if (m.chat.type !== 'private') {
    await telegram(env, 'leaveChat', { chat_id: m.chat.id }).catch(() => undefined);
    return;
  }
  if (m.from?.is_bot) return;
  const conv = await lireConversation(db, chatId);
  if (conv?.bloque) await db.prepare('UPDATE telegram_conversations SET bloque = 0 WHERE chat_id = ?').bind(chatId).run();
  const lang: Lang = conv?.langue ?? langueTelegram(m.from?.language_code);

  if (typeof m.text !== 'string') {
    // Autocollant, message de service (message épinglé, minuterie…) : rien à faire.
    if (!FICHIERS.some((k) => k in m)) return;
    // Photo, vidéo, fichier, message vocal, numéro… : retiré de la conversation, jamais gardé.
    let retire = false;
    try {
      await telegram(env, 'deleteMessage', { chat_id: chatId, message_id: m.message_id });
      retire = true;
    } catch {
      retire = false;
    }
    await envoyer(env, chatId, retire ? T(lang).fichierRetire : T(lang).fichierRefuse);
    exec.waitUntil(compterEvenement(db, 'telegram-fichier-refuse').catch(() => undefined));
    return;
  }

  const cmd = commande(m.text);
  if (cmd) return surCommande(env, chatId, conv, cmd, lang);

  const texte = nettoyer(m.text, 4000);
  if (!texte) return;
  if (!conv) {
    // Premier message sans /start : on accueille, et le texte attend l'accord de la personne.
    await nouvelleConversation(db, chatId, lang, texte);
    await accueillir(env, chatId, lang);
    return;
  }
  const etape = etapeEffective(conv);
  if (etape === 'demande') {
    const d = conv.demande_id ? await demandeLiee(db, conv.demande_id) : null;
    if (!d) {
      // Demande introuvable (cas qui ne devrait pas arriver : la purge efface aussi la conversation) : on repart de zéro.
      await nouvelleConversation(db, chatId, conv.langue, texte);
      await accueillir(env, chatId, conv.langue);
      return;
    }
    return messageClient(env, exec, conv, d, texte);
  }
  // En cours de questions : le texte est gardé pour la demande (4 000 caractères au plus), puis on repose la question.
  const tout = [conv.texte_attente, texte].filter(Boolean).join('\n\n');
  await db
    .prepare('UPDATE telegram_conversations SET texte_attente = ?, etape = ?, maj_le = ? WHERE chat_id = ?')
    .bind(tout.slice(0, 4000), etape, nowIso(), chatId)
    .run();
  await envoyer(env, chatId, tout.length <= 4000 ? T(conv.langue).texteEnAttente : T(conv.langue).texteApresQuestions);
  await reposer(env, chatId, etape, conv.langue);
}

/**
 * Étape réelle de la conversation. « demande » sans demande enregistrée veut dire que
 * l'enregistrement a échoué de notre côté : on en reste à l'accord, rien n'est perdu.
 */
function etapeEffective(conv: Conversation): Etape {
  return conv.etape === 'demande' && !conv.demande_id ? 'accord' : conv.etape;
}

async function surCommande(env: Env, chatId: string, conv: Conversation | null, cmd: { nom: string; arg: string }, lang: Lang): Promise<void> {
  const db = env.DB;
  const t = T(lang);
  if (cmd.nom === 'start') {
    // Lien du site (t.me/…?start=es) : la conversation démarre dans la langue de la page.
    const l: Lang = isLang(cmd.arg) ? cmd.arg : lang;
    const d = conv?.etape === 'demande' && conv.demande_id ? await demandeLiee(db, conv.demande_id) : null;
    if (conv && d) {
      if (l !== conv.langue) await db.prepare('UPDATE telegram_conversations SET langue = ? WHERE chat_id = ?').bind(l, chatId).run();
      await envoyer(env, chatId, T(l).dejaDemande.replace('{ref}', d.ref));
      return;
    }
    await nouvelleConversation(db, chatId, l, conv?.texte_attente ?? null);
    await accueillir(env, chatId, l);
    return;
  }
  if (['langue', 'language', 'idioma', 'lang'].includes(cmd.nom)) {
    await envoyer(env, chatId, t.choisirLangue, [LANGS.map((l) => choix(NOM_LANGUE[l], `l:${l}`))]);
    return;
  }
  // /aide, /help, /ayuda et toute autre commande : l'aide.
  await envoyer(env, chatId, t.aide, [
    [adresse(t.boutonQueFaire, lien(page('que-faire', lang)))],
    [adresse(t.boutonUrgence, lien(page('urgence', lang)))],
    [adresse(t.boutonFaq, lien(page('faq', lang)))],
  ]);
}

/** Message écrit après l'envoi de la demande : il rejoint la demande, l'équipe est prévenue. */
async function messageClient(env: Env, exec: ExecutionContext, conv: Conversation, d: DemandeLiee, texte: string): Promise<void> {
  const db = env.DB;
  if (d.statut === 'spam') return;
  const now = nowIso();
  const stmts: D1PreparedStatement[] = [
    db.prepare("INSERT INTO messages (id, demande_id, canal, sens, texte, le) VALUES (?, ?, 'telegram', 'entrant', ?, ?)").bind(newId(), d.id, texte, now),
  ];
  // Les liens envoyés rejoignent la demande tant qu'elle n'est pas devenue un dossier.
  let ajoutes = 0;
  if (!d.dossier_id) {
    let liens: string[] = [];
    try {
      liens = JSON.parse(d.liens ?? '[]');
    } catch {
      liens = [];
    }
    for (const u of liensDuTexte(texte)) {
      if (!liens.includes(u) && liens.length < 30) {
        liens.push(u);
        ajoutes++;
      }
    }
    if (ajoutes) stmts.push(db.prepare('UPDATE demandes SET liens = ? WHERE id = ?').bind(JSON.stringify(liens), d.id));
  }
  const accuser = !conv.accuse_le || conv.accuse_le <= addMinutes(now, -12 * 60);
  const prevenir = !conv.notifie_le || conv.notifie_le <= addMinutes(now, -10);
  stmts.push(
    db
      .prepare('UPDATE telegram_conversations SET maj_le = ?, accuse_le = ?, notifie_le = ? WHERE chat_id = ?')
      .bind(now, accuser ? now : conv.accuse_le, prevenir ? now : conv.notifie_le, conv.chat_id),
  );
  await db.batch(stmts);
  const t = T(conv.langue);
  const reponse = [accuser ? t.accuse : '', ajoutes ? t.liensAjoutes : ''].filter(Boolean).join('\n\n');
  if (reponse) await envoyer(env, conv.chat_id, reponse);
  if (prevenir) exec.waitUntil(notifier(db, [d.dossier_id ? d.dossier_assigne : d.assigne_a]).catch(() => 0));
}

// Boutons ----------------------------------------------------------------------------

async function repondreBouton(env: Env, id: string, texte?: string): Promise<void> {
  await telegram(env, 'answerCallbackQuery', { callback_query_id: id, ...(texte ? { text: texte } : {}) }).catch(() => undefined);
}

/** Retire les boutons de la question et rappelle la réponse choisie sous la question. */
async function noterChoix(env: Env, b: TgBouton, libelle: string | null): Promise<void> {
  const m = b.message;
  if (!m) return;
  const params = { chat_id: m.chat.id, message_id: m.message_id };
  if (libelle && typeof m.text === 'string') {
    await telegram(env, 'editMessageText', { ...params, text: `${m.text}\n\n→ ${libelle}`.slice(0, 4096), link_preview_options: { is_disabled: true } }).catch(() => undefined);
  } else {
    await telegram(env, 'editMessageReplyMarkup', { ...params, reply_markup: { inline_keyboard: [] } }).catch(() => undefined);
  }
}

async function surBouton(env: Env, exec: ExecutionContext, b: TgBouton): Promise<void> {
  const db = env.DB;
  if (b.message && b.message.chat.type !== 'private') return repondreBouton(env, b.id);
  const chatId = String(b.message?.chat.id ?? b.from.id);
  const data = String(b.data ?? '');
  const conv = await lireConversation(db, chatId);
  const lang: Lang = conv?.langue ?? langueTelegram(b.from.language_code);

  // Changer de langue : possible à tout moment.
  if (data.startsWith('l:')) {
    await repondreBouton(env, b.id);
    const l = data.slice(2);
    if (!isLang(l)) return;
    await noterChoix(env, b, null);
    if (!conv) {
      await nouvelleConversation(db, chatId, l);
      await accueillir(env, chatId, l);
      return;
    }
    await db.prepare('UPDATE telegram_conversations SET langue = ?, maj_le = ? WHERE chat_id = ?').bind(l, nowIso(), chatId).run();
    await envoyer(env, chatId, T(l).langueChoisie);
    await reposer(env, chatId, conv.etape, l);
    return;
  }

  const etapes: Record<string, Etape> = { a: 'age', s: 'situation', m: 'menace', c: 'accord' };
  const attendue = etapes[data.slice(0, 1)];
  const valeur = data.slice(2);
  if (!conv || !attendue || attendue !== etapeEffective(conv)) {
    await repondreBouton(env, b.id, T(lang).dejaRepondu);
    return;
  }
  await repondreBouton(env, b.id);
  const t = T(lang);

  if (attendue === 'age') {
    if (valeur === 'n') {
      // Personne mineure : aide officielle gratuite, et rien n'est gardé.
      await oublier(db, chatId);
      await noterChoix(env, b, t.ageNon);
      await envoyer(env, chatId, aideMineur(lang), [
        [adresse(t.boutonTakeItDown, TAKE_IT_DOWN)],
        [adresse(C.urgenceLien[lang], lien(page('urgence', lang)))],
      ]);
      exec.waitUntil(compterEvenement(db, 'telegram-mineur').catch(() => undefined));
      return;
    }
    if (valeur !== 'o' || !(await avancer(db, chatId, 'age', 'situation'))) return;
    await noterChoix(env, b, t.ageOui);
    return reposer(env, chatId, 'situation', lang);
  }

  if (attendue === 'situation') {
    if (!isSituation(valeur) || !(await avancer(db, chatId, 'situation', 'menace', { situation: valeur }))) return;
    await noterChoix(env, b, SITUATION_LABEL[valeur][lang]);
    return reposer(env, chatId, 'menace', lang);
  }

  if (attendue === 'menace') {
    if ((valeur !== 'o' && valeur !== 'n') || !(await avancer(db, chatId, 'menace', 'accord', { menace: valeur === 'o' ? 1 : 0 }))) return;
    await noterChoix(env, b, valeur === 'o' ? t.oui : t.non);
    if (valeur === 'o') await envoyer(env, chatId, conseilsMenace(lang), [[adresse(C.urgenceLien[lang], lien(page('urgence', lang)))]]);
    return reposer(env, chatId, 'accord', lang);
  }

  // Accord
  if (valeur === 'n') {
    await oublier(db, chatId);
    await noterChoix(env, b, t.accordNon);
    await envoyer(env, chatId, t.refus, [
      [adresse(t.boutonQueFaire, lien(page('que-faire', lang)))],
      [adresse(t.boutonDiagnostic, lien(page('diagnostic', lang)))],
    ]);
    return;
  }
  if (valeur !== 'o') return;
  await creerDemande(env, exec, conv, b);
}

/** Accord donné : la demande arrive dans l'outil, attribuée selon la langue, comme une demande du site. */
async function creerDemande(env: Env, exec: ExecutionContext, conv: Conversation, b: TgBouton): Promise<void> {
  const db = env.DB;
  // On réserve l'étape (un double appui ne crée qu'une demande). Une réservation de plus de
  // 2 minutes restée sans demande vient d'un échec de notre côté : elle peut être reprise.
  const reserve = await db
    .prepare(
      `UPDATE telegram_conversations SET etape = 'demande', maj_le = ? WHERE chat_id = ?
         AND (etape = 'accord' OR (etape = 'demande' AND demande_id IS NULL AND maj_le <= ?))`,
    )
    .bind(nowIso(), conv.chat_id, addMinutes(nowIso(), -2))
    .run();
  if (!Number(reserve.meta?.changes ?? 0)) return;
  const lang = conv.langue;
  const t = T(lang);
  const id = newId();
  const situation = isSituation(conv.situation) ? conv.situation : 'autre';
  const message = conv.texte_attente || null;
  let ref: string;
  let assigne: string | null;
  try {
    ref = await nextRef(db, 'D');
    assigne = await assigneePourLangue(db, lang);
    const now = nowIso();
    await db.batch([
      db
        .prepare(
          `INSERT INTO demandes (id, ref, recue_le, langue, pays, situation, plateformes, liens, message, pseudo,
            contact_mode, contact_valeur, menace, deja_signale, publie_par_soi, consentement_version, consentement_le,
            statut, assigne_a, ip_hash)
           VALUES (?, ?, ?, ?, NULL, ?, '[]', ?, ?, ?, 'telegram', ?, ?, 0, NULL, ?, ?, 'nouvelle', ?, NULL)`,
        )
        .bind(
          id,
          ref,
          now,
          lang,
          situation,
          JSON.stringify(liensDuTexte(message ?? '').slice(0, 30)),
          message,
          prenom(b.from.first_name),
          conv.chat_id,
          conv.menace ? 1 : 0,
          CONSENTEMENT_VERSION,
          now,
          assigne,
        ),
      db
        .prepare('UPDATE telegram_conversations SET demande_id = ?, texte_attente = NULL, accuse_le = ?, notifie_le = ?, maj_le = ? WHERE chat_id = ?')
        .bind(id, now, now, now, conv.chat_id),
      journalStmt(db, { action: 'demande-recue', objet: 'demande', objet_id: id, details: { ref, langue: lang, situation, canal: 'telegram' } }),
    ]);
  } catch (e) {
    // Échec de notre côté : retour à l'accord (réponses et texte gardés), et Telegram renverra l'appui.
    await db
      .prepare("UPDATE telegram_conversations SET etape = 'accord' WHERE chat_id = ? AND demande_id IS NULL")
      .bind(conv.chat_id)
      .run()
      .catch(() => undefined);
    throw e;
  }
  await noterChoix(env, b, t.accordOui);
  // Alerte immédiate sur le téléphone de la personne désignée (ou des admins).
  exec.waitUntil(Promise.all([notifier(db, [assigne]), compterEvenement(db, 'demande-telegram')]).catch(() => undefined));
  const boutons: Clavier = [];
  if (situation !== 'autre') boutons.push([adresse(t.boutonGuide, lien(situationPath(situation, lang)))]);
  boutons.push([adresse(t.boutonQueFaire, lien(page('que-faire', lang)))]);
  await envoyer(env, conv.chat_id, t.confirmation.replace('{ref}', ref), boutons);
}

// Point d'entrée ---------------------------------------------------------------------

export async function webhookTelegram(request: Request, env: Env, exec: ExecutionContext): Promise<Response> {
  const cle = env.TELEGRAM_BOT_TOKEN;
  if (!cle) throw new HttpError(404, 'introuvable');
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  const recue = request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '';
  if (!timingSafeEqualStr(recue, await cleWebhook(cle))) throw new HttpError(401, 'non-autorise');

  const brut = await request.text();
  let envoi: TgEnvoi;
  try {
    envoi = JSON.parse(brut) as TgEnvoi;
  } catch {
    return json({ ok: true });
  }
  if (brut.length > 100_000 || typeof envoi?.update_id !== 'number') return json({ ok: true });

  // Telegram renvoie un envoi tant qu'il n'a pas eu de réponse : chacun n'est traité qu'une fois.
  const nouveau = await env.DB.prepare('INSERT OR IGNORE INTO telegram_envois (update_id, le) VALUES (?, ?)').bind(envoi.update_id, nowIso()).run();
  if (!Number(nouveau.meta?.changes ?? 0)) return json({ ok: true });
  try {
    if (envoi.callback_query) await surBouton(env, exec, envoi.callback_query);
    else if (envoi.message) await surMessage(env, exec, envoi.message);
  } catch (e) {
    // Erreur de notre côté : on libère l'envoi pour que Telegram le renvoie.
    await env.DB.prepare('DELETE FROM telegram_envois WHERE update_id = ?').bind(envoi.update_id).run().catch(() => undefined);
    throw e;
  }
  return json({ ok: true });
}
