// Textes des pages : accueil, méthode, confier, contact, urgence,
// confidentialité, mentions légales. Une clé = trois langues.

import type { L3, T3 } from '../../shared/vocab';

export const ACCUEIL = {
  seo: {
    fr: 'Faire retirer un contenu d’internet',
    es: 'Retirar un contenido de internet',
    en: 'Get content removed from the internet',
  } as T3,
  meta: {
    fr: 'Photo intime, deepfake, faux profil, compte piraté, faux avis, diffamation : on vous apprend à le faire retirer vous-même. Si ça ne suffit pas, on prend le relais.',
    es: 'Foto íntima, deepfake, perfil falso, cuenta hackeada, reseñas falsas, difamación: te enseñamos a retirarlo tú. Si no basta, nos encargamos nosotros.',
    en: 'Intimate image, deepfake, fake profile, hacked account, fake reviews, defamation: we show you how to get it removed yourself. If that’s not enough, we take over.',
  } as T3,
  eyebrow: {
    fr: 'photos · faux profils · faux avis · usurpation · diffamation',
    es: 'fotos · perfiles falsos · reseñas falsas · suplantación · difamación',
    en: 'photos · fake profiles · fake reviews · impersonation · defamation',
  } as T3,
  h1: {
    fr: 'Reprenez ce qui vous appartient.',
    es: 'Recupera lo que es tuyo.',
    en: "Reclaim what's yours.",
  } as T3,
  lede: {
    fr: 'On vous apprend d’abord à le faire vous-même. Si ça ne suffit pas, on prend le relais.',
    es: 'Primero te enseñamos a hacerlo tú. Si no es suficiente, nos encargamos nosotros.',
    en: "We teach you how to do it yourself first. If that's not enough, we take over.",
  } as T3,
  sous: {
    fr: 'Même si vous aviez accepté au départ. Même si c’est vous qui l’aviez publié.',
    es: 'Aunque al principio hayas dado tu consentimiento. Aunque lo hayas publicado tú.',
    en: 'Even if you agreed to it at first. Even if you posted it yourself.',
  } as T3,
  ctaQueFaire: { fr: 'Voir ce que vous pouvez faire', es: 'Ver lo que puedes hacer', en: 'See what you can do' } as T3,
  situationsTitre: { fr: 'Ce qui vous arrive', es: 'Lo que te está pasando', en: "What's happening to you" } as T3,
  commentTitre: { fr: 'Comment ça marche', es: 'Cómo funciona', en: 'How it works' } as T3,
  comment: {
    fr: [
      ['Vous essayez d’abord', 'Le diagnostic vous indique les formulaires officiels et les recours de votre pays. C’est gratuit, sans inscription, et rien ne quitte votre téléphone.'],
      ['Si ça bloque, on prend le relais', 'Avec votre accord écrit, nous écrivons au site, à son hébergeur, à la société qui gère son nom de domaine, aux moteurs de recherche, puis aux autorités si besoin.'],
      ['Un humain à chaque étape', 'Chaque courrier est relu et validé par une personne de l’équipe. Vous savez toujours ce qui a été envoyé, à qui et quand.'],
    ],
    es: [
      ['Primero lo intentas tú', 'El diagnóstico te indica los formularios oficiales y los recursos de tu país. Es gratis, sin registro, y nada sale de tu teléfono.'],
      ['Si se bloquea, nos encargamos', 'Con tu acuerdo por escrito, escribimos al sitio, a su proveedor de alojamiento, a la empresa que gestiona su dominio, a los buscadores y, si hace falta, a las autoridades.'],
      ['Una persona en cada paso', 'Cada carta la revisa y la valida una persona del equipo. Siempre sabes qué se envió, a quién y cuándo.'],
    ],
    en: [
      ['You try first', 'The diagnostic shows you the official forms and the remedies in your country. Free, no sign-up, and nothing leaves your phone.'],
      ['If it gets stuck, we take over', 'With your written agreement, we write to the site, its hosting company, the company managing its domain name, search engines, then the authorities if needed.'],
      ['A human at every step', 'Every letter is reviewed and approved by a person on the team. You always know what was sent, to whom and when.'],
    ],
  } as Record<'fr' | 'es' | 'en', [string, string][]>,
  echelleTitre: { fr: 'L’échelle des recours', es: 'La escalera de recursos', en: 'The ladder of remedies' } as T3,
  echelleIntro: {
    fr: 'On commence toujours par la porte la plus simple. Sans réponse dans le délai, on monte d’une marche.',
    es: 'Siempre empezamos por la puerta más sencilla. Si no hay respuesta en el plazo, subimos un escalón.',
    en: 'We always start with the simplest door. If there is no answer in time, we go one step up.',
  } as T3,
  echelle: {
    fr: ['Le signalement à la plateforme', 'La demande écrite fondée sur la loi', 'Le registrar du nom de domaine', 'L’hébergeur du site', 'Les moteurs de recherche', 'L’autorité ou la justice'],
    es: ['La denuncia a la plataforma', 'La solicitud escrita basada en la ley', 'El registrador del dominio', 'El proveedor de alojamiento', 'Los buscadores', 'La autoridad o la justicia'],
    en: ['Reporting to the platform', 'A written request based on the law', 'The domain name registrar', 'The hosting company', 'Search engines', 'The authority or the courts'],
  } as L3,
  recoursTitre: { fr: 'Des recours vérifiés, datés, sourcés', es: 'Recursos verificados, fechados y con fuente', en: 'Remedies that are checked, dated and sourced' } as T3,
  recoursIntro: {
    fr: 'Chaque recours indique la loi, le lien officiel et la date de sa dernière vérification. Rien n’est inventé, rien n’est promis.',
    es: 'Cada recurso indica la ley, el enlace oficial y la fecha de su última verificación. Nada es inventado, nada es prometido.',
    en: 'Each remedy shows the law, the official link and the date it was last checked. Nothing invented, nothing promised.',
  } as T3,
  tousLesRecours: { fr: 'Tous les recours', es: 'Todos los recursos', en: 'All remedies' } as T3,
  contactTitre: { fr: 'Parler à quelqu’un', es: 'Hablar con alguien', en: 'Talk to someone' } as T3,
  contactIntro: {
    fr: 'Une question, un doute ? Écrivez-nous dans votre langue. Nos messages ne mentionnent jamais votre situation dans l’objet.',
    es: '¿Una pregunta, una duda? Escríbenos en tu idioma. Nuestros mensajes nunca mencionan tu situación en el asunto.',
    en: 'A question, a doubt? Write to us in your language. Our messages never mention your situation in the subject line.',
  } as T3,
};

