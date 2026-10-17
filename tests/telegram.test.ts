// Robot Telegram : le vrai code, sur une vraie base SQLite en mémoire (mêmes
// migrations que la base D1), avec un Telegram simulé.
// Vérifie : secret du webhook, parcours (langue → âge → situation → menace →
// texte → demande créée), personne mineure (aucune demande), images refusées,
// textes fixes dans les trois langues, réponse de l'équipe depuis l'outil.

import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureSchema } from '../server/schema';
import { purgerElements } from '../server/taches';
import { decider, lireLiens, purgerConversations, secretWebhook, webhookTelegram, type Conversation, type TgMiseAJour } from '../server/telegram';
import { ACCUEIL, LIENS_SEULEMENT_3, TEXTES_TELEGRAM, boutonsSituation, lienDiagnostic } from '../server/telegram-textes';
import { filDossier, repondreDemande } from '../server/outil/telegram';
import type { UserRow } from '../server/outil/auth';
import type { Ctx } from '../server/outil/router';
import { HttpError, type Env } from '../server/util';
import { TEXTES_CONFIER } from '../src/scripts/confier-textes';
import { SITUATIONS_TEXTE } from '../src/i18n/situations';
import { typo } from '../shared/typo';
import { LANGS, SITUATIONS, SITUATION_LABEL } from '../shared/vocab';

const TOKEN = '123456789:AAEexempleDeCleFactice_pour-les-essais';

