// Politique de confidentialité et mentions légales, en trois langues.
// Toute modification de fond doit aussi changer la date « mis à jour le ».

import type { T3 } from '../../shared/vocab';

export interface Section {
  titre: string;
  paras: string[];
}

export const MAJ_LEGAL = '2026-10-16';

export const CONFIDENTIALITE: { seo: T3; meta: T3; h1: T3; sections: Record<'fr' | 'es' | 'en', Section[]> } = {
  seo: { fr: 'Confidentialité', es: 'Privacidad', en: 'Privacy' },
  meta: {
    fr: 'Ce que Devuelta collecte, pourquoi, combien de temps, et vos droits. Aucun cookie, aucun traceur.',
    es: 'Qué recoge Devuelta, por qué, durante cuánto tiempo y tus derechos. Sin cookies ni rastreadores.',
    en: 'What Devuelta collects, why, for how long, and your rights. No cookies, no trackers.',
  },
  h1: { fr: 'Politique de confidentialité', es: 'Política de privacidad', en: 'Privacy policy' },
  sections: {
    fr: [
      {
        titre: 'En bref',
        paras: [
          'Pas de cookie, pas de traceur, pas de publicité. Le diagnostic fonctionne entièrement dans votre navigateur : vos réponses ne nous sont pas envoyées. Nous ne recevons des informations que si vous remplissez le formulaire « Confier mon dossier » ou si vous nous écrivez.',
        ],
      },
      {
        titre: 'Qui est responsable',
        paras: [
          'Devuelta, société en cours d’immatriculation au Ghana. Pour toute question sur vos données : team.devuelta@protonmail.com.',
        ],
      },
      {
        titre: 'Ce que nous collectons',
        paras: [
          'Statistiques de visite : nous comptons le nombre de pages vues par jour, avec la page, le site d’où vous venez (par exemple « google ») et le pays. Aucun cookie, aucun identifiant, et votre adresse IP n’est pas enregistrée.',
          'Formulaire « Confier mon dossier » : ce que vous y écrivez (un prénom ou pseudo, votre moyen de contact, votre situation, votre pays, les liens concernés, votre message et les cases cochées). Pour bloquer les envois abusifs, nous gardons une empreinte chiffrée de votre adresse IP, impossible à relire, supprimée avec la demande.',
          'Formulaire « Renoncer au contrat ici » : votre nom, le numéro de dossier si vous l’indiquez, le moyen de contact choisi pour l’accusé de réception et votre message éventuel, avec la date et l’heure. La même empreinte chiffrée de l’adresse IP sert à bloquer les abus.',
          'Si vous devenez client·e : uniquement ce qui est nécessaire à votre dossier (identité, mandat signé, liens à faire retirer, échanges avec les sites). Nous ne vous demandons jamais d’images intimes.',
        ],
      },
      {
        titre: 'Pourquoi, et sur quelle base',
        paras: [
          'Répondre à votre demande et traiter votre dossier : mesures précontractuelles puis exécution du contrat (RGPD, article 6.1.b). Les informations sensibles que vous nous confiez sont traitées avec votre consentement explicite (article 9.2.a), que vous pouvez retirer à tout moment.',
          'Rétractation : respect d’une obligation légale (article 6.1.c).',
          'Sécurité du service et lutte contre les abus : intérêt légitime (article 6.1.f).',
          'Vos données ne servent jamais à la publicité, à la vente, à des démonstrations ou à entraîner un outil d’intelligence artificielle.',
        ],
      },
      {
        titre: 'Combien de temps',
        paras: [
          'Demande sans suite : supprimée 30 jours après son traitement. Dossier : supprimé automatiquement 6 mois après sa clôture. Rétractation : supprimée avec le dossier, et au plus tard 2 ans après sa réception, pour servir de preuve. Statistiques : agrégées, sans donnée personnelle.',
        ],
      },
      {
        titre: 'Qui y a accès',
        paras: [
          'Notre équipe de trois personnes, liées par un accord de confidentialité, avec double authentification. Notre hébergeur technique, Cloudflare, stocke les données pour notre compte. Nos e-mails passent par Proton Mail ; si vous nous écrivez par WhatsApp, WhatsApp transporte vos messages.',
          'Quand vous approuvez une demande, nous transmettons au site, à la plateforme ou à l’hébergeur concerné uniquement ce qui est nécessaire à cette demande. Si vous payez en ligne, le prestataire de paiement reçoit ce qui est nécessaire au paiement ; nous ne voyons jamais votre numéro de carte. Personne d’autre : aucune vente, aucune publicité.',
          'Notre équipe travaille depuis le Ghana. Les données sont hébergées par Cloudflare ; la base de données principale se trouve en Europe de l’Ouest.',
        ],
      },
      {
        titre: 'Vos droits',
        paras: [
          'Vous pouvez demander à consulter, corriger ou supprimer vos données, limiter leur utilisation, vous y opposer, les récupérer, ou retirer votre consentement : écrivez à team.devuelta@protonmail.com. Nous répondons sous un mois au plus.',
          'Vous pouvez aussi saisir l’autorité de protection des données de votre pays : la CNIL en France, l’AEPD en Espagne, ou l’autorité compétente chez vous.',
        ],
      },
      {
        titre: 'Sécurité',
        paras: [
          'Connexion chiffrée (HTTPS), accès à l’outil interne protégé par mot de passe et double authentification, journal des actions, données réduites au strict nécessaire, suppression automatique.',
        ],
      },
      {
        titre: 'Cookies',
        paras: [
          'Le site public n’utilise aucun cookie. L’outil interne de l’équipe utilise un seul cookie, strictement nécessaire à la connexion des membres de l’équipe.',
        ],
      },
    ],
    es: [
      {
        titre: 'En resumen',
        paras: [
          'Sin cookies, sin rastreadores, sin publicidad. El diagnóstico funciona por completo en tu navegador: tus respuestas no se nos envían. Solo recibimos información si rellenas el formulario «Confiar mi caso» o si nos escribes.',
        ],
      },
      {
        titre: 'Quién es responsable',
        paras: ['Devuelta, sociedad en proceso de registro en Ghana. Para cualquier pregunta sobre tus datos: team.devuelta@protonmail.com.'],
      },
      {
        titre: 'Qué recogemos',
        paras: [
          'Estadísticas de visitas: contamos las páginas vistas por día, con la página, el sitio desde el que llegas (por ejemplo «google») y el país. Sin cookies, sin identificadores, y tu dirección IP no se guarda.',
          'Formulario «Confiar mi caso»: lo que escribes (un nombre o seudónimo, tu medio de contacto, tu situación, tu país, los enlaces, tu mensaje y las casillas marcadas). Para bloquear envíos abusivos guardamos una huella cifrada de tu dirección IP, imposible de leer, que se borra con la solicitud.',
          'Formulario «Desistir del contrato aquí»: tu nombre, el número de caso si lo indicas, el medio de contacto elegido para el acuse de recibo y tu mensaje, si lo hay, con la fecha y la hora. La misma huella cifrada de la dirección IP sirve para bloquear abusos.',
          'Si te conviertes en cliente: solo lo necesario para tu caso (identidad, mandato firmado, enlaces a retirar, intercambios con los sitios). Nunca te pedimos imágenes íntimas.',
        ],
      },
      {
        titre: 'Para qué y con qué base',
        paras: [
          'Responder a tu solicitud y tramitar tu caso: medidas precontractuales y ejecución del contrato (RGPD, artículo 6.1.b). La información sensible que nos confías se trata con tu consentimiento explícito (artículo 9.2.a), que puedes retirar cuando quieras.',
          'Desistimiento: cumplimiento de una obligación legal (artículo 6.1.c).',
          'Seguridad del servicio y prevención de abusos: interés legítimo (artículo 6.1.f).',
          'Tus datos nunca se usan para publicidad, venta, demostraciones ni para entrenar inteligencia artificial.',
        ],
      },
      {
        titre: 'Durante cuánto tiempo',
        paras: ['Solicitud sin continuidad: se borra 30 días después de tratarla. Caso: se borra automáticamente 6 meses después de cerrarlo. Desistimiento: se borra con el caso y, como máximo, 2 años después de recibirlo, para servir de prueba. Estadísticas: agregadas, sin datos personales.'],
      },
      {
        titre: 'Quién tiene acceso',
        paras: [
          'Nuestro equipo de tres personas, con acuerdo de confidencialidad y verificación en dos pasos. Nuestro proveedor técnico, Cloudflare, almacena los datos por cuenta nuestra. Nuestros correos pasan por Proton Mail; si nos escribes por WhatsApp, WhatsApp transporta tus mensajes.',
          'Cuando apruebas una solicitud, enviamos al sitio, a la plataforma o al proveedor de alojamiento correspondiente solo lo necesario para esa solicitud. Si pagas en línea, el proveedor de pagos recibe lo necesario para el pago; nunca vemos el número de tu tarjeta. Nadie más: ninguna venta, ninguna publicidad.',
          'Nuestro equipo trabaja desde Ghana. Los datos están alojados en Cloudflare; la base de datos principal está en Europa occidental.',
        ],
      },
      {
        titre: 'Tus derechos',
        paras: [
          'Puedes pedir acceder, rectificar o suprimir tus datos, limitar su uso, oponerte, recuperarlos o retirar tu consentimiento: escribe a team.devuelta@protonmail.com. Respondemos en un mes como máximo.',
          'También puedes acudir a la autoridad de protección de datos de tu país: la AEPD en España o la autoridad competente donde vivas.',
        ],
      },
      {
        titre: 'Seguridad',
        paras: ['Conexión cifrada (HTTPS), acceso a la herramienta interna con contraseña y verificación en dos pasos, registro de acciones, datos reducidos al mínimo, borrado automático.'],
      },
      {
        titre: 'Cookies',
        paras: ['El sitio público no usa cookies. La herramienta interna del equipo usa una sola cookie, estrictamente necesaria para que los miembros del equipo inicien sesión.'],
      },
    ],
    en: [
      {
        titre: 'In short',
        paras: [
          "No cookies, no trackers, no ads. The diagnostic runs entirely in your browser: your answers are not sent to us. We only receive information if you fill in the \"Get our help\" form or write to us.",
        ],
      },
      {
        titre: 'Who is responsible',
        paras: ['Devuelta, a company being registered in Ghana. For any question about your data: team.devuelta@protonmail.com.'],
      },
      {
        titre: 'What we collect',
        paras: [
          'Visit statistics: we count page views per day, with the page, the site you came from (for example "google") and the country. No cookies, no identifiers, and your IP address is not stored.',
          '"Get our help" form: what you write (a first name or nickname, how to contact you, your situation, your country, the links, your message and the boxes you tick). To block abuse we keep an encrypted fingerprint of your IP address, which cannot be read back and is deleted with the request.',
          '“Withdraw from contract here” form: your name, the case number if you give it, the contact channel chosen for the acknowledgement and your message if any, with the date and time. The same encrypted fingerprint of your IP address is used to block abuse.',
          'If you become a client: only what your case needs (identity, signed mandate, links to remove, exchanges with the sites). We never ask you for intimate images.',
        ],
      },
      {
        titre: 'Why, and on what basis',
        paras: [
          'Answering your request and handling your case: pre-contractual steps, then performance of the contract (GDPR, Article 6(1)(b)). Sensitive information you share is processed with your explicit consent (Article 9(2)(a)), which you can withdraw at any time.',
          'Withdrawal: compliance with a legal obligation (Article 6(1)(c)).',
          'Security of the service and preventing abuse: legitimate interest (Article 6(1)(f)).',
          'Your data is never used for advertising, sale, demonstrations or to train artificial intelligence.',
        ],
      },
      {
        titre: 'How long',
        paras: ['Request not followed up: deleted 30 days after it is handled. Case: deleted automatically 6 months after it is closed. Withdrawal: deleted with the case, and at the latest 2 years after it is received, to serve as proof. Statistics: aggregated, no personal data.'],
      },
      {
        titre: 'Who has access',
        paras: [
          'Our team of three, bound by a confidentiality agreement and using two-factor authentication. Our technical host, Cloudflare, stores the data on our behalf. Our emails go through Proton Mail; if you write to us on WhatsApp, WhatsApp carries your messages.',
          'When you approve a request, we send the site, platform or host concerned only what that request needs. If you pay online, the payment provider receives what the payment needs; we never see your card number. Nobody else: no selling, no advertising.',
          'Our team works from Ghana. Data is hosted by Cloudflare; the main database is located in Western Europe.',
        ],
      },
      {
        titre: 'Your rights',
        paras: [
          'You can ask to access, correct or delete your data, restrict or object to its use, receive a copy, or withdraw your consent: write to team.devuelta@protonmail.com. We answer within one month at most.',
          'You can also contact the data protection authority in your country.',
        ],
      },
      {
        titre: 'Security',
        paras: ['Encrypted connection (HTTPS), internal tool protected by password and two-factor authentication, action log, minimal data, automatic deletion.'],
      },
      {
        titre: 'Cookies',
        paras: ['The public site uses no cookies. The team’s internal tool uses a single cookie, strictly necessary for team members to log in.'],
      },
    ],
  },
};