export const METHODE = {
  seo: { fr: 'Notre méthode', es: 'Cómo trabajamos', en: 'How we work' } as T3,
  meta: {
    fr: 'Qui nous sommes, comment nous travaillons, nos règles et nos limites. Un humain valide chaque étape, uniquement par des moyens légaux.',
    es: 'Quiénes somos, cómo trabajamos, nuestras reglas y nuestros límites. Una persona valida cada paso, solo por vías legales.',
    en: 'Who we are, how we work, our rules and our limits. A human approves every step, through legal means only.',
  } as T3,
  h1: { fr: 'Notre méthode', es: 'Cómo trabajamos', en: 'How we work' } as T3,
  intro: {
    fr: 'Devuelta est une petite équipe trilingue — français, espagnol, anglais — basée au Ghana. Notre métier : faire retirer d’internet ce qui vous concerne, uniquement par des moyens légaux.',
    es: 'Devuelta es un pequeño equipo trilingüe —francés, español, inglés— con base en Ghana. Nuestro trabajo: retirar de internet lo que te concierne, solo por vías legales.',
    en: 'Devuelta is a small trilingual team — French, Spanish, English — based in Ghana. Our job: getting what concerns you removed from the internet, through legal means only.',
  } as T3,
  dabordTitre: { fr: 'D’abord, vous', es: 'Primero, tú', en: 'You first' } as T3,
  dabord: {
    fr: 'Beaucoup de situations se règlent avec le bon formulaire, au bon endroit. Nos guides et notre diagnostic sont gratuits et sans inscription. Si vous pouvez le faire seul·e, nous vous le dirons.',
    es: 'Muchas situaciones se resuelven con el formulario correcto, en el lugar correcto. Nuestras guías y nuestro diagnóstico son gratis y sin registro. Si puedes hacerlo tú, te lo diremos.',
    en: "Many situations are solved with the right form, in the right place. Our guides and diagnostic are free and need no sign-up. If you can do it yourself, we'll tell you.",
  } as T3,
  reglesTitre: { fr: 'Nos règles, sans exception', es: 'Nuestras reglas, sin excepción', en: 'Our rules, no exceptions' } as T3,
  regles: {
    fr: [
      'Un humain relit et valide chaque courrier avant son envoi. Rien ne part automatiquement.',
      'Nous travaillons à partir des liens, pas de vos images. Nous ne vous demanderons jamais d’envoyer un contenu intime.',
      'Uniquement des moyens légaux : pas de piratage, pas de menace, pas de faux.',
      'Nous n’agissons en votre nom qu’avec votre mandat écrit, que vous pouvez retirer à tout moment.',
      'Nous ne promettons jamais un retrait garanti : nous vous disons honnêtement ce qui est possible.',
      'Personnes mineures : nous orientons vers les services officiels gratuits, sans jamais facturer.',
      'Vos données sont supprimées automatiquement après la clôture de votre dossier.',
    ],
    es: [
      'Una persona revisa y valida cada carta antes de enviarla. Nada se envía de forma automática.',
      'Trabajamos a partir de los enlaces, no de tus imágenes. Nunca te pediremos que envíes un contenido íntimo.',
      'Solo vías legales: nada de hackeo, nada de amenazas, nada falso.',
      'Solo actuamos en tu nombre con tu mandato por escrito, que puedes retirar cuando quieras.',
      'Nunca prometemos una retirada garantizada: te decimos con honestidad lo que es posible.',
      'Personas menores de edad: las orientamos hacia los servicios oficiales gratuitos, sin cobrar nunca.',
      'Tus datos se borran automáticamente después de cerrar tu caso.',
    ],
    en: [
      'A human reviews and approves every letter before it is sent. Nothing goes out automatically.',
      'We work from links, not from your images. We will never ask you to send intimate content.',
      'Legal means only: no hacking, no threats, nothing fake.',
      'We only act on your behalf with your written mandate, which you can withdraw at any time.',
      'We never promise guaranteed removal: we tell you honestly what is possible.',
      'Minors: we point to official free services and never charge.',
      'Your data is deleted automatically after your case is closed.',
    ],
  } as L3,
  prixTitre: { fr: 'Combien ça coûte ?', es: '¿Cuánto cuesta?', en: 'How much does it cost?' } as T3,
  prix: {
    fr: 'Le diagnostic et les guides sont gratuits. Pour une prise en charge, nous vous donnons d’abord un devis clair, selon le nombre de liens et la difficulté. Vous ne payez rien avant de l’avoir accepté.',
    es: 'El diagnóstico y las guías son gratis. Para que nos encarguemos, primero te damos un presupuesto claro, según el número de enlaces y la dificultad. No pagas nada antes de aceptarlo.',
    en: 'The diagnostic and the guides are free. If you want us to take over, we first give you a clear quote, based on the number of links and how difficult it is. You pay nothing before accepting it.',
  } as T3,
  pasTitre: { fr: 'Ce que nous ne sommes pas', es: 'Lo que no somos', en: 'What we are not' } as T3,
  pas: {
    fr: 'Nous ne sommes pas un cabinet d’avocats et ne donnons pas de conseil juridique. Nous vous aidons à exercer vos droits. Si une action en justice devient nécessaire, nous vous le disons et vous orientons.',
    es: 'No somos un despacho de abogados y no damos asesoría jurídica. Te ayudamos a ejercer tus derechos. Si hace falta una acción judicial, te lo decimos y te orientamos.',
    en: "We are not a law firm and we don't give legal advice. We help you use your rights. If legal action becomes necessary, we tell you and point you in the right direction.",
  } as T3,
  confianceTitre: { fr: 'Pourquoi nous faire confiance', es: 'Por qué confiar en nosotros', en: 'Why you can trust us' } as T3,
  confiance: {
    fr: 'Nos sources sont publiques : chaque recours de ce site cite la loi, le lien officiel et sa date de vérification. Notre référentiel des recours est ouvert et réutilisable librement. Et ce site lui-même ne contient aucun traceur.',
    es: 'Nuestras fuentes son públicas: cada recurso de este sitio cita la ley, el enlace oficial y su fecha de verificación. Nuestro referencial de recursos es abierto y reutilizable libremente. Y este sitio no contiene ningún rastreador.',
    en: 'Our sources are public: every remedy on this site cites the law, the official link and the date it was checked. Our dataset of remedies is open and free to reuse. And this site itself contains no trackers.',
  } as T3,
};

