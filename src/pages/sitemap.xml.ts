// Plan du site pour les moteurs de recherche, avec les versions de chaque langue.
import type { APIRoute } from 'astro';
import { toutesLesRoutes } from '../routes-table';
import { SITE_URL } from '../config';

export const GET: APIRoute = () => {
  const routes = toutesLesRoutes();
  const parGroupe = new Map<string, typeof routes>();
  for (const r of routes) parGroupe.set(r.groupe, [...(parGroupe.get(r.groupe) ?? []), r]);
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lignes = routes.map((r) => {
    const alternatives = (parGroupe.get(r.groupe) ?? [])
      .map((a) => `<xhtml:link rel="alternate" hreflang="${a.props.lang}" href="${esc(SITE_URL + a.chemin)}"/>`)
      .join('');
    return `<url><loc>${esc(SITE_URL + r.chemin)}</loc><lastmod>2026-10-15</lastmod><priority>${r.priorite.toFixed(1)}</priority>${alternatives}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${lignes.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