export const MENTIONS: { seo: T3; meta: T3; h1: T3; sections: Record<'fr' | 'es' | 'en', Section[]> } = {
  seo: { fr: 'Mentions légales', es: 'Aviso legal', en: 'Legal notice' },
  meta: {
    fr: 'Éditeur, hébergeur, propriété intellectuelle et limites de responsabilité du site Devuelta.',
    es: 'Editor, alojamiento, propiedad intelectual y límites de responsabilidad del sitio Devuelta.',
    en: 'Publisher, host, intellectual property and liability limits of the Devuelta website.',
  },
  h1: { fr: 'Mentions légales', es: 'Aviso legal', en: 'Legal notice' },
  sections: {
    fr: [
      { titre: 'Éditeur', paras: ['Devuelta, société en cours d’immatriculation au Ghana. Son nom légal, son numéro d’enregistrement et son adresse seront indiqués ici dès la fin de l’immatriculation.', 'Contact : team.devuelta@protonmail.com'] },
      {
        titre: 'Hébergeur',
        paras: ['Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis — cloudflare.com'],
      },
      {
        titre: 'Contenu et responsabilité',
        paras: [
          'Les informations de ce site sont générales. Elles sont vérifiées sur les sources officielles à la date indiquée sur chaque page, mais les lois et les procédures des plateformes évoluent. Elles ne constituent pas un conseil juridique et ne remplacent pas l’avis d’un avocat.',
          'Vous avez repéré une erreur ou un lien qui ne fonctionne plus ? Écrivez-nous : nous corrigeons vite.',
        ],
      },
      {
        titre: 'Propriété intellectuelle',
        paras: [
          'Les textes du site appartiennent à Devuelta. Le référentiel des recours (fichier referentiel.json) est publié sous licence Creative Commons Attribution 4.0 (CC BY 4.0) : vous pouvez le réutiliser librement, en citant Devuelta et en renvoyant vers ce site.',
        ],
      },
    ],
    es: [
      { titre: 'Editor', paras: ['Devuelta, sociedad en proceso de registro en Ghana. Su nombre legal, su número de registro y su dirección se indicarán aquí en cuanto termine el registro.', 'Contacto: team.devuelta@protonmail.com'] },
      { titre: 'Alojamiento', paras: ['Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, Estados Unidos — cloudflare.com'] },
      {
        titre: 'Contenido y responsabilidad',
        paras: [
          'La información de este sitio es general. Se verifica en fuentes oficiales en la fecha indicada en cada página, pero las leyes y los procedimientos de las plataformas cambian. No constituye asesoría jurídica ni sustituye la opinión de un abogado.',
          '¿Encontraste un error o un enlace que ya no funciona? Escríbenos: lo corregimos rápido.',
        ],
      },
      {
        titre: 'Propiedad intelectual',
        paras: [
          'Los textos del sitio pertenecen a Devuelta. El referencial de recursos (archivo referentiel.json) se publica con licencia Creative Commons Atribución 4.0 (CC BY 4.0): puedes reutilizarlo libremente citando a Devuelta y enlazando a este sitio.',
        ],
      },
    ],
    en: [
      { titre: 'Publisher', paras: ['Devuelta, a company being registered in Ghana. Its legal name, registration number and address will be shown here as soon as registration is complete.', 'Contact: team.devuelta@protonmail.com'] },
      { titre: 'Host', paras: ['Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, United States — cloudflare.com'] },
      {
        titre: 'Content and liability',
        paras: [
          'The information on this site is general. It is checked against official sources on the date shown on each page, but laws and platform procedures change. It is not legal advice and does not replace a lawyer’s opinion.',
          'Found a mistake or a broken link? Write to us: we fix things fast.',
        ],
      },
      {
        titre: 'Intellectual property',
        paras: [
          'The texts on this site belong to Devuelta. The dataset of remedies (referentiel.json) is published under the Creative Commons Attribution 4.0 licence (CC BY 4.0): you may reuse it freely, crediting Devuelta and linking to this site.',
        ],
      },
    ],
  },
};

