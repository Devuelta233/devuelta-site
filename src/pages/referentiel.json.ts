// Le référentiel des recours, publié à une adresse fixe (licence CC BY 4.0).
// Source unique : shared/referentiel.json, lu aussi par l'outil interne.
import type { APIRoute } from 'astro';
import referentiel from '../../shared/referentiel.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ licence: 'CC BY 4.0 — Devuelta, https://getdevuelta.com', ...referentiel }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
