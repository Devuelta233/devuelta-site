// Textes fixes du robot Telegram, en trois langues. Aucune IA : à part ces
// textes (accueil, consignes, accusés de réception), rien ne part tout seul ;
// chaque vraie réponse est écrite et envoyée par une personne, depuis l'outil.
// Français : « vous ». Espagnol : « tú ». Anglais : simple et direct.
// Autant que possible, ce sont les mots du site, repris tels quels (formulaire
// « Confier mon dossier », diagnostic, page Aide urgente) : une seule source.

import { NOM_LANGUE } from '../src/config';
import { C } from '../src/i18n/commun';
import { URGENCE } from '../src/i18n/pages';
import { page, type PageFixe } from '../src/i18n/routes';
import { SITUATIONS_TEXTE } from '../src/i18n/situations';
import { TEXTES_CONFIER } from '../src/scripts/confier-textes';
import { TEXTES_DIAGNOSTIC } from '../src/scripts/diagnostic-textes';
import { SITE_URL } from '../shared/site';
import { typoProfonde } from '../shared/typo';
import { CONTACT_EMAIL, LANGS, SITUATIONS, SITUATION_LABEL, type Lang } from '../shared/vocab';

export { NOM_LANGUE };

const adresse = (p: PageFixe, lang: Lang) => `${SITE_URL}${page(p, lang)}`;

/** Premier message : une courte ligne par langue, puis les boutons de langue. */
export const ACCUEIL = [
  'Bonjour, ici Devuelta. Choisissez votre langue.',
  'Hola, aquí Devuelta. Elige tu idioma.',
  'Hello, this is Devuelta. Choose your language.',
].join('\n');

export interface TextesTelegram {
  /** Message automatique, pas d'image, accord et politique de confidentialité. */
  information: string;
  age: string;
  oui: string;
  non: string;
  /** Moins de 18 ans : l'aide officielle gratuite, comme sur le formulaire du site. */
  mineur: string;
  situation: string;
  menace: string;
  /** Les bons réflexes en cas de chantage (page Aide urgente du site). */
  conseilsMenace: string;
  liens: string;
  /** Message suivant, ajouté au dossier (une fois par heure au plus). */
  recu: string;
  /** /start alors qu'une demande est déjà ouverte ({ref} = sa référence). */
  dejaOuverte: string;
  /** Photo, vidéo, fichier, note vocale, autocollant… : jamais gardés. */
  liensSeulement: string;
}

function reflexes(lang: Lang): string[] {
  return SITUATIONS_TEXTE.chantage[lang].premiers.map((p, i) => `${i + 1}. ${p}`);
}

const FR: TextesTelegram = {
  information: [
    'Ceci est un message automatique. Une personne de l’équipe vous répondra ici, sur Telegram.',
    '',
    'N’envoyez jamais d’image : nous travaillons à partir des liens, pas de vos images.',
    '',
    'En continuant, vous acceptez que Devuelta utilise vos réponses pour vous recontacter au sujet de votre situation. Vous pouvez retirer votre accord à tout moment.',
    `${TEXTES_CONFIER.fr.confidentialite} : ${adresse('confidentialite', 'fr')}`,
  ].join('\n'),
  age: 'Avez-vous 18 ans ou plus ?',
  oui: TEXTES_CONFIER.fr.oui,
  non: TEXTES_CONFIER.fr.non,
  mineur: [TEXTES_CONFIER.fr.mineurMessage, '', `${C.nav.urgence.fr} : ${adresse('urgence', 'fr')}`, CONTACT_EMAIL].join('\n'),
  situation: TEXTES_DIAGNOSTIC.fr.q1,
  menace: 'Quelqu’un vous menace ou vous demande de l’argent ?',
  conseilsMenace: [URGENCE.danger.fr, '', `${URGENCE.reflexesTitre.fr} :`, ...reflexes('fr'), '', `${C.nav.urgence.fr} : ${adresse('urgence', 'fr')}`].join('\n'),
  liens: [
    'Envoyez les liens concernés, un lien par ligne : copiez l’adresse de chaque page.',
    'Pas de lien ? Décrivez en quelques mots ce qui se passe, sans décrire le contenu intime.',
  ].join('\n'),
  recu: 'Bien reçu : c’est ajouté à votre dossier. Une personne de l’équipe vous répondra ici.',
  dejaOuverte: 'Votre demande {ref} est ouverte. Écrivez-nous ici : une personne de l’équipe vous répondra.',
  liensSeulement: 'N’envoyez jamais d’image ni de fichier : nous ne les gardons pas. Envoyez seulement les liens, en texte : l’adresse de chaque page.',
};

