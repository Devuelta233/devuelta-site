// Une page par situation : ce qu'il faut faire d'abord, ce qu'il faut éviter,
// les questions fréquentes. Conseils généraux, sans promesse de résultat.

import type { SituationReelle, T3 } from '../../shared/vocab';

export interface Faq {
  q: string;
  r: string;
}

export interface ContenuSituation {
  h1: string;
  seo: string; // titre court pour Google (sans le nom du site)
  meta: string; // description pour Google (< 155 caractères)
  carte: string; // phrase courte pour la carte d'accueil
  intro: string;
  premiers: string[];
  eviter: string[];
  faq: Faq[];
}

type ParLangue = Record<'fr' | 'es' | 'en', ContenuSituation>;

export const SITUATIONS_TEXTE: Record<SituationReelle, ParLangue> = {
  'contenu-intime': {
    fr: {
      h1: 'Vos photos ou vidéos intimes ont été diffusées : que faire',
      seo: 'Photos intimes diffusées sans consentement : que faire',
      meta: 'Une photo ou vidéo intime de vous circule en ligne ? Les démarches officielles, dans l’ordre, pour la faire retirer et éviter qu’elle se propage.',
      carte: 'Une image intime de vous circule en ligne.',
      intro:
        'Ce qui vous arrive n’est pas de votre faute, même si vous aviez envoyé ce contenu vous-même ou accepté au départ. La loi vous protège dans la plupart des pays, et les grandes plateformes ont des procédures prioritaires pour ce type de contenu.',
      premiers: [
        'Notez les liens (les adresses web) où le contenu apparaît, avec la date. Ne téléchargez pas et ne transférez pas le contenu lui-même.',
        'Signalez chaque lien avec le formulaire officiel de la plateforme, en choisissant la catégorie « contenu intime partagé sans consentement ».',
        'Si vous êtes majeur·e, créez une empreinte numérique sur StopNCII.org : les plateformes partenaires pourront bloquer les nouvelles publications de la même image, sans que l’image quitte votre téléphone.',
        'Demandez aussi le retrait dans les résultats de Google et de Bing : ils ont des formulaires dédiés aux images intimes.',
      ],
      eviter: [
        'Ne payez jamais quelqu’un qui menace de publier : cela arrête rarement le chantage.',
        'Ne contactez pas directement la personne qui a publié, surtout si elle vous menace.',
        'N’effacez pas les messages de menace : ce sont des preuves.',
      ],
      faq: [
        {
          q: 'Et si c’est moi qui avais envoyé la photo ?',
          r: 'Avoir partagé une image avec quelqu’un ne l’autorise pas à la publier. Vous pouvez demander le retrait en expliquant que vous ne consentez pas, ou plus, à cette diffusion.',
        },
        {
          q: 'Combien de temps faut-il pour obtenir le retrait ?',
          r: 'Cela dépend du site. Les grandes plateformes répondent souvent en quelques jours. Aux États-Unis, la loi TAKE IT DOWN impose aux plateformes concernées de retirer le contenu sous 48 heures après une demande valable. Les petits sites anonymes demandent plus de démarches.',
        },
        {
          q: 'Dois-je porter plainte ?',
          r: 'C’est votre choix. Diffuser une image intime sans accord est une infraction dans de nombreux pays, dont la France, l’Espagne, le Mexique et les États-Unis. La plainte n’est pas obligatoire pour demander le retrait, mais elle est recommandée en cas de menace ou de chantage.',
        },
      ],
    },
    es: {
      h1: 'Filtraron tu pack o tus fotos íntimas: qué hacer ahora',
      seo: 'Filtraron mis fotos íntimas: qué hacer y cómo borrarlas',
      meta: '¿Circula en internet una foto o un video íntimo tuyo? Los pasos oficiales, en orden, para que lo retiren y evitar que se siga compartiendo.',
      carte: 'Una imagen íntima tuya circula en internet.',
      intro:
        'Lo que te está pasando no es tu culpa, aunque hayas enviado ese contenido tú o hayas aceptado al principio. La ley te protege en la mayoría de los países, y las grandes plataformas tienen procedimientos prioritarios para este tipo de contenido.',
      premiers: [
        'Anota los enlaces (las direcciones web) donde aparece el contenido, con la fecha. No descargues ni reenvíes el contenido.',
        'Denuncia cada enlace con el formulario oficial de la plataforma, eligiendo la categoría «contenido íntimo compartido sin consentimiento».',
        'Si eres mayor de edad, crea una huella digital en StopNCII.org: las plataformas asociadas podrán bloquear nuevas publicaciones de la misma imagen, sin que la imagen salga de tu teléfono.',
        'Pide también que la retiren de los resultados de Google y Bing: tienen formularios específicos para imágenes íntimas.',
      ],
      eviter: [
        'Nunca le pagues a quien amenaza con publicar: pagar casi nunca detiene el chantaje.',
        'No contactes directamente a quien lo publicó, sobre todo si te amenaza.',
        'No borres los mensajes de amenaza: son pruebas.',
      ],
      faq: [
        {
          q: '¿Y si fui yo quien envió la foto?',
          r: 'Haber compartido una imagen con alguien no le da derecho a publicarla. Puedes pedir que la retiren explicando que no das, o ya no das, tu consentimiento para que se difunda.',
        },
        {
          q: '¿Cuánto tarda la retirada?',
          r: 'Depende del sitio. Las grandes plataformas suelen responder en pocos días. En Estados Unidos, la ley TAKE IT DOWN obliga a las plataformas afectadas a retirar el contenido en 48 horas tras una solicitud válida. Los sitios pequeños y anónimos requieren más gestiones.',
        },
        {
          q: '¿Tengo que denunciar ante la policía?',
          r: 'Es tu decisión. Difundir una imagen íntima sin consentimiento es delito en muchos países, como España, México, Francia y Estados Unidos. No es obligatorio denunciar para pedir la retirada, pero sí recomendable si hay amenazas o chantaje.',
        },
      ],
    },
    en: {
      h1: 'Your intimate images were shared without consent: what to do',
      seo: 'Intimate images shared without consent: get them removed',
      meta: 'An intimate photo or video of you is online? The official steps, in order, to get it removed and stop it from spreading.',
      carte: 'An intimate image of you is online.',
      intro:
        "What is happening to you is not your fault, even if you sent the content yourself or agreed at first. The law protects you in most countries, and major platforms have priority procedures for this kind of content.",
      premiers: [
        "Write down the links (web addresses) where the content appears, with the date. Don't download or forward the content itself.",
        'Report each link with the platform’s official form, choosing the category for intimate content shared without consent.',
        "If you're an adult, create a digital fingerprint on StopNCII.org: partner platforms can then block new uploads of the same image, without the image ever leaving your phone.",
        'Also ask Google and Bing to remove it from search results: both have forms dedicated to intimate images.',
      ],
      eviter: [
        'Never pay someone who threatens to publish: paying rarely stops blackmail.',
        "Don't contact the person who posted it directly, especially if they're threatening you.",
        "Don't delete threatening messages: they are evidence.",
      ],
      faq: [
        {
          q: 'What if I sent the photo myself?',
          r: "Sharing an image with someone doesn't give them the right to publish it. You can ask for removal by explaining that you do not, or no longer, consent to it being shared.",
        },
        {
          q: 'How long does removal take?',
          r: 'It depends on the site. Major platforms often answer within a few days. In the US, the TAKE IT DOWN Act requires covered platforms to remove the content within 48 hours of a valid request. Small anonymous sites take more steps.',
        },
        {
          q: 'Should I go to the police?',
          r: "It's your choice. Sharing an intimate image without consent is a crime in many countries, including the US, the UK, France, Spain and Mexico. You don't need a police report to request removal, but it's recommended if there are threats or blackmail.",
        },
      ],
    },
  },

  deepfake: {
    fr: {
      h1: 'Un deepfake de vous circule : le faire retirer, porter plainte',
      seo: 'Deepfake de vous : le faire supprimer et porter plainte',
      meta: 'Une fausse image intime de vous, créée par IA, circule ? Elle peut être retirée comme une vraie. Les démarches, plateforme par plateforme.',
      carte: 'Une fausse image de vous, créée par IA, circule.',
      intro:
        'Une image truquée par intelligence artificielle reste une atteinte grave, même si « ce n’est pas vraiment vous ». De plus en plus de lois et toutes les grandes plateformes la traitent comme un contenu intime non consenti.',
      premiers: [
        'Notez les liens et la date. Ne partagez pas l’image, même pour prévenir des proches : envoyez plutôt le lien.',
        'Signalez-la sur chaque plateforme comme contenu intime non consenti ou comme image manipulée par IA.',
        'Demandez à Google et à Bing de retirer les résultats : Google propose une démarche dédiée aux fausses images explicites.',
        'Si vous êtes majeur·e, l’outil StopNCII.org fonctionne aussi pour les images truquées.',
      ],
      eviter: [
        'Ne payez pas et ne négociez pas avec la personne qui diffuse.',
        'Ne tentez pas de « prouver » publiquement que c’est un faux en republiant l’image.',
      ],
      faq: [
        {
          q: 'Est-ce illégal si l’image est fausse ?',
          r: 'Dans de plus en plus de pays, oui. En France, la loi de 2024 sur l’espace numérique punit la diffusion d’un montage sexuel d’une personne sans son accord (article 226-8-1 du Code pénal). Aux États-Unis, la loi TAKE IT DOWN vise aussi les images générées par IA.',
        },
        {
          q: 'Dois-je prouver que c’est un montage ?',
          r: 'En général non : les procédures visent la diffusion sans consentement. Si vous avez la photo d’origine (habillée), gardez-la : elle peut aider.',
        },
      ],
    },
    es: {
      h1: 'Hicieron un deepfake de ti: cómo eliminarlo y denunciar',
      seo: 'Deepfake de ti: cómo eliminarlo y denunciarlo',
      meta: '¿Circula una imagen íntima falsa tuya creada con IA? Se puede retirar igual que una real. Los pasos, plataforma por plataforma.',
      carte: 'Circula una imagen falsa tuya creada con IA.',
      intro:
        'Una imagen manipulada con inteligencia artificial es una agresión grave, aunque «no seas tú de verdad». Cada vez más leyes y todas las grandes plataformas la tratan como contenido íntimo sin consentimiento.',
      premiers: [
        'Anota los enlaces y la fecha. No compartas la imagen, ni siquiera para avisar a tus cercanos: envía el enlace.',
        'Denúnciala en cada plataforma como contenido íntimo sin consentimiento o como imagen manipulada con IA.',
        'Pide a Google y a Bing que retiren los resultados: Google tiene un procedimiento específico para imágenes explícitas falsas.',
        'Si eres mayor de edad, StopNCII.org también funciona con imágenes manipuladas.',
      ],
      eviter: [
        'No pagues ni negocies con quien la difunde.',
        'No intentes «demostrar» en público que es falsa volviendo a publicar la imagen.',
      ],
      faq: [
        {
          q: '¿Es ilegal si la imagen es falsa?',
          r: 'En cada vez más países, sí. En Estados Unidos, la ley TAKE IT DOWN incluye las imágenes generadas con IA. En Francia, la ley de 2024 castiga difundir un montaje sexual de una persona sin su consentimiento. Revisa la situación en tu país en nuestra página de recursos.',
        },
        {
          q: '¿Tengo que demostrar que es un montaje?',
          r: 'Por lo general, no: los procedimientos se centran en la difusión sin consentimiento. Si tienes la foto original (vestida), guárdala: puede ayudar.',
        },
      ],
    },
    en: {
      h1: 'Someone made a deepfake of you: report it and get it removed',
      seo: 'How to report a deepfake of you (Instagram, TikTok, X)',
      meta: 'A fake intimate image of you, made with AI, is circulating? It can be removed just like a real one. The steps, platform by platform.',
      carte: 'A fake image of you, made with AI, is circulating.',
      intro:
        "An image faked with artificial intelligence is still a serious violation, even if \"it isn't really you\". More and more laws, and every major platform, treat it as non-consensual intimate content.",
      premiers: [
        "Write down the links and the date. Don't share the image, not even to warn people close to you: send the link instead.",
        'Report it on each platform as non-consensual intimate content or as an AI-manipulated image.',
        'Ask Google and Bing to remove the results: Google has a dedicated process for fake explicit images.',
        "If you're an adult, StopNCII.org also works for faked images.",
      ],
      eviter: [
        "Don't pay or negotiate with the person spreading it.",
        "Don't try to publicly \"prove\" it's fake by reposting the image.",
      ],
      faq: [
        {
          q: 'Is it illegal if the image is fake?',
          r: 'In more and more places, yes. In the US, the TAKE IT DOWN Act covers AI-generated images. France punishes sharing a sexual deepfake of someone without consent since 2024. Check your country on our remedies page.',
        },
        {
          q: 'Do I have to prove it is fake?',
          r: 'Usually not: the procedures target sharing without consent. If you have the original (clothed) photo, keep it: it can help.',
        },
      ],
    },
  },

  usurpation: {
    fr: {
      h1: 'Un faux profil à votre nom : le faire supprimer partout',
      seo: 'Faux profil, usurpation d’identité en ligne : que faire',
      meta: 'Quelqu’un se fait passer pour vous sur Instagram, Facebook, TikTok… Les formulaires officiels pour faire supprimer un faux profil, même sans compte.',
      carte: 'Quelqu’un se fait passer pour vous.',
      intro:
        'Quelqu’un utilise vos photos ou votre nom pour se faire passer pour vous ? Toutes les grandes plateformes interdisent l’usurpation d’identité et proposent un formulaire pour la signaler, souvent même sans avoir de compte.',
      premiers: [
        'Faites une capture d’écran du faux profil (avec son adresse et la date) et copiez son lien.',
        'Signalez-le avec le formulaire « usurpation d’identité » de la plateforme. Préparez une pièce d’identité : certaines plateformes la demandent pour vérifier que c’est bien vous.',
        'Prévenez vos contacts que ce profil n’est pas vous, sans relayer son contenu.',
        'Si le faux profil sert à escroquer ou à nuire, portez plainte. En France, usurper l’identité de quelqu’un en ligne est un délit (article 226-4-1 du Code pénal).',
      ],
      eviter: [
        'N’envoyez jamais votre pièce d’identité à quelqu’un qui propose de « vous aider » par message : utilisez uniquement les formulaires officiels.',
        'N’interagissez pas avec le faux profil.',
      ],
      faq: [
        {
          q: 'Et si je n’ai pas de compte sur cette plateforme ?',
          r: 'La plupart des grandes plateformes ont un formulaire accessible sans compte pour signaler une usurpation d’identité. Les liens sont sur cette page.',
        },
        {
          q: 'Combien de temps faut-il ?',
          r: 'Souvent quelques jours. Si rien ne bouge au bout d’une semaine, renouvelez le signalement et passez à l’étape suivante.',
        },
      ],
    },
    es: {
      h1: 'Suplantan tu identidad en redes sociales: qué hacer',
      seo: 'Suplantación de identidad en redes sociales: qué hacer',
      meta: '¿Alguien se hace pasar por ti en Instagram, Facebook o TikTok? Los formularios oficiales para eliminar un perfil falso, incluso sin tener cuenta.',
      carte: 'Alguien se hace pasar por ti.',
      intro:
        '¿Alguien usa tus fotos o tu nombre para hacerse pasar por ti? Todas las grandes plataformas prohíben la suplantación de identidad y tienen un formulario para denunciarla, a menudo sin necesidad de tener cuenta.',
      premiers: [
        'Haz una captura de pantalla del perfil falso (con su dirección y la fecha) y copia su enlace.',
        'Denúncialo con el formulario de «suplantación de identidad» de la plataforma. Ten a mano un documento de identidad: algunas plataformas lo piden para comprobar que eres tú.',
        'Avisa a tus contactos de que ese perfil no eres tú, sin compartir su contenido.',
        'Si el perfil falso se usa para estafar o hacer daño, denúncialo ante la policía.',
      ],
      eviter: [
        'Nunca envíes tu documento de identidad a alguien que se ofrece a «ayudarte» por mensaje: usa solo los formularios oficiales.',
        'No interactúes con el perfil falso.',
      ],
      faq: [
        {
          q: '¿Y si no tengo cuenta en esa plataforma?',
          r: 'La mayoría de las grandes plataformas tienen un formulario accesible sin cuenta para denunciar una suplantación. Los enlaces están en esta página.',
        },
        {
          q: '¿Cuánto tarda?',
          r: 'Suele tardar unos días. Si nada cambia en una semana, vuelve a denunciar y pasa al siguiente paso.',
        },
      ],
    },
    en: {
      h1: 'A fake account is pretending to be you: get it removed',
      seo: 'Someone is impersonating you online: what to do',
      meta: 'Someone is pretending to be you on Instagram, Facebook or TikTok? The official forms to get an impersonation account removed, even without an account.',
      carte: 'Someone is pretending to be you.',
      intro:
        'Someone is using your photos or name to pretend to be you? Every major platform bans impersonation and has a form to report it, often even if you don’t have an account.',
      premiers: [
        'Take a screenshot of the fake profile (with its address and the date) and copy its link.',
        'Report it with the platform’s impersonation form. Have an ID ready: some platforms ask for it to confirm it’s really you.',
        "Tell your contacts that this profile isn't you, without sharing its content.",
        'If the fake profile is used to scam or harm, report it to the police.',
      ],
      eviter: [
        'Never send your ID to someone offering to "help" by message: only use official forms.',
        "Don't interact with the fake profile.",
      ],
      faq: [
        {
          q: "What if I don't have an account on that platform?",
          r: 'Most major platforms have a form you can use without an account to report impersonation. The links are on this page.',
        },
        {
          q: 'How long does it take?',
          r: "Often a few days. If nothing happens after a week, report it again and move on to the next step.",
        },
      ],
    },
  },

  'piratage-compte': {
    fr: {
      h1: 'Compte piraté : que faire, plateforme par plateforme',
      seo: 'Compte piraté : que faire selon la plateforme',
      meta: 'Instagram, Facebook, TikTok, WhatsApp… votre compte est piraté ? Les pages officielles de récupération et les bons réflexes, étape par étape.',
      carte: 'Vous n’avez plus accès à votre compte.',
      intro:
        'Vous ne pouvez plus vous connecter, ou quelqu’un publie à votre place ? Agissez vite : chaque plateforme a une procédure de récupération, et plus vous agissez tôt, plus c’est simple.',
      premiers: [
        'Passez uniquement par la page officielle de récupération de la plateforme, jamais par un lien reçu par message : c’est souvent une arnaque.',
        'Si vous avez encore accès à votre e-mail, changez d’abord son mot de passe : c’est la clé de tous vos comptes.',
        'Une fois le compte récupéré : nouveau mot de passe unique, double authentification activée, déconnexion des appareils inconnus.',
        'Prévenez vos proches : le pirate peut leur demander de l’argent en se faisant passer pour vous.',
      ],
      eviter: [
        'Ne payez jamais un « hacker » qui promet de récupérer votre compte : ce sont presque toujours des escrocs.',
        'Ne donnez jamais un code reçu par SMS, même à un ami.',
      ],
      faq: [
        {
          q: 'Le pirate a changé mon e-mail et mon numéro : que faire ?',
          r: 'Les plateformes prévoient ce cas : lien envoyé à l’ancienne adresse, vérification d’identité, selfie vidéo… Suivez la page officielle « compte piraté » de la plateforme, dont le lien est sur cette page.',
        },
        {
          q: 'Et si le pirate a publié des contenus gênants ?',
          r: 'Signalez ces publications à la plateforme en précisant que le compte a été piraté, puis supprimez-les dès que vous avez récupéré l’accès.',
        },
      ],
    },
    es: {
      h1: 'Me hackearon la cuenta: qué hacer en cada plataforma',
      seo: 'Me hackearon la cuenta: qué hacer según la red social',
      meta: 'Instagram, Facebook, TikTok, WhatsApp… ¿te hackearon la cuenta? Las páginas oficiales de recuperación y qué hacer, paso a paso.',
      carte: 'Ya no puedes entrar a tu cuenta.',
      intro:
        '¿Ya no puedes entrar o alguien publica en tu nombre? Actúa rápido: cada plataforma tiene un procedimiento de recuperación, y cuanto antes actúes, más fácil será.',
      premiers: [
        'Usa solo la página oficial de recuperación de la plataforma, nunca un enlace recibido por mensaje: suele ser una estafa.',
        'Si todavía tienes acceso a tu correo, cambia primero su contraseña: es la llave de todas tus cuentas.',
        'Cuando recuperes la cuenta: contraseña nueva y única, verificación en dos pasos activada y cierre de sesión en los dispositivos desconocidos.',
        'Avisa a tus contactos: quien te hackeó puede pedirles dinero haciéndose pasar por ti.',
      ],
      eviter: [
        'Nunca le pagues a un «hacker» que promete recuperar tu cuenta: casi siempre son estafadores.',
        'Nunca compartas un código recibido por SMS, ni siquiera con un amigo.',
      ],
      faq: [
        {
          q: 'Cambiaron mi correo y mi número: ¿qué hago?',
          r: 'Las plataformas prevén este caso: enlace enviado al correo anterior, verificación de identidad, video selfie… Sigue la página oficial de «cuenta hackeada» de la plataforma; el enlace está en esta página.',
        },
        {
          q: '¿Y si publicaron contenido que me perjudica?',
          r: 'Denuncia esas publicaciones a la plataforma indicando que la cuenta fue hackeada, y bórralas en cuanto recuperes el acceso.',
        },
      ],
    },
    en: {
      h1: 'Your account was hacked: what to do, platform by platform',
      seo: 'Account hacked? What to do on each platform',
      meta: 'Instagram, Facebook, TikTok, WhatsApp… your account was hacked? The official recovery pages and what to do, step by step.',
      carte: "You can't get into your account anymore.",
      intro:
        "You can't log in, or someone is posting as you? Act fast: every platform has a recovery process, and the sooner you act, the easier it is.",
      premiers: [
        "Only use the platform's official recovery page, never a link sent to you in a message: that's often a scam.",
        "If you still have access to your email, change its password first: it's the key to all your accounts.",
        'Once you get the account back: a new unique password, two-factor authentication turned on, and unknown devices logged out.',
        'Warn your contacts: the hacker may ask them for money while pretending to be you.',
      ],
      eviter: [
        'Never pay a "hacker" who promises to recover your account: they are almost always scammers.',
        'Never share a code you received by text message, not even with a friend.',
      ],
      faq: [
        {
          q: 'The hacker changed my email and phone number. What now?',
          r: 'Platforms plan for this: a link sent to your old email, identity checks, a video selfie… Follow the platform’s official hacked-account page, linked on this page.',
        },
        {
          q: 'What if the hacker posted embarrassing content?',
          r: 'Report those posts to the platform, saying the account was hacked, then delete them as soon as you regain access.',
        },
      ],
    },
  },

  'faux-avis': {
    fr: {
      h1: 'Faux avis ou faux commentaires : comment les faire retirer',
      seo: 'Faux avis Google ou Trustpilot : les faire retirer',
      meta: 'Des avis inventés sur votre commerce ou des commentaires mensongers ? Ce que les plateformes acceptent de retirer, et comment le demander.',
      carte: 'De faux avis visent vous ou votre commerce.',
      intro:
        'Des avis inventés sur votre commerce, ou des commentaires mensongers à votre sujet ? Les plateformes d’avis retirent les avis faux ou contraires à leurs règles. Un avis négatif sincère, en revanche, est en général protégé : c’est la limite à connaître.',
      premiers: [
        'Repérez ce qui rend l’avis contraire aux règles : personne qui n’a jamais été cliente, concurrent ou ancien salarié, propos haineux, informations personnelles, avis en série.',
        'Signalez chaque avis avec le bouton prévu (Google Maps, Trustpilot…), en choisissant le motif exact.',
        'Répondez publiquement, avec calme et des faits : les autres lecteurs voient votre réponse.',
        'Si l’avis contient des accusations précises et fausses, cela peut relever de la diffamation. En France, le délai pour agir est de 3 mois après la publication.',
      ],
      eviter: [
        'Méfiez-vous des agences qui promettent la suppression garantie d’avis négatifs.',
        'Ne publiez pas de faux avis positifs en réponse : c’est une pratique commerciale trompeuse, sanctionnée.',
      ],
      faq: [
        {
          q: 'Peut-on faire retirer un avis négatif mais sincère ?',
          r: 'Rarement. Un client a le droit de donner son avis, même sévère. On peut en revanche contester un avis faux, injurieux, ou qui ne vient pas d’un vrai client.',
        },
        {
          q: 'Et si les faux avis viennent d’un concurrent ?',
          r: 'Rassemblez les indices (dates, comptes créés le même jour, style identique) et joignez-les au signalement. En cas de campagne organisée, une action en justice peut s’envisager avec un avocat.',
        },
      ],
    },
    es: {
      h1: 'Reseñas o comentarios falsos: cómo conseguir que los retiren',
      seo: 'Reseñas falsas en Google o Trustpilot: retirarlas',
      meta: '¿Reseñas inventadas sobre tu negocio o comentarios falsos sobre ti? Lo que las plataformas aceptan retirar y cómo pedirlo.',
      carte: 'Reseñas falsas contra ti o tu negocio.',
      intro:
        '¿Reseñas inventadas sobre tu negocio o comentarios falsos sobre ti? Las plataformas de reseñas retiran las reseñas falsas o contrarias a sus normas. Una reseña negativa pero sincera, en cambio, suele estar protegida: es el límite que hay que conocer.',
      premiers: [
        'Identifica qué hace que la reseña incumpla las normas: alguien que nunca fue cliente, un competidor o un exempleado, discurso de odio, datos personales, reseñas en serie.',
        'Denuncia cada reseña con el botón previsto (Google Maps, Trustpilot…), eligiendo el motivo exacto.',
        'Responde en público, con calma y con hechos: los demás lectores ven tu respuesta.',
        'Si la reseña contiene acusaciones concretas y falsas, puede ser difamación: consulta los plazos de tu país, a veces son cortos.',
      ],
      eviter: [
        'Desconfía de las agencias que prometen eliminar reseñas negativas «garantizado».',
        'No publiques reseñas positivas falsas como respuesta: es una práctica comercial engañosa y sancionable.',
      ],
      faq: [
        {
          q: '¿Se puede retirar una reseña negativa pero sincera?',
          r: 'Pocas veces. Un cliente tiene derecho a opinar, aunque sea con dureza. Sí se puede impugnar una reseña falsa, insultante o que no viene de un cliente real.',
        },
        {
          q: '¿Y si las reseñas falsas vienen de un competidor?',
          r: 'Reúne indicios (fechas, cuentas creadas el mismo día, mismo estilo) y añádelos a la denuncia. Si es una campaña organizada, se puede valorar una acción judicial con un abogado.',
        },
      ],
    },
    en: {
      h1: 'Fake reviews or comments: how to get them removed',
      seo: 'Fake Google or Trustpilot reviews: remove them',
      meta: 'Made-up reviews about your business or false comments about you? What platforms agree to remove, and how to ask.',
      carte: 'Fake reviews target you or your business.',
      intro:
        "Made-up reviews about your business, or false comments about you? Review platforms remove reviews that are fake or break their rules. An honest negative review, however, is usually protected: that's the line to know.",
      premiers: [
        'Spot what makes the review break the rules: someone who was never a customer, a competitor or former employee, hate speech, personal information, a wave of reviews.',
        'Report each review with the button provided (Google Maps, Trustpilot…), choosing the exact reason.',
        'Reply publicly, calmly and with facts: other readers see your answer.',
        'If the review contains specific false accusations, it may be defamation: check the time limits in your country, they can be short.',
      ],
      eviter: [
        'Be wary of agencies promising "guaranteed" removal of negative reviews.',
        "Don't post fake positive reviews in response: it's a deceptive practice and can be penalised.",
      ],
      faq: [
        {
          q: 'Can an honest negative review be removed?',
          r: 'Rarely. Customers have the right to give their opinion, even a harsh one. You can, however, challenge a review that is fake, abusive, or not from a real customer.',
        },
        {
          q: 'What if the fake reviews come from a competitor?',
          r: 'Gather the clues (dates, accounts created the same day, identical style) and add them to your report. For an organised campaign, legal action can be considered with a lawyer.',
        },
      ],
    },
  },

  diffamation: {
    fr: {
      h1: 'Harcèlement ou diffamation en ligne : que faire, étape par étape',
      seo: 'Harcèlement sur les réseaux sociaux, diffamation : que faire',
      meta: 'Accusations fausses, insultes, messages répétés contre vous en ligne ? Les démarches pour faire retirer, les preuves à garder, et le délai de 3 mois à ne pas rater.',
      carte: 'On vous accuse ou on vous harcèle en ligne.',
      intro:
        'Des accusations fausses, des insultes, des messages répétés contre vous ? Les plateformes interdisent le harcèlement, et la loi sanctionne la diffamation et le cyberharcèlement. Attention : en France, le délai pour agir en diffamation est très court, 3 mois à partir de la publication.',
      premiers: [
        'Notez la date de la première publication : c’est elle qui compte pour les délais, pas le jour où vous la découvrez.',
        'Faites des captures d’écran complètes : adresse de la page, date, nom du compte, texte entier.',
        'Signalez les publications à la plateforme (harcèlement, propos haineux, fausses informations sur une personne).',
        'Si ça continue ou si c’est grave, portez plainte. Les numéros d’aide de votre pays sont sur notre page Aide urgente.',
      ],
      eviter: [
        'Ne répondez pas sur le même ton : vos réponses peuvent être retournées contre vous.',
        'Ne supprimez pas les messages reçus avant d’en avoir fait des captures.',
      ],
      faq: [
        {
          q: 'Quelle différence entre diffamation et injure ?',
          r: 'En droit français, la diffamation accuse quelqu’un d’un fait précis qui porte atteinte à son honneur (« il a volé dans la caisse »). L’injure est une expression outrageante sans fait précis, comme une insulte. Les deux sont punies, avec des délais stricts.',
        },
        {
          q: 'Le délai de 3 mois s’applique-t-il partout ?',
          r: 'Non, il est propre au droit français de la presse. Les autres pays ont leurs propres règles. Dans tous les cas, agissez vite.',
        },
      ],
    },
    es: {
      h1: 'Difamación o acoso en internet: qué hacer',
      seo: 'Difamación o acoso en internet: qué hacer',
      meta: '¿Acusaciones falsas, insultos o mensajes repetidos contra ti en internet? Cómo pedir que lo retiren, qué pruebas guardar y por qué no esperar.',
      carte: 'Te acusan o te acosan en internet.',
      intro:
        '¿Acusaciones falsas, insultos o mensajes repetidos contra ti? Las plataformas prohíben el acoso, y la ley castiga la difamación y el ciberacoso. Los plazos para actuar pueden ser cortos según el país: no esperes.',
      premiers: [
        'Anota la fecha de la primera publicación: es la que cuenta para los plazos, no el día en que la descubres.',
        'Haz capturas de pantalla completas: dirección de la página, fecha, nombre de la cuenta, texto entero.',
        'Denuncia las publicaciones a la plataforma (acoso, discurso de odio, información falsa sobre una persona).',
        'Si continúa o es grave, denuncia ante la policía. Los números de ayuda de tu país están en nuestra página de Ayuda urgente.',
      ],
      eviter: [
        'No respondas en el mismo tono: tus respuestas pueden usarse en tu contra.',
        'No borres los mensajes recibidos antes de hacer capturas.',
      ],
      faq: [
        {
          q: '¿Qué diferencia hay entre difamación e injuria?',
          r: 'En general, la difamación (o calumnia, según el país) atribuye a alguien un hecho concreto que daña su honor. La injuria es una expresión ofensiva sin hecho concreto, como un insulto. Las reglas exactas dependen de cada país.',
        },
        {
          q: '¿Hay un plazo para actuar?',
          r: 'Sí, y puede ser corto. En Francia, por ejemplo, es de solo 3 meses desde la publicación. Actúa rápido en cualquier caso.',
        },
      ],
    },
    en: {
      h1: 'Online defamation or harassment: what to do',
      seo: 'Online defamation or harassment: what to do',
      meta: 'False accusations, insults or repeated messages against you online? How to get them removed, what evidence to keep, and why you shouldn’t wait.',
      carte: "You're being accused or harassed online.",
      intro:
        'False accusations, insults, repeated messages against you? Platforms ban harassment, and the law punishes defamation and cyberstalking. Time limits to act can be short depending on the country: don’t wait.',
      premiers: [
        'Note the date of the first publication: that is what counts for time limits, not the day you found it.',
        'Take complete screenshots: page address, date, account name, full text.',
        'Report the posts to the platform (harassment, hate speech, false information about a person).',
        'If it continues or is serious, report it to the police. Helplines for your country are on our Urgent help page.',
      ],
      eviter: [
        "Don't reply in the same tone: your replies can be used against you.",
        "Don't delete the messages you received before taking screenshots.",
      ],
      faq: [
        {
          q: 'What is the difference between defamation and an insult?',
          r: 'Broadly, defamation accuses someone of a specific fact that harms their reputation. An insult is an offensive expression without a specific fact. The exact rules depend on each country.',
        },
        {
          q: 'Is there a deadline to act?',
          r: 'Yes, and it can be short. In France, for example, it is only 3 months from publication. Act quickly in any case.',
        },
      ],
    },
  },

  'donnees-personnelles': {
    fr: {
      h1: 'Adresse, téléphone ou papiers publiés en ligne : comment les retirer',
      seo: 'Mes données publiées en ligne : les faire retirer',
      meta: 'Votre adresse, votre numéro ou vos papiers d’identité sont en ligne sans votre accord ? Le droit à l’effacement (RGPD) et les outils de Google, étape par étape.',
      carte: 'Votre adresse ou vos papiers sont exposés.',
      intro:
        'Votre adresse, votre numéro, vos papiers d’identité ou des informations privées sont en ligne sans votre accord ? Vous pouvez en demander l’effacement. Dans l’Union européenne, le RGPD vous donne un droit à l’effacement, et Google permet de retirer des résultats qui affichent vos coordonnées.',
      premiers: [
        'Listez les pages concernées (leurs liens) et ce qu’elles montrent.',
        'Demandez au site de supprimer vos données, via son formulaire de contact ou l’adresse indiquée dans sa politique de confidentialité. Dans l’UE, il doit en principe répondre sous un mois.',
        'Demandez à Google de retirer les résultats qui affichent vos coordonnées (outil « Résultats vous concernant »).',
        'Sans réponse, saisissez l’autorité de protection des données de votre pays (CNIL en France, AEPD en Espagne…).',
      ],
      eviter: [
        'Ne partagez pas la page sur les réseaux pour demander de l’aide : vous lui donneriez plus de visibilité.',
      ],
      faq: [
        {
          q: 'Le site est hors d’Europe : le RGPD s’applique-t-il ?',
          r: 'Souvent oui, si le site s’adresse à des personnes en Europe. Sinon, d’autres portes existent : l’hébergeur, la société qui gère le nom de domaine, et le déréférencement dans les moteurs de recherche.',
        },
        {
          q: 'Le déréférencement supprime-t-il la page ?',
          r: 'Non. Il retire le lien des résultats de recherche, mais la page reste en ligne. C’est un complément utile, pas une solution complète.',
        },
      ],
    },
    es: {
      h1: 'Dirección, teléfono o documentos publicados en internet: cómo retirarlos',
      seo: 'Mis datos publicados en internet: cómo borrarlos',
      meta: '¿Tu dirección, tu número o tus documentos están en internet sin tu permiso? El derecho de supresión y las herramientas de Google, paso a paso.',
      carte: 'Tu dirección o tus documentos están expuestos.',
      intro:
        '¿Tu dirección, tu número, tus documentos de identidad o información privada están en internet sin tu permiso? Puedes pedir que los borren. En la Unión Europea, el RGPD te da derecho de supresión, y Google permite retirar resultados que muestran tus datos de contacto.',
      premiers: [
        'Haz una lista de las páginas (sus enlaces) y de lo que muestran.',
        'Pide al sitio que borre tus datos, con su formulario de contacto o el correo de su política de privacidad. En la UE, en principio debe responder en un mes.',
        'Pide a Google que retire los resultados que muestran tus datos de contacto (herramienta «Resultados sobre ti»).',
        'Si no responden, acude a la autoridad de protección de datos de tu país (la AEPD en España, por ejemplo).',
      ],
      eviter: ['No compartas la página en redes para pedir ayuda: le darías más visibilidad.'],
      faq: [
        {
          q: 'El sitio está fuera de Europa: ¿se aplica el RGPD?',
          r: 'A menudo sí, si el sitio se dirige a personas en Europa. Si no, hay otras vías: el proveedor que aloja el sitio, la empresa que gestiona el dominio y la desindexación en los buscadores.',
        },
        {
          q: '¿La desindexación borra la página?',
          r: 'No. Quita el enlace de los resultados de búsqueda, pero la página sigue en línea. Es un complemento útil, no una solución completa.',
        },
      ],
    },
    en: {
      h1: 'Address, phone or ID posted online: how to get it removed',
      seo: 'My personal info is online: get it removed',
      meta: 'Your address, number or ID documents are online without your consent? Your right to erasure and Google’s removal tools, step by step.',
      carte: 'Your address or ID is exposed.',
      intro:
        'Your address, phone number, ID documents or private information are online without your consent? You can ask for them to be erased. In the European Union, the GDPR gives you a right to erasure, and Google lets you remove results showing your contact details.',
      premiers: [
        'List the pages concerned (their links) and what they show.',
        'Ask the site to delete your data, through its contact form or the address in its privacy policy. In the EU, it must generally answer within one month.',
        'Ask Google to remove results showing your contact details (the "Results about you" tool).',
        'If there is no answer, contact the data protection authority in your country.',
      ],
      eviter: ["Don't share the page on social media to ask for help: you would give it more visibility."],
      faq: [
        {
          q: 'The site is outside Europe. Does the GDPR apply?',
          r: 'Often yes, if the site targets people in Europe. If not, other doors exist: the hosting company, the company managing the domain name, and removal from search engines.',
        },
        {
          q: 'Does search-engine removal delete the page?',
          r: 'No. It removes the link from search results, but the page stays online. It is a useful extra, not a complete solution.',
        },
      ],
    },
  },

  'droit-auteur': {
    fr: {
      h1: 'Quelqu’un utilise vos photos : comment les faire retirer',
      seo: 'Quelqu’un utilise vos photos sans accord : que faire',
      meta: 'Une photo que vous avez prise est réutilisée sans votre accord ? Le droit d’auteur permet souvent un retrait rapide. Les démarches et leurs limites.',
      carte: 'Votre photo est utilisée sans votre accord.',
      intro:
        'Si vous avez pris la photo vous-même, y compris un selfie, vous en êtes l’auteur·e. Vous pouvez demander son retrait au titre du droit d’auteur, une voie souvent traitée très vite par les plateformes.',
      premiers: [
        'Rassemblez la preuve que la photo est à vous : l’original avec sa date, une publication antérieure.',
        'Utilisez le formulaire « droit d’auteur » de la plateforme ou du site (souvent appelé DMCA).',
        'Si la photo vous montre, signalez aussi l’atteinte à votre vie privée : les deux démarches peuvent être menées en parallèle.',
      ],
      eviter: [
        'N’utilisez la voie du droit d’auteur que si vous êtes vraiment l’auteur·e : une fausse déclaration engage votre responsabilité.',
        'Sachez que la personne visée peut contester : le contenu peut alors être remis en ligne après 10 à 14 jours ouvrés, sauf action en justice aux États-Unis.',
      ],
      faq: [
        {
          q: 'Et si quelqu’un d’autre a pris la photo de moi ?',
          r: 'Dans ce cas, le droit d’auteur appartient au photographe. Vous passez plutôt par le droit à l’image, la vie privée ou les règles de la plateforme.',
        },
      ],
    },
    es: {
      h1: 'Alguien usa tus fotos sin permiso: qué hacer',
      seo: 'Usan tus fotos sin permiso: cómo hacer que las quiten',
      meta: '¿Usan sin tu permiso una foto que tomaste tú? Los derechos de autor suelen permitir una retirada rápida. Los pasos y sus límites.',
      carte: 'Usan tu foto sin tu permiso.',
      intro:
        'Si tomaste la foto tú, incluso un selfie, eres su autor o autora. Puedes pedir que la retiren por derechos de autor, una vía que las plataformas suelen tramitar muy rápido.',
      premiers: [
        'Reúne pruebas de que la foto es tuya: el original con su fecha, una publicación anterior.',
        'Usa el formulario de «derechos de autor» de la plataforma o del sitio (a menudo llamado DMCA).',
        'Si la foto te muestra a ti, denuncia también la vulneración de tu privacidad: ambas gestiones pueden hacerse a la vez.',
      ],
      eviter: [
        'Usa la vía de derechos de autor solo si de verdad eres el autor: una declaración falsa tiene consecuencias.',
        'La persona denunciada puede impugnar: el contenido podría volver a publicarse tras 10 a 14 días hábiles, salvo acción judicial en Estados Unidos.',
      ],
      faq: [
        {
          q: '¿Y si otra persona me tomó la foto?',
          r: 'En ese caso, los derechos de autor son del fotógrafo. Mejor usa el derecho a la propia imagen, la privacidad o las normas de la plataforma.',
        },
      ],
    },
    en: {
      h1: 'Someone posted your photo without permission: get it removed',
      seo: 'Someone posted your picture without permission: what to do',
      meta: 'A photo you took is being reused without your permission? Copyright often allows fast removal. The steps and their limits.',
      carte: 'Your photo is used without your permission.',
      intro:
        'If you took the photo yourself, selfies included, you are its author. You can ask for removal on copyright grounds, a route platforms often handle very quickly.',
      premiers: [
        'Gather proof that the photo is yours: the original with its date, an earlier post.',
        'Use the copyright form of the platform or site (often called a DMCA form).',
        'If the photo shows you, also report the privacy violation: both can be done in parallel.',
      ],
      eviter: [
        'Only use the copyright route if you really are the author: a false statement carries legal responsibility.',
        'The other side can object: the content may then be restored after 10 to 14 business days unless a lawsuit is filed in the US.',
      ],
      faq: [
        {
          q: 'What if someone else took the photo of me?',
          r: 'Then the copyright belongs to the photographer. Use privacy rights, image rights or the platform’s rules instead.',
        },
      ],
    },
  },

  chantage: {
    fr: {
      h1: 'On menace de publier vos photos : que faire maintenant',
      seo: 'Sextorsion, chantage aux photos : que faire maintenant',
      meta: 'Quelqu’un menace de publier des images de vous ? Ne payez pas. Les bons réflexes, les numéros d’aide et les outils pour bloquer la publication.',
      carte: 'Quelqu’un vous menace ou vous fait chanter.',
      intro:
        'Quelqu’un menace de publier des images de vous si vous ne payez pas ou n’obéissez pas ? Vous n’êtes pas seul·e et ce n’est pas votre faute. C’est un délit, et il existe des moyens d’agir, sans payer.',
      premiers: [
        'Ne payez pas et n’envoyez plus rien : payer arrête rarement le chantage, cela le relance souvent.',
        'Arrêtez la conversation, mais ne supprimez rien : faites des captures (profil, messages, numéros, demandes d’argent).',
        'Bloquez la personne et signalez son compte à la plateforme.',
        'Prévenez la police et parlez-en à quelqu’un de confiance. Les numéros d’aide de votre pays sont sur notre page Aide urgente.',
        'Si des images existent : StopNCII.org (si vous êtes majeur·e) ou Take It Down (images prises avant vos 18 ans) permettent de bloquer leur publication sur de grandes plateformes.',
      ],
      eviter: ['Ne restez pas seul·e avec ça, et ne vous mettez pas en danger pour « régler ça » vous-même.'],
      faq: [
        {
          q: 'Et s’ils ont vraiment les images ?',
          r: 'Même dans ce cas, payer ne garantit rien. Les outils comme StopNCII permettent de bloquer à l’avance la publication sur de grandes plateformes, et les publications qui apparaîtraient peuvent être signalées et retirées.',
        },
        {
          q: 'Je suis mineur·e. Que faire ?',
          r: 'Parlez-en tout de suite à un adulte de confiance et à la police. Le service Take It Down aide à faire retirer les images prises avant vos 18 ans. Devuelta ne prend pas de dossier payant concernant une personne mineure : nous vous orientons vers les services officiels, gratuits.',
        },
      ],
    },
    es: {
      h1: '¿Te amenazan con publicar tus fotos? Qué hacer ahora mismo',
      seo: 'Me amenazan con publicar mis fotos: qué hacer ahora',
      meta: '¿Alguien amenaza con publicar imágenes tuyas? No pagues. Qué hacer, los números de ayuda y las herramientas para bloquear la publicación.',
      carte: 'Alguien te amenaza o te chantajea.',
      intro:
        '¿Alguien amenaza con publicar imágenes tuyas si no pagas o no obedeces? No estás sol@ y no es tu culpa. Es un delito, y hay formas de actuar sin pagar.',
      premiers: [
        'No pagues y no envíes nada más: pagar casi nunca detiene el chantaje, y a menudo lo empeora.',
        'Corta la conversación, pero no borres nada: haz capturas (perfil, mensajes, números, peticiones de dinero).',
        'Bloquea a la persona y denuncia su cuenta a la plataforma.',
        'Avisa a la policía y habla con alguien de confianza. Los números de ayuda de tu país están en nuestra página de Ayuda urgente.',
        'Si existen imágenes: StopNCII.org (si eres mayor de edad) o Take It Down (imágenes de antes de tus 18 años) permiten bloquear su publicación en grandes plataformas.',
      ],
      eviter: ['No te quedes sol@ con esto, y no te pongas en riesgo para «resolverlo» por tu cuenta.'],
      faq: [
        {
          q: '¿Y si de verdad tienen las imágenes?',
          r: 'Aun así, pagar no garantiza nada. Herramientas como StopNCII permiten bloquear de antemano la publicación en grandes plataformas, y lo que se publique se puede denunciar y retirar.',
        },
        {
          q: 'Soy menor de edad. ¿Qué hago?',
          r: 'Cuéntaselo ya a un adulto de confianza y a la policía. El servicio Take It Down ayuda a retirar imágenes tomadas antes de tus 18 años. Devuelta no acepta casos de pago de personas menores: te orientamos hacia los servicios oficiales y gratuitos.',
        },
      ],
    },
    en: {
      h1: 'Someone is blackmailing you with pictures: what to do now',
      seo: 'Blackmailed with your pictures? What to do right now',
      meta: 'Someone is threatening to post images of you? Don’t pay. What to do, helplines, and the tools that block publication.',
      carte: 'Someone is threatening or blackmailing you.',
      intro:
        "Someone is threatening to post images of you unless you pay or obey? You're not alone and it's not your fault. It's a crime, and there are ways to act without paying.",
      premiers: [
        "Don't pay and don't send anything else: paying rarely stops blackmail, and often makes it worse.",
        'Stop the conversation, but delete nothing: take screenshots (profile, messages, numbers, demands for money).',
        "Block the person and report their account to the platform.",
        'Tell the police and talk to someone you trust. Helplines for your country are on our Urgent help page.',
        'If images exist: StopNCII.org (if you are an adult) or Take It Down (images from before you turned 18) can block them from being posted on major platforms.',
      ],
      eviter: ["Don't carry this alone, and don't put yourself at risk trying to \"sort it out\" yourself."],
      faq: [
        {
          q: 'What if they really have the images?',
          r: 'Even then, paying guarantees nothing. Tools like StopNCII block publication on major platforms in advance, and anything that does get posted can be reported and removed.',
        },
        {
          q: "I'm under 18. What should I do?",
          r: "Tell a trusted adult and the police right away. Take It Down helps remove images taken before you turned 18. Devuelta does not take paid cases involving minors: we point you to official, free services.",
        },
      ],
    },
  },
};

