// Vocabulaire commun au site public, au moteur (Worker) et à l'outil interne.
// Une seule liste par notion : si une valeur change ici, elle change partout.

export const LANGS = ['fr', 'es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type T3 = Record<Lang, string>;
export type L3 = Record<Lang, string[]>;

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

// Situations : mêmes identifiants que les catégories du référentiel,
// plus « chantage » et « autre ».
export const SITUATIONS = [
  'contenu-intime',
  'deepfake',
  'usurpation',
  'piratage-compte',
  'faux-avis',
  'diffamation',
  'donnees-personnelles',
  'droit-auteur',
  'chantage',
  'autre',
] as const;
export type Situation = (typeof SITUATIONS)[number];
export type SituationReelle = Exclude<Situation, 'autre'>;
export const SITUATIONS_REELLES = SITUATIONS.filter((s) => s !== 'autre') as SituationReelle[];

export const SITUATION_LABEL: Record<Situation, T3> = {
  'contenu-intime': {
    fr: 'Photo ou vidéo intime diffusée',
    es: 'Foto o video íntimo difundido',
    en: 'Intimate photo or video shared',
  },
  deepfake: {
    fr: 'Montage ou image truquée par IA',
    es: 'Montaje o imagen falsa creada con IA',
    en: 'Fake or AI-generated image',
  },
  usurpation: {
    fr: "Faux profil ou usurpation d’identité",
    es: 'Perfil falso o suplantación de identidad',
    en: 'Fake profile or impersonation',
  },
  'piratage-compte': {
    fr: 'Compte piraté ou accès perdu',
    es: 'Cuenta hackeada o acceso perdido',
    en: 'Hacked account or lost access',
  },
  'faux-avis': {
    fr: 'Faux avis ou faux commentaires',
    es: 'Reseñas o comentarios falsos',
    en: 'Fake reviews or comments',
  },
  diffamation: {
    fr: 'Propos diffamatoires ou harcèlement',
    es: 'Difamación o acoso',
    en: 'Defamation or harassment',
  },
  'donnees-personnelles': {
    fr: 'Adresse, téléphone ou papiers exposés',
    es: 'Dirección, teléfono o documentos expuestos',
    en: 'Address, phone or ID exposed',
  },
  'droit-auteur': {
    fr: 'Photo ou création réutilisée sans accord',
    es: 'Foto o creación usada sin permiso',
    en: 'Photo or work reused without permission',
  },
  chantage: {
    fr: 'Menace ou chantage',
    es: 'Amenaza o chantaje',
    en: 'Threats or blackmail',
  },
  autre: {
    fr: 'Autre situation',
    es: 'Otra situación',
    en: 'Something else',
  },
};

export function isSituation(v: unknown): v is Situation {
  return typeof v === 'string' && (SITUATIONS as readonly string[]).includes(v);
}

// Pays proposés. « ZZ » = autre pays.
export const PAYS = ['FR', 'BE', 'CH', 'ES', 'MX', 'AR', 'CO', 'US', 'GB', 'CA', 'GH', 'CI', 'ZZ'] as const;
export type Pays = (typeof PAYS)[number];
// Union européenne (avec les régions ultrapériphériques françaises) : droits du DSA,
// droit de rétractation.
export const PAYS_UE: readonly string[] = (
  'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE GF GP MQ RE YT MF'
).split(' ');

/** Tous les autres pays acceptés (codes ISO 3166-1 alpha-2), pour que personne ne soit « autre pays ». */
export const AUTRES_CODES_PAYS: readonly string[] = (
  'AD AE AF AG AI AL AM AO AS AT AU AW AX AZ BA BB BD BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CC CD CF CG CK CL CM CN CR CU CV CW CX CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG EH ER ET FI FJ FK FM FO GA GD GE GF GG GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT ' +
  'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ' +
  'ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ');

export const PAYS_LABEL: Record<Pays, T3> = {
  FR: { fr: 'France', es: 'Francia', en: 'France' },
  BE: { fr: 'Belgique', es: 'Bélgica', en: 'Belgium' },
  CH: { fr: 'Suisse', es: 'Suiza', en: 'Switzerland' },
  ES: { fr: 'Espagne', es: 'España', en: 'Spain' },
  MX: { fr: 'Mexique', es: 'México', en: 'Mexico' },
  AR: { fr: 'Argentine', es: 'Argentina', en: 'Argentina' },
  CO: { fr: 'Colombie', es: 'Colombia', en: 'Colombia' },
  US: { fr: 'États-Unis', es: 'Estados Unidos', en: 'United States' },
  GB: { fr: 'Royaume-Uni', es: 'Reino Unido', en: 'United Kingdom' },
  CA: { fr: 'Canada', es: 'Canadá', en: 'Canada' },
  GH: { fr: 'Ghana', es: 'Ghana', en: 'Ghana' },
  CI: { fr: "Côte d’Ivoire", es: 'Costa de Marfil', en: "Côte d’Ivoire" },
  ZZ: { fr: 'Autre pays', es: 'Otro país', en: 'Another country' },
};

export function isPays(v: unknown): v is string {
  return typeof v === 'string' && ((PAYS as readonly string[]).includes(v) || AUTRES_CODES_PAYS.includes(v));
}

const nomsRegion = new Map<string, Intl.DisplayNames | null>();

/** Nom d'un pays dans la langue voulue (liste principale, sinon noms standard du navigateur). */
export function nomPays(code: string, lang: Lang): string {
  if ((PAYS as readonly string[]).includes(code)) return PAYS_LABEL[code as Pays][lang];
  if (!nomsRegion.has(lang)) {
    try {
      nomsRegion.set(lang, new Intl.DisplayNames([lang], { type: 'region' }));
    } catch {
      nomsRegion.set(lang, null);
    }
  }
  try {
    return nomsRegion.get(lang)?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Les autres pays, triés par nom dans la langue voulue. */
export function autresPays(lang: Lang): Array<{ code: string; nom: string }> {
  return AUTRES_CODES_PAYS.filter((c) => !(PAYS as readonly string[]).includes(c))
    .map((code) => ({ code, nom: nomPays(code, lang) }))
    .sort((a, b) => a.nom.localeCompare(b.nom, lang));
}

// Outil interne ---------------------------------------------------------------

export const ROLES = ['admin', 'membre'] as const;
export type Role = (typeof ROLES)[number];

export const STATUTS_DEMANDE = ['nouvelle', 'convertie', 'orientee', 'refusee', 'spam'] as const;
export type StatutDemande = (typeof STATUTS_DEMANDE)[number];

export const STATUTS_DOSSIER = ['ouvert', 'en-cours', 'en-attente', 'resolu', 'clos', 'oriente'] as const;
export type StatutDossier = (typeof STATUTS_DOSSIER)[number];
export const STATUTS_DOSSIER_FERMES: readonly StatutDossier[] = ['resolu', 'clos', 'oriente'];

export const PRIORITES = ['normal', 'prioritaire', 'mineur-immediat'] as const;
export type Priorite = (typeof PRIORITES)[number];

export const STATUTS_CONTENU = ['a-valider', 'a-traiter', 'signale', 'retire', 'refuse', 'reapparu'] as const;
export type StatutContenu = (typeof STATUTS_CONTENU)[number];

export const STATUTS_COURRIER = ['brouillon', 'valide', 'envoye', 'annule'] as const;
export type StatutCourrier = (typeof STATUTS_COURRIER)[number];

export const STATUTS_ETAPE = ['a-faire', 'envoye', 'reponse', 'succes', 'refus', 'sans-reponse'] as const;
export type StatutEtape = (typeof STATUTS_ETAPE)[number];

// Échelle d'escalade, du plus rapide au plus lourd. Le délai est un délai
// interne de relance (en jours), pas un délai légal.
export const ETAPES = [
  { id: 'plateforme', delai: 7 },
  { id: 'site-contact', delai: 7 },
  { id: 'takeitdown', delai: 3 },
  { id: 'dsa', delai: 7 },
  { id: 'rgpd', delai: 30 },
  { id: 'registrant', delai: 7 },
  { id: 'registrar', delai: 7 },
  { id: 'hebergeur', delai: 7 },
  { id: 'cloudflare', delai: 7 },
  { id: 'dmca', delai: 3 },
  { id: 'dereferencement', delai: 30 },
  { id: 'regulateur', delai: 60 },
  { id: 'stopncii', delai: 0 },
  { id: 'police', delai: 0 },
  { id: 'autre', delai: 7 },
] as const;
export type TypeEtape = (typeof ETAPES)[number]['id'];
export const TYPES_ETAPE = ETAPES.map((e) => e.id) as TypeEtape[];
export function delaiEtape(t: string): number {
  return ETAPES.find((e) => e.id === t)?.delai ?? 7;
}

// Versions des textes acceptés (consentement public, accord de confidentialité).
export const CONSENTEMENT_VERSION = '2026-10-15';
export const NDA_VERSION = '2026-10-15';

export const CONTACT_EMAIL = 'team.devuelta@protonmail.com';
