// Tous les robots sont les bienvenus sur le site public (moteurs de recherche
// et assistants IA) : être lu et cité sert la mission. Seul l'outil interne
// et les API sont exclus.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';

export const GET: APIRoute = () =>
  new Response(
    ['User-agent: *', 'Allow: /', 'Disallow: /outil/', 'Disallow: /api/', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