export const SITUATIONS_ORDRE: SituationReelle[] = [
  'usurpation',
  'piratage-compte',
  'contenu-intime',
  'deepfake',
  'chantage',
  'diffamation',
  'faux-avis',
  'donnees-personnelles',
  'droit-auteur',
];

export const QUE_FAIRE: Record<'titre' | 'seo' | 'meta' | 'intro' | 'plateformesTitre' | 'premiersTitre' | 'eviterTitre' | 'faqTitre' | 'recoursTitre' | 'parPlateforme' | 'toutesPlateformes', T3> = {
  titre: { fr: 'Que faire ? Choisissez votre situation', es: '¿Qué hacer? Elige tu situación', en: 'What to do? Choose your situation' },
  seo: {
    fr: 'Faire retirer un contenu d’internet : que faire',
    es: 'Retirar un contenido de internet: qué hacer',
    en: 'Get content removed from the internet',
  },
  meta: {
    fr: 'Faux profil, compte piraté, photo intime, deepfake, faux avis, diffamation, données exposées : les démarches officielles, situation par situation.',
    es: 'Perfil falso, cuenta hackeada, foto íntima, deepfake, reseñas falsas, difamación, datos expuestos: los pasos oficiales, caso por caso.',
    en: 'Fake profile, hacked account, intimate image, deepfake, fake reviews, defamation, exposed data: the official steps, case by case.',
  },
  intro: {
    fr: 'Chaque situation a ses propres démarches. Choisissez la vôtre : vous trouverez les premières choses à faire, les formulaires officiels de chaque plateforme, et ce qu’il reste possible si le formulaire ne donne rien.',
    es: 'Cada situación tiene sus propios pasos. Elige la tuya: encontrarás lo primero que hay que hacer, los formularios oficiales de cada plataforma y lo que todavía se puede hacer si el formulario no da resultado.',
    en: "Each situation has its own steps. Pick yours: you'll find what to do first, each platform’s official forms, and what is still possible if the form gets nowhere.",
  },
  plateformesTitre: { fr: 'Selon la plateforme', es: 'Según la plataforma', en: 'By platform' },
  premiersTitre: { fr: 'Les premières choses à faire', es: 'Lo primero que hay que hacer', en: 'What to do first' },
  eviterTitre: { fr: 'À éviter', es: 'Lo que debes evitar', en: 'What to avoid' },
  faqTitre: { fr: 'Questions fréquentes', es: 'Preguntas frecuentes', en: 'Common questions' },
  recoursTitre: { fr: 'Vos recours selon le pays', es: 'Tus recursos según el país', en: 'Your remedies by country' },
  parPlateforme: { fr: 'Pas à pas sur', es: 'Paso a paso en', en: 'Step by step on' },
  toutesPlateformes: { fr: 'Toutes les plateformes', es: 'Todas las plataformas', en: 'All platforms' },
};