export const CONFIER = {
  seo: { fr: 'Confier mon dossier', es: 'Confiar mi caso', en: 'Get our help' } as T3,
  meta: {
    fr: 'Décrivez votre situation : nous vous recontactons pour vous dire honnêtement ce qui est possible, avec un devis clair. Aucune image à envoyer.',
    es: 'Describe tu situación: te contactamos para decirte con honestidad lo que es posible, con un presupuesto claro. No tienes que enviar imágenes.',
    en: 'Describe your situation: we get back to you to say honestly what is possible, with a clear quote. No images to send.',
  } as T3,
  h1: { fr: 'Confier mon dossier', es: 'Confiar mi caso', en: 'Get our help' } as T3,
  intro: {
    fr: 'Décrivez votre situation en quelques mots. Nous vous recontactons, en général sous 24 à 48 heures, pour vous dire honnêtement ce qui est possible et vous proposer un devis. Rien n’est engagé à ce stade.',
    es: 'Describe tu situación en pocas palabras. Te contactamos, normalmente en 24 a 48 horas, para decirte con honestidad lo que es posible y darte un presupuesto. Nada te compromete en este momento.',
    en: 'Describe your situation in a few words. We get back to you, usually within 24 to 48 hours, to say honestly what is possible and give you a quote. Nothing is committed at this stage.',
  } as T3,
  direct: {
    fr: 'Vous préférez écrire directement ?',
    es: '¿Prefieres escribirnos directamente?',
    en: 'Prefer to write to us directly?',
  } as T3,
};

