// Coordonnées publiques de Devuelta. Une seule source : changer une adresse ici
// la change sur tout le site.

import { CONTACT_EMAIL, type Lang } from '../shared/vocab';
export { SITE_URL } from '../shared/site';

export const EMAIL = CONTACT_EMAIL;

// Contact public : une seule boîte, « Team Devuelta », et le robot Telegram
// officiel quand il est en service. Aucun prénom, aucun numéro sur le site : la
// demande est attribuée dans l'outil selon la langue, et la suite se passe par
// e-mail ou dans la conversation Telegram (pas de WhatsApp, décision du 16/10/2026).
export const NOM_CONTACT = 'Team Devuelta';

export const NOM_LANGUE: Record<Lang, string> = { fr: 'Français', es: 'Español', en: 'English' };

// Robot Telegram officiel : son nom d'utilisateur, sans @ (il finit par « bot »).
// Vide = aucun lien sur le site. À remplir seulement quand le robot a été vérifié
// de bout en bout : jamais un nom non confirmé (risque de renvoyer vers le compte
// de quelqu'un d'autre).
export const TELEGRAM_ROBOT = '';

/** Ouvre la conversation avec le robot, dans la langue de la page (t.me/…?start=es). */
export function lienTelegram(lang: Lang): string {
  return `https://t.me/${TELEGRAM_ROBOT}?start=${lang}`;
}

// Réseaux sociaux de Devuelta. Une adresse vide = le lien n'apparaît pas sur le site.
export const RESEAUX: Array<{ nom: string; url: string }> = [
  { nom: 'Instagram', url: '' },
  { nom: 'TikTok', url: '' },
  { nom: 'Facebook', url: '' },
].filter((r) => r.url !== '');
