// Grille de prix unique, utilisée par le site (page Tarifs) et par l'outil
// (calcul de l'ouverture et du solde d'un dossier). Changer un prix ici le
// change partout.
//
// Règle : la moitié pour démarrer, l'autre moitié seulement pour les liens
// effectivement retirés (ou déréférencés quand c'est la démarche choisie).
// Prix divisés par deux pour les personnes qui vivent en Afrique ou en
// Amérique latine et Caraïbes. Personnes mineures : jamais de paiement.

export type IdFormule = 'un-lien' | 'petit' | 'dossier';

export interface Formule {
  id: IdFormule;
  min: number; // nombre de liens
  max: number;
  prix: number; // euros, prix complet (zone standard)
  ghs: number; // prix complet en zone réduite, en cedis
  fcfa: number; // prix complet en zone réduite, en francs CFA
  usd: number; // simple repère en dollars US (zone réduite, Amérique latine) : le paiement se fait en euros convertis en cedis, jamais en dollars
}

export const FORMULES: readonly Formule[] = [
  { id: 'un-lien', min: 1, max: 1, prix: 40, ghs: 270, fcfa: 13_000, usd: 22 },
  { id: 'petit', min: 2, max: 5, prix: 80, ghs: 540, fcfa: 26_000, usd: 45 },
  { id: 'dossier', min: 6, max: 15, prix: 160, ghs: 1_080, fcfa: 52_000, usd: 90 },
];

/** Au-delà de 15 liens, ou cas difficile : sur devis, à partir de ce prix (zone standard). */
export const DEVIS_A_PARTIR_DE = 250;

/** Part payée à l'ouverture du dossier. */
export const PART_OUVERTURE = 0.5;

/** Coefficient des prix pour l'Afrique et l'Amérique latine et Caraïbes. */
export const COEF_ZONE_REDUITE = 0.5;

/**
 * Commerces et entreprises (par exemple de faux avis sur une fiche
 * d'établissement) : mêmes formules, prix multipliés par ce coefficient.
 */
export const COEF_PRO = 2;

// Pays où les prix sont divisés par deux (codes ISO 3166-1 alpha-2).
// Les départements et territoires d'outre-mer français suivent le prix standard.
const AFRIQUE =
  'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW';
const AMERIQUE_LATINE_CARAIBES =
  'AR BO BR CL CO CR CU DO EC SV GT HN HT MX NI PA PY PE UY VE AG BS BB BZ DM GD GY JM KN LC VC SR TT';
export const PAYS_ZONE_REDUITE: ReadonlySet<string> = new Set(`${AFRIQUE} ${AMERIQUE_LATINE_CARAIBES}`.split(' '));

export type Zone = 'standard' | 'reduite';

/** Zone de prix d'un pays ; null si le pays n'est pas connu (« autre pays »). */
export function zoneDuPays(pays: string | null | undefined): Zone | null {
  if (!pays || pays === 'ZZ') return null;
  return PAYS_ZONE_REDUITE.has(pays.toUpperCase()) ? 'reduite' : 'standard';
}

export function formulePour(nombreLiens: number): Formule | null {
  if (!Number.isFinite(nombreLiens) || nombreLiens < 1) return null;
  return FORMULES.find((f) => nombreLiens >= f.min && nombreLiens <= f.max) ?? null;
}

const arrondi = (n: number) => Math.round(n * 100) / 100;

export interface CalculPrix {
  formule: Formule | null; // null = sur devis (plus de 15 liens)
  zone: Zone;
  pro: boolean;
  total: number | null; // euros ; null = sur devis
  ouverture: number | null;
  soldeMaximum: number | null;
  soldeDu: number | null; // au prorata des liens retirés
}

/**
 * Prix d'un dossier : formule selon le nombre de liens, part d'ouverture, et
 * solde dû au prorata des liens retirés.
 */
export function calculerPrix(nombreLiens: number, liensRetires: number, zone: Zone, pro = false): CalculPrix {
  const formule = formulePour(nombreLiens);
  if (!formule) return { formule: null, zone, pro, total: null, ouverture: null, soldeMaximum: null, soldeDu: null };
  const coef = (zone === 'reduite' ? COEF_ZONE_REDUITE : 1) * (pro ? COEF_PRO : 1);
  const total = arrondi(formule.prix * coef);
  const ouverture = arrondi(total * PART_OUVERTURE);
  const soldeMaximum = arrondi(total - ouverture);
  const retires = Math.max(0, Math.min(liensRetires, nombreLiens));
  const soldeDu = arrondi((soldeMaximum * retires) / nombreLiens);
  return { formule, zone, pro, total, ouverture, soldeMaximum, soldeDu };
}

/** Montant affiché en euros, à la française ou non (« 7,50 € » / « €7.50 »). */
export function euros(n: number, lang: 'fr' | 'es' | 'en'): string {
  const texte = Number.isInteger(n) ? String(n) : n.toFixed(2);
  if (lang === 'en') return `€${texte}`;
  return `${texte.replace('.', ',')} €`;
}

/** Nombre entier avec séparateur de milliers (espace fine insécable en français). */
export function nombre(n: number, lang: 'fr' | 'es' | 'en'): string {
  const s = String(Math.round(n));
  const sep = lang === 'en' ? ',' : lang === 'es' ? ' ' : ' ';
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
