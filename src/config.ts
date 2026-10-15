// Coordonnées publiques de Devuelta. Une seule source : changer un numéro ici
// le change sur tout le site.

import { CONTACT_EMAIL, type Lang } from '../shared/vocab';
export { SITE_URL } from '../shared/site';

export const EMAIL = CONTACT_EMAIL;

// Un numéro WhatsApp par langue de réponse.
export const WHATSAPP: Record<Lang, { e164: string; affichage: string }> = {
  fr: { e164: '+41768232468', affichage: '+41 76 823 24 68' },
  es: { e164: '+41783169306', affichage: '+41 78 316 93 06' },
  en: { e164: '+233592151139', affichage: '+233 59 215 11 39' },
};

const MESSAGE_WHATSAPP: Record<Lang, string> = {
  fr: 'Bonjour, je viens du site Devuelta.',
  es: 'Hola, vengo del sitio de Devuelta.',
  en: 'Hello, I found you on the Devuelta website.',
};

export function lienWhatsApp(lang: Lang): string {
  return `https://wa.me/${WHATSAPP[lang].e164.replace('+', '')}?text=${encodeURIComponent(MESSAGE_WHATSAPP[lang])}`;
}

export const NOM_LANGUE: Record<Lang, string> = { fr: 'Français', es: 'Español', en: 'English' };
