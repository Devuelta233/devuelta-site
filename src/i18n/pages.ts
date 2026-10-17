// Textes des pages : accueil, méthode, confier, contact, urgence,
// confidentialité, mentions légales, faux sauveteurs, aide gratuite.
// Une clé = trois langues.

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
  prix: {
    fr: 'Prix affichés, sans surprise : dès 40 €, la moitié pour démarrer et le reste seulement si c’est retiré. Moitié prix en Afrique et en Amérique latine.',
    es: 'Precios publicados, sin sorpresas: desde 40 €, la mitad para empezar y el resto solo si se retira. Mitad de precio en África y en América Latina.',
    en: 'Published prices, no surprises: from €40, half to start and the rest only if it is removed. Half price in Africa and Latin America.',
  } as T3,
  voirTarifs: { fr: 'Voir les tarifs', es: 'Ver los precios', en: 'See prices' } as T3,
  comment: {
    fr: [
      ['Vous essayez d’abord', 'Le diagnostic vous indique les formulaires officiels et les recours de votre pays. C’est gratuit, sans inscription, et rien ne quitte votre téléphone.'],
      ['Si ça bloque, on prend le relais', 'Vous choisissez les démarches. Nous les préparons à partir de modèles types, vous validez chaque texte, puis nous l’envoyons et suivons les réponses : site, hébergeur, nom de domaine, moteurs de recherche.'],
      ['Un humain à chaque étape', 'Chaque courrier est relu par une personne de l’équipe, et rien ne part sans votre accord. Vous savez toujours ce qui a été envoyé, à qui et quand.'],
    ],
    es: [
      ['Primero lo intentas tú', 'El diagnóstico te indica los formularios oficiales y los recursos de tu país. Es gratis, sin registro, y nada sale de tu teléfono.'],
      ['Si se bloquea, nos encargamos', 'Tú eliges las gestiones. Las preparamos a partir de modelos tipo, validas cada texto y luego lo enviamos y seguimos las respuestas: sitio, proveedor de alojamiento, dominio, buscadores.'],
      ['Una persona en cada paso', 'Cada escrito lo revisa una persona del equipo, y nada se envía sin tu acuerdo. Siempre sabes qué se envió, a quién y cuándo.'],
    ],
    en: [
      ['You try first', 'The diagnostic shows you the official forms and the remedies in your country. Free, no sign-up, and nothing leaves your phone.'],
      ['If it gets stuck, we take over', 'You choose the requests. We prepare them from standard templates, you approve each text, then we send it and follow up: the site, its host, the domain name, search engines.'],
      ['A human at every step', 'Every letter is reviewed by a person on the team, and nothing goes out without your agreement. You always know what was sent, to whom and when.'],
    ],
  } as Record<'fr' | 'es' | 'en', [string, string][]>,
  echelleTitre: { fr: 'L’échelle des recours', es: 'La escalera de recursos', en: 'The ladder of remedies' } as T3,
  echelleIntro: {
    fr: 'On commence toujours par la porte la plus simple. Sans réponse dans le délai, on monte d’une marche.',
    es: 'Siempre empezamos por la puerta más sencilla. Si no hay respuesta en el plazo, subimos un escalón.',
    en: 'We always start with the simplest door. If there is no answer in time, we go one step up.',
  } as T3,
  echelle: {
    fr: ['Le signalement à la plateforme', 'La demande écrite à l’éditeur du site', 'Le registrar du nom de domaine', 'L’hébergeur du site', 'Les moteurs de recherche', 'L’autorité ou la justice'],
    es: ['La denuncia a la plataforma', 'La solicitud escrita al editor del sitio', 'El registrador del dominio', 'El proveedor de alojamiento', 'Los buscadores', 'La autoridad o la justicia'],
    en: ['Reporting to the platform', 'A written request to the site owner', 'The domain name registrar', 'The hosting company', 'Search engines', 'The authority or the courts'],
  } as L3,
  articlesTitre: {
    fr: 'Le formulaire n’a pas marché ? Nos derniers articles',
    es: '¿El formulario no funcionó? Nuestros últimos artículos',
    en: 'The form didn’t work? Our latest articles',
  } as T3,
  articlesIntro: {
    fr: 'Chaque semaine, un blocage fréquent et ce qui reste possible ensuite, vérifié sur les sources officielles.',
    es: 'Cada semana, un bloqueo frecuente y lo que aún se puede hacer, verificado en las fuentes oficiales.',
    en: 'Every week, a common dead end and what you can still do next, checked against official sources.',
  } as T3,
  tousLesArticles: { fr: 'Tous les articles', es: 'Todos los artículos', en: 'All articles' } as T3,
  recoursTitre: { fr: 'Des recours vérifiés, datés, sourcés', es: 'Recursos verificados, fechados y con fuente', en: 'Remedies that are checked, dated and sourced' } as T3,
  recoursIntro: {
    fr: 'Chaque recours indique la loi, le lien officiel et la date de sa dernière vérification. Rien n’est inventé, rien n’est promis.',
    es: 'Cada recurso indica la ley, el enlace oficial y la fecha de su última verificación. Nada es inventado, nada es prometido.',
    en: 'Each remedy shows the law, the official link and the date it was last checked. Nothing invented, nothing promised.',
  } as T3,
  tousLesRecours: { fr: 'Tous les recours', es: 'Todos los recursos', en: 'All remedies' } as T3,
  contactTitre: { fr: 'Parler à quelqu’un', es: 'Hablar con alguien', en: 'Talk to someone' } as T3,
  contactIntro: {
    fr: 'Une question, un doute ? Écrivez à Team Devuelta dans votre langue : français, espagnol ou anglais. Nos messages ne mentionnent jamais votre situation dans l’objet.',
    es: '¿Una pregunta, una duda? Escribe a Team Devuelta en tu idioma: español, francés o inglés. Nuestros mensajes nunca mencionan tu situación en el asunto.',
    en: 'A question, a doubt? Write to Team Devuelta in your language: English, French or Spanish. Our messages never mention your situation in the subject line.',
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
      'Un humain relit chaque courrier, et rien ne part sans votre validation. Rien n’est envoyé automatiquement.',
      'Vous choisissez les démarches : nous vous présentons les procédures officielles, sans avis sur vos chances.',
      'Nous travaillons à partir des liens, pas de vos images. Nous ne vous demanderons jamais d’envoyer un contenu intime.',
      'Uniquement des moyens légaux : pas de piratage, pas de menace, pas de faux.',
      'Nous n’agissons en votre nom qu’avec votre mandat écrit, que vous pouvez retirer à tout moment.',
      'Nous ne promettons jamais un retrait garanti : nous vous disons honnêtement ce qui est possible.',
      'Personnes mineures : nous orientons vers les services officiels gratuits, sans jamais facturer.',
      'Vos données sont supprimées automatiquement après la clôture de votre dossier.',
    ],
    es: [
      'Una persona revisa cada escrito, y nada se envía sin tu validación. Nada sale de forma automática.',
      'Tú eliges las gestiones: te presentamos los procedimientos oficiales, sin opinar sobre tus posibilidades.',
      'Trabajamos a partir de los enlaces, no de tus imágenes. Nunca te pediremos que envíes un contenido íntimo.',
      'Solo vías legales: nada de hackeo, nada de amenazas, nada falso.',
      'Solo actuamos en tu nombre con tu mandato por escrito, que puedes retirar cuando quieras.',
      'Nunca prometemos una retirada garantizada: te decimos con honestidad lo que es posible.',
      'Personas menores de edad: las orientamos hacia los servicios oficiales gratuitos, sin cobrar nunca.',
      'Tus datos se borran automáticamente después de cerrar tu caso.',
    ],
    en: [
      'A human reviews every letter, and nothing goes out without your approval. Nothing is sent automatically.',
      'You choose the requests: we show you the official procedures, with no opinion on your chances.',
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
    fr: 'Le diagnostic et les guides sont gratuits. Si vous nous confiez votre dossier : à partir de 40 €, dont la moitié pour démarrer et le reste seulement si c’est retiré. Prix divisés par deux en Afrique et en Amérique latine. Vous ne payez rien avant d’avoir accepté le devis.',
    es: 'El diagnóstico y las guías son gratis. Si nos confías tu caso: desde 40 €, la mitad para empezar y el resto solo si se retira. Precios a mitad en África y América Latina. No pagas nada antes de aceptar el presupuesto.',
    en: 'The diagnostic and the guides are free. If you hand us your case: from €40, half to start and the rest only if it’s removed. Half price in Africa and Latin America. You pay nothing before accepting the quote.',
  } as T3,
  voirTarifs: { fr: 'Voir les tarifs', es: 'Ver los precios', en: 'See pricing' } as T3,
  pasTitre: { fr: 'Ce que nous ne sommes pas', es: 'Lo que no somos', en: 'What we are not' } as T3,
  pas: {
    fr: 'Nous ne sommes pas un cabinet d’avocats et ne donnons pas de conseil juridique. Notre travail est une assistance technique et administrative : repérer les liens et les hébergeurs, remplir les formulaires officiels, envoyer les demandes que vous avez choisies et approuvées, suivre les délais. Si une action en justice devient utile, nous vous orientons vers un avocat, avec qui vous traitez directement.',
    es: 'No somos un despacho de abogados y no damos asesoría jurídica. Nuestro trabajo es una asistencia técnica y administrativa: localizar los enlaces y los alojamientos, rellenar los formularios oficiales, enviar las solicitudes que elegiste y aprobaste, vigilar los plazos. Si una acción judicial resulta útil, te orientamos hacia un abogado o abogada, con quien tratas directamente.',
    en: 'We are not a law firm and we don’t give legal advice. Our work is technical and administrative assistance: finding the links and hosts, filling in the official forms, sending the requests you chose and approved, and tracking deadlines. If legal action becomes useful, we refer you to a lawyer, whom you deal with directly.',
  } as T3,
  refusTitre: { fr: 'Les demandes que nous refusons', es: 'Las solicitudes que rechazamos', en: 'Requests we turn down' } as T3,
  refus: {
    fr: [
      'Faire retirer une critique honnête, un avis réel ou une information d’intérêt public.',
      'Agir pour une autre personne que celle qui est concernée, sauf son représentant légal.',
      'Faire disparaître une décision de justice ou une information qu’une loi oblige à publier.',
      'Retrouver ou démasquer l’auteur d’un contenu : seule la justice peut le faire.',
      'Entrer dans un compte, pirater, menacer, négocier avec un maître-chanteur ou le payer.',
      'Publier de faux avis ou envoyer de faux signalements.',
    ],
    es: [
      'Retirar una crítica honesta, una reseña real o una información de interés público.',
      'Actuar por otra persona que no sea la afectada, salvo su representante legal.',
      'Hacer desaparecer una resolución judicial o una información que la ley obliga a publicar.',
      'Encontrar o desenmascarar al autor de un contenido: solo la justicia puede hacerlo.',
      'Entrar en una cuenta, hackear, amenazar, negociar con un chantajista o pagarle.',
      'Publicar reseñas falsas o enviar denuncias falsas.',
    ],
    en: [
      'Removing honest criticism, a genuine review or information of public interest.',
      'Acting for anyone other than the person concerned, except their legal representative.',
      'Making a court decision disappear, or information that a law requires to be published.',
      'Finding or unmasking the author of content: only the courts can do that.',
      'Getting into an account, hacking, threatening, negotiating with or paying a blackmailer.',
      'Posting fake reviews or sending false reports.',
    ],
  } as L3,
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
  prix: {
    fr: 'Prix : à partir de 40 €, dont 20 € pour démarrer et le reste seulement si c’est retiré. Divisés par deux en Afrique et en Amérique latine.',
    es: 'Precio: desde 40 €, 20 € para empezar y el resto solo si se retira. A mitad de precio en África y América Latina.',
    en: 'Price: from €40, €20 to start and the rest only if it’s removed. Half price in Africa and Latin America.',
  } as T3,
};

