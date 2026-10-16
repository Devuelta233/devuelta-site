// Rétractation en ligne (« Renoncer au contrat ici ») : obligatoire dans l'UE
// depuis le 19 juin 2026 pour les contrats conclus en ligne (article 11 bis de
// la directive 2011/83/UE, ajouté par la directive 2023/2673).
// La personne donne son nom, le contrat concerné et où recevoir l'accusé de
// réception. L'équipe envoie cet accusé sans délai, sur un support durable
// (e-mail ou WhatsApp), avec le contenu de la rétractation, la date et l'heure.

import type { Lang } from './vocab';

export interface Retractation {
  ref: string;
  recue_le: string; // ISO, UTC
  nom: string;
  dossier_ref: string | null;
  contact_mode: 'email' | 'whatsapp';
  contact_valeur: string;
  message: string | null;
}

/** Libellés imposés (ou équivalents sans ambiguïté) dans chaque langue. */
export const LIBELLE_RETRACTATION: Record<Lang, { fonction: string; confirmer: string }> = {
  fr: { fonction: 'Renoncer au contrat ici', confirmer: 'Confirmer la rétractation' },
  es: { fonction: 'Desistir del contrato aquí', confirmer: 'Confirmar desistimiento' },
  en: { fonction: 'Withdraw from contract here', confirmer: 'Confirm withdrawal' },
};

const MOIS: Record<Lang, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** Date et heure en GMT, sans ambiguïté : « 16 octobre 2026 à 13 h 42 (heure GMT) ». */
export function dateHeureGmt(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const j = d.getUTCDate();
  const m = MOIS[lang][d.getUTCMonth()];
  const a = d.getUTCFullYear();
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  if (lang === 'es') return `${j} de ${m} de ${a} a las ${h}:${min} (hora GMT)`;
  if (lang === 'en') return `${j} ${m} ${a} at ${h}:${min} GMT`;
  return `${j} ${m} ${a} à ${h} h ${min} (heure GMT)`;
}

/** Texte de l'accusé de réception, prêt à envoyer par e-mail ou WhatsApp. */
export function texteAccuse(r: Retractation, lang: Lang): string {
  const quand = dateHeureGmt(r.recue_le, lang);
  if (lang === 'es') {
    return [
      `Hola, ${r.nom}:`,
      '',
      `Hemos recibido tu desistimiento, enviado el ${quand}.`,
      `Referencia: ${r.ref}`,
      '',
      'Lo que nos enviaste:',
      `– Nombre: ${r.nom}`,
      `– Caso: ${r.dossier_ref ?? 'no indicado'}`,
      `– Confirmación solicitada por ${r.contact_mode === 'email' ? 'correo electrónico' : 'WhatsApp'}: ${r.contact_valeur}`,
      `– Mensaje: ${r.message ?? 'ninguno'}`,
      '',
      'Detenemos todas las gestiones desde ahora. Si ya pagaste, te devolvemos en un plazo máximo de 14 días lo que exceda el trabajo realizado antes de tu desistimiento, por el mismo medio de pago.',
      '',
      'El equipo de Devuelta',
    ].join('\n');
  }
  if (lang === 'en') {
    return [
      `Hello ${r.nom},`,
      '',
      `We have received your withdrawal, sent on ${quand}.`,
      `Reference: ${r.ref}`,
      '',
      'What you sent us:',
      `– Name: ${r.nom}`,
      `– Case: ${r.dossier_ref ?? 'not given'}`,
      `– Confirmation requested by ${r.contact_mode === 'email' ? 'email' : 'WhatsApp'}: ${r.contact_valeur}`,
      `– Message: ${r.message ?? 'none'}`,
      '',
      'We are stopping all work on your case now. If you have already paid, we will refund anything above the work done before your withdrawal within 14 days at the latest, using the same payment method.',
      '',
      'The Devuelta team',
    ].join('\n');
  }
  return [
    `Bonjour ${r.nom},`,
    '',
    `Nous avons bien reçu votre rétractation, envoyée le ${quand}.`,
    `Référence : ${r.ref}`,
    '',
    'Ce que vous nous avez envoyé :',
    `– Nom : ${r.nom}`,
    `– Dossier : ${r.dossier_ref ?? 'non indiqué'}`,
    `– Confirmation demandée par ${r.contact_mode === 'email' ? 'e-mail' : 'WhatsApp'} : ${r.contact_valeur}`,
    `– Message : ${r.message ?? 'aucun'}`,
    '',
    'Nous arrêtons toutes les démarches à partir de maintenant. Si vous avez déjà payé, nous vous remboursons au plus tard dans 14 jours ce qui dépasse le travail fait avant votre rétractation, par le même moyen de paiement.',
    '',
    'L’équipe Devuelta',
  ].join('\n');
}
