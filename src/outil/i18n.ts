// Interface de l'outil en trois langues : [français, espagnol, anglais].

import { typo, typoProfonde } from '../../shared/typo';
import type { Lang } from '../../shared/vocab';

const navLang = (typeof navigator !== 'undefined' ? navigator.language : 'fr').slice(0, 2);
let courante: Lang = navLang === 'es' ? 'es' : navLang === 'en' ? 'en' : 'fr';
// Langue de l'interface : celle du profil une fois connecté, sinon celle du navigateur.
export const langue = {
  get value(): Lang {
    return courante;
  },
  set value(v: Lang) {
    courante = v;
    if (typeof document !== 'undefined') document.documentElement.lang = v;
  },
};

const D = typoProfonde({
  // Général
  chargement: ['Chargement…', 'Cargando…', 'Loading…'],
  enregistrer: ['Enregistrer', 'Guardar', 'Save'],
  annuler: ['Annuler', 'Cancelar', 'Cancel'],
  fermer: ['Fermer', 'Cerrar', 'Close'],
  supprimer: ['Supprimer', 'Eliminar', 'Delete'],
  modifier: ['Modifier', 'Editar', 'Edit'],
  ajouter: ['Ajouter', 'Añadir', 'Add'],
  retour: ['Retour', 'Volver', 'Back'],
  oui: ['Oui', 'Sí', 'Yes'],
  autresPays: ['Autres pays', 'Otros países', 'Other countries'],
  reponseTitre: ['Répondre', 'Responder', 'Reply'],
  reponsePreparer: ['Préparer une réponse', 'Preparar una respuesta', 'Prepare a reply'],
  reponseAide: [
    'Un brouillon est préparé automatiquement, avec le guide gratuit et le prix exact. Relisez-le, corrigez-le, puis envoyez.',
    'Se prepara un borrador automáticamente, con la guía gratuita y el precio exacto. Revísalo, corrígelo y envíalo.',
    'A draft is prepared automatically, with the free guide and the exact price. Read it, fix it, then send.',
  ],
  reponseVerifier: ['À relire de près : le brouillon contient un mot sensible.', 'Revisar con cuidado: el borrador contiene una palabra sensible.', 'Read carefully: the draft contains a sensitive word.'],
  reponseMineur: ['Personne peut-être mineure : aucune offre, seulement l’aide officielle gratuite.', 'Persona quizá menor: ninguna oferta, solo la ayuda oficial gratuita.', 'Person may be a minor: no offer, only free official help.'],
  reponseEnvoyer: ['Envoyer par e-mail', 'Enviar por correo', 'Send by email'],
  reponseEnvoyee: ['Réponse envoyée.', 'Respuesta enviada.', 'Reply sent.'],
  ongletTelegram: ['Telegram', 'Telegram', 'Telegram'],
  non: ['Non', 'No', 'No'],
  inconnu: ['Non renseigné', 'Sin indicar', 'Not set'],
  aucun: ['Aucun', 'Ninguno', 'None'],
  personne: ['Personne', 'Nadie', 'Nobody'],
  copier: ['Copier', 'Copiar', 'Copy'],
  copie: ['Copié', 'Copiado', 'Copied'],
  rechercher: ['Rechercher…', 'Buscar…', 'Search…'],
  tous: ['Tous', 'Todos', 'All'],
  confirmer: ['Confirmer', 'Confirmar', 'Confirm'],
  sur: ['Êtes-vous sûr·e ?', '¿Seguro?', 'Are you sure?'],
  erreur: ['Une erreur est survenue.', 'Ha ocurrido un error.', 'Something went wrong.'],
  // Menu
  mTableau: ['Tableau de bord', 'Panel', 'Dashboard'],
  mDemandes: ['Demandes', 'Solicitudes', 'Requests'],
  mDossiers: ['Dossiers', 'Casos', 'Cases'],
  mNouveau: ['Nouveau dossier', 'Nuevo caso', 'New case'],
  mReferentiel: ['Référentiel', 'Referencial', 'Legal reference'],
  mFloutage: ['Masquer une pièce', 'Ocultar un documento', 'Redact an ID'],
  mStats: ['Statistiques', 'Estadísticas', 'Statistics'],
  mEquipe: ['Équipe', 'Equipo', 'Team'],
  mReglages: ['Réglages', 'Ajustes', 'Settings'],
  mAide: ['Règles et aide', 'Reglas y ayuda', 'Rules & help'],
  deconnexion: ['Se déconnecter', 'Cerrar sesión', 'Log out'],
  // Connexion
  connexion: ['Connexion', 'Iniciar sesión', 'Log in'],
  email: ['Adresse e-mail', 'Correo electrónico', 'Email address'],
  motDePasse: ['Mot de passe', 'Contraseña', 'Password'],
  seConnecter: ['Se connecter', 'Entrar', 'Log in'],
  code2fa: ['Code à 6 chiffres', 'Código de 6 cifras', '6-digit code'],
  code2faAide: [
    'Ouvrez votre application d’authentification (Proton Pass, Google Authenticator…) et saisissez le code affiché pour EraseOps.',
    'Abre tu aplicación de autenticación (Proton Pass, Google Authenticator…) e introduce el código que aparece para EraseOps.',
    'Open your authenticator app (Proton Pass, Google Authenticator…) and enter the code shown for EraseOps.',
  ],
  valider: ['Valider', 'Validar', 'Confirm'],
  initTitre: ['Première installation', 'Primera instalación', 'First setup'],
  initAide: [
    'Créez le compte administrateur avec le code d’initialisation reçu lors de l’installation.',
    'Crea la cuenta de administrador con el código de inicialización recibido en la instalación.',
    'Create the administrator account with the setup code you received during installation.',
  ],
  codeInit: ['Code d’initialisation', 'Código de inicialización', 'Setup code'],
  nom: ['Nom affiché', 'Nombre visible', 'Display name'],
  langueUi: ['Langue', 'Idioma', 'Language'],
  creerCompte: ['Créer le compte', 'Crear la cuenta', 'Create account'],
  initOk: ['Compte créé. Connectez-vous.', 'Cuenta creada. Inicia sesión.', 'Account created. Please log in.'],
  changerMdpTitre: ['Choisissez votre mot de passe', 'Elige tu contraseña', 'Choose your password'],
  changerMdpAide: [
    'Au moins 12 caractères. Une phrase facile à retenir pour vous, difficile à deviner pour les autres. Gardez-la dans Proton Pass.',
    'Al menos 12 caracteres. Una frase fácil de recordar para ti y difícil de adivinar para otros. Guárdala en Proton Pass.',
    'At least 12 characters. A phrase easy for you to remember and hard for others to guess. Keep it in Proton Pass.',
  ],
  nouveauMdp: ['Nouveau mot de passe', 'Nueva contraseña', 'New password'],
  confirmerMdp: ['Confirmez le mot de passe', 'Confirma la contraseña', 'Confirm password'],
  mdpActuel: ['Mot de passe actuel', 'Contraseña actual', 'Current password'],
  mdpDifferents: ['Les deux mots de passe ne sont pas identiques.', 'Las contraseñas no coinciden.', 'The passwords do not match.'],
  activer2faTitre: ['Activez la double authentification', 'Activa la verificación en dos pasos', 'Turn on two-factor authentication'],
  activer2faAide: [
    'Scannez ce code avec votre application d’authentification (Proton Pass, Google Authenticator, Aegis…), puis saisissez le code à 6 chiffres affiché.',
    'Escanea este código con tu aplicación de autenticación (Proton Pass, Google Authenticator, Aegis…) e introduce el código de 6 cifras.',
    'Scan this code with your authenticator app (Proton Pass, Google Authenticator, Aegis…), then enter the 6-digit code shown.',
  ],
  cleManuelle: ['Ou saisissez cette clé à la main :', 'O introduce esta clave a mano:', 'Or type this key manually:'],
  ndaTitre: ['Accord de confidentialité', 'Acuerdo de confidencialidad', 'Confidentiality agreement'],
  ndaAccepte: [
    'J’ai lu et j’accepte cet accord de confidentialité.',
    'He leído y acepto este acuerdo de confidencialidad.',
    'I have read and accept this confidentiality agreement.',
  ],
  nouveauPays: [
    'Connexion depuis un pays inhabituel. Si ce n’est pas vous, changez votre mot de passe tout de suite.',
    'Conexión desde un país inusual. Si no fuiste tú, cambia tu contraseña ahora mismo.',
    'Login from an unusual country. If it was not you, change your password right away.',
  ],
  // Tableau de bord
  bonjour: ['Bonjour', 'Hola', 'Hello'],
  aTraiter: ['À traiter aujourd’hui', 'Para hoy', 'To do today'],
  nouvellesDemandes: ['Nouvelles demandes', 'Solicitudes nuevas', 'New requests'],
  echeances: ['Échéances', 'Plazos', 'Deadlines'],
  enRetard: ['en retard', 'vencido', 'overdue'],
  aujourdhui: ['aujourd’hui', 'hoy', 'today'],
  courriersATraiter: ['Courriers à valider ou à envoyer', 'Cartas por validar o enviar', 'Letters to validate or send'],
  alertesLiens: ['Liens à vérifier (contrôle automatique)', 'Enlaces por revisar (control automático)', 'Links to check (automatic check)'],
  alertesConnexion: ['Connexions depuis un nouveau pays', 'Conexiones desde un país nuevo', 'Logins from a new country'],
  bientotSupprimes: ['Suppression automatique dans les 7 jours', 'Borrado automático en 7 días', 'Automatic deletion within 7 days'],
  dossiersOuverts: ['dossiers ouverts', 'casos abiertos', 'open cases'],
  dontMiens: ['attribués à moi :', 'asignados a mí:', 'assigned to me:'],
  rienAFaire: ['Rien d’urgent. Beau travail.', 'Nada urgente. Buen trabajo.', 'Nothing urgent. Good work.'],
  relanceAuto: ['relance préparée automatiquement', 'recordatorio preparado automáticamente', 'follow-up prepared automatically'],
  notifActiver: ['Recevoir les alertes sur ce téléphone', 'Recibir alertas en este teléfono', 'Get alerts on this phone'],
  notifIos: [
    'Sur iPhone : ajoutez d’abord EraseOps à l’écran d’accueil (bouton Partager → « Sur l’écran d’accueil »), ouvrez-le depuis l’icône, puis activez les alertes.',
    'En iPhone: primero añade EraseOps a la pantalla de inicio (Compartir → «Añadir a pantalla de inicio»), ábrelo desde el icono y activa las alertas.',
    'On iPhone: first add EraseOps to your home screen (Share → "Add to Home Screen"), open it from the icon, then turn on alerts.',
  ],
  notifActives: ['Alertes activées sur cet appareil.', 'Alertas activadas en este dispositivo.', 'Alerts turned on for this device.'],
  notifRefusees: [
    'Les notifications sont bloquées dans les réglages du téléphone pour ce site.',
    'Las notificaciones están bloqueadas en los ajustes del teléfono para este sitio.',
    'Notifications are blocked in the phone settings for this site.',
  ],
  notifTester: ['Envoyer une alerte de test', 'Enviar una alerta de prueba', 'Send a test alert'],
  notifDesactiver: ['Désactiver sur cet appareil', 'Desactivar en este dispositivo', 'Turn off on this device'],
  // Demandes
  recueLe: ['Reçue le', 'Recibida el', 'Received on'],
  contactPar: ['Contact par', 'Contacto por', 'Contact via'],
  menace: ['Menace / chantage', 'Amenaza / chantaje', 'Threat / blackmail'],
  dejaSignale: ['Déjà signalé sans résultat', 'Ya denunciado sin resultado', 'Already reported, no result'],
  publieParSoi: ['Publié ou envoyé par la personne au départ', 'Publicado o enviado por la persona al principio', 'Originally posted or sent by the person'],
  liens: ['Liens', 'Enlaces', 'Links'],
  message: ['Message', 'Mensaje', 'Message'],
  convertir: ['Ouvrir un dossier', 'Abrir un caso', 'Open a case'],
  orienter: ['Orientée vers un service officiel', 'Orientada a un servicio oficial', 'Referred to an official service'],
  refuser: ['Refusée', 'Rechazada', 'Declined'],
  spam: ['Indésirable', 'Spam', 'Spam'],
  remettreNouvelle: ['Remettre en « nouvelle »', 'Volver a «nueva»', 'Mark as new again'],
  noteTraitement: ['Note (facultatif)', 'Nota (opcional)', 'Note (optional)'],
  attribueeA: ['Attribuée à', 'Asignada a', 'Assigned to'],
  aucuneDemande: ['Aucune demande.', 'Ninguna solicitud.', 'No requests.'],
  repondreWhatsapp: ['Répondre sur WhatsApp', 'Responder por WhatsApp', 'Reply on WhatsApp'],
  repondreEmail: ['Répondre par e-mail', 'Responder por correo', 'Reply by email'],
  rappelDiscretion: [
    'Rappel : jamais la nature de la situation dans l’objet ou le premier message.',
    'Recuerda: nunca la naturaleza de la situación en el asunto ni en el primer mensaje.',
    'Reminder: never mention the nature of the situation in the subject or first message.',
  ],
  // Dossiers
  ref: ['Réf.', 'Ref.', 'Ref.'],
  statut: ['Statut', 'Estado', 'Status'],
  priorite: ['Priorité', 'Prioridad', 'Priority'],
  situation: ['Situation', 'Situación', 'Situation'],
  pays: ['Pays', 'País', 'Country'],
  langueDossier: ['Langue du client', 'Idioma del cliente', 'Client language'],
  assigneA: ['Attribué à', 'Asignado a', 'Assigned to'],
  prochaineEcheance: ['Prochaine échéance', 'Próximo plazo', 'Next deadline'],
  majLe: ['Mis à jour', 'Actualizado', 'Updated'],
  ouverts: ['Ouverts', 'Abiertos', 'Open'],
  fermes: ['Fermés', 'Cerrados', 'Closed'],
  aMoi: ['À moi', 'Míos', 'Mine'],
  aucunDossier: ['Aucun dossier.', 'Ningún caso.', 'No cases.'],
  retires: ['retirés', 'retirados', 'removed'],
  // Fiche dossier
  ongletResume: ['Résumé', 'Resumen', 'Summary'],
  ongletLiens: ['Liens et plan', 'Enlaces y plan', 'Links & plan'],
  ongletDemarches: ['Démarches', 'Gestiones', 'Steps'],
  ongletCourriers: ['Courriers', 'Cartas', 'Letters'],
  ongletNotes: ['Notes', 'Notas', 'Notes'],
  ongletJournal: ['Journal', 'Registro', 'Log'],
  client: ['Client·e', 'Cliente', 'Client'],
  pseudo: ['Prénom / pseudo', 'Nombre / seudónimo', 'First name / nickname'],
  nomLegal: ['Nom complet (pour les courriers)', 'Nombre completo (para las cartas)', 'Full legal name (for letters)'],
  whatsapp: ['WhatsApp', 'WhatsApp', 'WhatsApp'],
  contactPrefere: ['Contact préféré', 'Contacto preferido', 'Preferred contact'],
  mandatSigne: ['Mandat signé le', 'Mandato firmado el', 'Mandate signed on'],
  identiteVerifiee: ['Identité vérifiée le', 'Identidad verificada el', 'Identity checked on'],
  consentementRecherche: ['Accord pour la recherche d’images le', 'Consentimiento para la búsqueda de imágenes el', 'Consent for image search on'],
  resume: ['Résumé du dossier', 'Resumen del caso', 'Case summary'],
  prochaineAction: ['Prochaine action', 'Próxima acción', 'Next action'],
  tempsPasse: ['Temps passé sur le dossier (minutes)', 'Tiempo dedicado al caso (minutos)', 'Time spent on the case (minutes)'],
  clientPro: ['Client professionnel (commerce, entreprise) : tarif × 2', 'Cliente profesional (comercio, empresa): precio × 2', 'Business client (shop, company): price × 2'],
  tempsMoyen: ['Temps moyen par dossier', 'Tiempo medio por caso', 'Average time per case'],
  retractationsTitre: ['Rétractations : accusé de réception à envoyer', 'Desistimientos: acuse de recibo por enviar', 'Withdrawals: acknowledgement to send'],
  retractationsAide: [
    'La personne a renoncé au contrat. Arrêtez les démarches, puis envoyez l’accusé de réception par le moyen qu’elle a choisi, au plus tard le jour ouvré suivant. Remboursez sous 14 jours ce qui dépasse le travail déjà fait.',
    'La persona ha desistido del contrato. Detén las gestiones y envía el acuse de recibo por el medio que eligió, a más tardar el siguiente día hábil. Devuelve en 14 días lo que exceda el trabajo ya hecho.',
    'The person has withdrawn from the contract. Stop all work, then send the acknowledgement by the channel they chose, by the next working day at the latest. Refund anything above the work already done within 14 days.',
  ],
  dossierNonTrouve: ['dossier non trouvé', 'caso no encontrado', 'case not found'],
  sansDossier: ['aucun numéro de dossier', 'sin número de caso', 'no case number'],
  copierAccuse: ['Copier l’accusé de réception', 'Copiar el acuse de recibo', 'Copy the acknowledgement'],
  accuseEnvoye: ['J’ai envoyé l’accusé', 'He enviado el acuse', 'I sent the acknowledgement'],
  retractationRecue: ['Rétractation reçue le', 'Desistimiento recibido el', 'Withdrawal received on'],
  retractationStop: ['Arrêtez toutes les démarches de ce dossier.', 'Detén todas las gestiones de este caso.', 'Stop all work on this case.'],
  accuseLe: ['Accusé envoyé le', 'Acuse enviado el', 'Acknowledgement sent on'],
  accuseAEnvoyer: ['Accusé de réception à envoyer depuis le tableau de bord.', 'Acuse de recibo por enviar desde el panel.', 'Acknowledgement to send from the dashboard.'],
  ouvertureTitre: ['Dossier ouvert : message à envoyer au client', 'Caso abierto: mensaje para el cliente', 'Case opened: message to send to the client'],
  ouvertureAide: [
    'À envoyer par e-mail, dans sa langue. Il apprend qui suit son dossier et qu’il lui suffit de répondre à cet e-mail.',
    'Envíalo por correo, en su idioma. Sabrá quién lleva su caso y que le basta con responder a ese correo.',
    'Send it by email, in their language. They learn who is handling their case and that they just need to reply to that email.',
  ],
  copierMessage: ['Copier le message', 'Copiar el mensaje', 'Copy the message'],
  signatureEnvoyer: ['Envoyer le devis et le mandat à signer en ligne', 'Enviar el presupuesto y el mandato para firmar en línea', 'Send the quote and mandate to sign online'],
  signatureRenvoyer: ['Envoyer un nouveau lien', 'Enviar un enlace nuevo', 'Send a new link'],
  signatureAide: [
    'La personne lit le devis et le mandat, tape son nom et signe, en 2 minutes. Vous êtes prévenu dès que c’est signé, et elle reçoit sa copie par e-mail.',
    'La persona lee el presupuesto y el mandato, escribe su nombre y firma, en 2 minutos. Te avisamos en cuanto firma, y recibe su copia por correo.',
    'The person reads the quote and mandate, types their name and signs, in 2 minutes. You are alerted as soon as it is signed, and they get their copy by email.',
  ],
  signatureEnAttente: ['Lien envoyé le', 'Enlace enviado el', 'Link sent on'],
  signatureValable: ['valable jusqu’au', 'válido hasta el', 'valid until'],
  signatureEnvoyeeA: ['Envoyé par e-mail à', 'Enviado por correo a', 'Sent by email to'],
  signatureACopier: [
    'Envoi automatique impossible pour l’instant : copiez ce message et envoyez-le à la personne.',
    'Envío automático no disponible por ahora: copia este mensaje y envíaselo a la persona.',
    'Automatic sending is not available yet: copy this message and send it to the person.',
  ],
  signatureSignee: ['Signé en ligne le', 'Firmado en línea el', 'Signed online on'],
  signaturePar: ['par', 'por', 'by'],
  signatureDebut: ['Début immédiat demandé', 'Inicio inmediato solicitado', 'Immediate start requested'],
  signatureAttendre: [
    'Pas de début immédiat : ne commencez qu’après le délai de rétractation de 14 jours, sauf si la personne vous le demande par écrit.',
    'Sin inicio inmediato: empieza solo después del plazo de desistimiento de 14 días, salvo que la persona lo pida por escrito.',
    'No immediate start: only begin after the 14-day withdrawal period, unless the person asks you in writing.',
  ],
  voirDocumentSigne: ['Voir le document signé', 'Ver el documento firmado', 'See the signed document'],
  copierDocument: ['Copier le document', 'Copiar el documento', 'Copy the document'],
  mandatPapier: ['Ou préparer un mandat à signer sur papier', 'O preparar un mandato para firmar en papel', 'Or prepare a paper mandate'],
  paiementTitre: ['Paiement en ligne', 'Pago en línea', 'Online payment'],
  paiementInactif: [
    'Pas encore activé : il manque la clé Paystack. En attendant, le paiement se règle à la main.',
    'Aún no activado: falta la clave de Paystack. Mientras tanto, el pago se gestiona a mano.',
    'Not activated yet: the Paystack key is missing. Until then, payment is handled by hand.',
  ],
  paiementOuverture: ['Ouverture', 'Apertura', 'Opening'],
  paiementSolde: ['Solde', 'Saldo', 'Balance'],
  paiementEnvoyerOuverture: ['Envoyer le lien de paiement d’ouverture', 'Enviar el enlace de pago de apertura', 'Send the opening payment link'],
  paiementEnvoyerSolde: ['Envoyer le lien de paiement du solde', 'Enviar el enlace de pago del saldo', 'Send the balance payment link'],
  paiementPaye: ['payé le', 'pagado el', 'paid on'],
  paiementAttente: ['en attente, lien créé le', 'pendiente, enlace creado el', 'pending, link created on'],
  paiementAnomalie: [
    'payé, mais pas le montant prévu : à vérifier dans Paystack',
    'pagado, pero no el importe previsto: revisar en Paystack',
    'paid, but not the expected amount: check in Paystack',
  ],
  paiementFictif: ['paiement de test', 'pago de prueba', 'test payment'],
  paiementModeTest: [
    'Mode test : paiements fictifs, payables seulement avec les cartes de test de Paystack. Aucun lien ne part tout seul après une signature. N’envoyez pas de lien à un vrai client.',
    'Modo de prueba: pagos ficticios, que solo se pagan con las tarjetas de prueba de Paystack. Ningún enlace sale solo tras una firma. No envíes enlaces a un cliente real.',
    'Test mode: fake payments, payable only with Paystack test cards. No link goes out automatically after a signature. Do not send links to a real client.',
  ],
  paiementAuto: [
    'Après une signature en ligne, le lien d’ouverture part tout seul avec la copie signée.',
    'Tras una firma en línea, el enlace de apertura sale solo con la copia firmada.',
    'After an online signature, the opening link goes out automatically with the signed copy.',
  ],
  copierLien: ['Copier le lien', 'Copiar el enlace', 'Copy the link'],
  mandatManquant: [
    'Mandat non enregistré : aucun courrier ne pourra être validé au nom de la personne.',
    'Mandato no registrado: no se podrá validar ninguna carta en nombre de la persona.',
    'Mandate not recorded: no letter can be validated on the person’s behalf.',
  ],
  preparerMandat: ['Préparer le mandat à signer', 'Preparar el mandato para firmar', 'Prepare the mandate to sign'],
  cloreDossier: ['Clore le dossier', 'Cerrar el caso', 'Close the case'],
  rouvrir: ['Rouvrir', 'Reabrir', 'Reopen'],
  resultat: ['Résultat (obligatoire)', 'Resultado (obligatorio)', 'Outcome (required)'],
  purgeLe: ['Suppression automatique le', 'Borrado automático el', 'Automatic deletion on'],
  ajouterLiens: ['Ajouter des liens', 'Añadir enlaces', 'Add links'],
  origineRecherche: ['Issus d’une recherche inversée (à valider)', 'De una búsqueda inversa (por validar)', 'From a reverse image search (to validate)'],
  identifier: ['Identifier', 'Identificar', 'Identify'],
  identification: ['Identification', 'Identificación', 'Identification'],
  registrar: ['Registrar', 'Registrador', 'Registrar'],
  hebergeur: ['Hébergeur', 'Alojamiento', 'Host'],
  contactAbuse: ['Contact abuse', 'Contacto abuse', 'Abuse contact'],
  derriereCloudflare: ['Derrière Cloudflare (hébergeur réel masqué)', 'Detrás de Cloudflare (alojamiento real oculto)', 'Behind Cloudflare (real host hidden)'],
  domaineCree: ['Domaine créé le', 'Dominio creado el', 'Domain created on'],
  planTitre: ['Plan proposé', 'Plan propuesto', 'Suggested plan'],
  preparerCourrier: ['Préparer le courrier', 'Preparar la carta', 'Prepare the letter'],
  ouvrirLien: ['Ouvrir', 'Abrir', 'Open'],
  noterEtape: ['Noter comme fait', 'Marcar como hecho', 'Log as done'],
  semblReitire: ['Le contrôle automatique pense que le contenu a disparu : vérifiez et confirmez.', 'El control automático cree que el contenido desapareció: compruébalo y confirma.', 'The automatic check thinks the content is gone: check and confirm.'],
  sembleReapparu: ['Le contenu semble de nouveau en ligne : vérifiez.', 'El contenido parece haber vuelto: compruébalo.', 'The content seems to be back online: check.'],
  ignorer: ['Ignorer l’alerte', 'Ignorar la alerta', 'Dismiss alert'],
  derniereVerif: ['Dernier contrôle', 'Último control', 'Last check'],
  fichesUtiles: ['Recours utiles pour ce dossier', 'Recursos útiles para este caso', 'Useful remedies for this case'],
  delaiCouperet: ['Délai couperet', 'Plazo límite', 'Hard deadline'],
  nouvelleEtape: ['Noter une démarche', 'Registrar una gestión', 'Log a step'],
  typeEtape: ['Type de démarche', 'Tipo de gestión', 'Step type'],
  destinataire: ['Destinataire', 'Destinatario', 'Recipient'],
  destinataireEmail: ['E-mail du destinataire', 'Correo del destinatario', 'Recipient email'],
  lienConcerne: ['Lien concerné', 'Enlace afectado', 'Link concerned'],
  dejaEnvoye: ['Déjà envoyé', 'Ya enviado', 'Already sent'],
  aFaire: ['À faire', 'Por hacer', 'To do'],
  faitLe: ['Fait le', 'Hecho el', 'Done on'],
  echeance: ['Échéance', 'Plazo', 'Deadline'],
  note: ['Note', 'Nota', 'Note'],
  aucuneEtape: ['Aucune démarche notée.', 'Ninguna gestión registrada.', 'No steps logged.'],
  // Courriers
  nouveauCourrier: ['Préparer un courrier', 'Preparar una carta', 'Prepare a letter'],
  modele: ['Modèle', 'Plantilla', 'Template'],
  langueCourrier: ['Langue', 'Idioma', 'Language'],
  descriptionContenu: ['Description neutre du contenu (jamais explicite)', 'Descripción neutra del contenido (nunca explícita)', 'Neutral description of the content (never explicit)'],
  oeuvre: ['Description de la photo originale (DMCA)', 'Descripción de la foto original (DMCA)', 'Description of the original photo (DMCA)'],
  datePublication: ['Date de publication (si connue)', 'Fecha de publicación (si se conoce)', 'Publication date (if known)'],
  tousLesLiens: ['Tous les liens actifs du dossier', 'Todos los enlaces activos del caso', 'All active links in the case'],
  generer: ['Préparer le brouillon', 'Preparar el borrador', 'Prepare the draft'],
  objet: ['Objet', 'Asunto', 'Subject'],
  corps: ['Texte', 'Texto', 'Body'],
  aCompleter: [
    'Il reste des passages « À COMPLÉTER » : corrigez-les avant de valider.',
    'Quedan partes «À COMPLÉTER»: complétalas antes de validar.',
    'Some "À COMPLÉTER" parts remain: fill them in before validating.',
  ],
  validerCourrier: ['Valider (relu par moi)', 'Validar (revisado por mí)', 'Validate (reviewed by me)'],
  approuveClient: [
    'La personne a choisi ce modèle, a lu ce courrier et m’a donné son accord pour l’envoyer (message gardé dans les notes).',
    'La persona eligió esta plantilla, leyó esta carta y me dio su acuerdo para enviarla (mensaje guardado en las notas).',
    'The person chose this template, read this letter and agreed that I send it (message kept in the notes).',
  ],
  validerAide: [
    'Valider = j’ai relu ce courrier, il est exact, le mandat est en ordre et la personne l’a approuvé. Nous ne donnons pas d’avis juridique : la personne choisit le modèle. Rien n’est envoyé par l’outil.',
    'Validar = he revisado esta carta, es correcta, el mandato está en regla y la persona la aprobó. No damos asesoramiento jurídico: la persona elige la plantilla. La herramienta no envía nada.',
    'Validate = I reviewed this letter, it is accurate, the mandate is in order and the person approved it. We give no legal advice: the person chooses the template. The tool sends nothing.',
  ],
  envoyerProton: ['Ouvrir dans ma messagerie', 'Abrir en mi correo', 'Open in my email app'],
  marquerEnvoye: ['J’ai envoyé ce courrier', 'He enviado esta carta', 'I have sent this letter'],
  envoyeAide: [
    'Envoyez depuis team.devuelta@protonmail.com, puis confirmez ici : l’échéance de relance est créée automatiquement.',
    'Envía desde team.devuelta@protonmail.com y confirma aquí: el plazo de seguimiento se crea automáticamente.',
    'Send from team.devuelta@protonmail.com, then confirm here: the follow-up deadline is created automatically.',
  ],
  annulerCourrier: ['Abandonner ce courrier', 'Descartar esta carta', 'Discard this letter'],
  aucunCourrier: ['Aucun courrier.', 'Ninguna carta.', 'No letters.'],
  prepareAuto: ['Préparé automatiquement', 'Preparado automáticamente', 'Prepared automatically'],
  validePar: ['Validé par', 'Validado por', 'Validated by'],
  envoyePar: ['Envoyé par', 'Enviado por', 'Sent by'],
  quandUtiliser: ['Quand l’utiliser', 'Cuándo usarla', 'When to use'],
  piecesJointes: ['Pièces à joindre', 'Documentos adjuntos', 'Attachments'],
  // Notes et journal
  nouvelleNote: ['Ajouter une note pour l’équipe', 'Añadir una nota para el equipo', 'Add a note for the team'],
  aucuneNote: ['Aucune note.', 'Ninguna nota.', 'No notes.'],
  // Création
  creerDossier: ['Créer le dossier', 'Crear el caso', 'Create the case'],
  // Référentiel
  refIntro: [
    'Le référentiel unique des recours : la même source alimente le site public et cet outil.',
    'El referencial único de recursos: la misma fuente alimenta el sitio público y esta herramienta.',
    'The single dataset of remedies: the same source feeds the public site and this tool.',
  ],
  aReverifier: ['À revérifier (plus de 6 mois)', 'Por reverificar (más de 6 meses)', 'To re-check (over 6 months)'],
  // Floutage
  floutageTitre: ['Masquer une pièce d’identité', 'Ocultar datos de un documento', 'Redact an ID document'],
  floutageAide: [
    'L’image reste sur votre appareil : rien n’est envoyé. Masquez le numéro du document, la date de naissance, le numéro personnel et la bande de lecture automatique (MRZ). Gardez le nom et la photo visibles. Le masquage est opaque (un flou peut être inversé).',
    'La imagen se queda en tu dispositivo: no se envía nada. Oculta el número del documento, la fecha de nacimiento, el número personal y la zona de lectura automática (MRZ). Deja visibles el nombre y la foto. El ocultado es opaco (un desenfoque se puede revertir).',
    'The image stays on your device: nothing is sent. Hide the document number, date of birth, personal number and the machine-readable zone (MRZ). Keep the name and photo visible. Redaction is opaque (a blur can be reversed).',
  ],
  choisirImage: ['Choisir une image', 'Elegir una imagen', 'Choose an image'],
  dessinerZones: ['Tracez des rectangles sur les zones à masquer.', 'Dibuja rectángulos sobre las zonas a ocultar.', 'Draw rectangles over the areas to hide.'],
  annulerZone: ['Annuler la dernière zone', 'Deshacer la última zona', 'Undo last area'],
  telecharger: ['Télécharger l’image masquée', 'Descargar la imagen oculta', 'Download the redacted image'],
  verifierVisuellement: [
    'Vérifiez visuellement le résultat avant tout envoi.',
    'Comprueba visualmente el resultado antes de enviarlo.',
    'Check the result visually before sending it.',
  ],
  // Équipe
  membre: ['Membre', 'Miembro', 'Member'],
  admin: ['Administrateur', 'Administrador', 'Administrator'],
  role: ['Rôle', 'Rol', 'Role'],
  actif: ['Actif', 'Activo', 'Active'],
  inactif: ['Désactivé', 'Desactivado', 'Disabled'],
  ajouterMembre: ['Ajouter un membre', 'Añadir un miembro', 'Add a member'],
  mdpProvisoire: [
    'Mot de passe provisoire (affiché une seule fois) : transmettez-le par Signal ou WhatsApp, jamais par e-mail. Il devra être changé à la première connexion.',
    'Contraseña provisional (se muestra una sola vez): envíala por Signal o WhatsApp, nunca por correo. Deberá cambiarse en el primer acceso.',
    'Temporary password (shown only once): send it via Signal or WhatsApp, never by email. It must be changed at first login.',
  ],
  reinitMdp: ['Nouveau mot de passe provisoire', 'Nueva contraseña provisional', 'New temporary password'],
  reinit2fa: ['Réinitialiser la double authentification', 'Restablecer la verificación en dos pasos', 'Reset two-factor authentication'],
  desactiver: ['Désactiver', 'Desactivar', 'Disable'],
  reactiver: ['Réactiver', 'Reactivar', 'Re-enable'],
  derniereConnexion: ['Dernière connexion', 'Último acceso', 'Last login'],
  appareils: ['appareil(s) avec alertes', 'dispositivo(s) con alertas', 'device(s) with alerts'],
  historiqueConnexions: ['Historique des connexions', 'Historial de accesos', 'Login history'],
  // Réglages
  retentionDossier: ['Conservation après clôture (jours)', 'Conservación tras el cierre (días)', 'Retention after closing (days)'],
  retentionDemande: ['Conservation des demandes sans suite (jours)', 'Conservación de solicitudes sin continuidad (días)', 'Retention of unfollowed requests (days)'],
  attribution: ['Attribution automatique des demandes', 'Asignación automática de solicitudes', 'Automatic assignment of requests'],
  parDefaut: ['Automatique', 'Automático', 'Automatic'],
  exporter: ['Télécharger une sauvegarde complète (JSON)', 'Descargar una copia completa (JSON)', 'Download a full backup (JSON)'],
  purgeManuelle: ['Données arrivées à échéance', 'Datos vencidos', 'Data past retention'],
  purgerMaintenant: ['Supprimer définitivement maintenant', 'Borrar definitivamente ahora', 'Delete permanently now'],
  purgeAuto: [
    'Sinon, la suppression se fait automatiquement chaque matin.',
    'Si no, el borrado se hace automáticamente cada mañana.',
    'Otherwise, deletion happens automatically every morning.',
  ],
  monCompte: ['Mon compte', 'Mi cuenta', 'My account'],
  changerMdp: ['Changer mon mot de passe', 'Cambiar mi contraseña', 'Change my password'],
  deconnecterPartout: ['Me déconnecter de tous les appareils', 'Cerrar sesión en todos los dispositivos', 'Log out from all devices'],
  systeme: ['Fonctionnement automatique', 'Funcionamiento automático', 'Automatic operation'],
  derniereTache: ['Dernier passage automatique', 'Último pase automático', 'Last automatic run'],
  liensCasses: ['Liens officiels du site en panne', 'Enlaces oficiales del sitio caídos', 'Broken official links on the site'],
  aucunLienCasse: ['Aucun lien officiel en panne.', 'Ningún enlace oficial caído.', 'No broken official links.'],
  // Statistiques
  vues: ['Pages vues', 'Páginas vistas', 'Page views'],
  visites: ['Visites (arrivées sur le site)', 'Visitas (llegadas al sitio)', 'Visits (arrivals on the site)'],
  diagnostics: ['Diagnostics terminés', 'Diagnósticos completados', 'Diagnostics completed'],
  demandesRecues: ['Demandes reçues', 'Solicitudes recibidas', 'Requests received'],
  clicsWhatsapp: ['Clics WhatsApp', 'Clics en WhatsApp', 'WhatsApp clicks'],
  clicsEmail: ['Clics e-mail', 'Clics en correo', 'Email clicks'],
  dossiersOuvertsPeriode: ['Dossiers ouverts', 'Casos abiertos', 'Cases opened'],
  dossiersResolus: ['Dossiers résolus', 'Casos resueltos', 'Cases resolved'],
  sources: ['Provenance', 'Procedencia', 'Sources'],
  topPages: ['Pages les plus vues', 'Páginas más vistas', 'Top pages'],
  paysVisiteurs: ['Pays', 'Países', 'Countries'],
  periode: ['Période', 'Periodo', 'Period'],
  jours: ['jours', 'días', 'days'],
  statsAide: [
    'Comptage sans cookie ni identifiant : des totaux par jour, rien de plus.',
    'Conteo sin cookies ni identificadores: totales por día, nada más.',
    'Counted without cookies or identifiers: daily totals, nothing more.',
  ],
});