export const CONTACT = {
  seo: { fr: 'Nous contacter', es: 'Contacto', en: 'Contact us' } as T3,
  meta: {
    fr: 'Écrivez à Devuelta en français, en espagnol ou en anglais, par WhatsApp ou par e-mail. Réponse en général sous 24 heures.',
    es: 'Escribe a Devuelta en español, francés o inglés, por WhatsApp o por correo. Respuesta normalmente en 24 horas.',
    en: 'Write to Devuelta in English, French or Spanish, by WhatsApp or email. We usually reply within 24 hours.',
  } as T3,
  h1: { fr: 'Nous contacter', es: 'Contacto', en: 'Contact us' } as T3,
  intro: {
    fr: 'Écrivez-nous dans votre langue. Nous répondons en général sous 24 heures.',
    es: 'Escríbenos en tu idioma. Normalmente respondemos en 24 horas.',
    en: 'Write to us in your language. We usually reply within 24 hours.',
  } as T3,
  discretionTitre: { fr: 'Pour votre discrétion', es: 'Para tu discreción', en: 'For your discretion' } as T3,
  discretion: {
    fr: [
      'Nos messages ne mentionnent jamais votre situation dans l’objet ou dans l’aperçu.',
      'Si quelqu’un peut voir votre téléphone, préférez l’e-mail ou archivez la conversation.',
      'N’envoyez pas d’images : les liens suffisent.',
    ],
    es: [
      'Nuestros mensajes nunca mencionan tu situación en el asunto ni en la vista previa.',
      'Si alguien puede ver tu teléfono, usa mejor el correo o archiva la conversación.',
      'No envíes imágenes: los enlaces son suficientes.',
    ],
    en: [
      'Our messages never mention your situation in the subject line or preview.',
      'If someone can see your phone, prefer email or archive the conversation.',
      "Don't send images: links are enough.",
    ],
  } as L3,
  avant: {
    fr: 'Avant de nous écrire : le diagnostic gratuit vous donne peut-être déjà la réponse.',
    es: 'Antes de escribirnos: quizá el diagnóstico gratuito ya tenga tu respuesta.',
    en: 'Before writing: the free diagnostic may already have your answer.',
  } as T3,
};

