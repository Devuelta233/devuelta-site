// Signature électronique du devis et du mandat (signature électronique simple) :
// le client reçoit un lien personnel, lit le devis et le mandat, tape son nom et
// signe. On garde le texte exact montré, son empreinte, la date et l'heure.

import { euros, type CalculPrix } from './tarifs';
import type { Lang } from './vocab';

/** Adresse de la page de signature dans chaque langue (le jeton suit après #). */
export const CHEMIN_SIGNATURE: Record<Lang, string> = { fr: '/signer/', es: '/es/firmar/', en: '/en/sign/' };

/** À la place du nom tant que le client n'a pas signé. */
export const NOM_A_SIGNER: Record<Lang, string> = { fr: '(votre nom)', es: '(tu nombre)', en: '(your name)' };

/** Le mandat se termine par des lignes de signature papier : on les remplace. */
export const DEBUT_FIN_MANDAT: Record<Lang, string> = { fr: '\n\nFait le ', es: '\n\nFecha: ', en: '\n\nDate: ' };

export const DESCRIPTION_GENERIQUE: Record<Lang, string> = {
  fr: 'les contenus publiés aux adresses ci-dessus',
  es: 'los contenidos publicados en las direcciones indicadas',
  en: 'the content published at the addresses above',
};

/** Les chiffres du devis, gardés à part pour le récapitulatif avant de signer. */
export interface ResumeDevis {
  ref: string;
  liens: number;
  total: number;
  ouverture: number;
  solde: number;
}

export interface DonneesDevis {
  ref: string;
  nbLiens: number;
  prix: CalculPrix;
  urlConditions: string;
}

/** Le devis, en tête du document à signer. */
export function texteDevis(d: DonneesDevis, lang: Lang): string {
  const p = d.prix;
  if (p.total === null || p.ouverture === null || p.soldeMaximum === null) throw new Error('prix-sur-devis');
  const e = (n: number) => euros(n, lang);
  const notes: Record<Lang, string[]> = {
    fr: [p.zone === 'reduite' ? 'tarif Afrique et Amérique latine' : '', p.pro ? 'tarif professionnel' : ''],
    es: [p.zone === 'reduite' ? 'precio África y América Latina' : '', p.pro ? 'precio profesional' : ''],
    en: [p.zone === 'reduite' ? 'Africa and Latin America price' : '', p.pro ? 'business price' : ''],
  };
  const note = notes[lang].filter(Boolean).join(', ');
  const total = note ? `${e(p.total)} (${note})` : e(p.total);
  if (lang === 'es') {
    return [
      'PRESUPUESTO',
      `Expediente Devuelta: ${d.ref}`,
      `Número de enlaces: ${d.nbLiens}`,
      `Precio total: ${total}`,
      `A pagar al abrir el caso: ${e(p.ouverture)}`,
      `El resto, ${e(p.soldeMaximum)} como máximo, solo se paga por los enlaces retirados, de forma proporcional, en los 14 días siguientes al mensaje que te lo anuncia. Si no se retira ningún enlace, no pagas nada más.`,
      `Condiciones de venta: ${d.urlConditions}`,
    ].join('\n');
  }
  if (lang === 'en') {
    return [
      'QUOTE',
      `Devuelta case: ${d.ref}`,
      `Number of links: ${d.nbLiens}`,
      `Total price: ${total}`,
      `To pay when the case opens: ${e(p.ouverture)}`,
      `The rest, ${e(p.soldeMaximum)} at most, is only due for the links removed, pro rata, within 14 days of the message telling you so. If no link is removed, you pay nothing more.`,
      `Terms of sale: ${d.urlConditions}`,
    ].join('\n');
  }
  return [
    'DEVIS',
    `Dossier Devuelta : ${d.ref}`,
    `Nombre de liens : ${d.nbLiens}`,
    `Prix total : ${total}`,
    `À payer à l’ouverture du dossier : ${e(p.ouverture)}`,
    `Le reste, ${e(p.soldeMaximum)} au plus, n’est dû que pour les liens retirés, au prorata, dans les 14 jours suivant le message qui vous l’annonce. Si aucun lien n’est retiré, vous ne payez rien de plus.`,
    `Conditions de vente : ${d.urlConditions}`,
  ].join('\n');
}

/** Mandat prêt à signer : sans les lignes de signature papier, ni paragraphe vide. */
export function mandatPourSignature(corps: string, lang: Lang): string {
  let t = corps.replace(/\n?\[À COMPLÉTER : paragraphe_consentement\]\n?/, '\n');
  const fin = t.indexOf(DEBUT_FIN_MANDAT[lang]);
  if (fin >= 0) t = t.slice(0, fin);
  return t.trimEnd();
}

/** Le texte complet, une fois signé : le nom tapé à sa place, puis la signature. */
export function documentSigne(
  document: string,
  s: { nom: string; signeLe: string; quand: string; debutImmediat: boolean; representant: string },
  lang: Lang,
): string {
  const texte = document.split(NOM_A_SIGNER[lang]).join(s.nom);
  const bloc: Record<Lang, string[]> = {
    fr: [
      `Fait et signé électroniquement le ${s.quand} par ${s.nom}, depuis le lien personnel envoyé par Devuelta.`,
      `Début immédiat demandé : ${s.debutImmediat ? 'oui' : 'non'}.`,
      `Pour Devuelta, ${s.representant}, qui accepte le mandat.`,
    ],
    es: [
      `Hecho y firmado electrónicamente el ${s.quand} por ${s.nom}, desde el enlace personal enviado por Devuelta.`,
      `Inicio inmediato solicitado: ${s.debutImmediat ? 'sí' : 'no'}.`,
      `Por Devuelta, ${s.representant}, que acepta el mandato.`,
    ],
    en: [
      `Done and signed electronically on ${s.quand} by ${s.nom}, from the personal link sent by Devuelta.`,
      `Immediate start requested: ${s.debutImmediat ? 'yes' : 'no'}.`,
      `For Devuelta, ${s.representant}, accepting this authorization.`,
    ],
  };
  return `${texte}\n\n${bloc[lang].join('\n')}`;
}

/** Message à envoyer au client avec son lien de signature. */
export function messageSignature(o: { pseudo: string; ref: string; url: string }, lang: Lang): string {
  if (lang === 'es') {
    return [
      `Hola, ${o.pseudo}:`,
      '',
      `Aquí tienes tu presupuesto y tu mandato para el caso ${o.ref}. Puedes leerlos y firmarlos en línea, en 2 minutos:`,
      o.url,
      '',
      'El enlace es personal y vale 14 días. Nada se envía en tu nombre sin tu acuerdo.',
      '',
      'Team Devuelta',
    ].join('\n');
  }
  if (lang === 'en') {
    return [
      `Hello ${o.pseudo},`,
      '',
      `Here are your quote and authorization for case ${o.ref}. You can read and sign them online in 2 minutes:`,
      o.url,
      '',
      'The link is personal and valid for 14 days. Nothing is sent on your behalf without your approval.',
      '',
      'Team Devuelta',
    ].join('\n');
  }
  return [
    `Bonjour ${o.pseudo},`,
    '',
    `Voici votre devis et votre mandat pour le dossier ${o.ref}. Vous pouvez les lire et les signer en ligne, en 2 minutes :`,
    o.url,
    '',
    'Le lien est personnel et valable 14 jours. Rien n’est envoyé en votre nom sans votre accord.',
    '',
    'Team Devuelta',
  ].join('\n');
}
