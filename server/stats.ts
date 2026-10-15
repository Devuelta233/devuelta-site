// Mesure d'audience sans traceur : uniquement des compteurs agrégés par jour
// (page, provenance, pays). Pas de cookie, pas d'identifiant, pas d'adresse IP.

import { ensureSchema } from './schema';
import { HttpError, json, jourIso, memeOrigine, readJson, type Env } from './util';

const ROBOTS = /bot|crawl|spider|slurp|preview|monitor|curl|wget|python|httpclient|headless|lighthouse|scan|fetch|facebookexternalhit|whatsapp/i;

function source(request: Request, host: string): string {
  const ref = request.headers.get('Referer');
  if (!ref) return 'direct';
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '').toLowerCase();
    if (h === host.replace(/^www\./, '')) return 'interne';
    // On regroupe les grandes familles de provenance.
    if (/(^|\.)google\./.test(h)) return 'google';
    if (/(^|\.)bing\.com$/.test(h)) return 'bing';
    if (/(^|\.)duckduckgo\.com$/.test(h)) return 'duckduckgo';
    if (/(^|\.)(chatgpt\.com|openai\.com)$/.test(h)) return 'chatgpt';
    if (/(^|\.)perplexity\.ai$/.test(h)) return 'perplexity';
    if (/(^|\.)(instagram\.com|l\.instagram\.com)$/.test(h)) return 'instagram';
    if (/(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com)$/.test(h)) return 'facebook';
    if (/(^|\.)tiktok\.com$/.test(h)) return 'tiktok';
    if (/(^|\.)(t\.co|x\.com|twitter\.com)$/.test(h)) return 'x';
    if (/(^|\.)youtube\.com$/.test(h)) return 'youtube';
    if (/(^|\.)linkedin\.com$/.test(h)) return 'linkedin';
    return h.slice(0, 60);
  } catch {
    return 'direct';
  }
}

/** Compte une page vue si c'est une vraie navigation d'un navigateur. */
export function compterVue(request: Request, response: Response, env: Env, ctx: ExecutionContext): void {
  if (request.method !== 'GET' || response.status !== 200) return;
  if (request.headers.get('Sec-Fetch-Dest') !== 'document') return;
  if (ROBOTS.test(request.headers.get('User-Agent') ?? '')) return;
  const type = response.headers.get('Content-Type') ?? '';
  if (!type.includes('text/html')) return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/outil')) return;
  const chemin = url.pathname.slice(0, 200);
  const pays = ((request as unknown as { cf?: { country?: string } }).cf?.country ?? 'XX').slice(0, 2);
  const src = source(request, url.hostname);
  ctx.waitUntil(
    ensureSchema(env.DB)
      .then(() =>
        env.DB.prepare(
          `INSERT INTO stats_vues (jour, chemin, source, pays, n) VALUES (?, ?, ?, ?, 1)
           ON CONFLICT(jour, chemin, source, pays) DO UPDATE SET n = n + 1`,
        )
          .bind(jourIso(), chemin, src, pays)
          .run(),
      )
      .catch(() => undefined),
  );
}

const EVENEMENTS = new Set(['diagnostic', 'whatsapp', 'email', 'formulaire-ouvert']);

export async function compterEvenementPublic(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') throw new HttpError(405, 'methode-non-autorisee');
  if (!memeOrigine(request)) throw new HttpError(403, 'origine-refusee');
  const body = await readJson(request, 500);
  const e = String(body.e ?? '');
  if (!EVENEMENTS.has(e)) throw new HttpError(400, 'evenement-inconnu');
  await compterEvenement(env.DB, e);
  return json({ ok: true });
}

export async function compterEvenement(db: D1Database, evenement: string, n = 1): Promise<void> {
  await db
    .prepare(
      `INSERT INTO stats_evenements (jour, evenement, n) VALUES (?, ?, ?)
       ON CONFLICT(jour, evenement) DO UPDATE SET n = n + excluded.n`,
    )
    .bind(jourIso(), evenement, n)
    .run();
}
