// Primitives cryptographiques, uniquement via Web Crypto (disponible dans
// Cloudflare Workers et dans Node 22). Aucun secret n'est écrit en clair.

const enc = new TextEncoder();

export function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

export function toB64(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
}

export function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function toB64Url(b: Uint8Array): string {
  return toB64(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return fromB64(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
}

export async function sha256Hex(s: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  return timingSafeEqual(enc.encode(a), enc.encode(b));
}

// Mots de passe : PBKDF2-SHA256 avec sel aléatoire de 16 octets. Le nombre
// d'itérations est réglable (variable HACHAGE_ITERATIONS) ; il est inscrit
// dans chaque empreinte, donc on peut le relever sans casser l'existant.
export const ITERATIONS_PAR_DEFAUT = 10_000;
const ITERATIONS_MAX = 1_000_000;

export function iterationsDepuis(v: string | undefined): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 10_000 && n <= ITERATIONS_MAX ? n : ITERATIONS_PAR_DEFAUT;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFKC')), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, iterations = ITERATIONS_PAR_DEFAUT): Promise<string> {
  const salt = randomBytes(16);
  const hash = await pbkdf2(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${toB64(salt)}$${toB64(hash)}`;
}

export function iterationsDuHash(stored: string): number {
  const n = Number(stored.split('$')[1]);
  return Number.isInteger(n) ? n : 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > ITERATIONS_MAX) return false;
  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = fromB64(parts[2]);
    expected = fromB64(parts[3]);
  } catch {
    return false;
  }
  const actual = await pbkdf2(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}

// Jeton de session : 32 octets aléatoires. Seule son empreinte SHA-256 est
// stockée en base, pour qu'une fuite de la base ne donne accès à rien.
export function newSessionToken(): string {
  return toB64Url(randomBytes(32));
}

export function newId(): string {
  return crypto.randomUUID();
}

// Mot de passe provisoire lisible (sans caractères ambigus), à transmettre
// par un canal privé et à changer à la première connexion.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomChar(): string {
  // Tirage sans biais : on rejette les octets qui fausseraient la répartition.
  const limit = 256 - (256 % ALPHABET.length);
  for (;;) {
    const b = randomBytes(1)[0];
    if (b < limit) return ALPHABET[b % ALPHABET.length];
  }
}

export function temporaryPassword(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    let s = '';
    for (let i = 0; i < 4; i++) s += randomChar();
    groups.push(s);
  }
  return groups.join('-');
}
