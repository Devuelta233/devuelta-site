// Adresses des pages dans chaque langue. Le français est à la racine du site,
// l'espagnol sous /es/ et l'anglais sous /en/. Chaque adresse est traduite.

import { LANGS, type Lang, type SituationReelle, type T3 } from '../../shared/vocab';

export type PageFixe =
  | 'diagnostic'
  | 'que-faire'
  | 'guides'
  | 'urgence'
  | 'methode'
  | 'confier'
  | 'tarifs'
  | 'contact'
  | 'confidentialite'
  | 'mentions'
  | 'conditions'
  | 'retractation'
  | 'controle';

export const BASE: Record<Lang, string> = { fr: '/', es: '/es/', en: '/en/' };

export const SLUGS: Record<PageFixe, T3> = {
  diagnostic: { fr: 'diagnostic', es: 'diagnostico', en: 'diagnostic' },
  'que-faire': { fr: 'que-faire', es: 'que-hacer', en: 'what-to-do' },
  guides: { fr: 'recours', es: 'recursos', en: 'remedies' },
  urgence: { fr: 'urgence', es: 'urgencia', en: 'urgent-help' },
  methode: { fr: 'methode', es: 'metodo', en: 'how-we-work' },
  confier: { fr: 'confier-mon-dossier', es: 'confiar-mi-caso', en: 'get-help' },
  tarifs: { fr: 'tarifs', es: 'precios', en: 'pricing' },
  contact: { fr: 'contact', es: 'contacto', en: 'contact' },
  confidentialite: { fr: 'confidentialite', es: 'privacidad', en: 'privacy' },
  conditions: { fr: 'conditions-de-vente', es: 'condiciones-de-venta', en: 'terms-of-sale' },
  retractation: { fr: 'renoncer-au-contrat', es: 'desistir-del-contrato', en: 'withdraw-from-contract' },
  controle: { fr: 'controle', es: 'chequeo', en: 'check-up' },
  mentions: { fr: 'mentions-legales', es: 'aviso-legal', en: 'legal-notice' },
};

export const SITUATION_SLUGS: Record<SituationReelle, T3> = {
  'contenu-intime': { fr: 'photo-intime-diffusee', es: 'foto-intima-difundida', en: 'intimate-image-shared' },
  deepfake: { fr: 'deepfake-montage', es: 'deepfake-montaje', en: 'deepfake' },
  usurpation: { fr: 'faux-profil', es: 'perfil-falso', en: 'fake-profile' },
  'piratage-compte': { fr: 'compte-pirate', es: 'cuenta-hackeada', en: 'hacked-account' },
  'faux-avis': { fr: 'faux-avis', es: 'resenas-falsas', en: 'fake-reviews' },
  diffamation: { fr: 'diffamation-harcelement', es: 'difamacion-acoso', en: 'defamation-harassment' },
  'donnees-personnelles': { fr: 'donnees-personnelles', es: 'datos-personales', en: 'personal-information' },
  'droit-auteur': { fr: 'photo-reutilisee', es: 'foto-usada-sin-permiso', en: 'photo-used-without-permission' },
  chantage: { fr: 'chantage-sextorsion', es: 'chantaje-sextorsion', en: 'blackmail-sextortion' },
};

export function accueil(lang: Lang): string {
  return BASE[lang];
}

export function page(id: PageFixe, lang: Lang): string {
  return `${BASE[lang]}${SLUGS[id][lang]}/`;
}

export function situationPath(s: SituationReelle, lang: Lang): string {
  return `${page('que-faire', lang)}${SITUATION_SLUGS[s][lang]}/`;
}

export function plateformePath(s: SituationReelle, plateforme: string, lang: Lang): string {
  return `${situationPath(s, lang)}${plateforme}/`;
}

export const ARTICLES_SLUG: T3 = { fr: 'articles', es: 'articulos', en: 'articles' };

export function articlesPath(lang: Lang): string {
  return `${BASE[lang]}${ARTICLES_SLUG[lang]}/`;
}

export function articlePath(slug: string, lang: Lang): string {
  return `${articlesPath(lang)}${slug}/`;
}

export function guidePath(slug: string, lang: Lang): string {
  return `${page('guides', lang)}${slug}/`;
}

/** Les trois versions d'une page, pour les balises hreflang et le sélecteur de langue. */
export type Versions = Record<Lang, string>;

export function versionsPage(id: PageFixe): Versions {
  return Object.fromEntries(LANGS.map((l) => [l, page(id, l)])) as Versions;
}

export function versionsAccueil(): Versions {
  return { ...BASE };
}