export const URGENCE = {
  seo: { fr: 'Aide urgente : numéros par pays', es: 'Ayuda urgente: números por país', en: 'Urgent help: helplines by country' } as T3,
  meta: {
    fr: 'Menace, chantage, sextorsion, personne mineure : les numéros et services officiels gratuits, pays par pays, vérifiés et datés.',
    es: 'Amenaza, chantaje, sextorsión, persona menor: los números y servicios oficiales gratuitos, país por país, verificados y fechados.',
    en: 'Threats, blackmail, sextortion, a minor involved: free official helplines and services, country by country, checked and dated.',
  } as T3,
  h1: { fr: 'Aide urgente', es: 'Ayuda urgente', en: 'Urgent help' } as T3,
  danger: {
    fr: 'Si vous êtes en danger immédiat, appelez les secours de votre pays.',
    es: 'Si estás en peligro inmediato, llama a los servicios de emergencia de tu país.',
    en: 'If you are in immediate danger, call your local emergency number.',
  } as T3,
  intro: {
    fr: 'Menace, chantage, personne mineure : voici les services officiels, souvent gratuits, pays par pays. Choisissez votre pays.',
    es: 'Amenaza, chantaje, persona menor de edad: aquí tienes los servicios oficiales, a menudo gratuitos, país por país. Elige tu país.',
    en: 'Threats, blackmail, a minor involved: here are the official services, often free, country by country. Choose your country.',
  } as T3,
  reflexesTitre: { fr: 'Les bons réflexes en cas de chantage', es: 'Qué hacer ante un chantaje', en: 'What to do if you are being blackmailed' } as T3,
  tracesTitre: { fr: 'Effacer vos traces', es: 'Borrar tus huellas', en: 'Covering your tracks' } as T3,
  traces: {
    fr: 'Si quelqu’un peut voir votre téléphone ou votre ordinateur : utilisez la navigation privée, effacez l’historique de ce site, et servez-vous du bouton « Quitter » en haut de chaque page : il ouvre Google immédiatement.',
    es: 'Si alguien puede ver tu teléfono o tu computadora: usa la navegación privada, borra el historial de este sitio y usa el botón «Salir» arriba de cada página: abre Google al instante.',
    en: 'If someone can see your phone or computer: use private browsing, clear this site from your history, and use the "Leave" button at the top of every page: it opens Google instantly.',
  } as T3,
  international: { fr: 'Outils internationaux', es: 'Herramientas internacionales', en: 'International tools' } as T3,
  gratuit: { fr: 'Gratuit', es: 'Gratis', en: 'Free' } as T3,
  appeler: { fr: 'Appeler', es: 'Llamar', en: 'Call' } as T3,
  site: { fr: 'Site officiel', es: 'Sitio oficial', en: 'Official website' } as T3,
  choisirPays: { fr: 'Votre pays', es: 'Tu país', en: 'Your country' } as T3,
  pasDeListe: {
    fr: 'Votre pays n’est pas dans la liste ? Appelez le numéro d’urgence local et utilisez les outils internationaux ci-dessous.',
    es: '¿Tu país no está en la lista? Llama al número de emergencia local y usa las herramientas internacionales de abajo.',
    en: "Your country isn't listed? Call your local emergency number and use the international tools below.",
  } as T3,
  types: {
    urgence: { fr: 'Urgences', es: 'Emergencias', en: 'Emergency' },
    'police-en-ligne': { fr: 'Police en ligne', es: 'Policía en línea', en: 'Police online' },
    'signalement-contenu': { fr: 'Signaler un contenu illégal', es: 'Denunciar contenido ilegal', en: 'Report illegal content' },
    cyberharcelement: { fr: 'Cyberharcèlement', es: 'Ciberacoso', en: 'Online harassment' },
    mineurs: { fr: 'Mineurs', es: 'Menores', en: 'Minors' },
    'violences-femmes': { fr: 'Violences faites aux femmes', es: 'Violencia contra las mujeres', en: 'Violence against women' },
    'aide-victimes': { fr: 'Aide aux victimes', es: 'Ayuda a víctimas', en: 'Victim support' },
    'protection-donnees': { fr: 'Protection des données', es: 'Protección de datos', en: 'Data protection' },
    ncii: { fr: 'Images intimes', es: 'Imágenes íntimas', en: 'Intimate images' },
  } as Record<string, T3>,
};

