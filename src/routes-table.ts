// Table de toutes les pages publiques du site, dans les trois langues.
// Sert à construire les pages ET le plan du site (sitemap.xml).

import { BASE, SLUGS, articlePath, articlesPath, guidePath, page, plateformePath, situationPath, type PageFixe } from './i18n/routes';
import { PLATEFORMES_VERIFIE_LE, URGENCES_VERIFIE_LE, articles, guides, toutesLesPagesPlateforme, type ActionPlateforme, type Article, type Guide, type Plateforme } from './data';
import { LANGS, SITUATIONS_REELLES, type Lang, type SituationReelle } from '../shared/vocab';

export type PropsPage =
  | { type: 'accueil'; lang: Lang }
  | { type: PageFixe; lang: Lang }
  | { type: 'situation'; lang: Lang; situation: SituationReelle }
  | { type: 'plateforme'; lang: Lang; situation: SituationReelle; plateforme: Plateforme; actions: ActionPlateforme[] }
  | { type: 'guide'; lang: Lang; guide: Guide }
  | { type: 'articles'; lang: Lang }
  | { type: 'article'; lang: Lang; article: Article };

export interface EntreeRoute {
  chemin: string; // avec / au début et à la fin
  props: PropsPage;
  groupe: string; // identifiant commun aux trois langues d'une même page
  priorite: number;
  maj: string; // date de dernière mise à jour réelle du contenu (sitemap)
}

// Date de la dernière révision des textes éditoriaux (à changer quand on les modifie).
export const TEXTES_MAJ = '2026-10-16';
const jour = (d: string | undefined) => (d && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : TEXTES_MAJ);

const FIXES: PageFixe[] = Object.keys(SLUGS) as PageFixe[];

export function toutesLesRoutes(): EntreeRoute[] {
  const out: EntreeRoute[] = [];
  for (const lang of LANGS) {
    out.push({ chemin: BASE[lang], props: { type: 'accueil', lang }, groupe: 'accueil', priorite: 1, maj: TEXTES_MAJ });
    for (const f of FIXES) {
      out.push({
        chemin: page(f, lang),
        props: { type: f, lang },
        groupe: `page:${f}`,
        priorite: ['diagnostic', 'que-faire', 'urgence', 'guides', 'aide-gratuite'].includes(f) ? 0.9 : 0.5,
        maj: f === 'urgence' ? jour(URGENCES_VERIFIE_LE) : TEXTES_MAJ,
      });
    }
    for (const s of SITUATIONS_REELLES) {
      out.push({ chemin: situationPath(s, lang), props: { type: 'situation', lang, situation: s }, groupe: `situation:${s}`, priorite: 0.9, maj: TEXTES_MAJ });
    }
    for (const x of toutesLesPagesPlateforme()) {
      out.push({
        chemin: plateformePath(x.situation, x.plateforme.id, lang),
        props: { type: 'plateforme', lang, situation: x.situation, plateforme: x.plateforme, actions: x.actions },
        groupe: `plateforme:${x.situation}:${x.plateforme.id}`,
        priorite: 0.8,
        maj: jour(PLATEFORMES_VERIFIE_LE),
      });
    }
    const liste = articles();
    if (liste.length > 0) {
      out.push({ chemin: articlesPath(lang), props: { type: 'articles', lang }, groupe: 'articles', priorite: 0.7, maj: liste[0].verifie_le.slice(0, 10) });
      for (const a of liste) {
        out.push({ chemin: articlePath(a.slug[lang], lang), props: { type: 'article', lang, article: a }, groupe: `article:${a.id}`, priorite: 0.7, maj: jour(a.verifie_le) });
      }
    }
    for (const g of guides()) {
      out.push({ chemin: guidePath(g.slug[lang], lang), props: { type: 'guide', lang, guide: g }, groupe: `guide:${g.id}`, priorite: 0.8, maj: jour(g.verifie_le) });
    }
  }
  // Garde-fou : deux pages ne doivent jamais avoir la même adresse.
  const vus = new Set<string>();
  for (const r of out) {
    if (vus.has(r.chemin)) throw new Error(`Adresse en double : ${r.chemin}`);
    vus.add(r.chemin);
  }
  return out;
}
