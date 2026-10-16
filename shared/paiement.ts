// Paiement en ligne : adresses de la page de retour après paiement.

import type { Lang } from './vocab';

export const CHEMIN_PAIEMENT_RECU: Record<Lang, string> = {
  fr: '/paiement-recu/',
  es: '/es/pago-recibido/',
  en: '/en/payment-received/',
};
