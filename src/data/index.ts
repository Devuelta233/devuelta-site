// Accès aux données vérifiées (dossier shared/) pour construire les pages.

import guidesData from '../../shared/guides.json';
import plateformesData from '../../shared/plateformes.json';
import referentielData from '../../shared/referentiel.json';
import urgencesData from '../../shared/urgences.json';
import { SITUATIONS_REELLES, type L3, type Lang, type SituationReelle, type T3 } from '../../shared/vocab';

export interface ActionPlateforme {
  situation: string;
  titre: T3;
  etapes: L3;
  url: string;
  url_par_langue?: Partial<T3>;
  connexion_requise?: boolean;
  verifie?: boolean;
  /** Limite ou précaution affichée sous les étapes (facultatif). */
  a_savoir?: T3;
  note?: string;
}

export interface Plateforme {
  id: string;
  nom: string;
  type: string;
  actions: ActionPlateforme[];
}

export interface Guide {
  id: string;
  slug: T3;
  titre: T3;
  meta_description: T3;
  resume: T3;
  pour_qui: T3;
  etapes: L3;
  a_preparer: L3;
  delai: T3;
  cout: T3;
  limites: L3;
  attention: T3 | null;
  base_legale: T3;
  source_officielle: { url: string; titre: string };
  liens_utiles: Array<{ url: string; titre: T3 }>;
  situations: string[];
  pays: string[];
  public_mineurs: boolean;
  verifie_le: string;
}

export interface Ressource {
  type: string;
  nom: string;
  telephone?: string | null;
  sms_ou_chat?: string | null;
  url?: string | null;
  horaires?: string | null;
  gratuit?: boolean | null;
  public?: string | null;
  description: T3;
  verifie?: boolean;
  source?: string;
}

export interface PaysUrgence {
  code: string;
  nom: T3;
  ressources: Ressource[];
}

const P = plateformesData as { verifie_le?: string; plateformes?: Plateforme[] };
const G = guidesData as { verifie_le?: string; fiches?: Guide[] };
const U = urgencesData as { verifie_le?: string; pays?: PaysUrgence[]; international?: Ressource[] };

export const PLATEFORMES_VERIFIE_LE = P.verifie_le ?? '';
export const URGENCES_VERIFIE_LE = U.verifie_le ?? '';

export function plateformes(): Plateforme[] {
  return (P.plateformes ?? []).map((p) => ({ ...p, actions: p.actions.filter((a) => a.verifie !== false && a.url) }));
}

export function guides(): Guide[] {
  return G.fiches ?? [];
}

export function guidesPour(situation: SituationReelle): Guide[] {
  const proches: Record<SituationReelle, string[]> = {
    'contenu-intime': ['contenu-intime'],
    deepfake: ['deepfake', 'contenu-intime'],
    usurpation: ['usurpation'],
    'piratage-compte': ['piratage-compte', 'usurpation'],
    'faux-avis': ['faux-avis', 'diffamation'],
    diffamation: ['diffamation'],
    'donnees-personnelles': ['donnees-personnelles'],
    'droit-auteur': ['droit-auteur'],
    chantage: ['chantage', 'contenu-intime'],
  };
  const cles = proches[situation];
  return guides().filter((g) => g.situations.some((s) => cles.includes(s)));
}

export function urgencesPays(): PaysUrgence[] {
  return (U.pays ?? []).map((p) => ({ ...p, ressources: p.ressources.filter((r) => r.verifie !== false) }));
}

export function urgencesInternational(): Ressource[] {
  return (U.international ?? []).filter((r) => r.verifie !== false);
}

/** Pour une situation : les plateformes qui ont une démarche dédiée. */
export function actionsPour(situation: SituationReelle): Array<{ plateforme: Plateforme; action: ActionPlateforme }> {
  const out: Array<{ plateforme: Plateforme; action: ActionPlateforme }> = [];
  for (const p of plateformes()) {
    const a = p.actions.find((x) => x.situation === situation);
    if (a) out.push({ plateforme: p, action: a });
  }
  return out;
}

export function urlAction(a: ActionPlateforme, lang: Lang): string {
  return a.url_par_langue?.[lang] ?? a.url;
}

/** Une page par plateforme et par situation, avec toutes les démarches officielles qui s'y rapportent. */
export function toutesLesPagesPlateforme(): Array<{ situation: SituationReelle; plateforme: Plateforme; actions: ActionPlateforme[] }> {
  const out: Array<{ situation: SituationReelle; plateforme: Plateforme; actions: ActionPlateforme[] }> = [];
  for (const s of SITUATIONS_REELLES) {
    for (const p of plateformes()) {
      const actions = p.actions.filter((x) => x.situation === s);
      if (actions.length > 0) out.push({ situation: s, plateforme: p, actions });
    }
  }
  return out;
}

export const REFERENTIEL = referentielData as { version: string; fiches: Array<Record<string, unknown>> };

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', es: 'es-ES', en: 'en-GB' };

export function dateLisible(iso: string | undefined | null, lang: Lang): string {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

// Articles « le formulaire officiel n'a pas marché » ----------------------------------

export interface SectionArticle {
  titre: T3;
  paragraphes: L3;
  etapes?: L3 | null;
}

export interface Article {
  id: string;
  publie_le: string;
  verifie_le: string;
  situation: SituationReelle;
  plateformes: string[];
  slug: T3;
  titre: T3;
  meta_description: T3;
  chapo: T3;
  sections: SectionArticle[];
  si_rien_ne_marche: T3;
  sources: Array<{ url: string; titre: string }>;
  liens_internes: Array<{ type: 'situation' | 'guide'; id: string }>;
}

// Un fichier par article (shared/articles/<id>.json) : deux articles en attente
// de validation ne modifient jamais le même fichier.
const FICHIERS_ARTICLES = import.meta.glob('../../shared/articles/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Article>;

/** Articles publiés, du plus récent au plus ancien. */
export function articles(): Article[] {
  return Object.values(FICHIERS_ARTICLES)
    .filter((a) => (SITUATIONS_REELLES as readonly string[]).includes(a.situation))
    .sort((a, b) => b.publie_le.localeCompare(a.publie_le));
}

export function articlesPour(situation: SituationReelle): Article[] {
  return articles().filter((a) => a.situation === situation);
}

