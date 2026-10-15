// Titres des pages « plateforme × situation » les plus recherchées, calqués sur
// les formulations réelles (recherche du 15/10/2026, autocomplétion Google et Bing).
// Les autres pages gardent le titre de la démarche officielle.

import type { Lang } from '../../shared/vocab';

type Titres = Record<Lang, { titre: string; h1: string }>;

export const SEO_PLATEFORME: Record<string, Titres> = {
  'usurpation:instagram': {
    fr: { titre: 'Faux compte Instagram à votre nom : le faire supprimer', h1: 'Quelqu’un se fait passer pour vous sur Instagram : que faire' },
    es: { titre: 'Alguien se hace pasar por ti en Instagram: qué hacer', h1: 'Alguien se hace pasar por ti en Instagram: cómo eliminar la cuenta' },
    en: { titre: 'Someone is impersonating you on Instagram: what to do', h1: 'Someone is pretending to be you on Instagram: get it removed' },
  },
  'piratage-compte:instagram': {
    fr: { titre: 'Compte Instagram piraté : que faire et qui contacter', h1: 'Compte Instagram piraté : récupérer l’accès, étape par étape' },
    es: { titre: 'Me hackearon Instagram: cómo recuperar la cuenta', h1: 'Me hackearon Instagram: cómo recuperar tu cuenta paso a paso' },
    en: { titre: 'Instagram hacked and email changed: how to get it back', h1: 'Your Instagram was hacked: how to get your account back' },
  },
  'piratage-compte:whatsapp': {
    fr: { titre: 'WhatsApp piraté : que faire tout de suite', h1: 'Votre compte WhatsApp a été piraté : que faire tout de suite' },
    es: { titre: 'Me hackearon WhatsApp: qué hacer ahora mismo', h1: 'Me hackearon WhatsApp: qué hacer ahora (y si piden dinero)' },
    en: { titre: 'WhatsApp hacked: what to do right now', h1: 'Your WhatsApp was hacked: what to do right now' },
  },
  'piratage-compte:facebook': {
    fr: { titre: 'Compte Facebook piraté : le récupérer, même désactivé', h1: 'Compte Facebook piraté : que faire pour le récupérer' },
    es: { titre: 'Me hackearon Facebook y cambiaron el correo: qué hacer', h1: 'Me hackearon Facebook y cambiaron mi correo: cómo recuperarlo' },
    en: { titre: 'Facebook hacked and disabled: how to recover it', h1: 'Your Facebook was hacked (or disabled): how to get it back' },
  },
  'faux-avis:google-maps': {
    fr: { titre: 'Faux avis Google : le faire supprimer (et si Google refuse)', h1: 'Faux avis Google sur votre entreprise : le faire supprimer' },
    es: { titre: 'Cómo eliminar una reseña falsa de Google', h1: 'Reseña falsa en Google: cómo conseguir que la eliminen' },
    en: { titre: 'How to remove a fake Google review (and if Google says no)', h1: 'How to get a fake Google review removed' },
  },
  'donnees-personnelles:google': {
    fr: { titre: 'Supprimer vos infos personnelles de Google (2026)', h1: 'Supprimer vos informations personnelles des résultats Google' },
    es: { titre: 'Cómo eliminar tus datos personales de Google gratis', h1: 'Eliminar tus datos personales de Google e internet, gratis' },
    en: { titre: 'Remove personal information from Google Search (free)', h1: 'How to remove your personal information from Google, free' },
  },
  'diffamation:facebook': {
    fr: { titre: 'Diffamation ou harcèlement sur Facebook : que faire', h1: 'Diffamation ou harcèlement sur Facebook : faire retirer, garder les preuves' },
    es: { titre: 'Me están difamando en Facebook: qué puedo hacer', h1: 'Te están difamando en Facebook: qué puedes hacer' },
    en: { titre: 'Someone is posting lies about you on Facebook: what to do', h1: 'Someone is posting lies about you on Facebook' },
  },
  'droit-auteur:instagram': {
    fr: { titre: 'Quelqu’un utilise vos photos sur Instagram : que faire', h1: 'Quelqu’un utilise vos photos sur Instagram : les faire retirer' },
    es: { titre: 'Usan tus fotos en Instagram sin permiso: qué hacer', h1: 'Alguien usa tus fotos en Instagram sin permiso: qué hacer' },
    en: { titre: 'Someone is using your photos on Instagram: what to do', h1: 'Someone is using your photos on Instagram: get them removed' },
  },
};
