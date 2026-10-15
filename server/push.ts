// Notifications sur téléphone (Web Push, norme VAPID), sans service tiers.
// Les messages partent VIDES : aucune donnée de dossier ne transite par les
// serveurs d'Apple ou de Google. Le téléphone demande ensuite lui-même un
// résumé neutre à l'outil, avec la session de la personne connectée.

import { CONTACT_EMAIL } from '../shared/vocab';
import { fromB64Url, toB64Url } from './crypto';
import { getParam } from './db';
import { nowIso } from './util';

interface Vapid {
  publique: string; // clé publique brute, base64url (65 octets)
  privee: CryptoKey;
}

let cache: Vapid | null = null;

/** Clés VAPID : créées automatiquement au premier besoin, conservées en base. */
export async function clesVapid(db: D1Database): Promise<Vapid> {
  if (cache) return cache;
  let jwk = await getParam(db, 'vapid_jwk', '');
  if (!jwk) {
    const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
    const exported = (await crypto.subtle.exportKey('jwk', pair.privateKey)) as JsonWebKey;
    await db.prepare('INSERT OR IGNORE INTO parametres (cle, valeur) VALUES (?, ?)').bind('vapid_jwk', JSON.stringify(exported)).run();
    jwk = await getParam(db, 'vapid_jwk', '');
  }
  const k = JSON.parse(jwk) as JsonWebKey;
  const privee = await crypto.subtle.importKey('jwk', k, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const x = fromB64Url(k.x!);
  const y = fromB64Url(k.y!);
  const raw = new Uint8Array(65);
  raw[0] = 4;
  raw.set(x, 1);
  raw.set(y, 33);
  cache = { publique: toB64Url(raw), privee };
  return cache;
}

async function jetonVapid(v: Vapid, endpoint: string): Promise<string> {
  const aud = new URL(endpoint).origin;
  const header = toB64Url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = toB64Url(
    new TextEncoder().encode(
      JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: `mailto:${CONTACT_EMAIL}` }),
    ),
  );
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, v.privee, data));
  return `${header}.${payload}.${toB64Url(sig)}`;
}

const ENDPOINTS_AUTORISES = /^https:\/\/([a-z0-9-]+\.)*(push\.apple\.com|fcm\.googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com|push\.api\.chromium\.org|android\.googleapis\.com)(\/|$)/i;

export function endpointValide(endpoint: string): boolean {
  return endpoint.length < 1000 && ENDPOINTS_AUTORISES.test(endpoint);
}

async function envoyerUn(db: D1Database, v: Vapid, endpoint: string): Promise<boolean> {
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        TTL: '86400',
        Urgency: 'high',
        Authorization: `vapid t=${await jetonVapid(v, endpoint)}, k=${v.publique}`,
        'Content-Length': '0',
      },
    });
    if (r.status === 404 || r.status === 410) {
      await db.prepare('DELETE FROM push_abonnements WHERE endpoint = ?').bind(endpoint).run();
      return false;
    }
    if (!r.ok) {
      await db.prepare('UPDATE push_abonnements SET echecs = echecs + 1 WHERE endpoint = ?').bind(endpoint).run();
      await db.prepare('DELETE FROM push_abonnements WHERE endpoint = ? AND echecs >= 10').bind(endpoint).run();
      return false;
    }
    await db.prepare('UPDATE push_abonnements SET dernier_envoi_le = ?, echecs = 0 WHERE endpoint = ?').bind(nowIso(), endpoint).run();
    return true;
  } catch {
    return false;
  }
}

/** Réveille les téléphones des personnes indiquées (ou des admins si liste vide). */
export async function notifier(db: D1Database, utilisateurs: Array<string | null | undefined>): Promise<number> {
  let ids = [...new Set(utilisateurs.filter((u): u is string => !!u))];
  if (ids.length === 0) {
    const admins = await db.prepare("SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1").all<{ id: string }>();
    ids = admins.results.map((a) => a.id);
  }
  if (ids.length === 0) return 0;
  const marks = ids.map(() => '?').join(',');
  const abos = await db
    .prepare(`SELECT endpoint FROM push_abonnements WHERE utilisateur_id IN (${marks}) LIMIT 20`)
    .bind(...ids)
    .all<{ endpoint: string }>();
  if (abos.results.length === 0) return 0;
  const v = await clesVapid(db);
  let ok = 0;
  for (const a of abos.results) if (await envoyerUn(db, v, a.endpoint)) ok++;
  return ok;
}

export async function vapidPublique(db: D1Database): Promise<string> {
  return (await clesVapid(db)).publique;
}
