// Jeu de données ouvert des recours (licence CC BY 4.0), en trois langues.
// Construit à partir des guides vérifiés sur les sources officielles
// (shared/guides.json) : les mêmes textes que les pages « Recours » du site.
import type { APIRoute } from 'astro';
import { guides } from '../data';
import { guidePath } from '../i18n/routes';
import { LANGS } from '../../shared/vocab';
import { SITE_URL } from '../../shared/site';
import guidesData from '../../shared/guides.json';

export const GET: APIRoute = () => {
  const donnees = {
    titre: 'Devuelta — recours officiels pour faire retirer un contenu en ligne',
    licence: 'CC BY 4.0 — Devuelta, https://getdevuelta.com',
    editeur: 'Devuelta',
    site: SITE_URL,
    verifie_le: (guidesData as { verifie_le?: string }).verifie_le ?? null,
    avertissement: {
      fr: 'Informations générales vérifiées sur les sources officielles à la date indiquée. Elles ne remplacent pas l’avis d’un avocat.',
      es: 'Información general verificada en las fuentes oficiales en la fecha indicada. No sustituye la opinión de un abogado.',
      en: 'General information checked against official sources on the date shown. It does not replace advice from a lawyer.',
    },
    fiches: guides().map((g) => ({
      id: g.id,
      pages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}${guidePath(g.slug[l], l)}`])),
      titre: g.titre,
      resume: g.resume,
      pour_qui: g.pour_qui,
      etapes: g.etapes,
      a_preparer: g.a_preparer,
      delai: g.delai,
      cout: g.cout,
      limites: g.limites,
      attention: g.attention,
      base_legale: g.base_legale,
      source_officielle: g.source_officielle,
      liens_utiles: g.liens_utiles,
      situations: g.situations,
      pays: g.pays,
      public_mineurs: g.public_mineurs,
      verifie_le: g.verifie_le,
    })),
  };
  return new Response(JSON.stringify(donnees, null, 1), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