const ES: TextesTelegram = {
  information: [
    'Este es un mensaje automático. Una persona del equipo te responderá aquí, en Telegram.',
    '',
    'Nunca envíes imágenes: trabajamos a partir de los enlaces, no de tus imágenes.',
    '',
    'Si sigues, aceptas que Devuelta use tus respuestas para contactarte sobre tu situación. Puedes retirar tu consentimiento cuando quieras.',
    `${TEXTES_CONFIER.es.confidentialite}: ${adresse('confidentialite', 'es')}`,
  ].join('\n'),
  age: '¿Tienes 18 años o más?',
  oui: TEXTES_CONFIER.es.oui,
  non: TEXTES_CONFIER.es.non,
  mineur: [TEXTES_CONFIER.es.mineurMessage, '', `${C.nav.urgence.es}: ${adresse('urgence', 'es')}`, CONTACT_EMAIL].join('\n'),
  situation: TEXTES_DIAGNOSTIC.es.q1,
  menace: '¿Alguien te amenaza o te pide dinero?',
  conseilsMenace: [URGENCE.danger.es, '', `${URGENCE.reflexesTitre.es}:`, ...reflexes('es'), '', `${C.nav.urgence.es}: ${adresse('urgence', 'es')}`].join('\n'),
  liens: [
    'Envía los enlaces, uno por línea: copia la dirección de cada página.',
    '¿No tienes enlace? Cuenta en pocas palabras lo que pasa, sin describir el contenido íntimo.',
  ].join('\n'),
  recu: 'Recibido: lo añadimos a tu caso. Una persona del equipo te responderá aquí.',
  dejaOuverte: 'Tu solicitud {ref} está abierta. Escríbenos aquí: una persona del equipo te responderá.',
  liensSeulement: 'Nunca envíes imágenes ni archivos: no los guardamos. Envía solo los enlaces, como texto: la dirección de cada página.',
};

const EN: TextesTelegram = {
  information: [
    'This is an automatic message. A member of our team will reply to you here, on Telegram.',
    '',
    'Never send images: we work from links, not from your images.',
    '',
    'By continuing, you agree that Devuelta may use your answers to contact you about your situation. You can withdraw your consent at any time.',
    `${TEXTES_CONFIER.en.confidentialite}: ${adresse('confidentialite', 'en')}`,
  ].join('\n'),
  age: 'Are you 18 or older?',
  oui: TEXTES_CONFIER.en.oui,
  non: TEXTES_CONFIER.en.non,
  mineur: [TEXTES_CONFIER.en.mineurMessage, '', `${C.nav.urgence.en}: ${adresse('urgence', 'en')}`, CONTACT_EMAIL].join('\n'),
  situation: TEXTES_DIAGNOSTIC.en.q1,
  menace: 'Is someone threatening you or asking you for money?',
  conseilsMenace: [URGENCE.danger.en, '', `${URGENCE.reflexesTitre.en}:`, ...reflexes('en'), '', `${C.nav.urgence.en}: ${adresse('urgence', 'en')}`].join('\n'),
  liens: [
    'Send the links concerned, one per line: copy the address of each page.',
    'No link? Describe in a few words what is happening, without describing intimate content.',
  ].join('\n'),
  recu: 'Received: it has been added to your case. A member of our team will reply here.',
  dejaOuverte: 'Your request {ref} is open. Write to us here: a member of our team will reply.',
  liensSeulement: 'Never send images or files: we do not keep them. Send only the links, as text: the address of each page.',
};

export const TEXTES_TELEGRAM: Record<Lang, TextesTelegram> = typoProfonde({ fr: FR, es: ES, en: EN });

/** Consigne « liens seulement » quand la langue n'est pas encore choisie : les trois langues. */
export const LIENS_SEULEMENT_3 = LANGS.map((l) => TEXTES_TELEGRAM[l].liensSeulement).join('\n\n');

/** Boutons des situations : la même liste et les mêmes libellés que le formulaire du site. */
export function boutonsSituation(lang: Lang): Array<{ valeur: string; texte: string }> {
  return SITUATIONS.map((s) => ({ valeur: s, texte: SITUATION_LABEL[s][lang] }));
}

/** Lien du diagnostic gratuit, dans la langue de la personne. */
export function lienDiagnostic(lang: Lang): string {
  return adresse('diagnostic', lang);
}