export const GUIDES = {
  seo: { fr: 'Les recours, pays par pays', es: 'Los recursos, país por país', en: 'Remedies, country by country' } as T3,
  meta: {
    fr: 'RGPD, DSA, TAKE IT DOWN, droit d’auteur, CNIL, AEPD, PHAROS… chaque recours expliqué simplement, avec la loi, le lien officiel et la date de vérification.',
    es: 'RGPD, DSA, TAKE IT DOWN, derechos de autor, AEPD… cada recurso explicado de forma sencilla, con la ley, el enlace oficial y la fecha de verificación.',
    en: 'GDPR, DSA, TAKE IT DOWN, copyright, StopNCII… each remedy explained simply, with the law, the official link and the date it was checked.',
  } as T3,
  h1: { fr: 'Les recours, pays par pays', es: 'Los recursos, país por país', en: 'Remedies, country by country' } as T3,
  intro: {
    fr: 'Chaque fiche explique une voie de recours officielle : à qui s’adresser, quoi préparer, les délais, le coût et les limites. Toutes sont vérifiées sur les textes officiels.',
    es: 'Cada ficha explica una vía de recurso oficial: a quién dirigirse, qué preparar, los plazos, el coste y los límites. Todas están verificadas en los textos oficiales.',
    en: 'Each page explains one official remedy: who to contact, what to prepare, time frames, cost and limits. All are checked against official texts.',
  } as T3,
  pourQui: { fr: 'Pour qui', es: 'Para quién', en: 'Who it is for' } as T3,
  etapes: { fr: 'Les étapes', es: 'Los pasos', en: 'The steps' } as T3,
  preparer: { fr: 'À préparer', es: 'Qué preparar', en: 'What to prepare' } as T3,
  delai: { fr: 'Délai', es: 'Plazo', en: 'Time frame' } as T3,
  cout: { fr: 'Coût', es: 'Coste', en: 'Cost' } as T3,
  limites: { fr: 'Les limites, à connaître', es: 'Los límites, que debes conocer', en: 'The limits you should know' } as T3,
  baseLegale: { fr: 'Base légale', es: 'Base legal', en: 'Legal basis' } as T3,
  liensUtiles: { fr: 'Liens officiels', es: 'Enlaces oficiales', en: 'Official links' } as T3,
  attention: { fr: 'Attention', es: 'Atención', en: 'Important' } as T3,
  international: { fr: 'International', es: 'Internacional', en: 'International' } as T3,
  ue: { fr: 'Union européenne', es: 'Unión Europea', en: 'European Union' } as T3,
  mineurs: { fr: 'Personnes mineures', es: 'Personas menores', en: 'Minors' } as T3,
};

