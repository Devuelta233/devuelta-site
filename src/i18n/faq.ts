// Questions fréquentes : les inquiétudes d'une personne qui hésite à nous
// confier quelque chose de personnel. Réponses courtes, calmes, sans promesse,
// cohérentes avec la méthode, les tarifs et les conditions de vente.

import type { PageFixe } from './routes';
import type { T3 } from '../../shared/vocab';

export interface QuestionFaq {
  q: T3;
  r: T3;
  /** Page du site qui détaille la réponse. */
  lien?: PageFixe;
  /** Phrase ajoutée quand le robot Telegram est en service ({robot} = son nom). */
  telegram?: T3;
}

export interface GroupeFaq {
  titre: T3;
  questions: QuestionFaq[];
}

export const FAQ_PAGE = {
  seo: {
    fr: 'Questions fréquentes : légalité, discrétion, délais, prix',
    es: 'Preguntas frecuentes: legalidad, discreción, plazos, precio',
    en: 'FAQ: is it legal, is it discreet, how long, how much',
  } as T3,
  meta: {
    fr: 'Est-ce légal ? Faut-il envoyer les images ? Combien de temps, combien ça coûte ? Nos réponses claires aux questions qu’on nous pose le plus.',
    es: '¿Es legal? ¿Hay que enviar las imágenes? ¿Cuánto tarda y cuánto cuesta? Respuestas claras a las preguntas que más nos hacen.',
    en: 'Is it legal? Do I have to send the images? How long does it take and what does it cost? Clear answers to the questions we get most.',
  } as T3,
  h1: { fr: 'Questions fréquentes', es: 'Preguntas frecuentes', en: 'Frequently asked questions' } as T3,
  intro: {
    fr: 'Vous vous posez sûrement ces questions. C’est normal : vous allez nous confier quelque chose de personnel. Voici nos réponses, sans détour.',
    es: 'Seguro que te haces estas preguntas. Es normal: vas a confiarnos algo personal. Aquí tienes nuestras respuestas, sin rodeos.',
    en: 'You probably have these questions. That is normal: you are about to trust us with something personal. Here are our answers, straight.',
  } as T3,
  enSavoirPlus: { fr: 'En savoir plus', es: 'Saber más', en: 'Learn more' } as T3,
  autreQuestion: {
    fr: 'Votre question n’est pas ici ? Écrivez-nous, dans votre langue.',
    es: '¿Tu pregunta no está aquí? Escríbenos, en tu idioma.',
    en: 'Your question isn’t here? Write to us, in your language.',
  } as T3,
  lienAccueil: {
    fr: 'Les réponses aux questions fréquentes',
    es: 'Las respuestas a las preguntas frecuentes',
    en: 'Answers to frequently asked questions',
  } as T3,
};

