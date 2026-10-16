// Robot Telegram : le vrai code, sur une vraie base SQLite en mémoire (mêmes
// migrations que la base D1), avec un Telegram simulé. Vérifie : la migration
// des demandes existantes, la clé des envois, l'accueil dans la bonne langue,
// les trois questions et l'accord, la demande dans l'outil, les personnes
// mineures, le refus des images, les doublons, la réponse de l'équipe, la purge.

import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import profil from '../shared/telegram-profil.json';
import { typo } from '../shared/typo';
import { CONSENTEMENT_VERSION, LANGS, SITUATIONS } from '../shared/vocab';
import { TELEGRAM_ROBOT, lienTelegram } from '../src/config';
import { situationPath } from '../src/i18n/routes';
import { convertir, detail as detailDemande } from '../server/outil/demandes';
import { detail as detailDossier } from '../server/outil/dossiers';
import type { Ctx } from '../server/outil/router';
import { repondreDemande, repondreDossier } from '../server/outil/telegram';
import { MIGRATIONS, ensureSchema } from '../server/schema';
import { cleWebhook, controleTelegram, langueTelegram, liensDuTexte, webhookTelegram } from '../server/telegram';
import { TEXTES_ROBOT } from '../server/telegram-textes';
import { purgerElements } from '../server/taches';
import { HttpError, type Env } from '../server/util';

const CLE_ROBOT = '123456789:cle_factice_pour_les_essais';

// Base SQLite en mémoire présentée comme une base D1 (prepare / bind / first / all / run / batch).
const brute = new DatabaseSync(':memory:');
function baseD1(): D1Database {
  type Valeur = string | number | null;
  const stmt = (sql: string, args: Valeur[] = []) => ({
    bind: (...a: Valeur[]) => stmt(sql, a),
    first: async () => brute.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: brute.prepare(sql).all(...args) }),
    run: async () => ({ meta: { changes: Number(brute.prepare(sql).run(...args).changes) } }),
  });
  return {
    prepare: (sql: string) => stmt(sql),
    batch: async (liste: Array<{ run: () => Promise<unknown> }>) => {
      const out = [];
      for (const s of liste) out.push(await s.run());
      return out;
    },
  } as unknown as D1Database;
}
const DB = baseD1();
const env: Env = { DB, ASSETS: {} as Fetcher, TELEGRAM_BOT_TOKEN: CLE_ROBOT };

// Telegram simulé : chaque appel est noté ; on peut simuler un robot bloqué ou un webhook en erreur.
type Appel = { methode: string; p: Record<string, any> };
let appels: Appel[] = [];
let bloque = false;
let infosWebhook: Record<string, unknown> = {};
let numeroMessage = 500;
function simulerTelegram() {
  vi.stubGlobal('fetch', async (entree: string | URL, init?: RequestInit) => {
    const url = String(entree);
    const m = url.match(/^https:\/\/api\.telegram\.org\/bot([^/]+)\/(\w+)$/);
    if (!m) return new Response('inattendu', { status: 500 });
    if (m[1] !== CLE_ROBOT) return Response.json({ ok: false, error_code: 401, description: 'Unauthorized' }, { status: 401 });
    const p = init?.body ? JSON.parse(String(init.body)) : {};
    appels.push({ methode: m[2], p });
    if (m[2] === 'sendMessage' && bloque) return Response.json({ ok: false, error_code: 403, description: 'Forbidden: bot was blocked by the user' }, { status: 403 });
    if (m[2] === 'sendMessage') return Response.json({ ok: true, result: { message_id: ++numeroMessage } });
    if (m[2] === 'getMe') return Response.json({ ok: true, result: { id: 42, is_bot: true, username: 'GetDevueltaBot' } });
    if (m[2] === 'getWebhookInfo') return Response.json({ ok: true, result: infosWebhook });
    return Response.json({ ok: true, result: true });
  });
}

