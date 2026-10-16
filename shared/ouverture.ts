// Message envoyé au client quand son dossier est ouvert (mandat signé) : c'est
// seulement à ce moment qu'il reçoit le numéro WhatsApp de la personne qui suit
// son dossier. Avant, tout passe par e-mail. Un rappel anti-arnaque protège le
// client contre les faux « Devuelta ».

import type { Lang } from './vocab';

export interface Ouverture {
  pseudo: string;
  ref: string;
  prenom: string;
  whatsapp: string;
}

export function texteOuverture(o: Ouverture, lang: Lang): string {
  if (lang === 'es') {
    return [
      `Hola, ${o.pseudo}:`,
      '',
      `Tu caso ${o.ref} está abierto. ${o.prenom} se encarga de él. Puedes escribirle por WhatsApp al ${o.whatsapp}, indicando tu número de caso.`,
      '',
      'Nunca te pediremos imágenes íntimas, ni que pagues por otro medio que el enlace de pago de Devuelta.',
      '',
      'El equipo de Devuelta',
    ].join('\n');
  }
  if (lang === 'en') {
    return [
      `Hello ${o.pseudo},`,
      '',
      `Your case ${o.ref} is now open. ${o.prenom} is handling it. You can message them on WhatsApp at ${o.whatsapp}, quoting your case number.`,
      '',
      'We will never ask you for intimate images, or to pay any other way than through the Devuelta payment link.',
      '',
      'The Devuelta team',
    ].join('\n');
  }
  return [
    `Bonjour ${o.pseudo},`,
    '',
    `Votre dossier ${o.ref} est ouvert. C’est ${o.prenom} qui s’en occupe. Vous pouvez lui écrire sur WhatsApp au ${o.whatsapp}, en indiquant votre numéro de dossier.`,
    '',
    'Nous ne vous demanderons jamais d’images intimes, ni de payer autrement que par le lien de paiement Devuelta.',
    '',
    'L’équipe Devuelta',
  ].join('\n');
}