export const RETRACTATION = {
  seo: {
    fr: 'Renoncer au contrat : rétractation en ligne',
    es: 'Desistir del contrato: desistimiento en línea',
    en: 'Withdraw from the contract online',
  } as T3,
  meta: {
    fr: 'Vous avez accepté notre devis il y a moins de 14 jours ? Renoncez ici, en ligne, sans donner de raison. Accusé de réception par e-mail.',
    es: '¿Aceptaste nuestro presupuesto hace menos de 14 días? Desiste aquí, en línea, sin dar motivos. Acuse de recibo por correo electrónico.',
    en: 'Accepted our quote less than 14 days ago? Withdraw here, online, without giving a reason. Acknowledgement by email.',
  } as T3,
  h1: { fr: 'Renoncer au contrat', es: 'Desistir del contrato', en: 'Withdraw from the contract' } as T3,
  intro: {
    fr: 'Vous avez accepté notre devis il y a moins de 14 jours ? Vous pouvez renoncer ici, sans donner de raison. Vous recevez un accusé de réception avec la date et l’heure.',
    es: '¿Aceptaste nuestro presupuesto hace menos de 14 días? Puedes desistir aquí, sin dar motivos. Recibirás un acuse de recibo con la fecha y la hora.',
    en: 'Accepted our quote less than 14 days ago? You can withdraw here without giving a reason. You will get an acknowledgement showing the date and time.',
  } as T3,
  points: {
    fr: [
      'Si vous nous aviez demandé de commencer tout de suite, vous payez seulement le travail déjà fait. Nous remboursons le reste sous 14 jours.',
      'Ce délai de 14 jours vaut pour les personnes qui vivent dans l’Union européenne. Ailleurs, ce formulaire sert aussi à arrêter votre dossier, à tout moment.',
      'Vous pouvez aussi nous écrire à team.devuelta@protonmail.com.',
    ],
    es: [
      'Si nos pediste empezar de inmediato, solo pagas el trabajo ya hecho. Te devolvemos el resto en un plazo de 14 días.',
      'Este plazo de 14 días se aplica a quienes viven en la Unión Europea. En otros países, este formulario también sirve para detener tu caso en cualquier momento.',
      'También puedes escribirnos a team.devuelta@protonmail.com.',
    ],
    en: [
      'If you asked us to start right away, you only pay for the work already done. We refund the rest within 14 days.',
      'This 14-day period applies to people living in the European Union. Elsewhere, you can also use this form to stop your case at any time.',
      'You can also write to team.devuelta@protonmail.com.',
    ],
  } as L3,
  sansJs: {
    fr: 'Le formulaire a besoin de JavaScript. Écrivez-nous à team.devuelta@protonmail.com avec votre nom et votre numéro de dossier : votre message vaut rétractation.',
    es: 'El formulario necesita JavaScript. Escríbenos a team.devuelta@protonmail.com con tu nombre y tu número de caso: tu mensaje vale como desistimiento.',
    en: 'The form needs JavaScript. Write to team.devuelta@protonmail.com with your name and case number: your message counts as a withdrawal.',
  } as T3,
};

