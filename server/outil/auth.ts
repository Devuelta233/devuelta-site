// Connexion à l'outil interne : mot de passe + code à usage unique (2FA),
// accord de confidentialité à la première connexion, sessions courtes.

import { NDA_VERSION, isLang, type Lang } from '../../shared/vocab';
import {
  hashPassword,
  iterationsDepuis,
  iterationsDuHash,
  newId,
  newSessionToken,
  sha256Hex,
  timingSafeEqualStr,
  verifyPassword,
} from '../crypto';
import { getParam, getParamInt, journal, setParam } from '../db';
import { newTotpSecret, otpauthUri, verifyTotp } from '../totp';
import {
  HttpError,
  addMinutes,
  cleanEmail,
  cleanText,
  clientGeo,
  clientIp,
  json,
  nowIso,
  readJson,
  type Env,
} from '../util';

export const COOKIE = 'dv_outil';
const COOKIE_PATH = '/api/outil';

export interface UserRow {
  id: string;
  email: string;
  nom: string;
  langue: Lang;
  role: 'admin' | 'membre';
  mdp_hash: string;
  mdp_a_changer: number;
  totp_secret: string | null;
  totp_actif: number;
  totp_dernier_compteur: number;
  nda_version: string | null;
  nda_accepte_le: string | null;
  actif: number;
  echecs: number;
  bloque_jusqua: string | null;
  cree_le: string;
  derniere_connexion: string | null;
  whatsapp: string | null;
}

export interface SessionRow {
  id_hash: string;
  utilisateur_id: string;
  mfa: number;
  complet_le: string | null;
  cree_le: string;
  expire_le: string;
  vu_le: string;
}

export type Etape = 'connexion' | 'code-2fa' | 'changer-mdp' | 'activer-2fa' | 'nda' | 'complet';

export function etapeDe(user: UserRow, session: SessionRow): Etape {
  if (user.totp_actif && !session.mfa) return 'code-2fa';
  if (user.mdp_a_changer) return 'changer-mdp';
  if (!user.totp_actif) return 'activer-2fa';
  if (user.nda_version !== NDA_VERSION) return 'nda';
  return 'complet';
}

export function publicUser(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    nom: u.nom,
    langue: u.langue,
    role: u.role,
    totp_actif: !!u.totp_actif,
    nda_accepte_le: u.nda_accepte_le,
    derniere_connexion: u.derniere_connexion,
    whatsapp: u.whatsapp ?? null,
  };
}