export type Cle = keyof typeof D;

const IDX: Record<Lang, number> = { fr: 0, es: 1, en: 2 };

export function t(cle: Cle): string {
  return D[cle][IDX[langue.value]];
}

/** Texte ponctuel propre à un écran : [français, espagnol, anglais]. */
export function tr(fr: string, es: string, en: string): string {
  return typo([fr, es, en][IDX[langue.value]]);
}

/** Position de la langue courante dans les tableaux [fr, es, en]. */
export function indexLangue(): number {
  return IDX[langue.value];
}

// Libellés des codes ---------------------------------------------------------------

const L = (fr: string, es: string, en: string) => [fr, es, en];

const CODES: Record<string, string[]> = typoProfonde({
  // statuts de dossier
  ouvert: L('Ouvert', 'Abierto', 'Open'),
  'en-cours': L('En cours', 'En curso', 'In progress'),
  'en-attente': L('En attente', 'En espera', 'Waiting'),
  resolu: L('Résolu', 'Resuelto', 'Resolved'),
  clos: L('Clos sans résultat', 'Cerrado sin resultado', 'Closed, no result'),
  oriente: L('Orienté ailleurs', 'Derivado', 'Referred'),
  // priorités
  normal: L('Normale', 'Normal', 'Normal'),
  prioritaire: L('Prioritaire', 'Prioritaria', 'Priority'),
  'mineur-immediat': L('Mineur — immédiat', 'Menor — inmediato', 'Minor — immediate'),
  // statuts de lien
  'a-valider': L('À valider', 'Por validar', 'To validate'),
  'a-traiter': L('À traiter', 'Por tratar', 'To handle'),
  signale: L('Signalé', 'Denunciado', 'Reported'),
  retire: L('Retiré', 'Retirado', 'Removed'),
  refuse: L('Refusé', 'Rechazado', 'Refused'),
  reapparu: L('Réapparu', 'Reapareció', 'Reappeared'),
  // statuts de courrier
  brouillon: L('Brouillon', 'Borrador', 'Draft'),
  valide: L('Validé, à envoyer', 'Validado, por enviar', 'Validated, to send'),
  envoye: L('Envoyé', 'Enviado', 'Sent'),
  annule: L('Abandonné', 'Descartado', 'Discarded'),
  // statuts d'étape
  'a-faire': L('À faire', 'Por hacer', 'To do'),
  reponse: L('Réponse reçue', 'Respuesta recibida', 'Reply received'),
  succes: L('Succès', 'Éxito', 'Success'),
  refus: L('Refus', 'Rechazo', 'Refusal'),
  'sans-reponse': L('Sans réponse', 'Sin respuesta', 'No reply'),
  // statuts de demande
  nouvelle: L('Nouvelle', 'Nueva', 'New'),
  convertie: L('Dossier ouvert', 'Caso abierto', 'Case opened'),
  orientee: L('Orientée', 'Orientada', 'Referred'),
  refusee: L('Refusée', 'Rechazada', 'Declined'),
  spam: L('Indésirable', 'Spam', 'Spam'),
  // types d'étape
  plateforme: L('Signalement plateforme', 'Denuncia en la plataforma', 'Platform report'),
  'site-contact': L('Contact du site', 'Contacto del sitio', 'Site contact'),
  takeitdown: L('TAKE IT DOWN (États-Unis)', 'TAKE IT DOWN (EE. UU.)', 'TAKE IT DOWN (US)'),
  dsa: L('Notification DSA', 'Notificación DSA', 'DSA notice'),
  rgpd: L('Effacement RGPD', 'Supresión RGPD', 'GDPR erasure'),
  registrant: L('Propriétaire du domaine', 'Titular del dominio', 'Domain owner'),
  registrar: L('Registrar', 'Registrador', 'Registrar'),
  hebergeur: L('Hébergeur', 'Alojamiento', 'Host'),
  cloudflare: L('Cloudflare (abuse)', 'Cloudflare (abuse)', 'Cloudflare (abuse)'),
  dmca: L('Droit d’auteur (DMCA)', 'Derechos de autor (DMCA)', 'Copyright (DMCA)'),
  dereferencement: L('Déréférencement', 'Desindexación', 'Search delisting'),
  regulateur: L('Autorité de contrôle', 'Autoridad de control', 'Regulator'),
  stopncii: L('StopNCII', 'StopNCII', 'StopNCII'),
  police: L('Police / signalement officiel', 'Policía / denuncia oficial', 'Police / official report'),
  autre: L('Autre', 'Otro', 'Other'),
  // suggestions du plan
  mineur: L('Mineur : orientation officielle (Take It Down)', 'Menor: orientación oficial (Take It Down)', 'Minor: official route (Take It Down)'),
  // rôles
  'role-admin': L('Administrateur', 'Administrador', 'Administrator'),
  'role-membre': L('Membre', 'Miembro', 'Member'),
  'cond-auteur': L('Seulement si la personne a pris la photo elle-même', 'Solo si la persona tomó la foto', 'Only if the person took the photo themselves'),
  // alertes de contrôle
  'semble-retire': L('Semble retiré', 'Parece retirado', 'Seems removed'),
  'semble-reapparu': L('Semble réapparu', 'Parece reaparecido', 'Seems back'),
  // résultats de connexion
  'cx-ok': L('Connexion réussie', 'Acceso correcto', 'Successful login'),
  'cx-inconnu': L('E-mail inconnu', 'Correo desconocido', 'Unknown email'),
  'cx-inactif': L('Compte désactivé', 'Cuenta desactivada', 'Disabled account'),
  'cx-bloque': L('Compte bloqué', 'Cuenta bloqueada', 'Locked account'),
  'cx-mdp-incorrect': L('Mauvais mot de passe', 'Contraseña incorrecta', 'Wrong password'),
  'cx-code-incorrect': L('Mauvais code 2FA', 'Código 2FA incorrecto', 'Wrong 2FA code'),
  'cx-code-init-incorrect': L('Mauvais code d’installation', 'Código de instalación incorrecto', 'Wrong setup code'),
});