// Contexte d'exécution : on attend les tâches lancées en arrière-plan.
const attente: Promise<unknown>[] = [];
const exec = { waitUntil: (p: Promise<unknown>) => attente.push(p), passThroughOnException: () => undefined } as unknown as ExecutionContext;

let numeroEnvoi = 1000;
let numeroBouton = 0;
async function envoyer(envoi: Record<string, unknown>, cle?: string, id = ++numeroEnvoi) {
  const r = await webhookTelegram(
    new Request('https://getdevuelta.com/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': cle ?? (await cleWebhook(CLE_ROBOT)) },
      body: JSON.stringify({ update_id: id, ...envoi }),
    }),
    env,
    exec,
  );
  await Promise.all(attente.splice(0));
  return r;
}
const de = (chat: number, langue = 'fr') => ({ id: chat, is_bot: false, first_name: 'Awa', language_code: langue });
const message = (chat: number, texte: string, langue = 'fr') => ({
  message: { message_id: ++numeroMessage, chat: { id: chat, type: 'private' }, from: de(chat, langue), text: texte },
});
const bouton = (chat: number, data: string, texte = 'Question', langue = 'fr') => ({
  callback_query: { id: `b${++numeroBouton}`, from: de(chat, langue), message: { message_id: ++numeroMessage, chat: { id: chat, type: 'private' }, text: texte }, data },
});

const envoyes = (methode = 'sendMessage') => appels.filter((a) => a.methode === methode);
const dernierTexte = () => String(envoyes().at(-1)?.p.text ?? '');
const conversation = (chat: number) =>
  DB.prepare('SELECT * FROM telegram_conversations WHERE chat_id = ?').bind(String(chat)).first<Record<string, any>>();
const demandeDe = (chat: number) =>
  DB.prepare("SELECT * FROM demandes WHERE contact_mode = 'telegram' AND contact_valeur = ?").bind(String(chat)).first<Record<string, any>>();
const boutons = (a: Appel | undefined) => (a?.p.reply_markup?.inline_keyboard ?? []).flat() as Array<{ text: string; url?: string; callback_data?: string }>;

const ADMIN = { id: 'u-admin', email: 'team.devuelta@protonmail.com', nom: 'Steven', langue: 'fr', role: 'admin' };
function ctx(params: Record<string, string>, corps?: unknown, adresse = 'https://getdevuelta.com/api/outil/essai'): Ctx {
  return {
    request: new Request(adresse, {
      method: corps === undefined ? 'GET' : 'POST',
      headers: corps === undefined ? {} : { 'Content-Type': 'application/json' },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    }),
    env,
    exec,
    url: new URL(adresse),
    params,
    auth: { user: ADMIN, etape: 'complet' },
  } as unknown as Ctx;
}

/** Parcours complet jusqu'à la demande, pour une conversation donnée. */
async function parcours(chat: number, situation = 'usurpation', menace = 'n') {
  await envoyer(message(chat, '/start'));
  await envoyer(bouton(chat, 'a:o'));
  await envoyer(bouton(chat, `s:${situation}`));
  await envoyer(bouton(chat, `m:${menace}`));
  await envoyer(bouton(chat, 'c:o'));
  return demandeDe(chat);
}