export const TARIFS = {
  seo: {
    fr: 'Tarifs : faire retirer un contenu dès 40 €',
    es: 'Precios: retirar un contenido desde 40 €',
    en: 'Pricing: get content removed from €40',
  } as T3,
  meta: {
    fr: 'Diagnostic gratuit. Dès 40 € pour nous confier votre dossier : la moitié au départ, le reste seulement si c’est retiré. Moitié prix en Afrique et Amérique latine.',
    es: 'Diagnóstico gratis. Si nos confías tu caso: la mitad para empezar, el resto solo si se retira. Precios a mitad en África y América Latina.',
    en: 'Free diagnostic. If you hand us your case: half to start, the rest only if it’s removed. Half price in Africa and Latin America.',
  } as T3,
  h1: { fr: 'Tarifs', es: 'Precios', en: 'Pricing' } as T3,
  intro: {
    fr: 'Le diagnostic, les guides et les articles sont gratuits. Si vous nous confiez votre dossier, vous payez la moitié pour démarrer, et l’autre moitié seulement si le contenu est retiré.',
    es: 'El diagnóstico, las guías y los artículos son gratis. Si nos confías tu caso, pagas la mitad para empezar y la otra mitad solo si el contenido se retira.',
    en: 'The diagnostic, guides and articles are free. If you hand us your case, you pay half to start, and the other half only if the content is removed.',
  } as T3,
  colDemarrer: { fr: 'Pour démarrer', es: 'Para empezar', en: 'To start' } as T3,
  colSolde: { fr: 'Seulement si retiré', es: 'Solo si se retira', en: 'Only if removed' } as T3,
  formules: {
    'un-lien': { fr: '1 lien', es: '1 enlace', en: '1 link' } as T3,
    petit: { fr: '2 à 5 liens', es: '2 a 5 enlaces', en: '2 to 5 links' } as T3,
    dossier: { fr: '6 à 15 liens', es: '6 a 15 enlaces', en: '6 to 15 links' } as T3,
  },
  exemples: {
    'un-lien': {
      fr: 'Un faux profil, un faux avis, une photo publiée sans accord.',
      es: 'Un perfil falso, una reseña falsa, una foto publicada sin permiso.',
      en: 'A fake profile, a fake review, a photo posted without consent.',
    } as T3,
    petit: {
      fr: 'Plusieurs publications ou comptes, sur une ou plusieurs plateformes.',
      es: 'Varias publicaciones o cuentas, en una o varias plataformas.',
      en: 'Several posts or accounts, on one or more platforms.',
    } as T3,
    dossier: {
      fr: 'Un contenu repris sur plusieurs sites.',
      es: 'Un contenido copiado en varios sitios.',
      en: 'Content copied across several sites.',
    } as T3,
  },
  devisLigne: {
    fr: 'Plus de 15 liens, ou cas difficile (site qui ne répond pas, contenu republié en boucle)',
    es: 'Más de 15 enlaces, o caso difícil (sitio que no responde, contenido republicado una y otra vez)',
    en: 'More than 15 links, or a difficult case (a site that doesn’t answer, content reposted again and again)',
  } as T3,
  devisPrix: { fr: 'Sur devis, dès {p}', es: 'Con presupuesto, desde {p}', en: 'Quoted, from {p}' } as T3,
  memeRegle: {
    fr: 'Même règle : la moitié pour démarrer, le reste seulement si c’est retiré.',
    es: 'Misma regla: la mitad para empezar, el resto solo si se retira.',
    en: 'Same rule: half to start, the rest only if it’s removed.',
  } as T3,
  devisAvant: {
    fr: 'Nous vous disons avant de commencer si votre cas entre dans une formule ou demande un devis.',
    es: 'Te decimos antes de empezar si tu caso entra en una fórmula o necesita un presupuesto.',
    en: 'We tell you before starting whether your case fits a package or needs a quote.',
  } as T3,
  zoneTitre: {
    fr: 'Vous vivez en Afrique ou en Amérique latine ?',
    es: '¿Vives en África o en América Latina?',
    en: 'Do you live in Africa or Latin America?',
  } as T3,
  zoneTexte: {
    fr: 'Tous les prix sont divisés par deux, avec la même règle : la moitié pour démarrer, le reste seulement si c’est retiré.',
    es: 'Todos los precios se dividen entre dos, con la misma regla: la mitad para empezar, el resto solo si se retira.',
    en: 'All prices are cut in half, with the same rule: half to start, the rest only if it’s removed.',
  } as T3,
  proTitre: { fr: 'Commerces et entreprises', es: 'Comercios y empresas', en: 'Shops and companies' } as T3,
  proTexte: {
    fr: 'Pour un usage professionnel, par exemple de faux avis sur la fiche de votre établissement, les mêmes formules s’appliquent avec des prix multipliés par deux. La règle ne change pas : la moitié pour démarrer, le reste seulement si c’est retiré.',
    es: 'Para un uso profesional, por ejemplo reseñas falsas en la ficha de tu negocio, se aplican las mismas fórmulas con precios multiplicados por dos. La regla no cambia: la mitad para empezar, el resto solo si se retira.',
    en: 'For business use, for example fake reviews on your business listing, the same packages apply with prices multiplied by two. The rule doesn’t change: half to start, the rest only if it’s removed.',
  } as T3,
  pourquoiTitre: {
    fr: 'Pourquoi le reste seulement si c’est retiré ?',
    es: '¿Por qué el resto solo si se retira?',
    en: 'Why the rest only if it’s removed?',
  } as T3,
  pourquoi: {
    fr: 'Personne ne peut promettre un retrait : la décision appartient à la plateforme, à l’hébergeur ou à un juge. Nous faisons tout ce qui est possible par des moyens légaux. Si ça ne marche pas, vous ne payez pas la seconde moitié.',
    es: 'Nadie puede prometer una retirada: la decisión es de la plataforma, del proveedor de alojamiento o de un juez. Hacemos todo lo posible por vías legales. Si no funciona, no pagas la segunda mitad.',
    en: 'Nobody can promise a removal: the decision belongs to the platform, the host or a judge. We do everything possible through legal means. If it doesn’t work, you don’t pay the second half.',
  } as T3,
  retireTitre: {
    fr: 'Quand un lien compte comme retiré',
    es: 'Cuándo un enlace cuenta como retirado',
    en: 'When a link counts as removed',
  } as T3,
  retire: {
    fr: 'Quand le contenu n’est plus en ligne à cette adresse, ou n’apparaît plus dans Google quand c’est la démarche choisie. Si seuls certains liens sont retirés, vous ne payez le reste que pour ceux-là.',
    es: 'Cuando el contenido ya no está en línea en esa dirección, o ya no aparece en Google cuando esa es la gestión elegida. Si solo se retiran algunos enlaces, pagas el resto solo por esos.',
    en: 'When the content is no longer online at that address, or no longer shows in Google when that is the chosen request. If only some links are removed, you only pay the rest for those.',
  } as T3,
  inclusTitre: { fr: 'Ce qui est compris', es: 'Qué incluye', en: 'What’s included' } as T3,
  inclus: {
    fr: [
      'Nous trouvons qui héberge chaque lien et nous vous présentons les démarches officielles possibles.',
      'Vous choisissez les démarches ; nous préparons les demandes à partir de modèles types, et vous validez chaque texte avant l’envoi.',
      'Nous envoyons, nous relançons, et en cas de refus nous préparons la contestation prévue (recours du DSA en Europe, hébergeur, nom de domaine).',
      'Vous savez où en est votre dossier ; vos données sont effacées après sa clôture.',
    ],
    es: [
      'Encontramos quién aloja cada enlace y te presentamos las gestiones oficiales posibles.',
      'Tú eliges las gestiones; preparamos las solicitudes a partir de modelos tipo y validas cada texto antes del envío.',
      'Enviamos, insistimos y, si hay un rechazo, preparamos la impugnación prevista (recursos del DSA en Europa, proveedor de alojamiento, nombre de dominio).',
      'Sabes en qué punto está tu caso; tus datos se borran después de cerrarlo.',
    ],
    en: [
      'We find who hosts each link and show you the official options.',
      'You choose the requests; we prepare them from standard templates and you approve each text before it is sent.',
      'We send, we follow up, and if a request is refused we prepare the available challenge (DSA remedies in Europe, the host, the domain name).',
      'You know where your case stands; your data is deleted after it closes.',
    ],
  } as L3,
  gratuitTitre: { fr: 'Ce qui reste gratuit', es: 'Lo que sigue siendo gratis', en: 'What stays free' } as T3,
  gratuit: {
    fr: [
      'Le diagnostic, les guides et les articles, pour faire les démarches vous-même.',
      'L’aide aux personnes mineures : nous les orientons vers les services officiels gratuits, sans jamais rien faire payer.',
    ],
    es: [
      'El diagnóstico, las guías y los artículos, para hacer las gestiones tú mismo o tú misma.',
      'La ayuda a personas menores de edad: las orientamos hacia los servicios oficiales gratuitos, sin cobrar nunca nada.',
    ],
    en: [
      'The diagnostic, guides and articles, so you can make the requests yourself.',
      'Help for minors: we point them to official free services and never charge anything.',
    ],
  } as L3,
  paiementTitre: { fr: 'Comment payer', es: 'Cómo pagar', en: 'How to pay' } as T3,
  paiement: {
    fr: 'Vous ne payez rien avant d’avoir accepté notre devis écrit. Le lien de paiement arrive avec lui : vous payez par carte bancaire, ou par Mobile Money au Ghana, sur la page sécurisée de Paystack, notre prestataire de paiement (racheté par Stripe en 2020). Le montant peut être débité en cedis ghanéens (GH¢) au taux du jour ; votre banque peut alors appliquer des frais de change. Le reste n’est demandé qu’une fois les liens retirés.',
    es: 'No pagas nada antes de aceptar nuestro presupuesto por escrito. El enlace de pago llega con él: pagas con tarjeta bancaria, o con Mobile Money en Ghana, en la página segura de Paystack, nuestro proveedor de pagos (comprado por Stripe en 2020). El importe puede cobrarse en cedis ghaneses (GH¢) al cambio del día; tu banco puede aplicar gastos de cambio. El resto solo se pide una vez retirados los enlaces.',
    en: 'You pay nothing before accepting our written quote. The payment link comes with it: you pay by bank card, or by Mobile Money in Ghana, on the secure page of Paystack, our payment provider (bought by Stripe in 2020). The amount may be charged in Ghanaian cedis (GH¢) at the day’s rate; your bank may then apply currency conversion fees. The rest is only requested once the links are removed.',
  } as T3,
};