// Base SQLite en mémoire présentée comme une base D1 (prepare / bind / first / all / run / batch).
function baseD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  type Valeur = string | number | null;
  const stmt = (sql: string, args: Valeur[] = []) => ({
    bind: (...a: Valeur[]) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
  });
  return {
    prepare: (sql: string) => stmt(sql),
    batch: async (liste: Array<{ run: () => Promise<unknown> }>) => {
      // Comme D1 : tout ou rien.
      db.exec('BEGIN');
      try {
        const out = [];
        for (const s of liste) out.push(await s.run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  } as unknown as D1Database;
}

const DB = baseD1();
const env = (token: string | undefined = TOKEN): Env => ({ DB, ASSETS: {} as Fetcher, TELEGRAM_BOT_TOKEN: token });

// Telegram simulé : les appels reçus, et la réponse à sendMessage.
const appels: Array<{ methode: string; corps: Record<string, unknown> }> = [];
let refusEnvoi: number | null = null;

function simulerTelegram() {
  vi.stubGlobal('fetch', async (entree: string | URL, init?: RequestInit) => {
    const url = String(entree);
    if (!url.startsWith(`https://api.telegram.org/bot${TOKEN}/`)) return new Response('inattendu', { status: 500 });
    const methode = url.split('/').pop() as string;
    appels.push({ methode, corps: init?.body ? JSON.parse(String(init.body)) : {} });
    if (methode === 'sendMessage' && refusEnvoi) return Response.json({ ok: false, description: 'Forbidden: bot was blocked by the user' }, { status: refusEnvoi });
    return Response.json({ ok: true, result: true });
  });
}

const envois = () => appels.filter((a) => a.methode === 'sendMessage');
const textes = () => envois().map((a) => String(a.corps.text));
const boutons = (i: number) => (envois()[i]?.corps.reply_markup as { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } | undefined)?.inline_keyboard ?? [];

let numero = 1000;
const enCours: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => enCours.push(p), passThroughOnException() {} } as unknown as ExecutionContext;

async function poster(u: Record<string, unknown>, secret?: string | null): Promise<Response> {
  const entetes: Record<string, string> = { 'Content-Type': 'application/json' };
  const s = secret === undefined ? await secretWebhook(TOKEN) : secret;
  if (s !== null) entetes['X-Telegram-Bot-Api-Secret-Token'] = s;
  const r = await webhookTelegram(new Request('https://getdevuelta.com/api/telegram', { method: 'POST', body: JSON.stringify(u), headers: entetes }), env(), ctx);
  await Promise.all(enCours.splice(0));
  return r;
}

const prive = (chat: number) => ({ id: chat, type: 'private' });
const de = { id: 77, first_name: 'Awa', username: 'awa_k' };
const texte = (chat: number, t: string) => poster({ update_id: ++numero, message: { message_id: numero, chat: prive(chat), from: de, date: 0, text: t } });
const bouton = (chat: number, data: string) =>
  poster({ update_id: ++numero, callback_query: { id: `q${numero}`, from: de, data, message: { message_id: 1, chat: prive(chat), date: 0 } } });

const demandeDe = (chat: number) =>
  DB.prepare('SELECT * FROM demandes WHERE telegram_chat_id = ?').bind(String(chat)).first<Record<string, unknown>>();
const conversation = (chat: number) => DB.prepare('SELECT * FROM telegram_conversations WHERE chat_id = ?').bind(String(chat)).first<Record<string, unknown>>();
const filDe = (demandeId: string) =>
  DB.prepare('SELECT sens, texte FROM telegram_messages WHERE demande_id = ? ORDER BY le, rowid').bind(demandeId).all<{ sens: string; texte: string }>();

beforeAll(async () => {
  await ensureSchema(DB);
  await DB.prepare(
    "INSERT INTO utilisateurs (id, email, nom, langue, role, mdp_hash, mdp_a_changer, cree_le) VALUES ('u-es', 'es@example.org', 'Agente ES', 'es', 'membre', 'x', 0, '2026-01-01T00:00:00.000Z')",
  ).run();
  await DB.prepare(
    "INSERT INTO utilisateurs (id, email, nom, langue, role, mdp_hash, mdp_a_changer, cree_le) VALUES ('u-fr', 'fr@example.org', 'Agent FR', 'fr', 'membre', 'x', 0, '2026-01-01T00:00:00.000Z')",
  ).run();
});

beforeEach(() => simulerTelegram());

afterEach(() => {
  vi.unstubAllGlobals();
  appels.length = 0;
  refusEnvoi = null;
});

describe('Telegram : secret du webhook', () => {
  it('le secret est le SHA-256 hexadécimal de « devuelta-telegram: » + clé, 48 premiers caractères', async () => {
    const attendu = createHash('sha256').update(`devuelta-telegram:${TOKEN}`).digest('hex').slice(0, 48);
    expect(await secretWebhook(TOKEN)).toBe(attendu);
    // Caractères acceptés par Telegram pour secret_token : A-Z, a-z, 0-9, _ et -.
    expect(attendu).toMatch(/^[0-9a-f]{48}$/);
  });

  it('sans la clé sur le Worker : la route n’existe pas (404), comme Paystack', async () => {
    const r = webhookTelegram(new Request('https://getdevuelta.com/api/telegram', { method: 'POST', body: '{}' }), env(''), ctx);
    await expect(r).rejects.toMatchObject({ status: 404 });
  });

  it('secret absent ou faux : refusé (401), rien n’est envoyé ni enregistré', async () => {
    const u = { update_id: 1, message: { chat: prive(1), from: de, text: '/start' } };
    await expect(poster(u, null)).rejects.toBeInstanceOf(HttpError);
    await expect(poster(u, 'faux')).rejects.toMatchObject({ status: 401 });
    await expect(poster(u, await secretWebhook('autre-cle'))).rejects.toMatchObject({ status: 401 });
    expect(appels).toHaveLength(0);
    expect(await conversation(1)).toBeNull();
  });

  it('bon secret : 200, même pour un contenu illisible (Telegram ne renvoie pas en boucle)', async () => {
    const r = await webhookTelegram(
      new Request('https://getdevuelta.com/api/telegram', { method: 'POST', body: 'pas du json', headers: { 'X-Telegram-Bot-Api-Secret-Token': await secretWebhook(TOKEN) } }),
      env(),
      ctx,
    );
    expect(r.status).toBe(200);
  });

  it('groupes et canaux ignorés : seules les conversations privées comptent', async () => {
    await poster({ update_id: ++numero, message: { chat: { id: -100, type: 'group' }, from: de, text: '/start' } });
    await poster({ update_id: ++numero, message: { chat: { id: -101, type: 'supergroup' }, from: de, text: 'bonjour' } });
    expect(envois()).toHaveLength(0);
    expect(await conversation(-100)).toBeNull();
  });
});

describe('Telegram : le parcours jusqu’à la demande', () => {
  it('langue → âge → situation → menace → liens : la demande est créée comme sur le site', async () => {
    const chat = 501;
    await texte(chat, '/start');
    expect(textes()[0]).toBe(ACCUEIL);
    expect(boutons(0).flat().map((b) => b.callback_data)).toEqual(['l:fr', 'l:es', 'l:en']);
    expect(boutons(0).flat().map((b) => b.text)).toEqual(['Français', 'Español', 'English']);

    appels.length = 0;
    await bouton(chat, 'l:es');
    expect(appels[0].methode).toBe('answerCallbackQuery');
    expect(textes()).toEqual([TEXTES_TELEGRAM.es.information, TEXTES_TELEGRAM.es.age]);
    expect(textes()[0]).toContain('https://getdevuelta.com/es/privacidad/');

    appels.length = 0;
    await bouton(chat, 'a:oui');
    expect(textes()).toEqual([TEXTES_TELEGRAM.es.situation]);
    // Mêmes situations, mêmes libellés que le formulaire du site.
    expect(boutons(0).map((l) => l[0].text)).toEqual(SITUATIONS.map((s) => SITUATION_LABEL[s].es));

    appels.length = 0;
    await bouton(chat, 's:usurpation');
    expect(textes()).toEqual([TEXTES_TELEGRAM.es.menace]);

    appels.length = 0;
    await bouton(chat, 'm:non');
    expect(textes()).toEqual([TEXTES_TELEGRAM.es.liens]);

    appels.length = 0;
    await texte(chat, 'https://www.instagram.com/faux.perfil/\nhttps://exemple.com/pagina');
    const d = await demandeDe(chat);
    expect(d).toMatchObject({
      source: 'telegram',
      langue: 'es',
      situation: 'usurpation',
      menace: 0,
      contact_mode: 'telegram',
      contact_valeur: '@awa_k',
      pseudo: 'Awa',
      statut: 'nouvelle',
      assigne_a: 'u-es', // attribution selon la langue, comme le site
      ip_hash: null,
    });
    expect(JSON.parse(String(d!.liens))).toEqual(['https://www.instagram.com/faux.perfil/', 'https://exemple.com/pagina']);
    expect(d!.message).toBeNull();
    expect(String(d!.ref)).toMatch(/^D-\d{4}-\d{4}$/);
    // Accusé de réception : le même texte que l'e-mail du site, avec le diagnostic gratuit.
    const accuse = textes().at(-1)!;
    expect(accuse).toContain(String(d!.ref));
    expect(accuse).toContain('Una persona del equipo lee tu solicitud y te responde aquí');
    expect(accuse).toContain(lienDiagnostic('es'));
    expect(accuse).toContain('https://getdevuelta.com/es/que-hacer/perfil-falso/');
    expect(accuse).toContain('Nunca te pediremos imágenes íntimas');
    expect(accuse).not.toMatch(/garanti|guarantee|garantiz/i);
    // L'équipe est prévenue comme pour le site (journal « demande-recue »).
    const j = await DB.prepare("SELECT details FROM journal WHERE action = 'demande-recue' AND objet_id = ?").bind(String(d!.id)).first<{ details: string }>();
    expect(JSON.parse(j!.details)).toMatchObject({ source: 'telegram', langue: 'es' });
    expect((await conversation(chat))?.etape).toBe('ouverte');
  });

  it('menace : les conseils du site d’abord, puis la demande est marquée « menace » (prioritaire)', async () => {
    const chat = 502;
    await texte(chat, 'hola');
    await bouton(chat, 'l:fr');
    await bouton(chat, 'a:oui');
    await bouton(chat, 's:chantage');
    appels.length = 0;
    await bouton(chat, 'm:oui');
    expect(textes()).toEqual([TEXTES_TELEGRAM.fr.conseilsMenace, TEXTES_TELEGRAM.fr.liens]);
    // Les mêmes bons réflexes que la page Aide urgente du site.
    for (const p of SITUATIONS_TEXTE.chantage.fr.premiers) expect(TEXTES_TELEGRAM.fr.conseilsMenace).toContain(typo(p));
    appels.length = 0;
    await texte(chat, 'Quelqu’un me demande 500 € sinon il publie des photos.');
    const d = await demandeDe(chat);
    expect(d).toMatchObject({ menace: 1, situation: 'chantage', assigne_a: 'u-fr' });
    expect(d!.message).toBe('Quelqu’un me demande 500 € sinon il publie des photos.');
    expect(JSON.parse(String(d!.liens))).toEqual([]);
    expect(textes().at(-1)).toContain('Vous nous avez signalé des menaces');
  });

  it('message pendant une question à boutons : la question est reposée, rien n’avance', async () => {
    const chat = 503;
    await texte(chat, '/start');
    await bouton(chat, 'l:en');
    appels.length = 0;
    await texte(chat, 'hello?');
    expect(textes()).toEqual([TEXTES_TELEGRAM.en.age]);
    expect((await conversation(chat))?.etape).toBe('age');
  });

  it('bouton déjà utilisé ou mise à jour reçue deux fois : traité une seule fois', async () => {
    const chat = 504;
    await texte(chat, '/start');
    await bouton(chat, 'l:en');
    await bouton(chat, 'a:oui');
    appels.length = 0;
    await bouton(chat, 'a:oui'); // ancien bouton
    expect(textes()).toEqual([]);
    expect((await conversation(chat))?.etape).toBe('situation');
    const u = { update_id: ++numero, callback_query: { id: 'x', from: de, data: 's:deepfake', message: { chat: prive(chat) } } };
    await poster(u);
    await poster(u); // la même mise à jour, renvoyée par Telegram
    expect(textes().filter((t) => t === TEXTES_TELEGRAM.en.menace)).toHaveLength(1);
  });
});

describe('Telegram : personne mineure', () => {
  it('« non » à 18 ans : l’aide officielle gratuite du site, et aucune demande n’est créée', async () => {
    const chat = 601;
    await texte(chat, '/start');
    await bouton(chat, 'l:fr');
    appels.length = 0;
    await bouton(chat, 'a:non');
    expect(textes()).toEqual([TEXTES_TELEGRAM.fr.mineur]);
    expect(TEXTES_TELEGRAM.fr.mineur).toContain(TEXTES_CONFIER.fr.mineurMessage);
    expect(TEXTES_TELEGRAM.fr.mineur).toContain('https://getdevuelta.com/urgence/');
    // Le parcours est fini : un message ne crée rien, il ramène seulement à l'accueil.
    appels.length = 0;
    await texte(chat, 'https://exemple.com/photo');
    expect(textes()).toEqual([ACCUEIL]);
    expect(await demandeDe(chat)).toBeNull();
    // Un vieux bouton de la question suivante ne fait rien non plus.
    await bouton(chat, 's:contenu-intime');
    expect(await demandeDe(chat)).toBeNull();
  });
});

describe('Telegram : images et fichiers', () => {
  it('photo, vidéo, fichier, note vocale, autocollant : jamais gardés, consigne « liens seulement »', async () => {
    const chat = 701;
    await poster({ update_id: ++numero, message: { chat: prive(chat), from: de, photo: [{ file_id: 'AgAC-secret', width: 90, height: 90 }] } });
    expect(textes()).toEqual([LIENS_SEULEMENT_3]);
    // Aucun appel pour télécharger le fichier, et rien de l'image n'est gardé.
    expect(appels.some((a) => a.methode === 'getFile')).toBe(false);
    expect(JSON.stringify(await conversation(chat))).not.toContain('AgAC');
    // Une fois la langue choisie, la consigne est dans cette langue (une par minute au plus).
    await texte(chat, '/start');
    await bouton(chat, 'l:es');
    for (const k of ['video', 'document', 'voice', 'sticker']) {
      appels.length = 0;
      await DB.prepare('UPDATE telegram_conversations SET media_le = NULL WHERE chat_id = ?').bind(String(chat)).run();
      await poster({ update_id: ++numero, message: { chat: prive(chat), from: de, [k]: { file_id: 'x' } } });
      expect(textes(), k).toEqual([TEXTES_TELEGRAM.es.liensSeulement]);
    }
    // Un album (plusieurs photos d'un coup) ne déclenche qu'une seule consigne.
    appels.length = 0;
    await poster({ update_id: ++numero, message: { chat: prive(chat), from: de, photo: [{ file_id: 'a' }] } });
    expect(textes()).toEqual([]);
  });
});

describe('Telegram : après la demande', () => {
  it('message suivant : ajouté au dossier ; « bien reçu » une fois par heure au plus', async () => {
    const chat = 801;
    await texte(chat, '/start');
    await bouton(chat, 'l:en');
    await bouton(chat, 'a:oui');
    await bouton(chat, 's:faux-avis');
    await bouton(chat, 'm:non');
    await texte(chat, 'https://maps.app.goo.gl/AbCdEf');
    const d = await demandeDe(chat);
    appels.length = 0;
    await texte(chat, 'There are two more reviews now.');
    expect(textes()).toEqual([TEXTES_TELEGRAM.en.recu]);
    appels.length = 0;
    await texte(chat, 'https://maps.app.goo.gl/XyZ');
    expect(textes()).toEqual([]);
    const fil = await filDe(String(d!.id));
    expect(fil.results).toEqual([
      { sens: 'client', texte: 'There are two more reviews now.' },
      { sens: 'client', texte: 'https://maps.app.goo.gl/XyZ' },
    ]);
    // Une heure plus tard, un nouveau « bien reçu ».
    await DB.prepare("UPDATE telegram_conversations SET accuse_le = '2000-01-01T00:00:00.000Z' WHERE chat_id = ?").bind(String(chat)).run();
    appels.length = 0;
    await texte(chat, 'Thanks');
    expect(textes()).toEqual([TEXTES_TELEGRAM.en.recu]);
    // /start ne recrée pas de demande : il rappelle la référence.
    await DB.prepare("UPDATE telegram_conversations SET accuse_le = '2000-01-01T00:00:00.000Z' WHERE chat_id = ?").bind(String(chat)).run();
    appels.length = 0;
    await texte(chat, '/start');
    expect(textes()).toEqual([TEXTES_TELEGRAM.en.dejaOuverte.replace('{ref}', String(d!.ref))]);
    expect((await DB.prepare('SELECT COUNT(*) AS n FROM demandes WHERE telegram_chat_id = ?').bind(String(chat)).first<{ n: number }>())?.n).toBe(1);
  });

  it('demande marquée « indésirable » : le robot se tait', async () => {
    const chat = 802;
    await texte(chat, '/start');
    await bouton(chat, 'l:fr');
    await bouton(chat, 'a:oui');
    await bouton(chat, 's:autre');
    await bouton(chat, 'm:non');
    await texte(chat, 'pub pub pub');
    await DB.prepare("UPDATE demandes SET statut = 'spam' WHERE telegram_chat_id = ?").bind(String(chat)).run();
    appels.length = 0;
    await texte(chat, 'encore');
    await poster({ update_id: ++numero, message: { chat: prive(chat), from: de, photo: [{ file_id: 'a' }] } });
    expect(textes()).toEqual([]);
  });

  it('réponse de l’équipe depuis l’outil : envoyée seulement à l’appui sur « Envoyer », puis gardée dans le fil', async () => {
    const chat = 803;
    await texte(chat, '/start');
    await bouton(chat, 'l:fr');
    await bouton(chat, 'a:oui');
    await bouton(chat, 's:diffamation');
    await bouton(chat, 'm:non');
    await texte(chat, 'https://exemple.com/article');
    const d = await demandeDe(chat);
    const user = { id: 'u-fr', role: 'membre', langue: 'fr', nom: 'Agent FR' } as UserRow;
    const appel = (corps: unknown, u: UserRow = user) =>
      repondreDemande({
        request: new Request('https://getdevuelta.com/api/outil/x', { method: 'POST', body: JSON.stringify(corps), headers: { 'Content-Type': 'application/json' } }),
        env: env(),
        exec: ctx,
        url: new URL('https://getdevuelta.com/api/outil/x'),
        params: { id: String(d!.id) },
        auth: { user: u, session: {} as never, etape: 'complet' },
      } as Ctx);
    appels.length = 0;
    expect((await appel({ texte: 'Bonjour Awa, nous avons bien lu votre demande.' })).status).toBe(200);
    expect(envois().map((a) => a.corps)).toEqual([expect.objectContaining({ chat_id: String(chat), text: 'Bonjour Awa, nous avons bien lu votre demande.' })]);
    expect((await filDe(String(d!.id))).results.at(-1)).toEqual({ sens: 'equipe', texte: 'Bonjour Awa, nous avons bien lu votre demande.' });
    // Texte vide : rien ne part.
    appels.length = 0;
    await expect(appel({ texte: '   ' })).rejects.toMatchObject({ code: 'champ-manquant' });
    expect(envois()).toHaveLength(0);
    // Un membre d'une autre langue ne voit pas cette demande.
    await expect(appel({ texte: 'x' }, { id: 'u-es', role: 'membre', langue: 'es', nom: 'Agente ES' } as UserRow)).rejects.toMatchObject({ status: 404 });
    // La personne a bloqué le robot : erreur claire, rien n'est noté comme envoyé.
    refusEnvoi = 403;
    await expect(appel({ texte: 'Vous êtes là ?' })).rejects.toMatchObject({ code: 'telegram-bloque' });
    expect((await filDe(String(d!.id))).results.at(-1)?.texte).toBe('Bonjour Awa, nous avons bien lu votre demande.');
  });

  it('le fil suit la demande dans le dossier ; la purge efface tout', async () => {
    const chat = 804;
    await texte(chat, '/start');
    await bouton(chat, 'l:en');
    await bouton(chat, 'a:oui');
    await bouton(chat, 's:usurpation');
    await bouton(chat, 'm:non');
    await texte(chat, 'https://exemple.com/fake');
    await texte(chat, 'one more thing');
    const d = await demandeDe(chat);
    const now = new Date().toISOString();
    await DB.prepare("INSERT INTO dossiers (id, ref, cree_le, maj_le, langue, situation, client_pseudo, assigne_a) VALUES ('dv-804', 'DV-T-0804', ?, ?, 'en', 'usurpation', 'Awa', 'u-fr')")
      .bind(now, now)
      .run();
    await DB.prepare("UPDATE demandes SET statut = 'convertie', dossier_id = 'dv-804' WHERE id = ?").bind(String(d!.id)).run();
    const r = await filDossier({
      request: new Request('https://getdevuelta.com/api/outil/x'),
      env: env(),
      exec: ctx,
      url: new URL('https://getdevuelta.com/api/outil/x'),
      params: { id: 'dv-804' },
      auth: { user: { id: 'u-fr', role: 'membre', langue: 'fr' } as UserRow, session: {} as never, etape: 'complet' },
    } as Ctx);
    const j = (await r.json()) as { actif: boolean; messages: Array<{ sens: string; texte: string }> };
    expect(j.actif).toBe(true);
    expect(j.messages.map((m) => m.texte)).toEqual(['one more thing']);
    // Lu : plus de pastille « non lu ».
    expect((await DB.prepare("SELECT COUNT(*) AS n FROM telegram_messages WHERE demande_id = ? AND lu_le IS NULL").bind(String(d!.id)).first<{ n: number }>())?.n).toBe(0);
    // Purge du dossier : la demande, son fil et la conversation disparaissent.
    await purgerElements(DB, ['dv-804'], [], null);
    expect(await demandeDe(chat)).toBeNull();
    expect(await conversation(chat)).toBeNull();
    expect((await filDe(String(d!.id))).results).toEqual([]);
    // La personne réécrit plus tard : nouveau départ, sans erreur.
    appels.length = 0;
    await texte(chat, 'hello again');
    expect(textes()).toEqual([ACCUEIL]);
  });

  it('parcours abandonné : purgé après le délai de conservation des demandes', async () => {
    const chat = 805;
    await texte(chat, '/start');
    await bouton(chat, 'l:fr');
    await DB.prepare("UPDATE telegram_conversations SET maj_le = '2000-01-01T00:00:00.000Z' WHERE chat_id = ?").bind(String(chat)).run();
    expect(await purgerConversations(DB)).toBeGreaterThanOrEqual(1);
    expect(await conversation(chat)).toBeNull();
  });
});

describe('Telegram : état du parcours, sans base ni réseau', () => {
  const maintenant = '2026-10-17T10:00:00.000Z';
  const base: Conversation = { etape: 'texte', langue: 'en', reponses: { situation: 'deepfake', menace: false }, demande_id: null, accuse_le: null, media_le: null };
  it('dernière étape : le texte crée la demande', () => {
    const r = decider(base, { type: 'texte', texte: 'https://exemple.com/x' }, { maintenant });
    expect(r.creer).toBe('https://exemple.com/x');
    expect(r.etat?.etape).toBe('ouverte');
  });
  it('bouton de langue inconnu ou bouton sans langue : rien', () => {
    expect(decider(null, { type: 'bouton', valeur: 'l:de' }, { maintenant }).envois).toEqual([]);
    expect(decider(null, { type: 'bouton', valeur: 'a:oui' }, { maintenant }).envois).toEqual([]);
    expect(decider(base, { type: 'bouton', valeur: 's:inconnue' }, { maintenant }).envois).toEqual([]);
  });
  it('liens repérés dans le texte, le reste gardé comme message seulement s’il dit quelque chose', () => {
    expect(lireLiens('https://a.com/x\nwww.b.org/y')).toEqual({ liens: ['https://a.com/x', 'https://www.b.org/y'], message: null });
    expect(lireLiens('voir https://a.com/x svp').message).toBe('voir https://a.com/x svp');
    expect(lireLiens('Aucun lien, juste un faux compte.')).toEqual({ liens: [], message: 'Aucun lien, juste un faux compte.' });
  });
});

describe('Telegram : textes fixes', () => {
  const tous = (l: (typeof LANGS)[number]) => [...Object.values(TEXTES_TELEGRAM[l]), ACCUEIL, LIENS_SEULEMENT_3, ...boutonsSituation(l).map((b) => b.texte)].join('\n');
  it('présents dans les trois langues, sans promesse ni conseil juridique', () => {
    for (const l of LANGS) {
      for (const [cle, v] of Object.entries(TEXTES_TELEGRAM[l])) expect(v.length, `${l}.${cle}`).toBeGreaterThan(1);
      expect(tous(l)).not.toMatch(/garanti|guarantee|garantiz|conseil juridique|asesoramiento jur[ií]dico|legal advice/i);
    }
    expect(TEXTES_TELEGRAM.fr.information).toContain('vous');
    expect(TEXTES_TELEGRAM.es.information).toMatch(/\bte\b|\btu\b/);
  });
  it('aucun prénom de l’équipe ni numéro de téléphone', () => {
    for (const l of LANGS) {
      const t = tous(l);
      for (const x of ['Paola', 'Michael', 'Steven', 'wa.me', 'WhatsApp']) expect(t, l).not.toContain(x);
      expect(t, l).not.toMatch(/\+\d{6,}|\d{3}[ .]?\d{3}[ .]?\d{3,}/);
    }
  });
  it('rappel : un message automatique, une personne répond ici, jamais d’image, politique de confidentialité', () => {
    expect(TEXTES_TELEGRAM.fr.information).toContain('https://getdevuelta.com/confidentialite/');
    expect(TEXTES_TELEGRAM.en.information).toContain('https://getdevuelta.com/en/privacy/');
    for (const l of LANGS) expect(TEXTES_TELEGRAM[l].information).toMatch(/automatique|automático|automatic/);
    for (const l of LANGS) expect(TEXTES_TELEGRAM[l].information).toMatch(/image|imágenes/i);
  });
  it('boutons courts : callback_data de 64 octets au plus', () => {
    for (const s of SITUATIONS) expect(new TextEncoder().encode(`s:${s}`).length).toBeLessThanOrEqual(64);
  });
});
