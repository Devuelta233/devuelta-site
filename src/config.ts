// Coordonnées publiques de Devuelta. Une seule source : changer une adresse ici
// la change sur tout le site.

import { CONTACT_EMAIL, type Lang } from '../shared/vocab';
export { SITE_URL } from '../shared/site';

export const EMAIL = CONTACT_EMAIL;

// Contact public : une seule boîte, « Team Devuelta ». Aucun prénom, aucun numéro
// sur le site : la demande est attribuée dans l'outil selon la langue, et le
// client reçoit le WhatsApp de la personne qui suit son dossier seulement à
// l'ouverture du dossier (mandat signé).
export const NOM_CONTACT = 'Team Devuelta';

export const NOM_LANGUE: Record<Lang, string> = { fr: 'Français', es: 'Español', en: 'English' };
