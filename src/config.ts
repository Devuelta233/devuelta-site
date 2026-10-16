// Coordonnées publiques de Devuelta. Une seule source : changer une adresse ici
// la change sur tout le site.

import { CONTACT_EMAIL, type Lang } from '../shared/vocab';
export { SITE_URL } from '../shared/site';

export const EMAIL = CONTACT_EMAIL;

// Contact public : l'e-mail seulement, une adresse par langue de réponse (la même
// pour l'instant). Les numéros WhatsApp de l'équipe ne sont jamais publiés : le
// client reçoit celui de la personne qui suit son dossier une fois le dossier
// ouvert (mandat signé), depuis l'outil (Réglages → numéro WhatsApp).
export const EMAIL_PAR_LANGUE: Record<Lang, string> = { fr: EMAIL, es: EMAIL, en: EMAIL };

export const NOM_LANGUE: Record<Lang, string> = { fr: 'Français', es: 'Español', en: 'English' };
