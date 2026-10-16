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
