// Coordonnées publiques de Devuelta. Une seule source : changer une adresse ici
// la change sur tout le site.

import { CONTACT_EMAIL, type Lang } from '../shared/vocab';
export { SITE_URL } from '../shared/site';

export const EMAIL = CONTACT_EMAIL;

// Contact public : une seule boîte, « Team Devuelta ». Aucun prénom, aucun numéro
// sur le site : la demande est attribuée dans l'outil selon la langue, et tout
// se passe ensuite par e-mail (pas de WhatsApp, décision du 16/10/2026).
export const NOM_CONTACT = 'Team Devuelta';

export const NOM_LANGUE: Record<Lang, string> = { fr: 'Français', es: 'Español', en: 'English' };

// Réseaux sociaux de Devuelta. Une adresse vide = le lien n'apparaît pas sur le site.
export const RESEAUX: Array<{ nom: string; url: string }> = [
  { nom: 'Instagram', url: '' },
  { nom: 'TikTok', url: '' },
  { nom: 'Facebook', url: '' },
].filter((r) => r.url !== '');
