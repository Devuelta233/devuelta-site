// E-mails envoyés automatiquement par le site (expéditeur « Team Devuelta »).
// Règles : ton chaleureux et simple, l'objet ne dit jamais de quoi il s'agit
// (seulement la référence), et chaque message rappelle comment repérer un faux.

import { SITE_URL } from './site';
import { euros } from './tarifs';
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

/** Prix indicatif donné dès l'accusé de réception (confirmé ensuite par l'équipe). */
export interface Estimation {
  liens: number;
  total: number | null;
  ouverture: number | null;
  /** Prix d'un lien dans la zone du client, quand aucun lien n'a été donné. */
  aPartirDe: number;
}

export function phrasePrix(e: Estimation, lang: Lang, aConfirmer = true): string {
  const m = (n: number) => euros(n, lang);
  if (e.liens > 15 || (e.liens > 0 && e.total === null)) {
    return { fr: 'plus de 15 liens : nous vous faisons un devis.', es: 'más de 15 enlaces: te hacemos un presupuesto.', en: 'more than 15 links: we will send you a quote.' }[lang];
  }
  if (e.liens === 0 || e.total === null || e.ouverture === null) {
    if (lang === 'es') return `desde ${m(e.aPartirDe)} por un enlace: la mitad para empezar y el resto solo si se retira.`;
    if (lang === 'en') return `from ${m(e.aPartirDe)} for one link: half to start, the rest only if it is removed.`;
    return `à partir de ${m(e.aPartirDe)} pour un lien : la moitié pour démarrer, le reste seulement s’il est retiré.`;
  }
  const n = e.liens;
  if (lang === 'es') {
    return `${n} enlace${n > 1 ? 's' : ''}, ${m(e.total)} en total: ${m(e.ouverture)} para empezar, el resto solo por los enlaces retirados.${aConfirmer ? ' Te confirmamos este precio después de leer tu solicitud.' : ''}`;
  }
  if (lang === 'en') {
    return `${n} link${n > 1 ? 's' : ''}, ${m(e.total)} in total: ${m(e.ouverture)} to start, the rest only for the links removed.${aConfirmer ? ' We confirm this price after reading your request.' : ''}`;
  }
  return `${n} lien${n > 1 ? 's' : ''}, ${m(e.total)} au total : ${m(e.ouverture)} pour démarrer, le reste seulement pour les liens retirés.${aConfirmer ? ' Ce prix vous est confirmé après lecture de votre demande.' : ''}`;
}