// Conditions de vente : courtes, en langage simple. Le service est une
// assistance technique et administrative ; la personne choisit et valide
// chaque démarche, elle reste l'auteur de ses demandes.
export const CONDITIONS: { seo: T3; meta: T3; h1: T3; sections: Record<'fr' | 'es' | 'en', Section[]> } = {
  seo: { fr: 'Conditions de vente', es: 'Condiciones de venta', en: 'Terms of sale' },
  meta: {
    fr: 'Les règles du service Devuelta : ce que nous faisons, les prix, le paiement, vos droits et les nôtres.',
    es: 'Las reglas del servicio Devuelta: lo que hacemos, los precios, el pago, tus derechos y los nuestros.',
    en: 'The rules of the Devuelta service: what we do, prices, payment, your rights and ours.',
  },
  h1: { fr: 'Conditions de vente', es: 'Condiciones de venta', en: 'Terms of sale' },
  sections: {
    fr: [
      {
        titre: 'Qui vend',
        paras: [
          'Le service Devuelta est fourni par Devuelta, société en cours d’immatriculation au Ghana. Aucun paiement n’est demandé avant la fin de cette immatriculation ; son nom légal, son numéro d’enregistrement et son adresse figureront alors ici et sur chaque devis. Contact : team.devuelta@protonmail.com.',
        ],
      },
      {
        titre: 'Ce que nous faisons',
        paras: [
          'Devuelta fournit une assistance technique et administrative pour faire retirer ou déréférencer des contenus en ligne qui vous concernent : trouver qui héberge chaque lien, vous présenter les procédures officielles, préparer les demandes à partir de modèles types, les envoyer après votre validation, relancer et suivre les réponses.',
          'Devuelta n’est pas un cabinet d’avocats. Nous ne donnons pas d’avis sur vos chances, nous ne vous représentons pas en justice et nous ne déposons pas plainte à votre place.',
        ],
      },
      {
        titre: 'Notre engagement',
        paras: [
          'Nous faisons tout ce qui est raisonnablement possible, uniquement par des moyens légaux. La décision de retirer un contenu appartient à la plateforme, à l’hébergeur, au moteur de recherche ou à l’autorité concernée : personne ne peut promettre un résultat, et nous ne le faisons pas.',
        ],
      },
      {
        titre: 'Vos engagements',
        paras: [
          'Vous nous donnez des informations exactes. Les contenus visés vous concernent personnellement. Votre demande ne vise pas à faire disparaître une critique honnête, un avis réel, une information d’intérêt public ou une décision de justice.',
          'Vous choisissez les démarches et vous validez chaque texte avant son envoi : vous restez l’auteur de vos demandes. Une demande de retrait que l’on sait inexacte peut être sanctionnée par la loi.',
        ],
      },
      {
        titre: 'Prix et paiement',
        paras: [
          'Les prix sont ceux de la page Tarifs le jour où vous acceptez notre devis écrit. Ils sont tout compris : aucun frais n’est ajouté ensuite.',
          'Vous payez la moitié à l’ouverture du dossier, après avoir accepté le devis. Le reste n’est dû que pour les liens retirés, au prorata, dans les 14 jours suivant le message qui vous l’annonce.',
          'Un lien compte comme retiré quand le contenu n’est plus en ligne à cette adresse, ou n’apparaît plus dans le moteur de recherche quand c’est la démarche choisie. Si le contenu réapparaît plus tard à une autre adresse, c’est un nouveau lien.',
          'Le paiement en ligne passe par notre prestataire de paiement, qui peut débiter en cedis ghanéens : votre banque peut alors appliquer des frais de change.',
        ],
      },
      {
        titre: 'Droit de rétractation',
        paras: [
          'Si vous vivez dans l’Union européenne, vous avez 14 jours pour vous rétracter après avoir accepté le devis, sans donner de raison. Le plus simple : le lien « Renoncer au contrat ici », en bas de chaque page. Un message à team.devuelta@protonmail.com suffit aussi. Nous vous envoyons un accusé de réception avec la date et l’heure.',
          'Si vous nous demandez de commencer tout de suite, nous commençons avant la fin de ce délai. En cas de rétractation, vous payez seulement le travail déjà fait : nous remboursons le reste sous 14 jours, par le même moyen de paiement. Vous perdez ce droit une fois le service entièrement exécuté.',
        ],
      },
      {
        titre: 'Arrêter le dossier',
        paras: [
          'Vous pouvez arrêter à tout moment en retirant votre mandat. La part payée à l’ouverture reste acquise dès que les premières démarches ont été envoyées ; si rien n’a encore été envoyé, elle vous est remboursée.',
          'Nous pouvons arrêter un dossier si les informations données sont fausses, si la demande vise une information légitime, ou en cas de menaces ou d’insultes envers l’équipe. Si aucune démarche n’a été envoyée, la part d’ouverture vous est alors remboursée.',
        ],
      },
      {
        titre: 'Personnes mineures',
        paras: [
          'Nous ne prenons aucun dossier payant pour une personne de moins de 18 ans : nous l’orientons vers les services officiels gratuits.',
        ],
      },
      {
        titre: 'Responsabilité',
        paras: [
          'Nous ne sommes pas responsables des décisions, des délais ou des erreurs des plateformes, hébergeurs, moteurs de recherche et autorités, ni des nouvelles publications faites par des tiers. Les informations générales du site ne remplacent pas l’avis d’un avocat.',
        ],
      },
      {
        titre: 'Données personnelles',
        paras: [
          'Nous utilisons vos données uniquement pour votre dossier et nous les effaçons après sa clôture, comme expliqué dans notre politique de confidentialité.',
        ],
      },
      {
        titre: 'Désaccord et loi applicable',
        paras: [
          'Une question ou un désaccord : écrivez-nous à team.devuelta@protonmail.com, nous répondons sous 7 jours et cherchons d’abord une solution amiable.',
          'Ces conditions sont soumises au droit ghanéen. Si vous êtes un consommateur, vous gardez les protections que vous donne la loi de votre pays de résidence.',
        ],
      },
    ],
    es: [
      {
        titre: 'Quién vende',
        paras: [
          'El servicio Devuelta lo presta Devuelta, sociedad en proceso de registro en Ghana. No se pide ningún pago antes de que termine el registro; su nombre legal, su número de registro y su dirección figurarán entonces aquí y en cada presupuesto. Contacto: team.devuelta@protonmail.com.',
        ],
      },
      {
        titre: 'Lo que hacemos',
        paras: [
          'Devuelta presta una asistencia técnica y administrativa para retirar o desindexar contenidos en línea que te conciernen: encontrar quién aloja cada enlace, presentarte los procedimientos oficiales, preparar las solicitudes a partir de modelos tipo, enviarlas tras tu validación, insistir y seguir las respuestas.',
          'Devuelta no es un despacho de abogados. No opinamos sobre tus posibilidades, no te representamos ante los tribunales y no presentamos denuncias en tu lugar.',
        ],
      },
      {
        titre: 'Nuestro compromiso',
        paras: [
          'Hacemos todo lo razonablemente posible, solo por vías legales. La decisión de retirar un contenido corresponde a la plataforma, al proveedor de alojamiento, al buscador o a la autoridad: nadie puede prometer un resultado, y nosotros no lo hacemos.',
        ],
      },
      {
        titre: 'Tus compromisos',
        paras: [
          'Nos das información exacta. Los contenidos afectados te conciernen personalmente. Tu solicitud no busca hacer desaparecer una crítica honesta, una reseña real, una información de interés público o una resolución judicial.',
          'Tú eliges las gestiones y validas cada texto antes de su envío: sigues siendo autor o autora de tus solicitudes. Una solicitud de retirada que se sabe inexacta puede ser sancionada por la ley.',
        ],
      },
      {
        titre: 'Precio y pago',
        paras: [
          'Los precios son los de la página Precios el día en que aceptas nuestro presupuesto escrito. Lo incluyen todo: no se añade ningún gasto después.',
          'Pagas la mitad al abrir el caso, después de aceptar el presupuesto. El resto solo se debe por los enlaces retirados, de forma proporcional, en los 14 días siguientes al mensaje que te lo anuncia.',
          'Un enlace cuenta como retirado cuando el contenido ya no está en línea en esa dirección, o ya no aparece en el buscador cuando esa es la gestión elegida. Si el contenido reaparece más tarde en otra dirección, es un enlace nuevo.',
          'El pago en línea pasa por nuestro proveedor de pagos, que puede cobrar en cedis ghaneses: tu banco puede aplicar gastos de cambio.',
        ],
      },
      {
        titre: 'Derecho de desistimiento',
        paras: [
          'Si vives en la Unión Europea, tienes 14 días para desistir después de aceptar el presupuesto, sin dar motivos. Lo más sencillo: el enlace «Desistir del contrato aquí», al pie de cada página. También basta un mensaje a team.devuelta@protonmail.com. Te enviamos un acuse de recibo con la fecha y la hora.',
          'Si nos pides empezar de inmediato, empezamos antes de que termine ese plazo. Si desistes, solo pagas el trabajo ya hecho: te devolvemos el resto en un plazo de 14 días, por el mismo medio de pago. Pierdes este derecho una vez prestado el servicio por completo.',
        ],
      },
      {
        titre: 'Detener el caso',
        paras: [
          'Puedes detenerlo en cualquier momento retirando tu mandato. La parte pagada al abrir el caso no se devuelve una vez enviadas las primeras gestiones; si todavía no se envió nada, se te devuelve.',
          'Podemos detener un caso si la información facilitada es falsa, si la solicitud busca retirar una información legítima, o si hay amenazas o insultos al equipo. Si no se envió ninguna gestión, se te devuelve la parte de apertura.',
        ],
      },
      {
        titre: 'Personas menores de edad',
        paras: [
          'No aceptamos ningún caso de pago para una persona menor de 18 años: la orientamos hacia los servicios oficiales gratuitos.',
        ],
      },
      {
        titre: 'Responsabilidad',
        paras: [
          'No somos responsables de las decisiones, los plazos o los errores de las plataformas, proveedores de alojamiento, buscadores y autoridades, ni de las nuevas publicaciones hechas por terceros. La información general del sitio no sustituye la opinión de un abogado.',
        ],
      },
      {
        titre: 'Datos personales',
        paras: [
          'Usamos tus datos solo para tu caso y los borramos después de cerrarlo, como se explica en nuestra política de privacidad.',
        ],
      },
      {
        titre: 'Desacuerdo y ley aplicable',
        paras: [
          'Si tienes una pregunta o un desacuerdo, escríbenos a team.devuelta@protonmail.com: respondemos en 7 días y buscamos primero una solución amistosa.',
          'Estas condiciones se rigen por la ley de Ghana. Si eres consumidor o consumidora, conservas las protecciones que te da la ley de tu país de residencia.',
        ],
      },
    ],
    en: [
      {
        titre: 'Who sells',
        paras: [
          'The Devuelta service is provided by Devuelta, a company being registered in Ghana. No payment is requested before registration is complete; its legal name, registration number and address will then appear here and on every quote. Contact: team.devuelta@protonmail.com.',
        ],
      },
      {
        titre: 'What we do',
        paras: [
          'Devuelta provides technical and administrative assistance to get online content about you removed or delisted: finding who hosts each link, showing you the official procedures, preparing the requests from standard templates, sending them after your approval, following up and tracking the answers.',
          'Devuelta is not a law firm. We give no opinion on your chances, we do not represent you in court and we do not file police reports for you.',
        ],
      },
      {
        titre: 'Our commitment',
        paras: [
          'We do everything reasonably possible, through legal means only. The decision to remove content belongs to the platform, host, search engine or authority concerned: nobody can promise a result, and we don’t.',
        ],
      },
      {
        titre: 'Your commitments',
        paras: [
          'You give us accurate information. The content concerned is about you personally. Your request does not seek to remove honest criticism, a genuine review, information of public interest or a court decision.',
          'You choose the requests and approve each text before it is sent: you remain the author of your requests. A removal request known to be inaccurate can be penalised by law.',
        ],
      },
      {
        titre: 'Prices and payment',
        paras: [
          'Prices are those on the Pricing page on the day you accept our written quote. They are all-inclusive: no fee is added later.',
          'You pay half when the case opens, after accepting the quote. The rest is only due for the links removed, pro rata, within 14 days of the message telling you so.',
          'A link counts as removed when the content is no longer online at that address, or no longer shows in the search engine when that is the chosen request. If the content reappears later at another address, it is a new link.',
          'Online payment goes through our payment provider, which may charge in Ghanaian cedis: your bank may then apply currency conversion fees.',
        ],
      },
      {
        titre: 'Right of withdrawal',
        paras: [
          'If you live in the European Union, you have 14 days to withdraw after accepting the quote, without giving a reason. The easiest way: the “Withdraw from contract here” link at the bottom of every page. A message to team.devuelta@protonmail.com also works. We send you an acknowledgement showing the date and time.',
          'If you ask us to start right away, we start before that period ends. If you withdraw, you only pay for the work already done: we refund the rest within 14 days, using the same payment method. You lose this right once the service has been fully performed.',
        ],
      },
      {
        titre: 'Stopping the case',
        paras: [
          'You can stop at any time by withdrawing your mandate. The part paid at opening is kept once the first requests have been sent; if nothing has been sent yet, it is refunded.',
          'We may stop a case if the information given is false, if the request targets legitimate information, or if the team is threatened or insulted. If no request has been sent, the opening part is then refunded.',
        ],
      },
      {
        titre: 'Minors',
        paras: [
          'We take no paid case for anyone under 18: we point them to official free services.',
        ],
      },
      {
        titre: 'Liability',
        paras: [
          'We are not responsible for the decisions, delays or mistakes of platforms, hosts, search engines and authorities, nor for new posts made by third parties. The general information on this site does not replace a lawyer’s opinion.',
        ],
      },
      {
        titre: 'Personal data',
        paras: [
          'We use your data only for your case and delete it after the case closes, as explained in our privacy policy.',
        ],
      },
      {
        titre: 'Disagreements and governing law',
        paras: [
          'For any question or disagreement, write to team.devuelta@protonmail.com: we reply within 7 days and look for a friendly solution first.',
          'These terms are governed by the law of Ghana. If you are a consumer, you keep the protections given to you by the law of your country of residence.',
        ],
      },
    ],
  },
};