export const CONTACT = {
  seo: { fr: 'Nous contacter', es: 'Contacto', en: 'Contact us' } as T3,
  meta: {
    fr: 'Écrivez à Devuelta en français, en espagnol ou en anglais, par e-mail. Réponse en général sous 24 à 48 heures.',
    es: 'Escribe a Devuelta en español, francés o inglés, por correo electrónico. Respuesta normalmente en 24 a 48 horas.',
    en: 'Write to Devuelta in English, French or Spanish, by email. We usually reply within 24 to 48 hours.',
  } as T3,
  h1: { fr: 'Nous contacter', es: 'Contacto', en: 'Contact us' } as T3,
  intro: {
    fr: 'Écrivez-nous dans votre langue. Nous répondons en général sous 24 à 48 heures.',
    es: 'Escríbenos en tu idioma. Normalmente respondemos en 24 a 48 horas.',
    en: 'Write to us in your language. We usually reply within 24 to 48 hours.',
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
    fr: 'Votre pays n’est pas dans la liste ? Appelez le numéro d’urgence local et utilisez les outils internationaux, en bas de cette page.',
    es: '¿Tu país no está en la lista? Llama al número de emergencia local y usa las herramientas internacionales, al final de esta página.',
    en: "Your country isn't listed? Call your local emergency number and use the international tools at the bottom of this page.",
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
    fr: 'Voici la démarche officielle sur {p}, vérifiée le {d}. Suivez les étapes dans l’ordre.',
    es: 'Este es el procedimiento oficial en {p}, verificado el {d}. Sigue los pasos en orden.',
    en: 'Here is the official process on {p}, checked on {d}. Follow the steps in order.',
  } as T3,
  autres: { fr: 'Même situation, autres plateformes', es: 'Misma situación, otras plataformas', en: 'Same situation, other platforms' } as T3,
  conseils: { fr: 'Avant de commencer', es: 'Antes de empezar', en: 'Before you start' } as T3,
  aSavoir: { fr: 'À savoir :', es: 'Ten en cuenta:', en: 'Good to know:' } as T3,
  mineursTitre: { fr: 'Si vous avez moins de 18 ans', es: 'Si tienes menos de 18 años', en: 'If you are under 18' } as T3,
  mineursTexte: {
    fr: 'Parlez-en à un adulte de confiance et, en cas de menace, à la police. Les services officiels gratuits de votre pays sont sur la page Aide urgente. Devuelta ne prend jamais en charge, ni ne facture, un dossier concernant une personne mineure.',
    es: 'Habla con un adulto de confianza y, si hay amenazas, con la policía. Los servicios oficiales gratuitos de tu país están en la página Ayuda urgente. Devuelta nunca se encarga ni cobra un caso que afecte a una persona menor.',
    en: 'Talk to a trusted adult and, if there are threats, to the police. Your country’s free official services are on the Urgent help page. Devuelta never takes on, or charges for, a case involving a minor.',
  } as T3,
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
  essentiel: {
    fr: 'L’essentiel en 30 secondes',
    es: 'Lo esencial en 30 segundos',
    en: 'The essentials in 30 seconds',
  } as T3,
  lecture: { fr: 'Lecture : {n} min', es: 'Lectura: {n} min', en: '{n}-minute read' } as T3,
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


// Contrôle en 5 minutes : rendre normal le fait de vérifier ce qui traîne sur soi.
export const CONTROLE = {
  seo: {
    fr: 'Contrôle en 5 minutes : qu’est-ce qui traîne sur vous en ligne ?',
    es: 'Chequeo en 5 minutos: ¿qué hay sobre ti en internet?',
    en: '5-minute check-up: what is online about you?',
  } as T3,
  meta: {
    fr: 'Six gestes gratuits pour voir ce qu’Internet montre de vous, protéger vos comptes et recevoir une alerte. Sans compte, sans rien nous envoyer.',
    es: 'Seis pasos gratuitos para ver qué muestra internet sobre ti, proteger tus cuentas y recibir una alerta. Sin cuenta, sin enviarnos nada.',
    en: 'Six free steps to see what the internet shows about you, protect your accounts and get alerts. No account, nothing sent to us.',
  } as T3,
  h1: {
    fr: 'Qu’est-ce qui traîne sur vous en ligne ?',
    es: '¿Qué hay sobre ti en internet?',
    en: 'What is online about you?',
  } as T3,
  intro: {
    fr: 'Comme un contrôle chez le médecin, mais pour votre vie en ligne. Six gestes, cinq minutes, gratuits. Vous ne nous envoyez rien.',
    es: 'Como un chequeo médico, pero para tu vida en internet. Seis pasos, cinco minutos, gratis. No nos envías nada.',
    en: 'Like a check-up at the doctor’s, but for your online life. Six steps, five minutes, free. You send us nothing.',
  } as T3,
  etapes: {
    fr: [
      ['Cherchez votre nom entre guillemets', 'Sur Google et sur Bing, regardez l’onglet « Tous » puis « Images ». Essayez aussi votre pseudo, votre numéro de téléphone et votre adresse e-mail.'],
      ['Cherchez vos photos de profil', 'Avec Google Lens ou TinEye, envoyez votre photo de profil : vous verrez si un faux compte l’utilise.'],
      ['Vérifiez vos e-mails dans les fuites de données', 'Sur Have I Been Pwned, tapez votre adresse. Si elle apparaît, changez le mot de passe du site concerné.'],
      ['Protégez vos comptes', 'Activez la double vérification. Vérifiez l’e-mail et le numéro de secours. Déconnectez les appareils que vous ne connaissez pas.'],
      ['Recevez une alerte automatique', 'Créez une Alerte Google sur votre nom entre guillemets : Google vous écrit quand une nouvelle page parle de vous.'],
      ['Une image intime vous inquiète ?', 'Adulte : StopNCII.org aide à bloquer sa publication sur de nombreuses plateformes, sans que l’image quitte votre téléphone. Image prise avant 18 ans : Take It Down.'],
    ],
    es: [
      ['Busca tu nombre entre comillas', 'En Google y en Bing, mira la pestaña «Todo» y luego «Imágenes». Prueba también tu apodo, tu número de teléfono y tu correo.'],
      ['Busca tus fotos de perfil', 'Con Google Lens o TinEye, sube tu foto de perfil: verás si una cuenta falsa la usa.'],
      ['Revisa tu correo en las filtraciones de datos', 'En Have I Been Pwned, escribe tu dirección. Si aparece, cambia la contraseña del sitio afectado.'],
      ['Protege tus cuentas', 'Activa la verificación en dos pasos. Revisa el correo y el número de recuperación. Cierra la sesión en los dispositivos que no conoces.'],
      ['Recibe una alerta automática', 'Crea una Alerta de Google con tu nombre entre comillas: Google te escribe cuando una página nueva habla de ti.'],
      ['¿Te preocupa una imagen íntima?', 'Si eres adulto: StopNCII.org ayuda a bloquear su publicación en muchas plataformas, sin que la imagen salga de tu teléfono. Imagen tomada antes de los 18 años: Take It Down.'],
    ],
    en: [
      ['Search your name in quotes', 'On Google and Bing, look at the “All” tab, then “Images”. Also try your username, your phone number and your email address.'],
      ['Search your profile photos', 'With Google Lens or TinEye, upload your profile photo: you will see if a fake account uses it.'],
      ['Check your email in data breaches', 'On Have I Been Pwned, type your address. If it shows up, change the password for that site.'],
      ['Protect your accounts', 'Turn on two-step verification. Check your recovery email and phone number. Sign out of devices you do not recognise.'],
      ['Get an automatic alert', 'Create a Google Alert for your name in quotes: Google emails you when a new page mentions you.'],
      ['Worried about an intimate image?', 'Adults: StopNCII.org helps block it from being posted on many platforms, without the image leaving your phone. Image taken before age 18: Take It Down.'],
    ],
  } as Record<'fr' | 'es' | 'en', Array<[string, string]>>,
  liens: [
    null,
    [['Google Lens', 'https://lens.google.com/'], ['TinEye', 'https://tineye.com/']],
    [['Have I Been Pwned', 'https://haveibeenpwned.com/']],
    null,
    [['Google Alerts', 'https://www.google.com/alerts']],
    [['StopNCII.org', 'https://stopncii.org/'], ['Take It Down', 'https://takeitdown.ncmec.org/']],
  ] as Array<Array<[string, string]> | null>,
  trouveTitre: { fr: 'Vous avez trouvé quelque chose ?', es: '¿Has encontrado algo?', en: 'Found something?' } as T3,
  trouveTexte: {
    fr: 'Pas de panique : beaucoup de contenus peuvent être retirés. Le diagnostic gratuit vous dit quoi faire, selon votre situation et votre pays.',
    es: 'Tranquilidad: muchos contenidos se pueden retirar. El diagnóstico gratuito te dice qué hacer, según tu situación y tu país.',
    en: 'Don’t panic: a lot of content can be removed. The free diagnostic tells you what to do, based on your situation and your country.',
  } as T3,
  rappelTitre: { fr: 'Refaites-le tous les 3 mois', es: 'Repítelo cada 3 meses', en: 'Do it again every 3 months' } as T3,
  rappelTexte: {
    fr: 'Un rappel dans votre agenda, tous les trois mois. Il reste sur votre téléphone : nous ne gardons rien.',
    es: 'Un recordatorio en tu calendario, cada tres meses. Se queda en tu teléfono: no guardamos nada.',
    en: 'A reminder in your calendar, every three months. It stays on your phone: we keep nothing.',
  } as T3,
  rappelAgenda: { fr: 'Ajouter le rappel à mon agenda', es: 'Añadir el recordatorio a mi calendario', en: 'Add the reminder to my calendar' } as T3,
  rappelGoogle: { fr: 'Ou dans Google Agenda', es: 'O en Google Calendar', en: 'Or in Google Calendar' } as T3,
  rappelEvenement: {
    fr: 'Contrôle Devuelta : qu’est-ce qui traîne sur moi ?',
    es: 'Chequeo Devuelta: ¿qué hay sobre mí en internet?',
    en: 'Devuelta check-up: what is online about me?',
  } as T3,
  partager: {
    fr: 'Ce contrôle peut servir à vos proches : envoyez-leur cette page.',
    es: 'Este chequeo puede servir a tu gente: envíales esta página.',
    en: 'This check-up can help the people around you: send them this page.',
  } as T3,
  accueilTitre: { fr: 'Contrôle en 5 minutes', es: 'Chequeo en 5 minutos', en: '5-minute check-up' } as T3,
  accueilTexte: {
    fr: 'Qu’est-ce qui traîne sur vous en ligne ? Six gestes gratuits, à refaire tous les 3 mois.',
    es: '¿Qué hay sobre ti en internet? Seis pasos gratuitos, para repetir cada 3 meses.',
    en: 'What is online about you? Six free steps, to repeat every 3 months.',
  } as T3,
};

// Faux sauveteurs : les signaux d'alerte décrits par la FTC dans sa plainte du
// 13 octobre 2026 (des accusations : l'affaire est en cours), puis nos
// engagements. Chaque engagement reprend une règle déjà écrite sur le site
// (Tarifs, Méthode, Conditions de vente, page Chantage) : ne rien promettre de plus.
export const FAUX_SAUVETEURS = {
  verifie_le: '2026-10-16',
  seo: {
    fr: 'Sextorsion : repérer un faux service d’aide payant',
    es: 'Sextorsión: cómo reconocer un falso servicio de ayuda',
    en: 'Sextortion help scams: how to spot a fake rescuer',
  } as T3,
  meta: {
    fr: 'Promesse de retrouver le maître-chanteur, grosse somme d’avance, faux avis : les signaux d’alerte selon la FTC, et nos engagements.',
    es: 'Promesas de encontrar al chantajista, mucho dinero por adelantado, reseñas falsas: las señales de alerta según la FTC, y nuestros compromisos.',
    en: 'Promises to track down the blackmailer, big upfront fees, fake reviews: the warning signs according to the FTC, and our commitments.',
  } as T3,
  h1: {
    fr: 'Faux sauveteurs : comment les repérer',
    es: 'Falsos rescatadores: cómo reconocerlos',
    en: 'Fake rescuers: how to spot them',
  } as T3,
  // Libellé des liens vers cette page (Méthode, encadré « Nos engagements »).
  lien: {
    fr: 'Repérer un faux sauveteur, et nos engagements',
    es: 'Cómo reconocer a un falso rescatador, y nuestros compromisos',
    en: 'How to spot a fake rescuer, and our commitments',
  } as T3,
  intro: {
    fr: 'Quand on vous menace, vous voulez de l’aide tout de suite. Certains services payants profitent de cette peur. Le 13 octobre 2026, la FTC a poursuivi l’un d’eux en justice. La FTC est l’agence américaine de protection des consommateurs. Voici les signaux d’alerte qu’elle décrit, puis nos engagements.',
    es: 'Cuando te amenazan, quieres ayuda enseguida. Algunos servicios de pago se aprovechan de ese miedo. El 13 de octubre de 2026, la FTC demandó a uno de ellos. La FTC es la agencia de protección del consumidor de Estados Unidos. Aquí tienes las señales de alerta que describe, y después nuestros compromisos.',
    en: 'When someone threatens you, you want help right away. Some paid services take advantage of that fear. On 13 October 2026, the FTC sued one of them. The FTC is the US consumer protection agency. Here are the warning signs it describes, then our commitments.',
  } as T3,
  maintenantTitre: {
    fr: 'Quelqu’un vous fait chanter en ce moment ?',
    es: '¿Alguien te está chantajeando ahora mismo?',
    en: 'Is someone blackmailing you right now?',
  } as T3,
  maintenant: {
    fr: 'Ne payez pas et ne répondez plus. Gardez des captures d’écran des messages et du profil, puis bloquez la personne.',
    es: 'No pagues y deja de responder. Guarda capturas de pantalla de los mensajes y del perfil, y después bloquea a la persona.',
    en: 'Don’t pay and stop replying. Keep screenshots of the messages and the profile, then block the person.',
  } as T3,
  ftcTitre: {
    fr: 'Ce que la FTC reproche à un service d’« aide »',
    es: 'Lo que la FTC reprocha a un servicio de «ayuda»',
    en: 'What the FTC alleges against one “help” service',
  } as T3,
  ftc: {
    fr: [
      'La sextorsion, c’est le chantage aux images intimes : quelqu’un menace de les publier si vous ne payez pas.',
      'Selon la FTC, la société Digital Forensics Corporation promettait d’identifier les maîtres-chanteurs et de faire cesser le chantage. D’après la FTC, les victimes lui ont payé au moins 60 millions de dollars. Dans de nombreux cas, selon la FTC, les services promis n’étaient pas rendus.',
      'Ce sont des accusations. À la demande de la FTC, un tribunal fédéral de l’Ohio a suspendu l’activité de la société, à titre provisoire. L’affaire est en cours : c’est le tribunal qui tranchera.',
    ],
    es: [
      'La sextorsión es el chantaje con imágenes íntimas: alguien amenaza con publicarlas si no pagas.',
      'Según la FTC, la empresa Digital Forensics Corporation prometía identificar a los chantajistas y acabar con el chantaje. De acuerdo con la FTC, las víctimas le pagaron al menos 60 millones de dólares. En muchos casos, según la FTC, no prestaba los servicios prometidos.',
      'Son acusaciones. A petición de la FTC, un tribunal federal de Ohio suspendió la actividad de la empresa de forma provisional. El caso sigue abierto: lo decidirá el tribunal.',
    ],
    en: [
      'Sextortion is blackmail with intimate images: someone threatens to publish them unless you pay.',
      'According to the FTC, a company called Digital Forensics Corporation promised to identify blackmailers and end the blackmail. The FTC says victims paid it at least $60 million. According to the FTC, in many cases it did not provide the services it promised.',
      'These are allegations. At the FTC’s request, a federal court in Ohio has temporarily halted the company’s activities. The case is ongoing: the court will decide.',
    ],
  } as L3,
  signauxTitre: {
    fr: 'Les signaux d’alerte décrits par la FTC',
    es: 'Las señales de alerta que describe la FTC',
    en: 'The warning signs described by the FTC',
  } as T3,
  // [signal, détail] : chaque détail est attribué à la FTC (« selon la FTC »).
  signaux: {
    fr: [
      ['Il promet de retrouver le maître-chanteur.', 'Selon la FTC, ses publicités promettaient de « traquer » les criminels et de les identifier. Or seule la justice peut obtenir l’identité d’un auteur.'],
      ['Il met la pression et demande beaucoup d’argent d’avance.', 'Selon la FTC, ses vendeurs jouaient sur les peurs de chaque victime pour la pousser à payer. D’après la plainte, la société faisait payer de 1 499 à 20 000 dollars. Une fois la « phase 1 » payée, elle poussait à acheter une « phase 2 ».'],
      ['Il remet de faux rapports.', 'Selon la FTC, la société inventait les données de ses « rapports » et fabriquait de fausses conversations. Souvent, toujours selon la FTC, elle ne prévenait pas la police, malgré sa promesse.'],
      ['Ses bons avis peuvent être faux.', 'Selon la FTC, la société a produit des milliers de faux avis positifs.'],
      ['Il vous dit de ne pas bloquer le maître-chanteur.', 'Selon la FTC, ce conseil est contraire à celui du FBI. Toujours selon la FTC, la société se contentait souvent de bloquer le maître-chanteur sur les réseaux sociaux de la victime. Vous pouvez le faire vous-même.'],
    ],
    es: [
      ['Promete encontrar al chantajista.', 'Según la FTC, sus anuncios prometían «rastrear» a los delincuentes e identificarlos. Pero solo la justicia puede obtener la identidad de un autor.'],
      ['Presiona y pide mucho dinero por adelantado.', 'Según la FTC, sus vendedores jugaban con los miedos de cada víctima para que pagara. De acuerdo con la demanda, la empresa cobraba entre 1 499 y 20 000 dólares. Una vez pagada la «fase 1», presionaba para comprar una «fase 2».'],
      ['Entrega informes falsos.', 'Según la FTC, la empresa inventaba los datos de sus «informes» y fabricaba conversaciones falsas. Muchas veces, también según la FTC, no avisaba a la policía, aunque lo había prometido.'],
      ['Sus buenas reseñas pueden ser falsas.', 'Según la FTC, la empresa generó miles de reseñas positivas falsas.'],
      ['Te dice que no bloquees al chantajista.', 'Según la FTC, ese consejo va en contra del que da el FBI. También según la FTC, la empresa muchas veces solo bloqueaba al chantajista en las redes sociales de la víctima. Puedes hacerlo tú.'],
    ],
    en: [
      ['It promises to track down the blackmailer.', 'According to the FTC, its ads promised to “track down” criminals and identify them. But only the courts can obtain the identity of the person behind it.'],
      ['It pressures you and asks for a lot of money upfront.', 'According to the FTC, its salespeople played on each victim’s fears to make them pay. The complaint says the company charged between $1,499 and $20,000. Once “Phase 1” was paid, it pushed victims to buy a “Phase 2”.'],
      ['It gives you fake reports.', 'According to the FTC, the company faked the data in its “reports” and made up chat transcripts. The FTC also says it often did not contact the police, despite promising to.'],
      ['Its good reviews may be fake.', 'According to the FTC, the company generated thousands of fake positive reviews.'],
      ['It tells you not to block the blackmailer.', 'According to the FTC, that advice goes against the FBI’s advice. The FTC also says the company often just blocked the blackmailer on the victim’s social media. You can do that yourself.'],
    ],
  } as Record<'fr' | 'es' | 'en', Array<[string, string]>>,
  verifier: {
    fr: 'Avant de payer un service, la FTC conseille de chercher son nom avec les mots « arnaque », « avis » ou « plainte ». Elle conseille aussi d’ignorer les résultats payants, en haut de la page.',
    es: 'Antes de pagar a un servicio, la FTC aconseja buscar su nombre con las palabras «estafa», «opiniones» o «queja». También aconseja saltarse los resultados de pago, que aparecen arriba.',
    en: 'Before paying any service, the FTC advises searching its name with words like “scam”, “review” or “complaint”. It also advises scrolling past the paid results at the top.',
  } as T3,
  engagementsIntro: {
    fr: 'Voici ce que nous faisons, et ce que nous ne faisons jamais.',
    es: 'Esto es lo que hacemos, y lo que nunca hacemos.',
    en: 'Here is what we do, and what we never do.',
  } as T3,
  // [engagement, détail] : uniquement des règles déjà écrites sur le site.
  engagements: {
    fr: [
      ['Un prix affiché avant de commencer.', 'Nos prix sont publics et dépendent du nombre de liens. Ils commencent à 40 €, moitié prix en Afrique et en Amérique latine. Vous ne payez rien avant d’avoir accepté notre devis écrit. Ensuite, la moitié sert à démarrer, et le reste n’est dû que pour les liens retirés.'],
      ['Aucune promesse de résultat.', 'La décision appartient à la plateforme, à l’hébergeur ou à un juge. Nous vous disons honnêtement ce qui est possible.'],
      ['Aucune négociation avec le maître-chanteur.', 'Nous ne négocions pas avec lui et nous ne le payons pas. Nous ne cherchons pas non plus à le retrouver : seule la justice peut le faire. Nous vous conseillons au contraire de le bloquer, après avoir gardé des captures d’écran.'],
      ['L’aide gratuite d’abord.', 'Si vous pouvez le faire seul·e, avec les démarches officielles gratuites, nous vous le disons. Le diagnostic, les guides et les articles sont gratuits.'],
      ['Aucun faux avis.', 'Nous ne publions ni faux avis ni faux témoignages. Et nous refusons d’en publier pour un client.'],
      ['Une personne valide chaque étape.', 'Chaque courrier est relu par une personne de l’équipe. Rien ne part sans votre accord.'],
      ['Des liens, jamais vos images.', 'Nous travaillons à partir des liens. Nous ne vous demanderons jamais d’envoyer un contenu intime.'],
      ['Moins de 18 ans : l’aide officielle gratuite.', 'Pour une personne mineure, nous orientons vers les services officiels gratuits. Nous ne faisons jamais rien payer.'],
    ],
    es: [
      ['Un precio visible antes de empezar.', 'Nuestros precios son públicos y dependen del número de enlaces. Empiezan en 40 €, a mitad de precio en África y América Latina. No pagas nada antes de aceptar nuestro presupuesto por escrito. Después, pagas la mitad para empezar, y el resto solo por los enlaces retirados.'],
      ['Ninguna promesa de resultado.', 'La decisión es de la plataforma, del proveedor de alojamiento o de un juez. Te decimos con honestidad lo que es posible.'],
      ['Ninguna negociación con el chantajista.', 'No negociamos con él y no le pagamos. Tampoco intentamos encontrarlo: solo la justicia puede hacerlo. Al contrario, te aconsejamos bloquearlo, después de guardar capturas de pantalla.'],
      ['Primero, la ayuda gratuita.', 'Si puedes hacerlo tú, con los trámites oficiales gratuitos, te lo decimos. El diagnóstico, las guías y los artículos son gratis.'],
      ['Ninguna reseña falsa.', 'No publicamos reseñas ni testimonios falsos. Y nos negamos a publicarlos para un cliente.'],
      ['Una persona valida cada paso.', 'Una persona del equipo revisa cada escrito. Nada se envía sin tu acuerdo.'],
      ['Enlaces, nunca tus imágenes.', 'Trabajamos a partir de los enlaces. Nunca te pediremos que envíes un contenido íntimo.'],
      ['Menores de 18 años: la ayuda oficial gratuita.', 'Para una persona menor de edad, orientamos hacia los servicios oficiales gratuitos. Nunca cobramos nada.'],
    ],
    en: [
      ['A price you see before anything starts.', 'Our prices are public and depend on the number of links. They start at €40, half price in Africa and Latin America. You pay nothing before accepting our written quote. Then you pay half to start, and the rest only for the links removed.'],
      ['No promise of results.', 'The decision belongs to the platform, the host or a judge. We tell you honestly what is possible.'],
      ['No negotiating with the blackmailer.', 'We don’t negotiate with them and we don’t pay them. We don’t try to find them either: only the courts can do that. Instead, we advise you to block them, after keeping screenshots.'],
      ['Free help first.', 'If you can do it yourself through the free official procedures, we tell you. The diagnostic, guides and articles are free.'],
      ['No fake reviews.', 'We publish no fake reviews or testimonials. And we refuse to post them for a client.'],
      ['A person approves every step.', 'A person on our team reviews every letter. Nothing goes out without your agreement.'],
      ['Links, never your images.', 'We work from links. We will never ask you to send intimate content.'],
      ['Under 18: free official help.', 'For a minor, we point to official free services. We never charge anything.'],
    ],
  } as Record<'fr' | 'es' | 'en', Array<[string, string]>>,
  reglesDetail: { fr: 'Nos règles en détail :', es: 'Nuestras reglas en detalle:', en: 'Our rules in detail:' } as T3,
  aideGratuite: {
    fr: 'Avant de payer qui que ce soit, regardez les aides gratuites de votre pays :',
    es: 'Antes de pagar a nadie, mira las ayudas gratuitas de tu país:',
    en: 'Before paying anyone, check the free help in your country:',
  } as T3,
  sources: [
    {
      url: 'https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-sues-operator-sextortion-relief-scheme-misleading-consumers-believing-it-would-identify',
      titre: {
        fr: 'FTC : plainte contre un service d’« aide » aux victimes de sextorsion (13 octobre 2026, en anglais)',
        es: 'FTC: demanda contra un servicio de «ayuda» a víctimas de sextorsión (13 de octubre de 2026, en inglés)',
        en: 'FTC Sues Operator of Sextortion Relief Scheme (FTC, 13 October 2026)',
      } as T3,
    },
    {
      url: 'https://consumer.ftc.gov/consumer-alerts/2026/10/how-avoid-deceptive-sextortion-assistance-services-and-find-real-help',
      titre: {
        fr: 'FTC : éviter les faux services d’aide en cas de sextorsion (13 octobre 2026, en anglais)',
        es: 'FTC: cómo evitar los falsos servicios de ayuda ante la sextorsión (13 de octubre de 2026, en inglés)',
        en: 'How to avoid deceptive sextortion assistance services and find real help (FTC, 13 October 2026)',
      } as T3,
    },
  ] as Array<{ url: string; titre: T3 }>,
};

// L'aide gratuite d'abord : services publics ou associatifs, vérifiés un par un
// sur leur site officiel. « gratuit » vaut true seulement quand le service, ou
// une page officielle citée en source, le dit ; un téléphone n'est donné que
// s'il est publié par le service lui-même.
export interface AideGratuite {
  pays: 'INTL' | 'FR' | 'ES' | 'GB' | 'US' | 'GH';
  nom: string;
  quoi: T3;
  pourQui: T3;
  url: string;
  telephone?: string;
  autres?: T3;
  gratuit: boolean;
}

export const AIDE_GRATUITE = {
  verifie_le: '2026-10-16',
  seo: {
    fr: 'L’aide gratuite d’abord : services officiels par pays',
    es: 'La ayuda gratuita primero: servicios oficiales por país',
    en: 'Free help first: official services by country',
  } as T3,
  meta: {
    fr: 'StopNCII, Take It Down, PHAROS, 17Cyber, 3018, 116 006, 017, Canal prioritario, Revenge Porn Helpline, CSA : les aides officielles, vérifiées et datées.',
    es: 'StopNCII, Take It Down, 017, Canal prioritario, PHAROS, 3018, Revenge Porn Helpline, TakeItDown.ftc.gov, CSA: ayuda oficial, verificada y fechada.',
    en: 'StopNCII, Take It Down, Revenge Porn Helpline, TakeItDown.ftc.gov, CSA 292, PHAROS, 017: official help, checked and dated.',
  } as T3,
  h1: { fr: 'L’aide gratuite d’abord', es: 'La ayuda gratuita primero', en: 'Free help first' } as T3,
  intro: {
    fr: 'Avant de payer qui que ce soit, regardez ces services publics ou associatifs. Beaucoup sont gratuits : l’étiquette « Gratuit » apparaît quand le service ou une page officielle le dit.',
    es: 'Antes de pagar a nadie, mira estos servicios públicos o sin ánimo de lucro. Muchos son gratuitos: la etiqueta «Gratis» aparece cuando el servicio o una página oficial lo dice.',
    en: 'Before paying anyone, look at these public and non-profit services. Many are free: the “Free” label appears when the service or an official page says so.',
  } as T3,
  international: { fr: 'Outils en ligne, tous pays', es: 'Herramientas en línea, todos los países', en: 'Online tools, any country' } as T3,
  mineurs: {
    fr: 'Take It Down, le 3018 en France et le 017 en Espagne sont là pour vous. Parlez-en aussi à un adulte de confiance. Devuelta ne prend jamais de dossier payant pour une personne mineure.',
    es: 'Take It Down, el 017 en España y el 3018 en Francia están para ayudarte. Habla también con un adulto de confianza. Devuelta nunca acepta un caso de pago de una persona menor de edad.',
    en: 'Take It Down, the 3018 in France and the 017 in Spain are there for you. Also talk to an adult you trust. Devuelta never takes a paid case for a minor.',
  } as T3,
  autresPays: {
    fr: 'Votre pays n’est pas dans la liste ? D’autres services officiels, pays par pays :',
    es: '¿Tu país no está en la lista? Más servicios oficiales, país por país:',
    en: 'Your country isn’t listed? More official services, country by country:',
  } as T3,
  quandTitre: { fr: 'Quand Devuelta peut aider', es: 'Cuándo puede ayudar Devuelta', en: 'When Devuelta can help' } as T3,
  quand: {
    fr: 'Devuelta prend le relais quand la voie gratuite bloque, ou quand vous ne voulez pas agir seul·e. Nous aidons aussi quand aucun service ne couvre votre langue ou votre pays.',
    es: 'Devuelta toma el relevo cuando la vía gratuita se bloquea, o cuando no quieres hacerlo sin ayuda. También ayudamos cuando ningún servicio cubre tu idioma o tu país.',
    en: 'Devuelta takes over when the free route is blocked, or when you don’t want to do it alone. We also help when no service covers your language or your country.',
  } as T3,
  fauxSauveteurs: {
    fr: 'Avant de payer un service, apprenez à repérer un faux sauveteur :',
    es: 'Antes de pagar a un servicio, aprende a reconocer a un falso rescatador:',
    en: 'Before paying for a service, learn how to spot a fake rescuer:',
  } as T3,
  // Phrase des liens vers cette page (pages Contact et Aide urgente).
  renvoi: {
    fr: 'Pour faire retirer un contenu, voyez aussi les aides gratuites, pays par pays :',
    es: 'Para retirar un contenido, mira también las ayudas gratuitas, país por país:',
    en: 'To get content removed, also see the free help, country by country:',
  } as T3,
  services: [
    {
      pays: 'INTL',
      nom: 'StopNCII.org',
      quoi: {
        fr: 'Aide à bloquer la publication de vos images intimes sur les plateformes partenaires, sans que l’image quitte votre téléphone.',
        es: 'Ayuda a bloquear la publicación de tus imágenes íntimas en las plataformas asociadas. La imagen no sale de tu teléfono.',
        en: 'Helps block your intimate images from being posted on partner platforms, without the image leaving your phone.',
      },
      pourQui: {
        fr: 'Les adultes, pour une image prise quand ils avaient 18 ans ou plus.',
        es: 'Personas adultas, para una imagen tomada cuando ya tenían 18 años o más.',
        en: 'Adults, for an image taken when they were 18 or older.',
      },
      url: 'https://stopncii.org/',
      gratuit: true,
    },
    {
      pays: 'INTL',
      nom: 'Take It Down (NCMEC)',
      quoi: {
        fr: 'Fonctionne comme StopNCII, pour les images prises avant 18 ans : l’image reste sur votre téléphone.',
        es: 'Funciona como StopNCII, para imágenes tomadas antes de los 18 años: la imagen se queda en tu teléfono.',
        en: 'Works like StopNCII, for images taken before age 18: the image stays on your phone.',
      },
      pourQui: {
        fr: 'Toute personne dont l’image a été prise avant ses 18 ans, même adulte aujourd’hui.',
        es: 'Cualquier persona cuya imagen se tomó antes de los 18 años, aunque hoy sea adulta.',
        en: 'Anyone whose image was taken before they turned 18, even if they are an adult now.',
      },
      url: 'https://takeitdown.ncmec.org/',
      gratuit: true,
    },
    {
      pays: 'FR',
      nom: 'PHAROS',
      quoi: {
        fr: 'Le portail officiel pour signaler un contenu illicite visible par tous sur internet : site, réseau social, forum.',
        es: 'El portal oficial francés para denunciar un contenido ilícito visible para todos en internet: sitio web, red social, foro.',
        en: 'The official French portal for reporting illegal content anyone can see online: a website, social network or forum.',
      },
      pourQui: {
        fr: 'Toute personne. Pas pour une affaire privée avec quelqu’un que vous connaissez : adressez-vous alors à la police ou à la gendarmerie.',
        es: 'Cualquier persona. No sirve para un asunto privado con alguien que conoces: en ese caso, acude a la policía.',
        en: 'Anyone. Not for a private matter with someone you know: in that case, go to the police or the gendarmerie.',
      },
      url: 'https://www.internet-signalement.gouv.fr/',
      autres: {
        fr: 'Des policiers et des gendarmes analysent chaque signalement. Sauf exception, ils ne vous recontactent pas.',
        es: 'Policías y gendarmes analizan cada denuncia. Salvo excepciones, no te vuelven a contactar.',
        en: 'Police officers and gendarmes review each report. Except in rare cases, they will not contact you.',
      },
      gratuit: false,
    },
    {
      pays: 'FR',
      nom: '17Cyber (Cybermalveillance.gouv.fr)',
      quoi: {
        fr: 'Un diagnostic en ligne, des conseils et, si besoin, l’aide de policiers ou de gendarmes, pour les victimes d’infractions numériques.',
        es: 'Diagnóstico en línea, consejos y, si hace falta, ayuda de policías o gendarmes para víctimas de delitos en internet.',
        en: 'An online diagnostic, advice and, if needed, help from police officers or gendarmes, for victims of online offences.',
      },
      pourQui: {
        fr: 'Les particuliers, les entreprises, les associations et les collectivités.',
        es: 'Particulares, empresas, asociaciones y administraciones locales.',
        en: 'Individuals, businesses, associations and local authorities.',
      },
      url: 'https://17cyber.gouv.fr/',
      autres: { fr: '24 h sur 24, 7 jours sur 7.', es: 'Las 24 horas, todos los días.', en: 'Open 24 hours a day, 7 days a week.' },
      gratuit: true,
    },
    {
      pays: 'FR',
      nom: '3018 (association e-Enfance)',
      quoi: {
        fr: 'Écoute et conseils face au harcèlement et aux violences en ligne. Le 3018 peut aussi faire passer en priorité une demande de retrait auprès des grands réseaux sociaux.',
        es: 'Escucha y consejos ante el acoso y la violencia en línea. El 3018 también puede hacer llegar con prioridad una solicitud de retirada a las grandes redes sociales.',
        en: 'Listening and advice about online harassment and abuse. The 3018 can also fast-track a removal request with major social networks.',
      },
      pourQui: {
        fr: 'Les jeunes, enfants et adolescents, mais aussi leurs parents et les professionnels.',
        es: 'Los jóvenes, niños, niñas y adolescentes, y también sus familias y los profesionales.',
        en: 'Young people, children and teenagers, and also their parents and professionals.',
      },
      url: 'https://3018.fr/',
      telephone: '3018',
      autres: {
        fr: 'Aussi par tchat sur 3018.fr et avec l’application 3018. Tous les jours, de 9 h à 23 h.',
        es: 'También por chat en 3018.fr y con la aplicación 3018. Todos los días, de 9:00 a 23:00.',
        en: 'Also by chat on 3018.fr and in the 3018 app. Every day, 9 am to 11 pm.',
      },
      gratuit: true,
    },
    {
      pays: 'FR',
      nom: '116 006 (France Victimes)',
      quoi: {
        fr: 'Écoute les victimes d’infractions et les oriente vers une association d’aide aux victimes.',
        es: 'Escucha a las víctimas de delitos y las orienta hacia una asociación de ayuda a víctimas.',
        en: 'Listens to victims of crime and refers them to a victim support association.',
      },
      pourQui: {
        fr: 'Les victimes d’une infraction, sauf les atteintes aux biens commises sur internet.',
        es: 'Las víctimas de un delito, salvo los delitos contra el patrimonio cometidos en internet.',
        en: 'Victims of crime, except property offences committed online.',
      },
      url: 'https://www.france-victimes.fr/',
      telephone: '116 006',
      autres: {
        fr: 'Tous les jours, de 9 h à 20 h (heure de Paris).',
        es: 'Todos los días, de 9:00 a 20:00 (hora de París).',
        en: 'Every day, 9 am to 8 pm (Paris time).',
      },
      gratuit: true,
    },
    {
      pays: 'ES',
      nom: '017 – Tu Ayuda en Ciberseguridad (INCIBE)',
      quoi: {
        fr: 'La ligne nationale espagnole d’aide en cybersécurité : une équipe vous conseille de façon confidentielle et personnalisée.',
        es: 'La línea nacional de ayuda en ciberseguridad: un equipo te aconseja de forma confidencial y personalizada.',
        en: 'Spain’s national cybersecurity helpline: a team gives you confidential, personal advice.',
      },
      pourQui: {
        fr: 'Les particuliers, les entreprises, et les mineurs avec leur entourage.',
        es: 'Particulares, empresas, y menores de edad con su entorno.',
        en: 'Individuals, businesses, and minors with the adults around them.',
      },
      url: 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/',
      telephone: '017',
      autres: {
        fr: 'Aussi sur WhatsApp au 900 116 117 (enregistrez d’abord le numéro) et sur Telegram (@INCIBE017). Tous les jours, de 8 h à 23 h.',
        es: 'También por WhatsApp en el 900 116 117 (guarda antes el número en tu agenda) y por Telegram (@INCIBE017). Todos los días, de 8:00 a 23:00.',
        en: 'Also on WhatsApp at 900 116 117 (save the number first) and on Telegram (@INCIBE017). Every day, 8 am to 11 pm.',
      },
      gratuit: true,
    },
    {
      pays: 'ES',
      nom: 'Canal prioritario de l’AEPD',
      quoi: {
        fr: 'Pour demander le retrait urgent de photos, vidéos ou audios sexuels ou violents publiés sans accord, dans les cas graves. L’AEPD est l’autorité espagnole de protection des données.',
        es: 'Para pedir la retirada urgente de fotos, vídeos o audios sexuales o violentos publicados sin permiso, en los casos graves. La AEPD es la autoridad española de protección de datos.',
        en: 'To ask for the urgent removal of sexual or violent photos, videos or audio posted without consent, in serious cases. The AEPD is Spain’s data protection authority.',
      },
      pourQui: {
        fr: 'La personne concernée, ou toute personne qui connaît la diffusion. La victime doit être espagnole ou se trouver en Espagne.',
        es: 'La persona afectada o cualquiera que conozca la difusión. La víctima debe ser española o estar en España.',
        en: 'The person affected, or anyone who knows about it. The victim must be Spanish or be in Spain.',
      },
      url: 'https://www.aepd.es/canalprioritario',
      autres: {
        fr: 'Les moins de 18 ans ont un accès dédié depuis la même page.',
        es: 'Las personas menores de 18 años tienen un acceso propio desde la misma página.',
        en: 'Under-18s have their own access from the same page.',
      },
      gratuit: true,
    },
    {
      pays: 'GB',
      nom: 'Revenge Porn Helpline',
      quoi: {
        fr: 'Des conseils confidentiels, et de l’aide pour signaler et faire retirer des images intimes diffusées sans accord.',
        es: 'Consejos confidenciales y ayuda para denunciar y retirar imágenes íntimas difundidas sin consentimiento.',
        en: 'Confidential advice, and help to report and remove intimate images shared without consent.',
      },
      pourQui: {
        fr: 'Les adultes qui vivent au Royaume-Uni.',
        es: 'Personas adultas que viven en el Reino Unido.',
        en: 'Adults living in the UK.',
      },
      url: 'https://revengepornhelpline.org.uk/',
      telephone: '0345 6000 459',
      autres: {
        fr: 'Du lundi au vendredi, de 10 h à 16 h, sauf jours fériés.',
        es: 'De lunes a viernes, de 10:00 a 16:00, salvo festivos.',
        en: 'Monday to Friday, 10 am to 4 pm, except bank holidays.',
      },
      gratuit: true,
    },
    {
      pays: 'US',
      nom: 'TakeItDown.ftc.gov (FTC)',
      quoi: {
        fr: 'Pour signaler à la FTC une plateforme qui garde votre image intime malgré votre demande, ou qui n’a aucun formulaire.',
        es: 'Para denunciar ante la FTC a una plataforma que no retira tu imagen íntima o que no tiene formulario.',
        en: 'To report a platform to the FTC that kept your intimate image online, or has no removal form.',
      },
      pourQui: {
        fr: 'La personne sur l’image, ou quelqu’un qui agit pour elle, quand la plateforme n’a rien fait après 48 heures.',
        es: 'La persona de la imagen, o alguien que actúa por ella, si la plataforma no hizo nada en 48 horas.',
        en: 'The person in the image, or someone acting for them, if the platform has done nothing after 48 hours.',
      },
      url: 'https://takeitdown.ftc.gov/',
      autres: {
        fr: 'Depuis le 19 mai 2026, les plateformes concernées doivent retirer ces images sous 48 heures après une demande valable.',
        es: 'Desde el 19 de mayo de 2026, las plataformas afectadas deben retirarlas en 48 horas tras una solicitud válida.',
        en: 'Since 19 May 2026, covered platforms must remove these images within 48 hours of a valid request.',
      },
      gratuit: false,
    },
    {
      pays: 'GH',
      nom: 'Cyber Security Authority (CSA)',
      quoi: {
        fr: 'Pour signaler un acte de cybercriminalité à l’autorité de cybersécurité du Ghana : son équipe CERT-GH trie et examine les signalements.',
        es: 'Para denunciar un ciberdelito ante la autoridad de ciberseguridad de Ghana: su equipo CERT-GH clasifica y examina los avisos.',
        en: 'To report cybercrime to Ghana’s cybersecurity authority: its CERT-GH team triages and investigates reports.',
      },
      pourQui: {
        fr: 'Les personnes au Ghana. Selon la CSA, le SMS au 292 ne fonctionne que depuis le Ghana.',
        es: 'Las personas en Ghana. Según la CSA, el SMS al 292 solo funciona desde Ghana.',
        en: 'People in Ghana. According to the CSA, texting 292 only works from within Ghana.',
      },
      url: 'https://www.csa.gov.gh/report',
      telephone: '292',
      autres: {
        fr: 'Le 292 par appel ou par SMS. Aussi : WhatsApp au 050 160 3111, report@csa.gov.gh, l’application CSA GHANA ou le formulaire en ligne.',
        es: 'El 292 por llamada o SMS. También: WhatsApp al 050 160 3111, report@csa.gov.gh, la aplicación CSA GHANA o el formulario en línea.',
        en: 'Call or text 292. Also: WhatsApp on 050 160 3111, report@csa.gov.gh, the CSA GHANA app or the online form.',
      },
      gratuit: false,
    },
  ] as AideGratuite[],
  sourcesIntro: {
    fr: 'Chaque service a été vérifié sur son site officiel, et sur ces pages officielles :',
    es: 'Cada servicio se verificó en su sitio oficial y en estas páginas oficiales:',
    en: 'Each service was checked on its official website and on these official pages:',
  } as T3,
  sources: [
    {
      url: 'https://www.masecurite.interieur.gouv.fr/fr/demarches-en-ligne/portail-officiel-signalement-contenus-illicites-internet-pharos',
      titre: {
        fr: 'Ministère de l’Intérieur : le portail PHAROS',
        es: 'Ministerio del Interior de Francia: el portal PHAROS (en francés)',
        en: 'French Ministry of the Interior: the PHAROS portal (in French)',
      } as T3,
    },
    {
      url: 'https://www.info.gouv.fr/actualite/17cyber-gouv-fr-le-guichet-unique-pour-les-victimes-de-cybermalveillance',
      titre: {
        fr: 'Gouvernement : 17Cyber, le guichet unique et gratuit des victimes de cybermalveillance',
        es: 'Gobierno de Francia: 17Cyber, ventanilla única y gratuita para víctimas de ciberdelitos (en francés)',
        en: 'French government: 17Cyber, free one-stop help for victims of online crime (in French)',
      } as T3,
    },
    {
      url: 'https://e-enfance.org/wp-content/uploads/2026/03/Breve-presentation-Association-e-Enfance.pdf',
      titre: {
        fr: 'Association e-Enfance : présentation du 3018',
        es: 'Asociación e-Enfance: presentación del 3018 (en francés)',
        en: 'e-Enfance: about the 3018 helpline (in French)',
      } as T3,
    },
    {
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1435',
      titre: {
        fr: 'Service-Public.fr : porter plainte, et le numéro d’aide aux victimes 116 006',
        es: 'Service-Public.fr: presentar una denuncia, y el número de ayuda a víctimas 116 006 (en francés)',
        en: 'Service-Public.fr: filing a complaint, and the 116 006 victim helpline (in French)',
      } as T3,
    },
    {
      url: 'https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/lo-paras-o-lo-pasas-nueva-iniciativa-mar-espana',
      titre: {
        fr: 'AEPD : le Canal prioritario, une voie rapide et gratuite (15 avril 2021, en espagnol)',
        es: 'AEPD: el Canal prioritario, una vía rápida y gratuita (15 de abril de 2021)',
        en: 'AEPD: the Canal prioritario, a fast and free route (15 April 2021, in Spanish)',
      } as T3,
    },
    {
      url: 'https://www.aepd.es/preguntas-frecuentes/15-canal-prioritario-para-contenidos-sensibles-en-internet/FAQ-1502-en-que-casos-puedo-acudir-a-este-canal',
      titre: {
        fr: 'AEPD : dans quels cas utiliser le Canal prioritario (en espagnol)',
        es: 'AEPD: ¿en qué casos puedo acudir a este canal?',
        en: 'AEPD: when you can use the Canal prioritario (in Spanish)',
      } as T3,
    },
    {
      url: 'https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act',
      titre: {
        fr: 'FTC : début de l’application du TAKE IT DOWN Act (19 mai 2026, en anglais)',
        es: 'FTC: empieza la aplicación de la ley TAKE IT DOWN (19 de mayo de 2026, en inglés)',
        en: 'FTC Begins Enforcing the TAKE IT DOWN Act (FTC, 19 May 2026)',
      } as T3,
    },
    {
      url: 'https://consumer.ftc.gov/consumer-alerts/2026/09/how-report-platform-doesnt-take-down-your-intimate-images',
      titre: {
        fr: 'FTC : signaler une plateforme qui ne retire pas vos images intimes (23 septembre 2026, en anglais)',
        es: 'FTC: denunciar a una plataforma que no retira tus imágenes íntimas (23 de septiembre de 2026, en inglés)',
        en: 'How to report a platform that doesn’t take down your intimate images (FTC, 23 September 2026)',
      } as T3,
    },
    {
      url: 'https://www.csa.gov.gh/cert-gh-rfc',
      titre: {
        fr: 'Cyber Security Authority : profil RFC 2350 du CERT-GH (en anglais)',
        es: 'Cyber Security Authority: perfil RFC 2350 del CERT-GH (en inglés)',
        en: 'Cyber Security Authority: CERT-GH RFC 2350 profile',
      } as T3,
    },
  ] as Array<{ url: string; titre: T3 }>,
};