/** Juste après l'envoi du formulaire « Confier mon dossier ». */
export function emailDemandeRecue(
  d: { pseudo: string; ref: string; menace: boolean; guide?: string | null; estimation?: Estimation | null },
  lang: Lang,
): Courriel {
  const guides = d.guide ?? `${SITE_URL}${QUE_FAIRE[lang]}`;
  const prix = d.estimation ? phrasePrix(d.estimation, lang) : null;
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
        'Para avanzar ya:',
        `– La guía gratuita para tu situación: ${guides}`,
        ...(prix ? [`– Si prefieres que nos ocupemos nosotros: ${prix}`] : []),
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
        'To move forward right now:',
        `– The free guide for your situation: ${guides}`,
        ...(prix ? [`– If you would rather we handle it: ${prix}`] : []),
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
      'Pour avancer dès maintenant :',
      `– Le guide gratuit pour votre situation : ${guides}`,
      ...(prix ? [`– Si vous préférez que nous nous en occupions : ${prix}`] : []),
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
  /** Montant d'ouverture, déjà mis en forme (ex. « 29,50 € »). */
  ouverture: string;
  debutImmediat: boolean;
  /** Lien de paiement d'ouverture, quand le paiement en ligne est activé. */
  lienPaiement?: string | null;
  devise?: string | null;
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
        d.prenom
          ? `${d.prenom} se encarga de él. Para escribirle, responde a este correo indicando tu número de caso.`
          : 'La persona que lleva tu caso te escribe muy pronto.',
        '',
        ...(d.lienPaiement
          ? [`Siguiente paso: el pago de apertura, ${d.ouverture}, con tarjeta o Mobile Money:`, d.lienPaiement, noteDevise(d.devise, 'es')]
          : [`Siguiente paso: el pago de apertura, ${d.ouverture}. Te enviamos el enlace de pago por mensaje.`]),
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
        d.prenom
          ? `${d.prenom} is handling it. To write to them, reply to this email, quoting your case number.`
          : 'The person handling your case will write to you very soon.',
        '',
        ...(d.lienPaiement
          ? [`Next step: the opening payment, ${d.ouverture}, by card or Mobile Money:`, d.lienPaiement, noteDevise(d.devise, 'en')]
          : [`Next step: the opening payment, ${d.ouverture}. We send you the payment link by message.`]),
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
      d.prenom
        ? `C’est ${d.prenom} qui s’en occupe. Pour lui écrire, répondez à cet e-mail en indiquant votre numéro de dossier.`
        : 'La personne qui suit votre dossier vous écrit très vite.',
      '',
      ...(d.lienPaiement
        ? [`Prochaine étape : le paiement d’ouverture, ${d.ouverture}, par carte ou Mobile Money :`, d.lienPaiement, noteDevise(d.devise, 'fr')]
        : [`Prochaine étape : le paiement d’ouverture, ${d.ouverture}. Nous vous envoyons le lien de paiement par message.`]),
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

/** Rappel quand Paystack débite dans une autre devise que l'euro. */
export function noteDevise(devise: string | null | undefined, lang: Lang): string {
  if (!devise || devise === 'EUR') return '';
  const nom: Record<string, Record<Lang, string>> = {
    GHS: { fr: 'en cedis ghanéens (GHS)', es: 'en cedis ghaneses (GHS)', en: 'in Ghanaian cedis (GHS)' },
    USD: { fr: 'en dollars américains (USD)', es: 'en dólares estadounidenses (USD)', en: 'in US dollars (USD)' },
  };
  const n = nom[devise]?.[lang] ?? devise;
  if (lang === 'es') return `El importe se cobra ${n}, al cambio del día: tu banco puede aplicar una comisión de cambio.`;
  if (lang === 'en') return `The amount is charged ${n}, at the day's rate: your bank may add a currency fee.`;
  return `Le montant est débité ${n}, au taux du jour : votre banque peut appliquer des frais de change.`;
}

export interface DonneesPaiement {
  pseudo: string;
  ref: string;
  montant: string;
  type: 'ouverture' | 'solde';
}

/** Lien de paiement envoyé depuis l'outil (ouverture ou solde). */
export function emailLienPaiement(d: DonneesPaiement & { lien: string; devise: string | null }, lang: Lang): Courriel {
  const quoi: Record<Lang, string> =
    d.type === 'ouverture'
      ? { fr: 'l’ouverture du dossier', es: 'la apertura del caso', en: 'opening the case' }
      : { fr: 'le solde, pour les liens retirés', es: 'el resto, por los enlaces retirados', en: 'the balance, for the links removed' };
  if (lang === 'es') {
    return {
      sujet: `Devuelta: tu enlace de pago (${d.ref})`,
      texte: [`Hola, ${d.pseudo}:`, '', `Aquí tienes tu enlace de pago para el caso ${d.ref}: ${d.montant}, por ${quoi.es}. Con tarjeta o Mobile Money:`, d.lien, '', noteDevise(d.devise, 'es'), '', ANTI_ARNAQUE.es, '', SIGNATURE].join('\n'),
    };
  }
  if (lang === 'en') {
    return {
      sujet: `Devuelta: your payment link (${d.ref})`,
      texte: [`Hello ${d.pseudo},`, '', `Here is your payment link for case ${d.ref}: ${d.montant}, for ${quoi.en}. By card or Mobile Money:`, d.lien, '', noteDevise(d.devise, 'en'), '', ANTI_ARNAQUE.en, '', SIGNATURE].join('\n'),
    };
  }
  return francais({
    sujet: `Devuelta : votre lien de paiement (${d.ref})`,
    texte: [`Bonjour ${d.pseudo},`, '', `Voici votre lien de paiement pour le dossier ${d.ref} : ${d.montant}, pour ${quoi.fr}. Par carte ou Mobile Money :`, d.lien, '', noteDevise(d.devise, 'fr'), '', ANTI_ARNAQUE.fr, '', SIGNATURE].join('\n'),
  });
}

/** Confirmation automatique quand Paystack confirme le paiement. */
export function emailPaiementRecu(d: { pseudo: string; ref: string; montantEur: number; type: 'ouverture' | 'solde' }, lang: Lang): Courriel {
  const montant = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang, { style: 'currency', currency: 'EUR' }).format(d.montantEur);
  if (lang === 'es') {
    return {
      sujet: `Devuelta: pago recibido (${d.ref})`,
      texte: [
        `Hola, ${d.pseudo}:`,
        '',
        `Hemos recibido tu pago de ${montant} para el caso ${d.ref}. Gracias.`,
        d.type === 'ouverture' ? 'La persona que lleva tu caso te escribe para lo que sigue.' : 'Tu caso está pagado por completo. Gracias por tu confianza.',
        '',
        SIGNATURE,
      ].join('\n'),
    };
  }
  if (lang === 'en') {
    return {
      sujet: `Devuelta: payment received (${d.ref})`,
      texte: [
        `Hello ${d.pseudo},`,
        '',
        `We have received your payment of ${montant} for case ${d.ref}. Thank you.`,
        d.type === 'ouverture' ? 'The person handling your case will write to you about the next steps.' : 'Your case is now fully paid. Thank you for your trust.',
        '',
        SIGNATURE,
      ].join('\n'),
    };
  }
  return francais({
    sujet: `Devuelta : paiement reçu (${d.ref})`,
    texte: [
      `Bonjour ${d.pseudo},`,
      '',
      `Nous avons bien reçu votre paiement de ${montant} pour le dossier ${d.ref}. Merci.`,
      d.type === 'ouverture' ? 'La personne qui suit votre dossier vous écrit pour la suite.' : 'Votre dossier est entièrement réglé. Merci de votre confiance.',
      '',
      SIGNATURE,
    ].join('\n'),
  });
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