beforeAll(async () => {
  // Base « d'avant » (version 8) avec une demande du site, pour vérifier que la migration la garde.
  for (const lot of MIGRATIONS.slice(0, 8)) for (const sql of lot) brute.exec(sql);
  brute.exec('CREATE TABLE IF NOT EXISTS schema_version (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER NOT NULL)');
  brute.exec('INSERT INTO schema_version (id, version) VALUES (1, 8)');
  brute
    .prepare(
      `INSERT INTO demandes (id, ref, recue_le, langue, situation, plateformes, liens, message, pseudo, contact_mode, contact_valeur,
        menace, consentement_version, consentement_le, statut) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run('d-ancienne', 'D-2026-0001', '2026-10-16T10:00:00.000Z', 'es', 'faux-avis', '[]', '["https://example.org/a"]', 'Hola', 'Lu', 'email', 'lu@example.org', 0, '2026-10-15', '2026-10-16T10:00:00.000Z', 'nouvelle');
  brute.exec("INSERT INTO compteurs (nom, valeur) VALUES ('D-' || strftime('%Y', 'now'), 1)");
  await ensureSchema(DB);
  brute
    .prepare("INSERT INTO utilisateurs (id, email, nom, langue, role, mdp_hash, cree_le) VALUES (?, ?, ?, 'fr', 'admin', 'x', ?)")
    .run(ADMIN.id, ADMIN.email, ADMIN.nom, '2026-10-16T09:00:00.000Z');
  simulerTelegram();
});

afterEach(() => {
  appels = [];
  bloque = false;
  infosWebhook = {};
});

describe('migration 9', () => {
  it('garde les demandes existantes à l’identique et accepte désormais Telegram', async () => {
    const r = await DB.prepare("SELECT * FROM demandes WHERE id = 'd-ancienne'").first<Record<string, any>>();
    expect(r).toMatchObject({ ref: 'D-2026-0001', langue: 'es', situation: 'faux-avis', message: 'Hola', contact_mode: 'email', contact_valeur: 'lu@example.org', liens: '["https://example.org/a"]', statut: 'nouvelle' });
    const v = await DB.prepare('SELECT version FROM schema_version').first<{ version: number }>();
    expect(v?.version).toBe(MIGRATIONS.length);
    // Un moyen de contact inconnu reste refusé.
    expect(() =>
      brute.exec(`INSERT INTO demandes (id, ref, recue_le, langue, situation, pseudo, contact_mode, contact_valeur, consentement_version, consentement_le)
        VALUES ('x', 'D-x', 'now', 'fr', 'autre', 'X', 'sms', '1', 'v', 'now')`),
    ).toThrow();
  });
});

describe('clé des envois de Telegram', () => {
  it('même calcul que la mise en ligne (sha256 de « devuelta-telegram:<clé> »)', async () => {
    const attendue = createHash('sha256').update(`devuelta-telegram:${CLE_ROBOT}`).digest('hex');
    expect(await cleWebhook(CLE_ROBOT)).toBe(attendue);
    expect(attendue).toMatch(/^[a-f0-9]{64}$/); // caractères admis par Telegram
  });

  it('refuse un envoi sans la bonne clé, et répond « introuvable » si le robot est éteint', async () => {
    await expect(envoyer(message(1, '/start'), 'mauvaise-cle')).rejects.toMatchObject({ status: 401 });
    expect(appels).toHaveLength(0);
    const eteint = { ...env, TELEGRAM_BOT_TOKEN: undefined };
    await expect(webhookTelegram(new Request('https://getdevuelta.com/api/telegram', { method: 'POST', body: '{}' }), eteint, exec)).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('accueil et questions', () => {
  it('accueille dans la langue de l’application Telegram, puis pose la question de l’âge', async () => {
    await envoyer(message(101, '/start', 'es-ES'));
    const [accueil, age] = envoyes();
    expect(accueil.p.text).toContain('Aquí Devuelta');
    expect(accueil.p.text).toContain('nunca nos envíes imágenes');
    expect(accueil.p.text).toContain('Soy el robot del equipo'); // il dit qu'il est un robot
    expect(boutons(accueil).map((b) => b.callback_data)).toEqual(['l:fr', 'l:en']);
    expect(age.p.text).toContain('1/3');
    expect(boutons(age).map((b) => b.callback_data)).toEqual(['a:o', 'a:n']);
    expect(accueil.p.link_preview_options).toEqual({ is_disabled: true });
    expect((await conversation(101))?.etape).toBe('age');
  });

  it('lien du site (?start=en) : la conversation démarre dans la langue de la page', async () => {
    await envoyer(message(102, '/start en', 'fr'));
    expect(envoyes()[0].p.text).toContain('This is Devuelta');
    expect((await conversation(102))?.langue).toBe('en');
  });

  it('langue inconnue : anglais', () => {
    expect(langueTelegram('pt-BR')).toBe('en');
    expect(langueTelegram(undefined)).toBe('en');
    expect(langueTelegram('fr-CA')).toBe('fr');
  });

  it('changer de langue en cours de route : la question en cours est reposée dans la nouvelle langue', async () => {
    await envoyer(message(103, '/start'));
    await envoyer(bouton(103, 'a:o'));
    appels = [];
    await envoyer(bouton(103, 'l:en'));
    expect(envoyes()[0].p.text).toBe(TEXTES_ROBOT.en.langueChoisie);
    expect(envoyes()[1].p.text).toBe(TEXTES_ROBOT.en.qSituation);
    expect((await conversation(103))?.langue).toBe('en');
  });

  it('la question des situations propose les 10 situations du site', async () => {
    await envoyer(message(104, '/start'));
    appels = [];
    await envoyer(bouton(104, 'a:o', 'Q1'));
    const q = envoyes()[0];
    expect(boutons(q).map((b) => b.callback_data)).toEqual(SITUATIONS.map((s) => `s:${s}`));
    // La réponse choisie reste écrite sous la question, et ses boutons disparaissent.
    const edit = envoyes('editMessageText')[0];
    expect(edit.p.text).toBe(`Q1\n\n→ ${TEXTES_ROBOT.fr.ageOui}`);
    expect(edit.p.reply_markup).toBeUndefined();
  });
});

describe('parcours complet', () => {
  it('menace : conseils immédiats et aide urgente, puis l’accord', async () => {
    await envoyer(message(201, '/start'));
    await envoyer(bouton(201, 'a:o'));
    await envoyer(bouton(201, 's:chantage'));
    appels = [];
    await envoyer(bouton(201, 'm:o'));
    const [conseils, accord] = envoyes();
    expect(conseils.p.text).toContain('Ne payez pas');
    expect(conseils.p.text).toBe(typo(conseils.p.text)); // typographie française
    expect(boutons(conseils)[0].url).toBe('https://getdevuelta.com/urgence/');
    expect(accord.p.text).toBe(TEXTES_ROBOT.fr.qAccord);
    expect(boutons(accord).map((b) => b.callback_data ?? b.url)).toEqual(['c:o', 'c:n', 'https://getdevuelta.com/confidentialite/']);
  });

  it('accord donné : la demande arrive dans l’outil, attribuée, avec le premier message et ses liens', async () => {
    // Premier message sans /start : accueil, et le texte attend l'accord.
    await envoyer(message(202, 'Bonjour, quelqu’un a créé un faux compte à mon nom : instagram.com/faux_awa et https://www.facebook.com/faux.awa'));
    expect(envoyes()[0].p.text).toContain('Ici, c’est Devuelta');
    await envoyer(bouton(202, 'a:o'));
    await envoyer(bouton(202, 's:usurpation'));
    await envoyer(bouton(202, 'm:n'));
    appels = [];
    await envoyer(bouton(202, 'c:o'));
    const d = await demandeDe(202);
    expect(d).toMatchObject({
      contact_mode: 'telegram',
      contact_valeur: '202',
      langue: 'fr',
      situation: 'usurpation',
      menace: 0,
      pseudo: 'Awa',
      statut: 'nouvelle',
      assigne_a: ADMIN.id,
      consentement_version: CONSENTEMENT_VERSION,
      pays: null,
      ip_hash: null,
    });
    expect(d?.message).toContain('faux compte');
    expect(JSON.parse(d?.liens)).toEqual(['https://www.facebook.com/faux.awa']);
    const conv = await conversation(202);
    expect(conv).toMatchObject({ etape: 'demande', demande_id: d?.id, texte_attente: null });
    const confirmation = envoyes()[0];
    expect(confirmation.p.text).toContain(d?.ref);
    expect(boutons(confirmation)[0].url).toBe(`https://getdevuelta.com${situationPath('usurpation', 'fr')}`);
    const j = await DB.prepare("SELECT details FROM journal WHERE action = 'demande-recue' AND objet_id = ?").bind(d?.id).first<{ details: string }>();
    expect(JSON.parse(j!.details)).toMatchObject({ canal: 'telegram', situation: 'usurpation' });
  });

  it('message après la demande : il rejoint la demande, ses liens aussi ; pas de réponse automatique en boucle', async () => {
    const d = await demandeDe(202);
    appels = [];
    await envoyer(message(202, 'Il y a aussi https://exemple.org/page-fausse'));
    expect(dernierTexte()).toBe(TEXTES_ROBOT.fr.liensAjoutes);
    await envoyer(message(202, 'Merci beaucoup'));
    expect(envoyes()).toHaveLength(1); // aucun accusé de plus dans les 12 heures
    const fil = await DB.prepare("SELECT texte, sens FROM messages WHERE demande_id = ? ORDER BY le, rowid").bind(d?.id).all<{ texte: string; sens: string }>();
    expect(fil.results.map((m) => m.texte)).toEqual(['Il y a aussi https://exemple.org/page-fausse', 'Merci beaucoup']);
    const liens = JSON.parse((await demandeDe(202))?.liens);
    expect(liens).toContain('https://exemple.org/page-fausse');
  });

  it('/start après la demande : rappelle la référence, sans tout recommencer', async () => {
    const d = await demandeDe(202);
    appels = [];
    await envoyer(message(202, '/start'));
    expect(envoyes()).toHaveLength(1);
    expect(dernierTexte()).toContain(d?.ref);
  });

  it('texte pendant les questions : gardé pour la demande, et la question est reposée', async () => {
    await envoyer(message(203, '/start'));
    await envoyer(bouton(203, 'a:o'));
    appels = [];
    await envoyer(message(203, 'Mon ex a publié une photo'));
    expect(envoyes().map((a) => a.p.text)).toEqual([TEXTES_ROBOT.fr.texteEnAttente, TEXTES_ROBOT.fr.qSituation]);
    expect((await conversation(203))?.texte_attente).toBe('Mon ex a publié une photo');
  });
});

