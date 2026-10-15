// Plan d'action proposé pour un lien : quoi faire, dans quel ordre, avec quel
// modèle de courrier. Rien n'est envoyé : c'est une liste de suggestions que
// l'équipe valide. Toutes les données viennent des fichiers vérifiés (shared/).

import plateformesData from '../../shared/plateformes.json';
import referentielData from '../../shared/referentiel.json';
import urgencesData from '../../shared/urgences.json';
import type { T3 } from '../../shared/vocab';

interface ActionPlateforme {
  situation: string;
  titre: T3;
  url: string;
  url_par_langue?: Partial<T3>;
  verifie?: boolean;
}
interface Plateforme {
  id: string;
  nom: string;
  type: string;
  actions: ActionPlateforme[];
}
interface Ressource {
  type: string;
  nom: string;
  telephone?: string | null;
  url?: string | null;
  verifie?: boolean;
}
interface PaysUrgence {
  code: string;
  ressources: Ressource[];
}
export interface Fiche {
  id: string;
  pays: string;
  code_pays: string;
  categorie: string;
  statut: string;
  role_devuelta?: string;
  niveau_urgence?: string;
  delai_couperet?: string;
  action_immediate?: string;
  date_derniere_verification?: string;
  [k: string]: unknown;
}

const PLATEFORMES: Plateforme[] = ((plateformesData as { plateformes?: Plateforme[] }).plateformes ?? []) as Plateforme[];
const URGENCES: PaysUrgence[] = ((urgencesData as { pays?: PaysUrgence[] }).pays ?? []) as PaysUrgence[];
export const FICHES: Fiche[] = ((referentielData as { fiches?: Fiche[] }).fiches ?? []) as Fiche[];

const UE = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
]);
const PLATEFORMES_US = new Set([
  'facebook', 'instagram', 'whatsapp', 'x', 'youtube', 'snapchat', 'linkedin', 'reddit', 'discord', 'google', 'google-maps',
  'bing', 'tiktok', 'onlyfans', 'pornhub',
]);

export interface Suggestion {
  code: string;
  modele?: string | null;
  url?: string | null;
  titre?: T3 | null;
  destinataire?: string | null;
  email?: string | null;
  condition?: string | null;
}

export interface ContexteLien {
  situation: string;
  pays_client: string | null;
  priorite: string;
  plateforme: string | null;
  registrar: string | null;
  registrar_abuse: string | null;
  hebergeur: string | null;
  hebergeur_abuse: string | null;
  pays_reseau: string | null;
  derriere_cloudflare: boolean;
}

function actionPlateforme(p: Plateforme, situation: string): ActionPlateforme | null {
  return (
    p.actions.find((a) => a.situation === situation) ??
    // À défaut, le signalement le plus proche.
    p.actions.find((a) => (situation === 'deepfake' ? a.situation === 'contenu-intime' : false)) ??
    p.actions.find((a) => a.situation === 'diffamation') ??
    p.actions[0] ??
    null
  );
}

function ressource(pays: string | null, types: string[]): Ressource | null {
  if (!pays) return null;
  const p = URGENCES.find((u) => u.code === pays);
  if (!p) return null;
  for (const t of types) {
    const r = p.ressources.find((x) => x.type === t && x.verifie !== false);
    if (r) return r;
  }
  return null;
}