export function code(c: string | null | undefined): string {
  if (!c) return '—';
  return CODES[c]?.[IDX[langue.value]] ?? c;
}

const ERREURS: Record<string, string[]> = typoProfonde({
  'identifiants-invalides': L('E-mail ou mot de passe incorrect.', 'Correo o contraseña incorrectos.', 'Wrong email or password.'),
  'trop-de-tentatives': L('Trop de tentatives. Réessayez dans 15 minutes.', 'Demasiados intentos. Inténtalo en 15 minutos.', 'Too many attempts. Try again in 15 minutes.'),
  'compte-bloque': L('Compte bloqué 15 minutes après plusieurs erreurs.', 'Cuenta bloqueada 15 minutos tras varios errores.', 'Account locked for 15 minutes after several errors.'),
  'code-incorrect': L('Code incorrect ou expiré. Utilisez le code affiché maintenant.', 'Código incorrecto o caducado. Usa el código actual.', 'Wrong or expired code. Use the current code.'),
  'mdp-trop-court': L('Au moins 12 caractères.', 'Al menos 12 caracteres.', 'At least 12 characters.'),
  'mdp-trop-simple': L('Mot de passe trop prévisible.', 'Contraseña demasiado previsible.', 'Password too predictable.'),
  'mdp-identique': L('Choisissez un mot de passe différent de l’ancien.', 'Elige una contraseña distinta de la anterior.', 'Choose a password different from the old one.'),
  'mdp-actuel-incorrect': L('Mot de passe actuel incorrect.', 'Contraseña actual incorrecta.', 'Current password is wrong.'),
  'code-init-incorrect': L('Code d’initialisation incorrect.', 'Código de inicialización incorrecto.', 'Wrong setup code.'),
  'code-init-expire': L('Code d’initialisation expiré ou absent.', 'Código de inicialización caducado o ausente.', 'Setup code expired or missing.'),
  'deja-initialise': L('L’outil est déjà initialisé.', 'La herramienta ya está inicializada.', 'The tool is already set up.'),
  'approbation-client-manquante': L('Cochez d’abord l’accord de la personne sur ce courrier.', 'Marca primero el acuerdo de la persona sobre esta carta.', 'First tick the person’s approval of this letter.'),
  'mandat-manquant': L('Enregistrez d’abord la date du mandat signé (onglet Résumé).', 'Registra primero la fecha del mandato firmado (pestaña Resumen).', 'First record the signed mandate date (Summary tab).'),
  'liens-manquants': L('Ajoutez d’abord les liens à faire retirer (onglet Liens).', 'Añade primero los enlaces a retirar (pestaña Enlaces).', 'First add the links to remove (Links tab).'),
  'pays-manquant': L('Indiquez d’abord le pays de la personne : il fixe le tarif.', 'Indica primero el país de la persona: fija la tarifa.', 'First set the person’s country: it sets the price.'),
  'sur-devis': L('Ce dossier est sur devis : préparez le devis et le mandat à la main.', 'Este caso va con presupuesto a medida: prepáralo a mano.', 'This case needs a custom quote: prepare it by hand.'),
  'mandat-incomplet': L('Il manque des informations dans le mandat (« À COMPLÉTER »).', 'Faltan datos en el mandato («À COMPLÉTER»).', 'The mandate is missing information ("À COMPLÉTER").'),
  'mandat-deja-signe': L('Le mandat est déjà signé.', 'El mandato ya está firmado.', 'The mandate is already signed.'),
  'paiement-non-configure': L('Paiement en ligne pas encore activé (clé Paystack manquante).', 'Pago en línea aún no activado (falta la clave de Paystack).', 'Online payment not activated yet (Paystack key missing).'),
  'email-client-manquant': L('Ajoutez d’abord l’e-mail de la personne (onglet Résumé).', 'Añade primero el correo de la persona (pestaña Resumen).', 'First add the person’s email (Summary tab).'),
  'rien-a-payer': L('Rien à payer pour l’instant.', 'Nada que pagar por ahora.', 'Nothing to pay for now.'),
  'deja-paye': L('C’est déjà payé.', 'Ya está pagado.', 'Already paid.'),
  'paiement-indisponible': L('Paystack ne répond pas. Réessayez dans quelques minutes.', 'Paystack no responde. Inténtalo en unos minutos.', 'Paystack is not responding. Try again in a few minutes.'),
  'taux-indisponible': L('Taux de change indisponible. Réessayez dans quelques minutes.', 'Tipo de cambio no disponible. Inténtalo en unos minutos.', 'Exchange rate unavailable. Try again in a few minutes.'),
  'ia-indisponible': L('Brouillon automatique indisponible pour l’instant : répondez à la main.', 'Borrador automático no disponible por ahora: responde a mano.', 'Automatic draft unavailable for now: reply by hand.'),
  'email-indisponible': L('Envoi automatique indisponible : copiez le texte et envoyez-le depuis la boîte Proton.', 'Envío automático no disponible: copia el texto y envíalo desde el buzón de Proton.', 'Automatic sending unavailable: copy the text and send it from the Proton inbox.'),
  'contact-pas-email': L('Cette personne n’a pas donné d’e-mail.', 'Esta persona no dio un correo.', 'This person gave no email.'),
  'contact-pas-telegram': L('Cette personne ne nous a pas écrit par Telegram.', 'Esta persona no nos escribió por Telegram.', 'This person did not write to us on Telegram.'),
  'telegram-inactif': L('Robot Telegram pas encore activé (clé manquante).', 'Robot de Telegram aún no activado (falta la clave).', 'Telegram bot not activated yet (key missing).'),
  'telegram-bloque': L('La personne a bloqué le robot ou supprimé la conversation : impossible de lui écrire sur Telegram.', 'La persona bloqueó el robot o borró la conversación: no se le puede escribir por Telegram.', 'The person blocked the bot or deleted the chat: you cannot write to them on Telegram.'),
  'telegram-introuvable': L('Conversation Telegram introuvable : la personne doit réécrire au robot.', 'Conversación de Telegram no encontrada: la persona debe volver a escribir al robot.', 'Telegram chat not found: the person needs to write to the bot again.'),
  'telegram-indisponible': L('Telegram ne répond pas. Réessayez dans quelques minutes.', 'Telegram no responde. Inténtalo en unos minutos.', 'Telegram is not responding. Try again in a few minutes.'),
  'telegram-voir-dossier': L('Cette demande est devenue un dossier : répondez depuis l’onglet Telegram du dossier.', 'Esta solicitud se convirtió en un caso: responde desde la pestaña Telegram del caso.', 'This request became a case: reply from the case’s Telegram tab.'),
  'courrier-incomplet': L('Il reste des passages « À COMPLÉTER ».', 'Quedan partes «À COMPLÉTER».', 'Some "À COMPLÉTER" parts remain.'),
  'email-deja-utilise': L('Cette adresse e-mail est déjà utilisée.', 'Este correo ya se usa.', 'This email is already in use.'),
  'lien-invalide': L('Lien invalide.', 'Enlace no válido.', 'Invalid link.'),
  'email-invalide': L('Adresse e-mail invalide.', 'Correo no válido.', 'Invalid email.'),
  'telephone-invalide': L('Numéro invalide (ajoutez l’indicatif, ex. +33).', 'Número no válido (añade el prefijo, ej. +34).', 'Invalid number (add the country code, e.g. +1).'),
  'consentement-recherche-manquant': L('Enregistrez d’abord l’accord pour la recherche d’images.', 'Registra primero el consentimiento para la búsqueda de imágenes.', 'First record consent for image search.'),
  'reserve-admin': L('Réservé à l’administrateur.', 'Reservado al administrador.', 'Administrator only.'),
  introuvable: L('Introuvable (ou pas d’accès).', 'No encontrado (o sin acceso).', 'Not found (or no access).'),
  'champ-manquant': L('Un champ obligatoire est vide.', 'Falta un campo obligatorio.', 'A required field is empty.'),
  'auto-desactivation': L('Vous ne pouvez pas désactiver votre propre compte.', 'No puedes desactivar tu propia cuenta.', 'You cannot disable your own account.'),
  'auto-retrogradation': L('Vous ne pouvez pas retirer votre propre rôle d’administrateur.', 'No puedes quitarte el rol de administrador.', 'You cannot remove your own admin role.'),
  'abonnement-invalide': L('Ce navigateur ne permet pas les alertes.', 'Este navegador no permite alertas.', 'This browser does not support alerts.'),
});

