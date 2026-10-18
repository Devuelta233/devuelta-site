// Libellés lisibles, dans les trois langues, des codes qui sortent de l'outil
// vers un client : document de passation et page de suivi. Les codes eux-mêmes
// sont dans vocab.ts ; l'outil interne garde ses propres libellés (src/outil/i18n.ts).

import type { Lang, StatutContenu, StatutDossier, StatutEtape, T3, TypeEtape } from './vocab';

/** État du dossier, dit simplement (jamais un jugement sur les chances). */
export const LIBELLE_STATUT_DOSSIER: Record<StatutDossier, T3> = {
  ouvert: { fr: 'Dossier ouvert', es: 'Caso abierto', en: 'Case opened' },
  'en-cours': { fr: 'Démarches en cours', es: 'Gestiones en curso', en: 'Steps in progress' },
  'en-attente': { fr: 'En attente d’une réponse', es: 'En espera de una respuesta', en: 'Waiting for a reply' },
  resolu: { fr: 'Dossier terminé', es: 'Caso terminado', en: 'Case completed' },
  clos: { fr: 'Dossier clos', es: 'Caso cerrado', en: 'Case closed' },
  oriente: { fr: 'Dossier orienté vers un autre service', es: 'Caso derivado a otro servicio', en: 'Case referred to another service' },
};

export const LIBELLE_STATUT_CONTENU: Record<StatutContenu, T3> = {
  'a-valider': { fr: 'À valider', es: 'Por validar', en: 'To validate' },
  'a-traiter': { fr: 'À traiter', es: 'Por tratar', en: 'To handle' },
  signale: { fr: 'Signalé', es: 'Denunciado', en: 'Reported' },
  retire: { fr: 'Retiré', es: 'Retirado', en: 'Removed' },
  refuse: { fr: 'Refusé', es: 'Rechazado', en: 'Refused' },
  reapparu: { fr: 'Réapparu', es: 'Reapareció', en: 'Reappeared' },
};

export const LIBELLE_ETAPE: Record<TypeEtape, T3> = {
  plateforme: { fr: 'Signalement à la plateforme', es: 'Denuncia en la plataforma', en: 'Report to the platform' },
  'site-contact': { fr: 'Contact du site', es: 'Contacto con el sitio', en: 'Contact with the site' },
  takeitdown: { fr: 'Demande TAKE IT DOWN (États-Unis)', es: 'Solicitud TAKE IT DOWN (EE. UU.)', en: 'TAKE IT DOWN request (US)' },
  dsa: { fr: 'Notification DSA (Union européenne)', es: 'Notificación DSA (Unión Europea)', en: 'DSA notice (European Union)' },
  rgpd: { fr: 'Demande d’effacement (RGPD)', es: 'Solicitud de supresión (RGPD)', en: 'Erasure request (GDPR)' },
  registrant: { fr: 'Courrier au propriétaire du domaine', es: 'Carta al titular del dominio', en: 'Letter to the domain owner' },
  registrar: { fr: 'Courrier au registrar', es: 'Carta al registrador', en: 'Letter to the registrar' },
  hebergeur: { fr: 'Courrier à l’hébergeur', es: 'Carta al proveedor de alojamiento', en: 'Letter to the host' },
  cloudflare: { fr: 'Signalement à Cloudflare', es: 'Denuncia a Cloudflare', en: 'Report to Cloudflare' },
  dmca: { fr: 'Demande de retrait pour droit d’auteur (DMCA)', es: 'Solicitud de retirada por derechos de autor (DMCA)', en: 'Copyright takedown (DMCA)' },
  dereferencement: { fr: 'Demande de déréférencement (moteurs de recherche)', es: 'Solicitud de desindexación (buscadores)', en: 'Search delisting request' },
  regulateur: { fr: 'Saisine de l’autorité de contrôle', es: 'Reclamación ante la autoridad de control', en: 'Complaint to the regulator' },
  stopncii: { fr: 'Empreinte StopNCII', es: 'Huella StopNCII', en: 'StopNCII hash' },
  police: { fr: 'Signalement officiel / police', es: 'Denuncia oficial / policía', en: 'Official report / police' },
  autre: { fr: 'Autre démarche', es: 'Otra gestión', en: 'Other step' },
};

export const LIBELLE_STATUT_ETAPE: Record<StatutEtape, T3> = {
  'a-faire': { fr: 'Prévue', es: 'Prevista', en: 'Planned' },
  envoye: { fr: 'Envoyée, en attente de réponse', es: 'Enviada, en espera de respuesta', en: 'Sent, awaiting a reply' },
  reponse: { fr: 'Réponse reçue', es: 'Respuesta recibida', en: 'Reply received' },
  succes: { fr: 'Acceptée', es: 'Aceptada', en: 'Accepted' },
  refus: { fr: 'Refusée', es: 'Rechazada', en: 'Refused' },
  'sans-reponse': { fr: 'Sans réponse', es: 'Sin respuesta', en: 'No reply' },
};

function libelle<K extends string>(table: Record<K, T3>, code: string, lang: Lang): string {
  const t = (table as Record<string, T3>)[code];
  return t ? t[lang] : code;
}

export const statutDossier = (code: string, lang: Lang) => libelle(LIBELLE_STATUT_DOSSIER, code, lang);
export const statutContenu = (code: string, lang: Lang) => libelle(LIBELLE_STATUT_CONTENU, code, lang);
export const typeEtape = (code: string, lang: Lang) => libelle(LIBELLE_ETAPE, code, lang);
export const statutEtape = (code: string, lang: Lang) => libelle(LIBELLE_STATUT_ETAPE, code, lang);
