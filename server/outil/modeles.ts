// Modèles de courriers : remplissage à partir du dossier. Toute variable
// inconnue devient un marqueur « [À COMPLÉTER : …] » qui bloque la validation.

import data from '../../shared/modeles.json';
import { CONTACT_EMAIL, isPays, nomPays, type Lang } from '../../shared/vocab';

export interface Modele {
  id: string;
  langue: Lang;
  nom: string;
  quand_utiliser: string;
  destinataire_type: string;
  fiche_referentiel: string | null;
  objet: string;
  corps: string;
  paragraphes_consentement: { jamais_consenti: string; consentement_retire: string } | null;
  elements_obligatoires: string[];
  pieces_jointes: string[];
  delai_reponse_jours: number | null;
  sources: string[];
  note: string;
}

export const MODELES: Modele[] = ((data as { modeles?: Modele[] }).modeles ?? []) as Modele[];
export const MARQUEUR = '[À COMPLÉTER';

// Type d'étape créée quand le courrier est marqué « envoyé ».
export const ETAPE_DU_MODELE: Record<string, string | null> = {
  'rgpd-art17': 'rgpd',
  'dsa-art16': 'dsa',
  'takeitdown-notice': 'takeitdown',
  'aepd-canal-prioritario': 'regulateur',
  'dmca-512': 'dmca',
  'registrar-abuse': 'registrar',
  'hebergeur-abuse': 'hebergeur',
  relance: 'autre',
  dereferencement: 'dereferencement',
  mandat: null,
};

export function trouverModele(id: string, langue: string): Modele | undefined {
  return MODELES.find((m) => m.id === id && m.langue === langue);
}

export function resumeModeles() {
  return MODELES.map(({ corps: _c, objet: _o, paragraphes_consentement: _p, ...meta }) => meta);
}

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', es: 'es-ES', en: 'en-US' };

export function dateLongue(iso: string, langue: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[langue], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso),
  );
}

export function marqueur(cle: string): string {
  return `${MARQUEUR} : ${cle}]`;
}

export function remplir(texte: string, vars: Record<string, string | null | undefined>): string {
  return texte.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_m, cle: string) => {
    const v = vars[cle];
    return v === null || v === undefined || v === '' ? marqueur(cle) : v;
  });
}

export interface DonneesCourrier {
  modele: Modele;
  dossier: Record<string, unknown>;
  urls: string[];
  representant: string;
  destinataire?: string | null;
  description_contenu?: string | null;
  date_demande_initiale?: string | null;
  oeuvre?: string | null;
  date_publication?: string | null;
}

export function genererCourrier(d: DonneesCourrier): { objet: string; corps: string } {
  const langue = d.modele.langue;
  const pays = d.dossier.pays;
  let paragraphe: string | null = null;
  if (d.modele.paragraphes_consentement) {
    if (d.dossier.publie_par_soi === 1) paragraphe = d.modele.paragraphes_consentement.consentement_retire;
    else if (d.dossier.publie_par_soi === 0) paragraphe = d.modele.paragraphes_consentement.jamais_consenti;
  }
  const vars: Record<string, string | null | undefined> = {
    client_nom: (d.dossier.client_nom as string | null) ?? null,
    client_pays: isPays(pays) && pays !== 'ZZ' ? nomPays(pays, langue) : null,
    representant: d.representant,
    contact_email: CONTACT_EMAIL,
    destinataire: d.destinataire ?? null,
    urls: d.urls.length ? d.urls.map((u) => `- ${u}`).join('\n') : null,
    description_contenu: d.description_contenu ?? null,
    date_du_jour: dateLongue(new Date().toISOString(), langue),
    reference: String(d.dossier.ref ?? ''),
    date_demande_initiale: d.date_demande_initiale ? dateLongue(d.date_demande_initiale, langue) : null,
    oeuvre: d.oeuvre ?? null,
    date_publication: d.date_publication ?? null,
  };
  // Le paragraphe de consentement peut lui-même contenir des variables.
  vars.paragraphe_consentement = paragraphe ? remplir(paragraphe, vars) : null;
  return { objet: remplir(d.modele.objet, vars), corps: remplir(d.modele.corps, vars) };
}

export function contientMarqueur(texte: string): boolean {
  return texte.includes(MARQUEUR) || /\{\{\s*[a-z_]+\s*\}\}/.test(texte);
}
