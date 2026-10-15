// Outils HTTP communs au moteur (Worker) : réponses, validation des champs.

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  SITE_URL?: string;
  HACHAGE_ITERATIONS?: string;
  /** « 1 » sur un poste de développement : rien n'est envoyé aux moteurs de recherche. */
  LOCAL?: string;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const API_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};

export function json(data: unknown, status = 200, extra: HeadersInit = {}): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', ...API_HEADERS });
  new Headers(extra).forEach((v, k) => headers.append(k, v));
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) {
    return json({ ok: false, erreur: e.code, message: e.message }, e.status);
  }
  console.error('Erreur interne', e instanceof Error ? (e.stack ?? e.message) : e);
  return json({ ok: false, erreur: 'erreur-interne' }, 500);
}

export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 64_000): Promise<T> {
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'format-invalide', 'Le corps doit être en JSON.');
  }
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > maxBytes) throw new HttpError(413, 'trop-volumineux');
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'trop-volumineux');
  try {
    const data = JSON.parse(text);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('objet attendu');
    return data as T;
  } catch {
    throw new HttpError(400, 'json-invalide');
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
}

type CfProps = { country?: string; city?: string; asOrganization?: string };
export function clientGeo(request: Request): { pays: string | null; ville: string | null; reseau: string | null } {
  const cf = (request as unknown as { cf?: CfProps }).cf ?? {};
  return { pays: cf.country ?? null, ville: cf.city ?? null, reseau: cf.asOrganization ?? null };
}

/** Le même site sert l'API : on refuse les requêtes envoyées depuis un autre site. */
export function memeOrigine(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

// Validation de champs texte : coupe les espaces, impose une longueur maximale,
// retire les caractères de contrôle.
export function cleanText(v: unknown, max: number, { required = false, multiline = false } = {}): string | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new HttpError(400, 'champ-manquant');
    return null;
  }
  if (typeof v !== 'string') throw new HttpError(400, 'champ-invalide');
  let s = v.normalize('NFC');
  s = multiline
    ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n')
    : s.replace(/[\u0000-\u001F\u007F]/g, ' ');
  s = s.trim();
  if (!s) {
    if (required) throw new HttpError(400, 'champ-manquant');
    return null;
  }
  if (s.length > max) throw new HttpError(400, 'champ-trop-long');
  return s;
}

export function cleanEmail(v: unknown, required = true): string | null {
  const s = cleanText(v, 254, { required });
  if (s === null) return null;
  const e = s.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) throw new HttpError(400, 'email-invalide');
  return e;
}

export function cleanPhone(v: unknown, required = true): string | null {
  const s = cleanText(v, 40, { required });
  if (s === null) return null;
  let digits = s.replace(/[\s().-]/g, '');
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (!/^\+?\d{6,17}$/.test(digits)) throw new HttpError(400, 'telephone-invalide');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

// Liens : uniquement http(s), longueur raisonnable, sans doublon.
export function cleanUrls(v: unknown, maxCount = 30): string[] {
  if (v === undefined || v === null || v === '') return [];
  const raw: unknown[] = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/\s+/) : [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const t = item.trim();
    if (!t) continue;
    const u = normalizeUrl(t);
    if (!u) throw new HttpError(400, 'lien-invalide', `Lien invalide : ${t.slice(0, 80)}`);
    if (!out.includes(u)) out.push(u);
    if (out.length > maxCount) throw new HttpError(400, 'trop-de-liens');
  }
  return out;
}

export function normalizeUrl(input: string): string | null {
  let s = input.trim();
  if (!s || s.length > 2048) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https?:\/\//i.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.')) return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function bool(v: unknown): boolean {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}

export function jourIso(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