describe('ce que le robot refuse', () => {
  it('personne mineure : aide officielle gratuite, aucune demande, rien de gardé', async () => {
    await envoyer(message(301, '/start'));
    appels = [];
    await envoyer(bouton(301, 'a:n'));
    const aide = envoyes()[0];
    expect(aide.p.text).toContain('Personne mineure');
    expect(aide.p.text).toContain(TEXTES_ROBOT.fr.rienGarde);
    expect(boutons(aide).map((b) => b.url)).toEqual(['https://takeitdown.ncmec.org/', 'https://getdevuelta.com/urgence/']);
    expect(await conversation(301)).toBeNull();
    expect(await demandeDe(301)).toBeNull();
  });

  it('accord refusé : rien n’est gardé', async () => {
    await envoyer(message(302, 'Bonjour'));
    await envoyer(bouton(302, 'a:o'));
    await envoyer(bouton(302, 's:faux-avis'));
    await envoyer(bouton(302, 'm:n'));
    appels = [];
    await envoyer(bouton(302, 'c:n'));
    expect(dernierTexte()).toBe(TEXTES_ROBOT.fr.refus);
    expect(await conversation(302)).toBeNull();
    expect(await demandeDe(302)).toBeNull();
  });

  it('photo, vidéo, fichier, vocal : retiré de la conversation, jamais gardé', async () => {
    await envoyer(message(303, '/start'));
    appels = [];
    const id = ++numeroMessage;
    await envoyer({ message: { message_id: id, chat: { id: 303, type: 'private' }, from: de(303), photo: [{ file_id: 'AgAC', width: 90, height: 90 }], caption: 'regardez' } });
    expect(envoyes('deleteMessage')[0].p).toEqual({ chat_id: '303', message_id: id });
    expect(dernierTexte()).toBe(TEXTES_ROBOT.fr.fichierRetire);
    expect(JSON.stringify(appels)).not.toContain('AgAC'); // le fichier n'est jamais demandé à Telegram
    expect(JSON.stringify(await conversation(303))).not.toContain('regardez'); // ni la légende
  });

  it('autocollant : aucune réponse', async () => {
    appels = [];
    await envoyer({ message: { message_id: ++numeroMessage, chat: { id: 303, type: 'private' }, from: de(303), sticker: { file_id: 'x' } } });
    expect(appels).toHaveLength(0);
  });

  it('ajouté à un groupe : le robot en sort', async () => {
    await envoyer({ message: { message_id: ++numeroMessage, chat: { id: -100555, type: 'supergroup' }, from: de(304), text: '/start' } });
    expect(envoyes('leaveChat')).toHaveLength(1);
    expect(envoyes()).toHaveLength(0);
    expect(await conversation(-100555)).toBeNull();
  });

  it('un envoi répété par Telegram n’est traité qu’une fois', async () => {
    await envoyer(message(305, '/start'), undefined, 9_000_001);
    const n = envoyes().length;
    await envoyer(message(305, '/start'), undefined, 9_000_001);
    expect(envoyes()).toHaveLength(n);
  });

  it('ancien bouton ou double appui : une seule demande, et « déjà répondu »', async () => {
    await envoyer(message(306, '/start'));
    await envoyer(bouton(306, 'a:o'));
    await envoyer(bouton(306, 's:diffamation'));
    await envoyer(bouton(306, 'm:n'));
    await envoyer(bouton(306, 'c:o'));
    appels = [];
    await envoyer(bouton(306, 'c:o'));
    await envoyer(bouton(306, 'a:o'));
    const n = await DB.prepare("SELECT COUNT(*) AS n FROM demandes WHERE contact_valeur = '306'").first<{ n: number }>();
    expect(n?.n).toBe(1);
    expect(envoyes('answerCallbackQuery').map((a) => a.p.text)).toEqual([TEXTES_ROBOT.fr.dejaRepondu, TEXTES_ROBOT.fr.dejaRepondu]);
    expect(envoyes()).toHaveLength(0);
  });
});

