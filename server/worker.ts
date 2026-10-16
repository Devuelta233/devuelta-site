// Point d'entrée du moteur Devuelta (Cloudflare Worker).
// - sert le site public et l'outil interne (fichiers statiques construits par Astro),
// - répond aux API (/api/demande, /api/evenement, /api/outil/...),
// - lance chaque matin le travail automatique (scheduled).

import { SITE_HOST } from '../shared/site';
import { recevoirDemande } from './intake';
import { handleOutil } from './outil/router';
import { recevoirRetractation } from './retractation';
import { lireSignature, signer } from './signature';
import { ensureSchema } from './schema';
import { compterEvenementPublic, compterVue } from './stats';
import { executerTaches } from './taches';
import { HttpError, errorResponse, type Env } from './util';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

function securiser(response: Response, url: URL, local: boolean): Response {
  const r = new Response(response.body, response);
  const h = r.headers;
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'same-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (!local) h.set('Strict-Transport-Security', 'max-age=31536000');
  const type = h.get('Content-Type') ?? '';
  if (type.includes('text/html')) {
    h.set('Content-Security-Policy', CSP);
    h.set('X-Frame-Options', 'DENY');
  }
  if (url.pathname.startsWith('/outil')) {
    h.set('X-Robots-Tag', 'noindex, nofollow');
    h.set('Cache-Control', 'no-store');
  } else if (url.pathname.startsWith('/_astro/')) {
    h.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/fonts/')) {
    h.set('Cache-Control', 'public, max-age=2592000');
  }
  if (url.pathname === '/referentiel.json') {
    h.set('Access-Control-Allow-Origin', '*');
    h.set('Cache-Control', 'public, max-age=300');
  }
  return r;
}

function estLocal(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const local = estLocal(url.hostname);

    // Une seule adresse officielle : www et *.workers.dev renvoient vers getdevuelta.com.
    if (!local && url.hostname !== SITE_HOST && (request.method === 'GET' || request.method === 'HEAD')) {
      if (url.hostname === `www.${SITE_HOST}` || url.hostname.endsWith('.workers.dev')) {
        return Response.redirect(`https://${SITE_HOST}${url.pathname}${url.search}`, 301);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureSchema(env.DB);
        if (url.pathname === '/api/demande') return await recevoirDemande(request, env, ctx);
        if (url.pathname === '/api/retractation') return await recevoirRetractation(request, env, ctx);
        if (url.pathname === '/api/signature/lire') return await lireSignature(request, env);
        if (url.pathname === '/api/signature/signer') return await signer(request, env, ctx);
        if (url.pathname === '/api/evenement') return await compterEvenementPublic(request, env);
        if (url.pathname.startsWith('/api/outil/')) return await handleOutil(request, env, ctx);
        throw new HttpError(404, 'introuvable');
      } catch (e) {
        return errorResponse(e);
      }
    }

    const response = await env.ASSETS.fetch(request);
    compterVue(request, response, env, ctx);
    return securiser(response, url, local);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(executerTaches(env).then((r) => console.log('Tâches du matin', JSON.stringify(r))));
  },
} satisfies ExportedHandler<Env>;