export const PLATEFORME_PAGE = {
  h1Prefix: { fr: '', es: '', en: '' } as T3,
  etapes: { fr: 'Les étapes', es: 'Los pasos', en: 'The steps' } as T3,
  intro: {
    fr: 'Voici la démarche officielle de {p}, vérifiée le {d}. Suivez les étapes dans l’ordre.',
    es: 'Este es el procedimiento oficial de {p}, verificado el {d}. Sigue los pasos en orden.',
    en: "Here is {p}'s official process, checked on {d}. Follow the steps in order.",
  } as T3,
  autres: { fr: 'Même situation, autres plateformes', es: 'Misma situación, otras plataformas', en: 'Same situation, other platforms' } as T3,
  conseils: { fr: 'Avant de commencer', es: 'Antes de empezar', en: 'Before you start' } as T3,
};

export const NOT_FOUND = {
  titre: { fr: 'Page introuvable', es: 'Página no encontrada', en: 'Page not found' } as T3,
  texte: {
    fr: 'Cette page n’existe pas ou a été déplacée.',
    es: 'Esta página no existe o se ha movido.',
    en: "This page doesn't exist or has moved.",
  } as T3,
};

export const ARTICLES = {
  seo: {
    fr: 'Quand le formulaire officiel n’a pas marché : nos articles',
    es: 'Cuando el formulario oficial no funcionó: nuestros artículos',
    en: 'When the official form didn’t work: our articles',
  } as T3,
  h1: {
    fr: 'Le formulaire officiel n’a pas marché ? Les étapes suivantes',
    es: '¿El formulario oficial no funcionó? Los siguientes pasos',
    en: 'The official form didn’t work? The next steps',
  } as T3,
  meta: {
    fr: 'Plateforme qui refuse, demande ignorée, contenu qui revient : des articles vérifiés pour savoir quoi faire ensuite, avec les recours officiels.',
    es: 'Plataforma que se niega, solicitud ignorada, contenido que vuelve: artículos verificados para saber qué hacer después, con los recursos oficiales.',
    en: 'Platform says no, request ignored, content keeps coming back: checked articles on what to do next, with the official remedies.',
  } as T3,
  intro: {
    fr: 'Chaque article reprend un blocage fréquent et les recours qui existent après un refus. Tout est vérifié sur les sources officielles, à la date indiquée.',
    es: 'Cada artículo trata un bloqueo frecuente y los recursos que existen tras una negativa. Todo está verificado en las fuentes oficiales, en la fecha indicada.',
    en: 'Each article covers a common dead end and the remedies that exist after a refusal. Everything is checked against official sources, on the date shown.',
  } as T3,
  publieLe: { fr: 'Publié le', es: 'Publicado el', en: 'Published on' } as T3,
  sources: { fr: 'Sources officielles', es: 'Fuentes oficiales', en: 'Official sources' } as T3,
  siRien: { fr: 'Si rien ne marche', es: 'Si nada funciona', en: 'If nothing works' } as T3,
  aLire: { fr: 'À lire aussi', es: 'Para leer también', en: 'Read next' } as T3,
  siPasMarche: {
    fr: 'Si ça n’a pas marché',
    es: 'Si no funcionó',
    en: 'If it didn’t work',
  } as T3,
  nav: { fr: 'Articles', es: 'Artículos', en: 'Articles' } as T3,
};