export const FAQ: GroupeFaq[] = [
  {
    titre: { fr: 'Confiance et discrétion', es: 'Confianza y discreción', en: 'Trust and discretion' },
    questions: [
      {
        q: { fr: 'Est-ce que c’est légal ?', es: '¿Es legal?', en: 'Is this legal?' },
        r: {
          fr: 'Oui. Nous utilisons seulement les voies prévues par la loi et par les plateformes : formulaires officiels, demandes écrites, signalements aux hébergeurs, aux moteurs de recherche et aux autorités. Jamais de piratage, de menace ni de faux.',
          es: 'Sí. Solo usamos las vías que prevén la ley y las plataformas: formularios oficiales, solicitudes por escrito, avisos a los proveedores de alojamiento, a los buscadores y a las autoridades. Nunca pirateo, amenazas ni falsificaciones.',
          en: 'Yes. We only use the routes the law and the platforms provide: official forms, written requests, reports to hosting providers, search engines and authorities. Never hacking, threats or fakes.',
        },
        lien: 'methode',
      },
      {
        q: { fr: 'Dois-je vous envoyer les images ?', es: '¿Tengo que enviar las imágenes?', en: 'Do I have to send you the images?' },
        r: {
          fr: 'Non, jamais. Nous travaillons à partir des liens, c’est-à-dire les adresses des pages. Si quelqu’un vous demande vos images en disant venir de Devuelta, ce n’est pas nous.',
          es: 'No, nunca. Trabajamos a partir de los enlaces, es decir, las direcciones de las páginas. Si alguien te pide tus imágenes diciendo que es de Devuelta, no somos nosotros.',
          en: 'No, never. We work from links, meaning the web addresses of the pages. If someone asks for your images saying they are from Devuelta, it is not us.',
        },
      },
      {
        q: { fr: 'Qui saura que vous m’aidez ?', es: '¿Quién sabrá que Devuelta me ayuda?', en: 'Who will know you are helping me?' },
        r: {
          fr: 'Les démarches sont faites en votre nom, avec votre accord : la plateforme ou le site concerné saura qu’une demande existe. Rien d’autre n’est rendu public. Nos e-mails ne mentionnent jamais votre situation dans l’objet, et ce site n’a ni traceur ni cookie.',
          es: 'Las gestiones se hacen en tu nombre, con tu acuerdo: la plataforma o la web en cuestión sabrá que existe una solicitud. Nada más se hace público. Nuestros correos nunca mencionan tu situación en el asunto, y este sitio no tiene rastreadores ni cookies.',
          en: 'The requests are made in your name, with your agreement: the platform or site involved will know a request exists. Nothing else is made public. Our emails never mention your situation in the subject line, and this site has no trackers and no cookies.',
        },
      },
      {
        q: { fr: 'Puis-je rester anonyme ?', es: '¿Puedo mantener el anonimato?', en: 'Can I stay anonymous?' },
        r: {
          fr: 'Pour le diagnostic et les guides, oui : rien ne quitte votre téléphone. Pour nous écrire, un prénom ou un pseudo suffit. Pour agir en votre nom, il faut ensuite un mandat signé avec votre vrai nom, car les plateformes le demandent souvent.',
          es: 'Para el diagnóstico y las guías, sí: nada sale de tu teléfono. Para escribirnos, basta un nombre o un seudónimo. Para actuar en tu nombre hace falta luego un mandato firmado con tu nombre real, porque las plataformas suelen pedirlo.',
          en: 'For the diagnostic and the guides, yes: nothing leaves your phone. To write to us, a first name or a nickname is enough. To act on your behalf, we then need a mandate signed with your real name, because platforms often ask for it.',
        },
      },
      {
        q: {
          fr: 'Comment reconnaître un vrai message de Devuelta ?',
          es: '¿Cómo reconocer un mensaje auténtico de Devuelta?',
          en: 'How do I recognise a real message from Devuelta?',
        },
        r: {
          fr: 'Nos e-mails viennent uniquement de team.devuelta@protonmail.com, ou de team@getdevuelta.com pour les messages automatiques. Nous ne vous contactons jamais en premier sur les réseaux sociaux. Nous ne demandons jamais d’images, de mot de passe ni de code reçu par SMS.',
          es: 'Nuestros correos solo vienen de team.devuelta@protonmail.com, o de team@getdevuelta.com para los mensajes automáticos. Nunca te contactamos primero por redes sociales. Nunca pedimos imágenes, contraseñas ni códigos recibidos por SMS.',
          en: 'Our emails only come from team.devuelta@protonmail.com, or team@getdevuelta.com for automatic messages. We never contact you first on social media. We never ask for images, passwords or codes sent to you by text message.',
        },
        telegram: {
          fr: 'Sur Telegram, seul notre robot officiel @{robot} vous répond, et seulement si vous lui avez écrit d’abord.',
          es: 'En Telegram, solo te responde nuestro robot oficial @{robot}, y solo si tú le escribiste primero.',
          en: 'On Telegram, only our official bot @{robot} replies to you, and only if you wrote to it first.',
        },
      },
      {
        q: {
          fr: 'Que devient ce que je vous confie ?',
          es: '¿Qué pasa con la información que comparto?',
          en: 'What happens to what I share with you?',
        },
        r: {
          fr: 'Seule notre équipe y a accès, avec double authentification et un accord de confidentialité. Vos données sont effacées automatiquement après la clôture de votre dossier.',
          es: 'Solo nuestro equipo tiene acceso, con verificación en dos pasos y un acuerdo de confidencialidad. Tus datos se borran automáticamente después de cerrar tu caso.',
          en: 'Only our team can access it, with two-factor authentication and a confidentiality agreement. Your data is deleted automatically after your case is closed.',
        },
        lien: 'confidentialite',
      },
    ],
  },
  {
    titre: { fr: 'Comment ça se passe', es: 'Cómo funciona', en: 'How it works' },
    questions: [
      {
        q: { fr: 'Comment ça se passe, concrètement ?', es: '¿Cómo funciona, en concreto?', en: 'How does it work, in practice?' },
        r: {
          fr: 'Vous décrivez votre situation et vous nous donnez les liens. Nous vous disons honnêtement ce qui est possible, avec un devis. Si vous acceptez, nous préparons chaque demande, vous la validez, puis nous l’envoyons et suivons les réponses.',
          es: 'Nos describes tu situación y nos das los enlaces. Te decimos con honestidad lo que es posible, con un presupuesto. Si aceptas, preparamos cada solicitud, tú la validas y luego la enviamos y seguimos las respuestas.',
          en: 'You describe your situation and give us the links. We tell you honestly what is possible, with a quote. If you accept, we prepare each request, you approve it, then we send it and follow up on the answers.',
        },
        lien: 'confier',
      },
      {
        q: { fr: 'Combien de temps faut-il ?', es: '¿Cuánto tiempo tarda?', en: 'How long does it take?' },
        r: {
          fr: 'Cela dépend de la plateforme et du pays : de quelques heures à plusieurs semaines. Certaines lois fixent un délai, par exemple 48 heures aux États-Unis pour une image intime. Nous vous donnons le délai prévu avant de commencer.',
          es: 'Depende de la plataforma y del país: de unas horas a varias semanas. Algunas leyes fijan un plazo, por ejemplo 48 horas en Estados Unidos para una imagen íntima. Te damos el plazo previsto antes de empezar.',
          en: 'It depends on the platform and the country: from a few hours to several weeks. Some laws set a deadline, for example 48 hours in the United States for an intimate image. We tell you the expected time before we start.',
        },
      },
      {
        q: { fr: 'Et si la plateforme refuse ?', es: '¿Y si la plataforma se niega?', en: 'What if the platform says no?' },
        r: {
          fr: 'Ce n’est pas forcément la fin. Nous montons d’une marche : contestation, hébergeur du site, nom de domaine, moteurs de recherche, autorité. Si le lien n’est pas retiré, vous ne payez pas la seconde moitié.',
          es: 'No tiene por qué ser el final. Subimos un escalón: impugnación, proveedor de alojamiento, dominio, buscadores, autoridad. Si el enlace no se retira, no pagas la segunda mitad.',
          en: 'That is not necessarily the end. We go up a step: appeal, hosting provider, domain name, search engines, authority. If the link is not removed, you do not pay the second half.',
        },
      },
      {
        q: { fr: 'Et si le contenu revient ?', es: '¿Y si el contenido vuelve a aparecer?', en: 'What if the content comes back?' },
        r: {
          fr: 'Tant que votre dossier est ouvert, nous revérifions régulièrement les liens retirés sur les sites web. Si un lien revient, nous vous le disons et voyons la suite avec vous. Pour les images intimes, StopNCII aide aussi à bloquer les nouvelles publications sur de grandes plateformes.',
          es: 'Mientras tu caso está abierto, volvemos a comprobar con regularidad los enlaces retirados en sitios web. Si uno vuelve, te avisamos y vemos contigo qué hacer. Para imágenes íntimas, StopNCII también ayuda a bloquear nuevas publicaciones en grandes plataformas.',
          en: 'While your case is open, we regularly re-check removed links on websites. If a link comes back, we tell you and decide the next step together. For intimate images, StopNCII also helps block new posts on major platforms.',
        },
      },
      {
        q: { fr: 'Je ne sais pas où c’est publié.', es: 'No sé dónde está publicado.', en: 'I don’t know where it is posted.' },
        r: {
          fr: 'Commencez par le Contrôle en 5 minutes : il vous montre comment chercher votre nom et vos photos, gratuitement. Si vous n’y arrivez pas, écrivez-nous : nous vous dirons ce qu’il est possible de faire.',
          es: 'Empieza por el Chequeo en 5 minutos: te enseña a buscar tu nombre y tus fotos, gratis. Si no lo consigues, escríbenos: te diremos qué se puede hacer.',
          en: 'Start with the 5-minute check-up: it shows you how to search for your name and photos, for free. If you can’t find it, write to us: we will tell you what can be done.',
        },
        lien: 'controle',
      },
      {
        q: { fr: 'Êtes-vous des avocats ?', es: '¿Son abogados?', en: 'Are you lawyers?' },
        r: {
          fr: 'Non. Nous faisons les démarches pratiques : trouver qui héberge un contenu, remplir les formulaires officiels, envoyer les demandes que vous avez validées, suivre les délais. Si une action en justice devient utile, nous nous arrêtons là et nous vous remettons un dossier prêt pour l’avocat de votre choix.',
          es: 'No. Hacemos las gestiones prácticas: averiguar quién aloja un contenido, rellenar los formularios oficiales, enviar las solicitudes que has validado y seguir los plazos. Si hace falta ir a juicio, nos detenemos ahí y te entregamos un expediente listo para el abogado que tú elijas.',
          en: 'No. We do the practical work: finding who hosts the content, filling in official forms, sending the requests you have approved and keeping track of deadlines. If going to court becomes useful, we stop there and hand you a file ready for the lawyer of your choice.',
        },
      },
      {
        q: { fr: 'Et s’il faut un avocat ?', es: '¿Y si hace falta un abogado?', en: 'What if I need a lawyer?' },
        r: {
          fr: 'Nous faisons tout ce qui peut se faire sans avocat, y compris les plaintes auprès de l’autorité de protection des données. Dès qu’il faut un avocat ou un tribunal, nous nous arrêtons et nous vous remettons un dossier de passation : chronologie, preuves, démarches faites, réponses reçues. Il est compris dans le prix. Vous continuez seul·e ou avec l’avocat de votre choix : nous n’en recommandons aucun et nous ne touchons aucune commission. Si votre avocat le souhaite, nous pouvons continuer les démarches techniques sous sa direction, toujours payées par vous.',
          es: 'Hacemos todo lo que se puede hacer sin abogado, incluidas las reclamaciones ante la autoridad de protección de datos. En cuanto hace falta un abogado o un tribunal, nos detenemos y te entregamos un expediente de traspaso: cronología, pruebas, gestiones hechas, respuestas recibidas. Está incluido en el precio. Sigues por tu cuenta o con el abogado que tú elijas: no recomendamos a ninguno y no cobramos ninguna comisión. Si tu abogado lo desea, podemos seguir con las gestiones técnicas bajo su dirección, siempre pagadas por ti.',
          en: 'We do everything that can be done without a lawyer, including complaints to the data protection authority. As soon as a lawyer or a court is needed, we stop and hand you a handover file: timeline, evidence, steps taken, answers received. It is included in the price. You carry on alone or with the lawyer of your choice: we recommend none and we take no commission. If your lawyer wishes, we can keep doing the technical steps under their direction, always paid by you.',
        },
        lien: 'methode',
      },
    ],
  },
  {
    titre: { fr: 'Prix et paiement', es: 'Precio y pago', en: 'Price and payment' },
    questions: [
      {
        q: { fr: 'Combien ça coûte ?', es: '¿Cuánto cuesta?', en: 'How much does it cost?' },
        r: {
          fr: 'Le diagnostic, les guides et le contrôle sont gratuits. Si vous nous confiez votre dossier : dès 40 €, prix divisés par deux en Afrique et en Amérique latine. Vous payez la moitié pour démarrer, et le reste seulement pour les liens retirés.',
          es: 'El diagnóstico, las guías y el chequeo son gratis. Si nos confías tu caso: desde 40 €, con precios a mitad en África y América Latina. Pagas la mitad para empezar y el resto solo por los enlaces retirados.',
          en: 'The diagnostic, the guides and the check-up are free. If you hand us your case: from €40, with prices halved in Africa and Latin America. You pay half to start, and the rest only for the links that are removed.',
        },
        lien: 'tarifs',
      },
      {
        q: { fr: 'Quand dois-je payer ?', es: '¿Cuándo tengo que pagar?', en: 'When do I pay?' },
        r: {
          fr: 'Jamais avant d’avoir accepté notre devis écrit. Le lien de paiement arrive avec lui. Le reste n’est demandé qu’une fois les liens retirés.',
          es: 'Nunca antes de aceptar nuestro presupuesto por escrito. El enlace de pago llega con él. El resto solo se pide una vez retirados los enlaces.',
          en: 'Never before you accept our written quote. The payment link comes with it. The rest is only requested once the links are removed.',
        },
      },
      {
        q: {
          fr: 'Je vis hors d’Europe : comment payer ?',
          es: 'Vivo fuera de Europa: ¿cómo pago?',
          en: 'I live outside Europe: how do I pay?',
        },
        r: {
          fr: 'Par carte bancaire, ou par Mobile Money au Ghana, sur la page sécurisée de Paystack, notre prestataire de paiement (racheté par Stripe en 2020). Le montant peut être débité en cedis ghanéens : votre banque fait la conversion. Nous ne demandons jamais de paiement par carte cadeau, cryptomonnaie ou transfert à un particulier.',
          es: 'Con tarjeta bancaria, o con Mobile Money en Ghana, en la página segura de Paystack, nuestro proveedor de pagos (comprado por Stripe en 2020). El importe puede cobrarse en cedis ghaneses: tu banco hace la conversión. Nunca pedimos pagos con tarjetas regalo, criptomonedas ni transferencias a un particular.',
          en: 'By bank card, or by Mobile Money in Ghana, on the secure page of Paystack, our payment provider (bought by Stripe in 2020). The amount may be charged in Ghanaian cedis: your bank does the conversion. We never ask for payment by gift card, cryptocurrency or transfer to a private person.',
        },
      },
      {
        q: { fr: 'Puis-je arrêter en cours de route ?', es: '¿Puedo parar a mitad de camino?', en: 'Can I stop along the way?' },
        r: {
          fr: 'Oui. Le formulaire « Renoncer au contrat » vous permet d’arrêter quand vous voulez. Dans l’Union européenne, vous avez en plus 14 jours pour renoncer sans donner de raison.',
          es: 'Sí. El formulario «Desistir del contrato» te permite parar cuando quieras. En la Unión Europea tienes además 14 días para desistir sin dar motivos.',
          en: 'Yes. The “Withdraw from contract” form lets you stop whenever you want. In the European Union, you also have 14 days to withdraw without giving a reason.',
        },
        lien: 'retractation',
      },
    ],
  },
  {
    titre: { fr: 'Situations particulières', es: 'Situaciones particulares', en: 'Particular situations' },
    questions: [
      {
        q: { fr: 'On me menace en ce moment.', es: 'Me están amenazando ahora mismo.', en: 'Someone is threatening me right now.' },
        r: {
          fr: 'Ne payez pas et ne répondez plus, mais gardez tout : captures d’écran, messages, numéros. Prévenez la police et une personne de confiance. Les numéros d’aide de votre pays sont sur notre page Aide urgente.',
          es: 'No pagues y no respondas más, pero guárdalo todo: capturas, mensajes, números. Avisa a la policía y a alguien de confianza. Los números de ayuda de tu país están en nuestra página Ayuda urgente.',
          en: 'Do not pay and stop replying, but keep everything: screenshots, messages, numbers. Tell the police and someone you trust. The helplines for your country are on our Urgent help page.',
        },
        lien: 'urgence',
      },
      {
        q: { fr: 'J’ai moins de 18 ans.', es: 'Tengo menos de 18 años.', en: 'I am under 18.' },
        r: {
          fr: 'Ce n’est pas votre faute, et vous n’êtes pas seul·e. Nous ne faisons jamais payer une personne mineure : nous vous orientons vers les services officiels gratuits, faits pour vous aider.',
          es: 'No es culpa tuya y no estás solo ni sola. Nunca cobramos nada a una persona menor de edad: te orientamos hacia los servicios oficiales gratuitos, hechos para ayudarte.',
          en: 'It is not your fault, and you are not alone. We never charge a minor: we point you to the free official services that are there to help you.',
        },
        lien: 'urgence',
      },
      {
        q: {
          fr: 'J’avais accepté la photo, ou je l’ai publiée moi-même.',
          es: 'Yo había aceptado la foto, o la publiqué yo.',
          en: 'I had agreed to the photo, or I posted it myself.',
        },
        r: {
          fr: 'Vous pouvez quand même demander son retrait. Avoir accepté une photo ne veut pas dire accepter qu’elle soit diffusée, et beaucoup de lois vont dans ce sens. Si vous l’aviez publiée vous-même et qu’elle a été reprise ailleurs, des démarches existent aussi.',
          es: 'Aun así puedes pedir que se retire. Haber aceptado una foto no significa aceptar que se difunda, y muchas leyes lo reconocen. Si la publicaste tú y la han copiado en otro sitio, también hay gestiones posibles.',
          en: 'You can still ask for it to be removed. Agreeing to a photo does not mean agreeing to it being shared, and many laws recognise this. If you posted it yourself and it was copied elsewhere, there are steps for that too.',
        },
      },
      {
        q: { fr: 'Un commerce peut-il faire appel à vous ?', es: '¿Pueden ayudar a un negocio?', en: 'Can a business use Devuelta?' },
        r: {
          fr: 'Oui, par exemple pour de faux avis sur une fiche d’établissement. Les mêmes formules s’appliquent, avec des prix multipliés par deux. Nous ne retirons jamais un avis honnête, même négatif.',
          es: 'Sí, por ejemplo con reseñas falsas en la ficha de un establecimiento. Se aplican las mismas fórmulas, con precios multiplicados por dos. Nunca retiramos una reseña honesta, aunque sea negativa.',
          en: 'Yes, for example for fake reviews on a business listing. The same packages apply, with prices doubled. We never remove an honest review, even a negative one.',
        },
        lien: 'tarifs',
      },
    ],
  },
];