describe('dans l’outil', () => {
  it('la demande montre la conversation ; la réponse de l’équipe part dans Telegram et rejoint le fil', async () => {
    await parcours(401, 'contenu-intime');
    const d = await demandeDe(401);
    await envoyer(message(401, 'Les photos sont sur https://site-exemple.net/x'));
    const vue = (await (await detailDemande(ctx({ id: d?.id }))).json()) as any;
    expect(vue.conversation.messages.map((m: any) => m.sens)).toEqual(['entrant']);
    expect(vue.telegram_actif).toBe(true);
    // Ouvrir la demande (personne qui la suit) : les messages passent « lus ».
    const nonLus = await DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE demande_id = ? AND sens = 'entrant' AND lu_le IS NULL").bind(d?.id).first<{ n: number }>();
    expect(nonLus?.n).toBe(0);
    appels = [];
    await repondreDemande(ctx({ id: d?.id }, { texte: 'Bonjour Awa, je suis Paola. Je regarde ces liens et je reviens vers vous aujourd’hui.' }));
    expect(envoyes()[0].p).toMatchObject({ chat_id: '401', text: 'Bonjour Awa, je suis Paola. Je regarde ces liens et je reviens vers vous aujourd’hui.' });
    const fil = await DB.prepare('SELECT sens, auteur FROM messages WHERE demande_id = ? ORDER BY le, rowid').bind(d?.id).all<{ sens: string; auteur: string | null }>();
    expect(fil.results.at(-1)).toEqual({ sens: 'sortant', auteur: ADMIN.id });
    const j = await DB.prepare("SELECT details FROM journal WHERE action = 'telegram-envoye'").first<{ details: string | null }>();
    expect(j?.details).toBeNull(); // le journal ne garde jamais le contenu
  });

  it('robot bloqué par la personne : message clair dans l’outil, conversation marquée', async () => {
    const d = await demandeDe(401);
    bloque = true;
    const e = await repondreDemande(ctx({ id: d?.id }, { texte: 'Bonjour' })).catch((x) => x);
    expect(e).toBeInstanceOf(HttpError);
    expect(e).toMatchObject({ status: 409, code: 'telegram-bloque' });
    expect((await conversation(401))?.bloque).toBe(1);
    // Elle réécrit : la conversation est de nouveau ouverte.
    bloque = false;
    await envoyer(message(401, 'Je vous ai débloqué'));
    expect((await conversation(401))?.bloque).toBe(0);
  });

  it('demande d’e-mail : pas de réponse Telegram possible', async () => {
    const e = await repondreDemande(ctx({ id: 'd-ancienne' }, { texte: 'Hola' })).catch((x) => x);
    expect(e).toMatchObject({ status: 400, code: 'contact-pas-telegram' });
  });

  it('demande transformée en dossier : le dossier garde la conversation, lue seulement si l’onglet est ouvert', async () => {
    const d = await demandeDe(401);
    const r = (await (await convertir(ctx({ id: d?.id }, {}))).json()) as { id: string };
    await Promise.all(attente.splice(0));
    const dossier = await DB.prepare('SELECT client_telegram, contact_prefere, demande_id FROM dossiers WHERE id = ?').bind(r.id).first<Record<string, any>>();
    expect(dossier).toEqual({ client_telegram: '401', contact_prefere: 'telegram', demande_id: d?.id });
    await envoyer(message(401, 'Du nouveau ?'));
    const sansLire = (await (await detailDossier(ctx({ id: r.id }))).json()) as any;
    expect(sansLire.conversation.messages.at(-1)).toMatchObject({ texte: 'Du nouveau ?', lu_le: null });
    const toujoursNonLu = await DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE demande_id = ? AND sens = 'entrant' AND lu_le IS NULL").bind(d?.id).first<{ n: number }>();
    expect(toujoursNonLu?.n).toBe(2); // « Je vous ai débloqué » et « Du nouveau ? »
    await detailDossier(ctx({ id: r.id }, undefined, 'https://getdevuelta.com/api/outil/dossiers/x?lire=1'));
    const lu = await DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE demande_id = ? AND sens = 'entrant' AND lu_le IS NULL").bind(d?.id).first<{ n: number }>();
    expect(lu?.n).toBe(0);
    appels = [];
    await repondreDossier(ctx({ id: r.id }, { texte: 'Votre dossier est ouvert.' }));
    expect(envoyes()[0].p.chat_id).toBe('401');
  });

  it('purge : la demande effacée emporte ses messages, la conversation repart de zéro', async () => {
    const d = await demandeDe(202);
    await purgerElements(DB, [], [d?.id], null);
    const n = await DB.prepare('SELECT COUNT(*) AS n FROM messages WHERE demande_id = ?').bind(d?.id).first<{ n: number }>();
    expect(n?.n).toBe(0);
    expect((await conversation(202))?.demande_id).toBeNull();
    appels = [];
    await envoyer(message(202, 'Bonjour'));
    expect(envoyes()[0].p.text).toContain('Ici, c’est Devuelta');
  });
});