export function iterations(env: Env): number {
  return iterationsDepuis(env.HACHAGE_ITERATIONS);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `${COOKIE}=${token}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export interface AuthState {
  user: UserRow;
  session: SessionRow;
  etape: Etape;
}

export async function loadAuth(request: Request, env: Env): Promise<AuthState | null> {
  const token = readCookie(request, COOKIE);
  if (!token || token.length < 20 || token.length > 100) return null;
  const idHash = await sha256Hex(token);
  const session = await env.DB.prepare('SELECT * FROM sessions WHERE id_hash = ?').bind(idHash).first<SessionRow>();
  if (!session) return null;
  const now = nowIso();
  const inactivite = await getParamInt(env.DB, 'session_inactivite_minutes', 180);
  if (session.expire_le <= now || addMinutes(session.vu_le, inactivite) <= now) {
    await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?').bind(idHash).run();
    return null;
  }
  const user = await env.DB.prepare('SELECT * FROM utilisateurs WHERE id = ?').bind(session.utilisateur_id).first<UserRow>();
  if (!user || !user.actif) {
    await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?').bind(idHash).run();
    return null;
  }
  // On ne réécrit la date d'activité qu'une fois par minute au plus.
  if (addMinutes(session.vu_le, 1) <= now) {
    await env.DB.prepare('UPDATE sessions SET vu_le = ? WHERE id_hash = ?').bind(now, idHash).run();
    session.vu_le = now;
  }
  return { user, session, etape: etapeDe(user, session) };
}

// Protection contre les requêtes forgées depuis un autre site : en-tête
// personnalisé obligatoire + origine identique + cookie SameSite=Strict.
export function checkCsrf(request: Request): void {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  if (request.headers.get('X-Devuelta-Outil') !== '1') throw new HttpError(403, 'requete-refusee');
  const origin = request.headers.get('Origin');
  if (origin) {
    let o: URL;
    try {
      o = new URL(origin);
    } catch {
      throw new HttpError(403, 'requete-refusee');
    }
    if (o.host !== new URL(request.url).host) throw new HttpError(403, 'requete-refusee');
  }
}

async function recordLogin(
  env: Env,
  request: Request,
  userId: string | null,
  email: string | null,
  resultat: string,
): Promise<boolean> {
  const { pays, ville, reseau } = clientGeo(request);
  let nouveauPays = 0;
  if (userId && resultat === 'ok' && pays) {
    const known = await env.DB.prepare(
      "SELECT 1 FROM connexions WHERE utilisateur_id = ? AND resultat = 'ok' AND pays = ? LIMIT 1",
    )
      .bind(userId, pays)
      .first();
    const any = await env.DB.prepare("SELECT 1 FROM connexions WHERE utilisateur_id = ? AND resultat = 'ok' LIMIT 1")
      .bind(userId)
      .first();
    nouveauPays = any && !known ? 1 : 0;
  }
  await env.DB.prepare(
    'INSERT INTO connexions (utilisateur_id, email, le, resultat, ip, pays, ville, reseau, agent, nouveau_pays) VALUES (?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      userId,
      email,
      nowIso(),
      resultat,
      clientIp(request),
      pays,
      ville,
      reseau,
      (request.headers.get('User-Agent') ?? '').slice(0, 300),
      nouveauPays,
    )
    .run();
  return nouveauPays === 1;
}

// Empreinte factice : même temps de réponse qu'un compte existant.
let empreinteFactice: Promise<string> | null = null;

export async function connexion(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request, 4_000);
  const email = cleanEmail(body.email)!;
  const password = typeof body.mot_de_passe === 'string' ? body.mot_de_passe : '';
  if (!password || password.length > 200) throw new HttpError(400, 'champ-manquant');

  // Limite par adresse IP : 20 échecs en 15 minutes.
  const ip = clientIp(request);
  const fails = await env.DB.prepare("SELECT COUNT(*) AS n FROM connexions WHERE ip = ? AND le > ? AND resultat <> 'ok'")
    .bind(ip, addMinutes(nowIso(), -15))
    .first<{ n: number }>();
  if ((fails?.n ?? 0) >= 20) throw new HttpError(429, 'trop-de-tentatives');

  const user = await env.DB.prepare('SELECT * FROM utilisateurs WHERE email = ?').bind(email).first<UserRow>();
  if (!user) {
    empreinteFactice ??= hashPassword('factice-' + newId(), iterations(env));
    await verifyPassword(password, await empreinteFactice);
    await recordLogin(env, request, null, email, 'inconnu');
    throw new HttpError(401, 'identifiants-invalides');
  }
  if (!user.actif) {
    await recordLogin(env, request, user.id, email, 'inactif');
    throw new HttpError(401, 'identifiants-invalides');
  }
  const now = nowIso();
  if (user.bloque_jusqua && user.bloque_jusqua > now) {
    await recordLogin(env, request, user.id, email, 'bloque');
    throw new HttpError(423, 'compte-bloque');
  }
  if (!(await verifyPassword(password, user.mdp_hash))) {
    const echecs = user.echecs + 1;
    if (echecs >= 5) {
      await env.DB.prepare('UPDATE utilisateurs SET echecs = 0, bloque_jusqua = ? WHERE id = ?')
        .bind(addMinutes(now, 15), user.id)
        .run();
    } else {
      await env.DB.prepare('UPDATE utilisateurs SET echecs = ? WHERE id = ?').bind(echecs, user.id).run();
    }
    await recordLogin(env, request, user.id, email, 'mdp-incorrect');
    throw new HttpError(401, 'identifiants-invalides');
  }
  // Mot de passe juste : si l'empreinte est plus faible que le réglage actuel,
  // on la refait tout de suite (montée en sécurité progressive).
  const cible = iterations(env);
  if (iterationsDuHash(user.mdp_hash) < cible) {
    await env.DB.prepare('UPDATE utilisateurs SET mdp_hash = ? WHERE id = ?').bind(await hashPassword(password, cible), user.id).run();
  }
  await env.DB.prepare('UPDATE utilisateurs SET echecs = 0, bloque_jusqua = NULL WHERE id = ?').bind(user.id).run();

  const token = newSessionToken();
  const idHash = await sha256Hex(token);
  const heures = await getParamInt(env.DB, 'session_duree_heures', 24);
  const { pays } = clientGeo(request);
  await env.DB.prepare(
    'INSERT INTO sessions (id_hash, utilisateur_id, mfa, cree_le, expire_le, vu_le, ip, pays, agent) VALUES (?,?,0,?,?,?,?,?,?)',
  )
    .bind(idHash, user.id, now, addMinutes(now, heures * 60), now, ip, pays, (request.headers.get('User-Agent') ?? '').slice(0, 300))
    .run();
  await env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ? AND expire_le <= ?').bind(user.id, now).run();

  const session: SessionRow = { id_hash: idHash, utilisateur_id: user.id, mfa: 0, complet_le: null, cree_le: now, expire_le: '', vu_le: now };
  return json({ ok: true, etape: etapeDe(user, session), utilisateur: publicUser(user) }, 200, {
    'Set-Cookie': sessionCookie(token, heures * 3600),
  });
}

/** Après chaque étape d'accueil : recalcule l'étape et enregistre la connexion complète. */
async function respondWithState(env: Env, request: Request, state: AuthState): Promise<Response> {
  const user = (await env.DB.prepare('SELECT * FROM utilisateurs WHERE id = ?').bind(state.user.id).first<UserRow>())!;
  const session = (await env.DB.prepare('SELECT * FROM sessions WHERE id_hash = ?').bind(state.session.id_hash).first<SessionRow>())!;
  const etape = etapeDe(user, session);
  let nouveauPays = false;
  if (etape === 'complet' && !session.complet_le) {
    const now = nowIso();
    await env.DB.prepare('UPDATE sessions SET complet_le = ? WHERE id_hash = ?').bind(now, session.id_hash).run();
    await env.DB.prepare('UPDATE utilisateurs SET derniere_connexion = ? WHERE id = ?').bind(now, user.id).run();
    nouveauPays = await recordLogin(env, request, user.id, user.email, 'ok');
  }
  return json({ ok: true, etape, utilisateur: publicUser(user), alerte_nouveau_pays: nouveauPays });
}

export async function code2fa(request: Request, env: Env, state: AuthState): Promise<Response> {
  if (!state.user.totp_actif || !state.user.totp_secret) throw new HttpError(400, 'etape-invalide');
  if (state.session.mfa) return respondWithState(env, request, state);
  const body = await readJson(request, 1_000);
  const counter = await verifyTotp(state.user.totp_secret, String(body.code ?? ''), state.user.totp_dernier_compteur);
  if (counter === null) {
    await recordLogin(env, request, state.user.id, state.user.email, 'code-incorrect');
    const bad = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM connexions WHERE utilisateur_id = ? AND resultat = 'code-incorrect' AND le > ?",
    )
      .bind(state.user.id, addMinutes(nowIso(), -15))
      .first<{ n: number }>();
    if ((bad?.n ?? 0) >= 5) {
      await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?').bind(state.session.id_hash).run();
      await env.DB.prepare('UPDATE utilisateurs SET bloque_jusqua = ? WHERE id = ?').bind(addMinutes(nowIso(), 15), state.user.id).run();
      throw new HttpError(423, 'compte-bloque');
    }
    throw new HttpError(401, 'code-incorrect');
  }
  await env.DB.batch([
    env.DB.prepare('UPDATE utilisateurs SET totp_dernier_compteur = ? WHERE id = ?').bind(counter, state.user.id),
    env.DB.prepare('UPDATE sessions SET mfa = 1 WHERE id_hash = ?').bind(state.session.id_hash),
  ]);
  return respondWithState(env, request, state);
}

const MOTS_INTERDITS = ['motdepasse', 'password', 'contraseña', 'contrasena', 'devuelta', 'eraseops', '123456', 'azerty', 'qwerty'];

export function checkPasswordPolicy(pw: string, email: string): void {
  if (pw.length < 12) throw new HttpError(400, 'mdp-trop-court');
  if (pw.length > 128) throw new HttpError(400, 'mdp-trop-long');
  const lower = pw.toLowerCase();
  const local = email.split('@')[0].toLowerCase();
  if (local.length >= 4 && lower.includes(local)) throw new HttpError(400, 'mdp-trop-simple');
  if (MOTS_INTERDITS.some((m) => lower.includes(m))) throw new HttpError(400, 'mdp-trop-simple');
  if (new Set(pw).size < 6) throw new HttpError(400, 'mdp-trop-simple');
}

export async function changerMdp(request: Request, env: Env, state: AuthState): Promise<Response> {
  const body = await readJson(request, 2_000);
  const nouveau = typeof body.nouveau === 'string' ? body.nouveau : '';
  if (state.etape === 'complet') {
    // Changement volontaire : l'ancien mot de passe est exigé.
    const actuel = typeof body.actuel === 'string' ? body.actuel : '';
    if (!(await verifyPassword(actuel, state.user.mdp_hash))) throw new HttpError(401, 'mdp-actuel-incorrect');
  } else if (state.etape !== 'changer-mdp') {
    throw new HttpError(400, 'etape-invalide');
  }
  checkPasswordPolicy(nouveau, state.user.email);
  if (await verifyPassword(nouveau, state.user.mdp_hash)) throw new HttpError(400, 'mdp-identique');
  const hash = await hashPassword(nouveau, iterations(env));
  await env.DB.batch([
    env.DB.prepare('UPDATE utilisateurs SET mdp_hash = ?, mdp_a_changer = 0 WHERE id = ?').bind(hash, state.user.id),
    // Toutes les autres sessions sont fermées.
    env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ? AND id_hash <> ?').bind(state.user.id, state.session.id_hash),
  ]);
  await journal(env.DB, { utilisateur_id: state.user.id, action: 'mot-de-passe-change', objet: 'utilisateur', objet_id: state.user.id });
  return respondWithState(env, request, state);
}

export async function activer2fa(_request: Request, env: Env, state: AuthState): Promise<Response> {
  if (state.etape !== 'activer-2fa') throw new HttpError(400, 'etape-invalide');
  const secret = newTotpSecret();
  await env.DB.prepare('UPDATE utilisateurs SET totp_secret = ?, totp_actif = 0 WHERE id = ?').bind(secret, state.user.id).run();
  return json({ ok: true, secret, uri: otpauthUri(secret, state.user.email) });
}

export async function confirmer2fa(request: Request, env: Env, state: AuthState): Promise<Response> {
  if (state.etape !== 'activer-2fa' || !state.user.totp_secret) throw new HttpError(400, 'etape-invalide');
  const body = await readJson(request, 1_000);
  const counter = await verifyTotp(state.user.totp_secret, String(body.code ?? ''), state.user.totp_dernier_compteur);
  if (counter === null) throw new HttpError(401, 'code-incorrect');
  await env.DB.batch([
    env.DB.prepare('UPDATE utilisateurs SET totp_actif = 1, totp_dernier_compteur = ? WHERE id = ?').bind(counter, state.user.id),
    env.DB.prepare('UPDATE sessions SET mfa = 1 WHERE id_hash = ?').bind(state.session.id_hash),
  ]);
  await journal(env.DB, { utilisateur_id: state.user.id, action: '2fa-activee', objet: 'utilisateur', objet_id: state.user.id });
  return respondWithState(env, request, state);
}

export async function accepterNda(request: Request, env: Env, state: AuthState): Promise<Response> {
  if (state.etape !== 'nda') throw new HttpError(400, 'etape-invalide');
  const body = await readJson(request, 1_000);
  if (body.accepte !== true || body.version !== NDA_VERSION) throw new HttpError(400, 'acceptation-requise');
  await env.DB.prepare('UPDATE utilisateurs SET nda_version = ?, nda_accepte_le = ? WHERE id = ?')
    .bind(NDA_VERSION, nowIso(), state.user.id)
    .run();
  await journal(env.DB, {
    utilisateur_id: state.user.id,
    action: 'accord-confidentialite-accepte',
    objet: 'utilisateur',
    objet_id: state.user.id,
    details: { version: NDA_VERSION, ip: clientIp(request) },
  });
  return respondWithState(env, request, state);
}

export async function etat(request: Request, env: Env): Promise<Response> {
  const state = await loadAuth(request, env);
  if (!state) {
    const users = await env.DB.prepare('SELECT COUNT(*) AS n FROM utilisateurs').first<{ n: number }>();
    return json({ ok: true, etape: 'connexion', initialisation: (users?.n ?? 0) === 0 });
  }
  return json({ ok: true, etape: state.etape, utilisateur: publicUser(state.user) });
}

export async function deconnexion(_request: Request, env: Env, state: AuthState | null, partout = false): Promise<Response> {
  if (state) {
    if (partout) await env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ?').bind(state.user.id).run();
    else await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?').bind(state.session.id_hash).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}

/**
 * Création du tout premier compte (administrateur), protégée par un code
 * d'initialisation à usage unique déposé en base lors de l'installation.
 */
export async function initialiser(request: Request, env: Env): Promise<Response> {
  const users = await env.DB.prepare('SELECT COUNT(*) AS n FROM utilisateurs').first<{ n: number }>();
  if ((users?.n ?? 0) > 0) throw new HttpError(409, 'deja-initialise');
  const body = await readJson(request, 4_000);
  const code = cleanText(body.code, 64, { required: true })!.toUpperCase().replace(/\s/g, '');
  const expected = await getParam(env.DB, 'init_code_hash', '');
  const expire = await getParam(env.DB, 'init_code_expire_le', '');
  if (!expected || !expire || expire <= nowIso()) throw new HttpError(403, 'code-init-expire');
  if (!timingSafeEqualStr(await sha256Hex(code), expected)) {
    await recordLogin(env, request, null, null, 'code-init-incorrect');
    throw new HttpError(403, 'code-init-incorrect');
  }
  const email = cleanEmail(body.email)!;
  const nom = cleanText(body.nom, 80, { required: true })!;
  const langue = isLang(body.langue) ? body.langue : 'fr';
  const mdp = typeof body.mot_de_passe === 'string' ? body.mot_de_passe : '';
  checkPasswordPolicy(mdp, email);
  const id = newId();
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO utilisateurs (id, email, nom, langue, role, mdp_hash, mdp_a_changer, cree_le) VALUES (?,?,?,?,?,?,0,?)',
    ).bind(id, email, nom, langue, 'admin', await hashPassword(mdp, iterations(env)), now),
    env.DB.prepare("DELETE FROM parametres WHERE cle IN ('init_code_hash','init_code_expire_le')"),
  ]);
  await setParam(env.DB, 'initialise_le', now);
  await journal(env.DB, { utilisateur_id: id, action: 'initialisation', objet: 'utilisateur', objet_id: id });
  return json({ ok: true });
}