export function erreur(e: unknown): string {
  const c = (e as { code?: string })?.code ?? '';
  return ERREURS[c]?.[IDX[langue.value]] ?? `${t('erreur')} (${c || 'réseau'})`;
}

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', es: 'es-ES', en: 'en-GB' };

export function date(iso: string | null | undefined, avecHeure = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[langue.value], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d);
}

export const NDA: Record<Lang, { titre: string; points: string[]; fin: string }> = typoProfonde({
  fr: {
    titre: 'Accord de confidentialité — EraseOps (version du 15 octobre 2026)',
    points: [
      'Je garde strictement confidentielles toutes les informations des dossiers (identités, liens, échanges, situations), pendant et après ma collaboration avec Devuelta.',
      'Je ne copie, n’exporte et ne partage aucune donnée en dehors de l’outil, sauf pour exécuter une démarche validée (courrier à une plateforme, un hébergeur, un registrar ou une autorité).',
      'Je n’ouvre, ne télécharge et ne conserve aucun contenu intime : je travaille à partir des liens et des captures strictement nécessaires.',
      'Je n’envoie jamais un courrier sans mandat signé de la personne et sans validation dans l’outil.',
      'Je protège mon accès : mot de passe unique, double authentification, aucun partage de compte, téléphone verrouillé.',
      'Je signale immédiatement à l’administrateur toute perte d’appareil, tout message suspect ou tout accès inhabituel.',
      'Je n’utilise jamais les données d’un dossier à d’autres fins (prospection, démonstration, réseaux sociaux, entraînement d’une IA).',
    ],
    fin: 'Je sais que mes actions dans l’outil sont enregistrées dans un journal.',
  },
  es: {
    titre: 'Acuerdo de confidencialidad — EraseOps (versión del 15 de octubre de 2026)',
    points: [
      'Mantengo estrictamente confidencial toda la información de los casos (identidades, enlaces, intercambios, situaciones), durante y después de mi colaboración con Devuelta.',
      'No copio, no exporto ni comparto ningún dato fuera de la herramienta, salvo para ejecutar una gestión validada (carta a una plataforma, un proveedor de alojamiento, un registrador o una autoridad).',
      'No abro, no descargo ni conservo ningún contenido íntimo: trabajo a partir de los enlaces y de las capturas estrictamente necesarias.',
      'Nunca envío una carta sin el mandato firmado de la persona y sin validación en la herramienta.',
      'Protejo mi acceso: contraseña única, verificación en dos pasos, sin compartir la cuenta, teléfono bloqueado.',
      'Aviso de inmediato al administrador de cualquier pérdida de dispositivo, mensaje sospechoso o acceso inusual.',
      'Nunca uso los datos de un caso para otros fines (captación, demostraciones, redes sociales, entrenamiento de IA).',
    ],
    fin: 'Sé que mis acciones en la herramienta quedan registradas.',
  },
  en: {
    titre: 'Confidentiality agreement — EraseOps (version of 15 October 2026)',
    points: [
      'I keep all case information strictly confidential (identities, links, exchanges, situations), during and after my collaboration with Devuelta.',
      'I do not copy, export or share any data outside the tool, except to carry out a validated step (a letter to a platform, host, registrar or authority).',
      'I never open, download or keep intimate content: I work from links and strictly necessary screenshots.',
      'I never send a letter without the person’s signed mandate and without validation in the tool.',
      'I protect my access: a unique password, two-factor authentication, no account sharing, a locked phone.',
      'I immediately tell the administrator about any lost device, suspicious message or unusual access.',
      'I never use case data for any other purpose (prospecting, demos, social media, training an AI).',
    ],
    fin: 'I know my actions in the tool are recorded in a log.',
  },
});