describe('contrôle du matin', () => {
  it('rebranche le robot si le webhook n’est pas le bon, avec la clé dérivée', async () => {
    infosWebhook = { url: '' };
    expect(await controleTelegram(env)).toEqual({ rebranche: true });
    const b = envoyes('setWebhook')[0].p;
    expect(b).toEqual({ url: 'https://getdevuelta.com/api/telegram', secret_token: await cleWebhook(CLE_ROBOT), allowed_updates: ['message', 'callback_query'], max_connections: 1 });
  });

  it('erreur récente côté Telegram : signalée aux administrateurs', async () => {
    infosWebhook = { url: 'https://getdevuelta.com/api/telegram', last_error_date: Math.floor(Date.now() / 1000) - 600, last_error_message: 'Wrong response from the webhook: 403 Forbidden' };
    await expect(controleTelegram(env)).rejects.toThrow(/403/);
    infosWebhook = { url: 'https://getdevuelta.com/api/telegram', pending_update_count: 0 };
    expect(await controleTelegram(env)).toEqual({ en_attente: 0 });
    expect(await controleTelegram({ ...env, TELEGRAM_BOT_TOKEN: undefined })).toBe('inactif');
  });
});

describe('textes et profil du robot', () => {
  it('textes fixes dans les trois langues, sans WhatsApp ni promesse, typographie française', () => {
    const cles = Object.keys(TEXTES_ROBOT.fr);
    for (const l of LANGS) {
      expect(Object.keys(TEXTES_ROBOT[l])).toEqual(cles);
      for (const v of Object.values(TEXTES_ROBOT[l])) {
        expect(v.trim().length).toBeGreaterThan(0);
        expect(v.length).toBeLessThan(4096);
        expect(v).not.toMatch(/whatsapp|garanti|100\s?%/i);
      }
    }
    for (const v of Object.values(TEXTES_ROBOT.fr)) expect(v).toBe(typo(v));
    expect(TEXTES_ROBOT.fr.accueil).toContain('ne nous envoyez jamais d’images');
    expect(TEXTES_ROBOT.es.accueil).toContain('nunca nos envíes imágenes');
    expect(TEXTES_ROBOT.en.accueil).toContain('never send us images');
    // Honnête : le robot dit qu'il est un robot, et qu'une vraie personne prend le relais.
    expect(TEXTES_ROBOT.fr.accueil).toContain('Je suis le robot de l’équipe');
    expect(TEXTES_ROBOT.es.accueil).toContain('Soy el robot del equipo');
    expect(TEXTES_ROBOT.en.accueil).toContain('I am the team’s bot');
    for (const l of LANGS) expect(TEXTES_ROBOT[l].accueil).toMatch(/vraie personne|persona real|real person/);
  });

  it('profil public dans les limites de Telegram, commandes comprises par le robot', () => {
    const p = profil as unknown as Record<string, { description: string; courte: string; commandes: Array<{ command: string; description: string }> }>;
    const comprises = ['start', 'aide', 'help', 'ayuda', 'langue', 'language', 'idioma'];
    for (const l of LANGS) {
      expect(p[l].description.length).toBeLessThanOrEqual(512);
      expect(p[l].courte.length).toBeLessThanOrEqual(120);
      expect(p[l].description).toContain('getdevuelta.com');
      expect(p[l].commandes.map((c) => c.command)).toContain('start');
      for (const c of p[l].commandes) {
        expect(c.command).toMatch(/^[a-z0-9_]{1,32}$/);
        expect(comprises).toContain(c.command);
        expect(c.description.length).toBeGreaterThanOrEqual(1);
        expect(c.description.length).toBeLessThanOrEqual(256);
      }
    }
    for (const s of [p.fr.description, p.fr.courte, ...p.fr.commandes.map((c) => c.description)]) expect(s).toBe(typo(s));
  });

  it('nom du robot sur le site : vide (lien caché) ou un vrai nom de robot Telegram', () => {
    expect(TELEGRAM_ROBOT === '' || /^[A-Za-z][A-Za-z0-9_]{1,28}bot$/i.test(TELEGRAM_ROBOT)).toBe(true);
    if (TELEGRAM_ROBOT) expect(lienTelegram('es')).toBe(`https://t.me/${TELEGRAM_ROBOT}?start=es`);
  });

  it('liens repérés dans un message : seulement des adresses web valides, sans doublon', () => {
    expect(liensDuTexte('voir www.exemple.org/a, https://www.exemple.org/a et http://x')).toEqual(['https://www.exemple.org/a']);
  });
});
