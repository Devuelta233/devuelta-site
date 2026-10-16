// E-mails envoyés automatiquement par le site (expéditeur « Team Devuelta »).
// Règles : ton chaleureux et simple, l'objet ne dit jamais de quoi il s'agit
// (seulement la référence), et chaque message rappelle comment repérer un faux.

import { SITE_URL } from './site';
import { typo } from './typo';
import type { Lang } from './vocab';

export interface Courriel {
  sujet: string;
  texte: string;
}

const QUE_FAIRE: Record<Lang, string> = { fr: '/que-faire/', es: '/es/que-hacer/', en: '/en/what-to-do/' };

const ANTI_ARNAQUE: Record<Lang, string> = {
  fr: 'Nous ne vous demanderons jamais d’images intimes, ni de payer autrement que par le lien de paiement Devuelta.',
  es: 'Nunca te pediremos imágenes íntimas, ni que pagues por otro medio que el enlace de pago de Devuelta.',
  en: 'We will never ask you for intimate images, or to pay any other way than through the Devuelta payment link.',
};

const SIGNATURE = 'Team Devuelta';

/** Juste après l'envoi du formulaire « Confier mon dossier ». */
export function emailDemandeRecue(d: { pseudo: string; ref: string; menace: boolean }, lang: Lang): Courriel {
  const guides = `${SITE_URL}${QUE_FAIRE[lang]}`;
  if (lang === 'es') {
    return {
      sujet: `Devuelta: solicitud ${d.ref} recibida`,
      texte: [
        `Hola, ${d.pseudo}:`,
        '',
        'Hemos recibido tu solicitud. Has hecho bien en escribirnos: no eres la única persona en esta situación, y hay soluciones.',
        '',
        `Tu referencia: ${d.ref}`,
        '',
        '¿Y ahora qué?',
        '1. Una persona del equipo lee tu solicitud y te responde por correo, normalmente en 24 a 48 horas.',
        '2. Te dice qué se puede hacer y cuánto cuesta. Nada empieza sin tu acuerdo.',
        ...(d.menace
          ? ['', 'Nos has indicado que hay amenazas. Si te piden dinero, no pagues. No respondas más y guarda capturas de pantalla. Miramos tu solicitud con prioridad.']
          : []),
        '',
        'Mientras tanto, nuestras guías gratuitas explican los primeros pasos:',
        guides,
        '',
        ANTI_ARNAQUE.es,
        '',
        'Para escribirnos, responde a este mensaje.',
        '',
        SIGNATURE,
      ].join('\n'),
    };
  }
  if (lang === 'en') {
    return {
      sujet: `Devuelta: request ${d.ref} received`,
      texte: [
        `Hello ${d.pseudo},`,
        '',
        'We have received your request. You did the right thing by writing to us: you are not the only one in this situation, and there are solutions.',
        '',
        `Your reference: ${d.ref}`,
        '',
        'What happens next?',
        '1. A member of our team reads your request and replies by email, usually within 24 to 48 hours.',
        '2. They tell you what is possible and what it costs. Nothing starts without your agreement.',
        ...(d.menace
          ? ['', 'You told us about threats. If someone asks you for money, do not pay. Stop replying, and keep screenshots. We are looking at your request first.']
          : []),
        '',
        'In the meantime, our free guides explain the first steps:',
        guides,
        '',
        ANTI_ARNAQUE.en,
        '',
        'To write to us, just reply to this message.',
        '',
        SIGNATURE,
      ].join('\n'),
    };
  }
  return francais({
    sujet: `Devuelta : demande ${d.ref} bien reçue`,
    texte: [
      `Bonjour ${d.pseudo},`,
      '',
      'Nous avons bien reçu votre demande. Vous avez bien fait de nous écrire : vous n’êtes pas la seule personne dans ce cas, et il existe des solutions.',
      '',
      `Votre référence : ${d.ref}`,
      '',
      'Et maintenant ?',
      '1. Une personne de l’équipe lit votre demande et vous répond par e-mail, en général sous 24 à 48 heures.',
      '2. Elle vous dit ce qui est possible et combien cela coûte. Rien ne démarre sans votre accord.',
      ...(d.menace
        ? ['', 'Vous nous avez signalé des menaces. Si on vous demande de l’argent, ne payez pas. Ne répondez plus, et gardez des captures d’écran. Nous regardons votre demande en priorité.']
        : []),
      '',
      'En attendant, nos guides gratuits expliquent les premiers gestes :',
      guides,
      '',
      ANTI_ARNAQUE.fr,
      '',
      'Pour nous écrire, répondez simplement à ce message.',
      '',
      SIGNATURE,
    ].join('\n'),
  });
}

/** Objet du message qui porte le lien de signature (le texte vient de messageSignature). */
export function sujetSignature(ref: string, lang: Lang): string {
  if (lang === 'es') return `Devuelta: tu presupuesto para firmar (${ref})`;
  if (lang === 'en') return `Devuelta: your quote to sign (${ref})`;
  return typo(`Devuelta : votre devis à signer (${ref})`);
}