export function planPourLien(c: ContexteLien): Suggestion[] {
  const out: Suggestion[] = [];
  const intime = c.situation === 'contenu-intime' || c.situation === 'deepfake';
  const clientUE = !!c.pays_client && UE.has(c.pays_client);
  const hebergeurUE = !!c.pays_reseau && UE.has(c.pays_reseau);

  if (c.priorite === 'mineur-immediat') {
    out.push({ code: 'mineur', url: 'https://takeitdown.ncmec.org/' });
    const r = ressource(c.pays_client, ['mineurs', 'signalement-contenu', 'police-en-ligne']);
    if (r) out.push({ code: 'police', url: r.url ?? null, destinataire: r.nom });
    return out;
  }

  if (c.plateforme) {
    const p = PLATEFORMES.find((x) => x.id === c.plateforme);
    const a = p ? actionPlateforme(p, c.situation) : null;
    out.push({ code: 'plateforme', destinataire: p?.nom ?? c.plateforme, url: a?.url ?? null, titre: a?.titre ?? null });
    if (intime && PLATEFORMES_US.has(c.plateforme)) out.push({ code: 'takeitdown', modele: 'takeitdown-notice' });
    if (clientUE || intime) out.push({ code: 'dsa', modele: 'dsa-art16' });
  } else {
    out.push({ code: 'site-contact' });
    if (hebergeurUE) out.push({ code: 'dsa', modele: 'dsa-art16', destinataire: c.hebergeur });
    if (clientUE) out.push({ code: 'rgpd', modele: 'rgpd-art17' });
    out.push({
      code: 'registrar',
      modele: 'registrar-abuse',
      destinataire: c.registrar,
      email: c.registrar_abuse,
    });
    if (c.derriere_cloudflare) {
      out.push({ code: 'cloudflare', url: 'https://abuse.cloudflare.com/' });
    } else {
      out.push({ code: 'hebergeur', modele: hebergeurUE ? 'dsa-art16' : 'hebergeur-abuse', destinataire: c.hebergeur, email: c.hebergeur_abuse });
    }
  }

  if (intime) out.push({ code: 'stopncii', url: 'https://stopncii.org/' });
  if (intime || c.situation === 'droit-auteur') {
    out.push({ code: 'dmca', modele: 'dmca-512', condition: 'auteur' });
  }
  if (clientUE && c.plateforme !== 'google' && c.plateforme !== 'bing') {
    out.push({ code: 'dereferencement', modele: 'dereferencement' });
  }
  const reg = ressource(c.pays_client, ['protection-donnees']);
  if (reg) out.push({ code: 'regulateur', url: reg.url ?? null, destinataire: reg.nom });
  if (intime || c.situation === 'chantage' || c.situation === 'usurpation') {
    const pol = ressource(c.pays_client, ['signalement-contenu', 'police-en-ligne']);
    if (pol) out.push({ code: 'police', url: pol.url ?? null, destinataire: pol.nom });
  }
  return out;
}

const CATEGORIE: Record<string, string[]> = {
  'contenu-intime': ['contenu-intime', 'transversal', 'donnees-personnelles'],
  deepfake: ['deepfake', 'contenu-intime', 'transversal', 'donnees-personnelles'],
  usurpation: ['usurpation', 'transversal', 'donnees-personnelles'],
  'piratage-compte': ['piratage-compte', 'transversal'],
  'faux-avis': ['diffamation', 'transversal'],
  diffamation: ['diffamation', 'transversal', 'donnees-personnelles'],
  'donnees-personnelles': ['donnees-personnelles', 'transversal'],
  'droit-auteur': ['droit-auteur', 'transversal'],
  chantage: ['contenu-intime', 'transversal'],
  autre: ['transversal', 'donnees-personnelles'],
};

/** Fiches du référentiel utiles pour un dossier (situation + pays). */
export function fichesPour(situation: string, pays: string | null): Fiche[] {
  const cats = CATEGORIE[situation] ?? ['transversal'];
  const ue = !!pays && UE.has(pays);
  return FICHES.filter((f) => {
    if (!cats.includes(f.categorie)) return false;
    const cp = String(f.code_pays ?? '').toUpperCase();
    if (cp === 'INTL') return true;
    if (cp === 'UE') return ue || !pays;
    return !pays || cp === pays;
  });
}

/** Fiches dont la dernière vérification date de plus de six mois. */
export function fichesAReverifier(maintenant = new Date()): Fiche[] {
  const limite = new Date(maintenant);
  limite.setUTCMonth(limite.getUTCMonth() - 6);
  const l = limite.toISOString().slice(0, 10);
  return FICHES.filter((f) => !f.date_derniere_verification || String(f.date_derniere_verification) < l);
}
