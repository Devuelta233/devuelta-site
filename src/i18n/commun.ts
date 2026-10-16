// Textes communs à toutes les pages publiques (en-tête, pied de page, contact).
// Français : « vous ». Espagnol : « tú ». Anglais : simple et direct.

import type { L3, T3 } from '../../shared/vocab';

export const C = {
  nomSite: { fr: 'Devuelta', es: 'Devuelta', en: 'Devuelta' } as T3,
  slogan: {
    fr: 'Reprenez ce qui vous appartient.',
    es: 'Recupera lo que es tuyo.',
    en: "Reclaim what's yours.",
  } as T3,
  quitter: { fr: 'Quitter', es: 'Salir', en: 'Leave' } as T3,
  quitterAide: {
    fr: 'Quitter le site tout de suite (ouvre Google)',
    es: 'Salir del sitio ahora mismo (abre Google)',
    en: 'Leave this site right now (opens Google)',
  } as T3,
  allerContenu: { fr: 'Aller au contenu', es: 'Ir al contenido', en: 'Skip to content' } as T3,
  langue: { fr: 'Langue', es: 'Idioma', en: 'Language' } as T3,
  menu: { fr: 'Menu', es: 'Menú', en: 'Menu' } as T3,
  nav: {
    diagnostic: { fr: 'Diagnostic', es: 'Diagnóstico', en: 'Diagnostic' } as T3,
    queFaire: { fr: 'Que faire ?', es: '¿Qué hacer?', en: 'What to do' } as T3,
    guides: { fr: 'Recours', es: 'Recursos', en: 'Remedies' } as T3,
    urgence: { fr: 'Aide urgente', es: 'Ayuda urgente', en: 'Urgent help' } as T3,
    methode: { fr: 'Notre méthode', es: 'Cómo trabajamos', en: 'How we work' } as T3,
    confier: { fr: 'Confier mon dossier', es: 'Confiar mi caso', en: 'Get our help' } as T3,
    tarifs: { fr: 'Tarifs', es: 'Precios', en: 'Pricing' } as T3,
    contact: { fr: 'Contact', es: 'Contacto', en: 'Contact' } as T3,
    confidentialite: { fr: 'Confidentialité', es: 'Privacidad', en: 'Privacy' } as T3,
    mentions: { fr: 'Mentions légales', es: 'Aviso legal', en: 'Legal notice' } as T3,
    conditions: { fr: 'Conditions de vente', es: 'Condiciones de venta', en: 'Terms of sale' } as T3,
    // Libellé imposé pour la fonction de rétractation en ligne (directive 2011/83/UE, art. 11 bis).
    retractation: { fr: 'Renoncer au contrat ici', es: 'Desistir del contrato aquí', en: 'Withdraw from contract here' } as T3,
    controle: { fr: 'Contrôle en 5 minutes', es: 'Chequeo en 5 minutos', en: '5-minute check-up' } as T3,
    referentiel: { fr: 'Référentiel ouvert (JSON)', es: 'Referencial abierto (JSON)', en: 'Open dataset (JSON)' } as T3,
  },
  engagementsTitre: { fr: 'Nos engagements', es: 'Nuestros compromisos', en: 'Our commitments' } as T3,
  engagements: {
    fr: [
      'Aucun traceur, aucun cookie',
      "Rien n'est envoyé sans votre accord",
      'Nous travaillons à partir des liens, pas de vos images',
      'Un humain valide chaque étape',
    ],
    es: [
      'Sin rastreadores, sin cookies',
      'No se envía nada sin tu permiso',
      'Trabajamos a partir de los enlaces, no de tus imágenes',
      'Una persona revisa cada paso',
    ],
    en: [
      'No trackers, no cookies',
      'Nothing is sent without your consent',
      'We work from links, not from your images',
      'A human reviews every step',
    ],
  } as L3,
  urgence: {
    fr: 'Situation urgente, menace ou chantage, personne mineure : ne restez pas seul·e. Contactez la police et un proche de confiance avant tout signalement.',
    es: 'Situación urgente, amenaza o chantaje, persona menor de edad: no te quedes sol@. Avisa a la policía y a alguien de confianza antes de cualquier denuncia.',
    en: "Urgent situation, threats or blackmail, or a minor involved: don't handle it alone. Contact the police and someone you trust before filing anything.",
  } as T3,
  urgenceLien: { fr: 'Les numéros d’aide par pays', es: 'Los números de ayuda por país', en: 'Helplines by country' } as T3,
  ecrireTitre: { fr: 'Nous écrire', es: 'Escríbenos', en: 'Write to us' } as T3,
  whatsappApres: {
    fr: 'Le numéro WhatsApp de la personne qui suit votre dossier vous est donné dès l’ouverture du dossier.',
    es: 'El número de WhatsApp de la persona que lleva tu caso se te da en cuanto se abre el caso.',
    en: 'The WhatsApp number of the person handling your case is given to you as soon as your case is opened.',
  } as T3,
  reponseEn: {
    fr: 'Réponse en français',
    es: 'Respuesta en español',
    en: 'Reply in English',
  } as T3,
  piedTexte: {
    fr: 'Devuelta aide à faire retirer de l’internet ce qui vous concerne, par des moyens légaux. Ce site ne donne pas de conseil juridique.',
    es: 'Devuelta ayuda a retirar de internet lo que te concierne, por vías legales. Este sitio no ofrece asesoría jurídica.',
    en: 'Devuelta helps you get what concerns you removed from the internet, through legal means only. This site does not give legal advice.',
  } as T3,
  verifieLe: { fr: 'Vérifié le', es: 'Verificado el', en: 'Checked on' } as T3,
  sourceOfficielle: { fr: 'Source officielle', es: 'Fuente oficial', en: 'Official source' } as T3,
  accueil: { fr: 'Accueil', es: 'Inicio', en: 'Home' } as T3,
  lireAussi: { fr: 'À lire aussi', es: 'También te puede servir', en: 'Also useful' } as T3,
  ouvrirFormulaire: { fr: 'Ouvrir la page officielle', es: 'Abrir la página oficial', en: 'Open the official page' } as T3,
  connexionRequise: {
    fr: 'Vous devrez peut-être vous connecter à votre compte.',
    es: 'Puede que tengas que iniciar sesión en tu cuenta.',
    en: 'You may need to log in to your account.',
  } as T3,
  pasDeConnexion: {
    fr: 'Pas besoin d’avoir un compte.',
    es: 'No necesitas tener una cuenta.',
    en: "You don't need an account.",
  } as T3,
  siCaNeMarchePas: {
    fr: 'Si ça ne marche pas',
    es: 'Si no funciona',
    en: "If it doesn't work",
  } as T3,
  siCaNeMarchePasTexte: {
    fr: 'Un formulaire officiel peut rester sans réponse, ou être refusé à tort. Ce n’est pas la fin : il existe d’autres portes, plus lourdes mais efficaces — l’hébergeur du site, la société qui gère son nom de domaine, les lois de votre pays, l’autorité de protection des données. C’est exactement ce que nous faisons pour vous, avec votre accord.',
    es: 'Un formulario oficial puede quedar sin respuesta o ser rechazado por error. No es el final: hay otras puertas, más pesadas pero eficaces: el proveedor que aloja el sitio, la empresa que gestiona su dominio, las leyes de tu país, la autoridad de protección de datos. Eso es exactamente lo que hacemos por ti, con tu acuerdo.',
    en: "An official form can go unanswered or be wrongly refused. That's not the end: there are other doors, heavier but effective — the company hosting the site, the company managing its domain name, the laws of your country, the data protection authority. That's exactly what we do for you, with your agreement.",
  } as T3,
  ctaDiagnostic: { fr: 'Commencer le diagnostic', es: 'Empezar el diagnóstico', en: 'Start the diagnostic' } as T3,
  ctaDiagnosticSous: { fr: 'Gratuit, anonyme, 3 minutes', es: 'Gratis, anónimo, 3 minutos', en: 'Free, anonymous, 3 minutes' } as T3,
  ctaConfier: { fr: 'Confier mon dossier', es: 'Confiar mi caso', en: 'Get our help' } as T3,
  ctaConfierSous: {
    fr: 'Dès 40 €, le reste seulement si c’est retiré',
    es: 'Desde 40 €, el resto solo si se retira',
    en: 'From €40, the rest only if removed',
  } as T3,
  pasConseilJuridique: {
    fr: 'Ces informations vous aident à exercer vos droits. Elles ne remplacent pas l’avis d’un avocat.',
    es: 'Esta información te ayuda a ejercer tus derechos. No sustituye la opinión de un abogado.',
    en: "This information helps you use your rights. It doesn't replace advice from a lawyer.",
  } as T3,
  nouvelOnglet: { fr: '(nouvel onglet)', es: '(nueva pestaña)', en: '(new tab)' } as T3,
};