export interface DonneesSigne {
  pseudo: string;
  ref: string;
  documentSigne: string;
  prenom: string | null;
  whatsapp: string | null;
  /** Montant d'ouverture, déjà mis en forme (ex. « 29,50 € »). */
  ouverture: string;
  debutImmediat: boolean;
}

/** Après la signature en ligne : la copie signée (support durable) et la suite. */
export function emailSigne(d: DonneesSigne, lang: Lang): Courriel {
  const trait = '————————————————';
  if (lang === 'es') {
    return {
      sujet: `Devuelta: tu copia firmada (${d.ref})`,
      texte: [
        `Hola, ${d.pseudo}:`,
        '',
        `Gracias, ya está firmado. Tu caso es el ${d.ref}.`,
        '',
        d.prenom && d.whatsapp
          ? `${d.prenom} se encarga de él. Puedes escribirle por WhatsApp al ${d.whatsapp}, indicando tu número de caso.`
          : 'La persona que lleva tu caso te escribe muy pronto.',
        '',
        `Siguiente paso: el pago de apertura, ${d.ouverture}. Te enviamos el enlace de pago por mensaje.`,
        d.debutImmediat
          ? 'Empezamos en cuanto lo recibimos.'
          : 'No pediste un inicio inmediato: empezamos al terminar el plazo de desistimiento de 14 días. Si quieres que empecemos antes, responde a este mensaje.',
        '',
        ANTI_ARNAQUE.es,
        '',
        'Debajo tienes tu copia del presupuesto y del mandato firmados. Guarda este mensaje.',
        '',
        SIGNATURE,
        '',
        trait,
        d.documentSigne,
      ].join('\n'),
    };
  }
  if (lang === 'en') {
    return {
      sujet: `Devuelta: your signed copy (${d.ref})`,
      texte: [
        `Hello ${d.pseudo},`,
        '',
        `Thank you, it is signed. Your case is ${d.ref}.`,
        '',
        d.prenom && d.whatsapp
          ? `${d.prenom} is handling it. You can message them on WhatsApp at ${d.whatsapp}, quoting your case number.`
          : 'The person handling your case will write to you very soon.',
        '',
        `Next step: the opening payment, ${d.ouverture}. We send you the payment link by message.`,
        d.debutImmediat
          ? 'We start as soon as we receive it.'
          : 'You did not ask for an immediate start: we start when the 14-day withdrawal period ends. If you want us to start sooner, just reply to this message.',
        '',
        ANTI_ARNAQUE.en,
        '',
        'Your copy of the signed quote and authorization is below. Keep this message.',
        '',
        SIGNATURE,
        '',
        trait,
        d.documentSigne,
      ].join('\n'),
    };
  }
  // Le document signé est repris tel quel (c'est la preuve) : seule l'introduction est retouchée.
  const intro = francais({
    sujet: `Devuelta : votre copie signée (${d.ref})`,
    texte: [
      `Bonjour ${d.pseudo},`,
      '',
      `Merci, c’est signé. Votre dossier porte le numéro ${d.ref}.`,
      '',
      d.prenom && d.whatsapp
        ? `C’est ${d.prenom} qui s’en occupe. Vous pouvez lui écrire sur WhatsApp au ${d.whatsapp}, en indiquant votre numéro de dossier.`
        : 'La personne qui suit votre dossier vous écrit très vite.',
      '',
      `Prochaine étape : le paiement d’ouverture, ${d.ouverture}. Nous vous envoyons le lien de paiement par message.`,
      d.debutImmediat
        ? 'Nous commençons dès qu’il est reçu.'
        : 'Vous n’avez pas demandé de début immédiat : nous commençons à la fin du délai de rétractation de 14 jours. Pour que nous commencions plus tôt, répondez simplement à ce message.',
      '',
      ANTI_ARNAQUE.fr,
      '',
      'Votre copie du devis et du mandat signés se trouve ci-dessous. Gardez ce message.',
      '',
      SIGNATURE,
    ].join('\n'),
  });
  return { sujet: intro.sujet, texte: [intro.texte, '', trait, d.documentSigne].join('\n') };
}

/** Objet de l'accusé de réception d'une rétractation (le texte vient de texteAccuse). */
export function sujetAccuse(ref: string, lang: Lang): string {
  if (lang === 'es') return `Devuelta: acuse de recibo de tu desistimiento (${ref})`;
  if (lang === 'en') return `Devuelta: acknowledgment of your withdrawal (${ref})`;
  return typo(`Devuelta : accusé de réception de votre rétractation (${ref})`);
}

/** Espaces insécables et apostrophes typographiques du français. */
function francais(c: Courriel): Courriel {
  return { sujet: typo(c.sujet), texte: typo(c.texte) };
}
