// Message envoyé au client quand son dossier est ouvert (mandat signé) : qui
// suit son dossier et comment lui écrire (par e-mail, ou dans la conversation
// Telegram s'il nous a écrit par notre robot ; jamais par WhatsApp). Un rappel
// anti-arnaque protège le client contre les faux « Devuelta ».

import type { Lang } from './vocab';

export interface Ouverture {
  pseudo: string;
  ref: string;
  prenom: string;
}

export function texteOuverture(o: Ouverture, lang: Lang, canal: 'email' | 'telegram' = 'email'): string {
  const telegram = canal === 'telegram';
  if (lang === 'es') {
    return [
      `Hola, ${o.pseudo}:`,
      '',
      `Tu caso ${o.ref} está abierto. ${o.prenom} se encarga de él. ${telegram ? 'Para escribirle, responde simplemente en esta conversación.' : 'Para escribirle, responde a este correo indicando tu número de caso.'}`,
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
      `Your case ${o.ref} is now open. ${o.prenom} is handling it. ${telegram ? 'To write to them, simply reply in this conversation.' : 'To write to them, reply to this email, quoting your case number.'}`,
      '',
      'We will never ask you for intimate images, or to pay any other way than through the Devuelta payment link.',
      '',
      'The Devuelta team',
    ].join('\n');
  }
  return [
    `Bonjour ${o.pseudo},`,
    '',
    `Votre dossier ${o.ref} est ouvert. C’est ${o.prenom} qui s’en occupe. ${telegram ? 'Pour lui écrire, répondez simplement dans cette conversation.' : 'Pour lui écrire, répondez à cet e-mail en indiquant votre numéro de dossier.'}`,
    '',
    'Nous ne vous demanderons jamais d’images intimes, ni de payer autrement que par le lien de paiement Devuelta.',
    '',
    'L’équipe Devuelta',
  ].join('\n');
}
