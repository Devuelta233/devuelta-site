// Politique de confidentialité et mentions légales, en trois langues.
// Toute modification de fond doit aussi changer la date « mis à jour le ».

import type { T3 } from '../../shared/vocab';

export interface Section {
  titre: string;
  paras: string[];
}

export const MAJ_LEGAL = '2026-10-15';

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
          'Devuelta, service exploité depuis Accra (Ghana). Pour toute question sur vos données : team.devuelta@protonmail.com.',
        ],
      },
      {
        titre: 'Ce que nous collectons',
        paras: [
          'Statistiques de visite : nous comptons le nombre de pages vues par jour, avec la page, le site d’où vous venez (par exemple « google ») et le pays. Aucun cookie, aucun identifiant, et votre adresse IP n’est pas enregistrée.',
          'Formulaire « Confier mon dossier » : ce que vous y écrivez (un prénom ou pseudo, votre moyen de contact, votre situation, votre pays, les liens concernés, votre message et les cases cochées). Pour bloquer les envois abusifs, nous gardons une empreinte chiffrée de votre adresse IP, impossible à relire, supprimée avec la demande.',
          'Si vous devenez client·e : uniquement ce qui est nécessaire à votre dossier (identité, mandat signé, liens à faire retirer, échanges avec les sites). Nous ne vous demandons jamais d’images intimes.',
        ],
      },
      {
        titre: 'Pourquoi, et sur quelle base',
        paras: [
          'Répondre à votre demande et traiter votre dossier : mesures précontractuelles puis exécution du contrat (RGPD, article 6.1.b). Les informations sensibles que vous nous confiez sont traitées avec votre consentement explicite (article 9.2.a), que vous pouvez retirer à tout moment.',
          'Sécurité du service et lutte contre les abus : intérêt légitime (article 6.1.f).',
          'Vos données ne servent jamais à la publicité, à la vente, à des démonstrations ou à entraîner un outil d’intelligence artificielle.',
        ],
      },
      {
        titre: 'Combien de temps',
        paras: [
          'Demande sans suite : supprimée 30 jours après son traitement. Dossier : supprimé automatiquement 6 mois après sa clôture. Statistiques : agrégées, sans donnée personnelle.',
        ],
      },
      {
        titre: 'Qui y a accès',
        paras: [
          'Uniquement notre équipe de trois personnes, liées par un accord de confidentialité, avec double authentification. Notre hébergeur technique, Cloudflare, stocke les données pour notre compte. Personne d’autre.',
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
        paras: ['Devuelta, servicio operado desde Acra (Ghana). Para cualquier pregunta sobre tus datos: team.devuelta@protonmail.com.'],
      },
      {
        titre: 'Qué recogemos',
        paras: [
          'Estadísticas de visitas: contamos las páginas vistas por día, con la página, el sitio desde el que llegas (por ejemplo «google») y el país. Sin cookies, sin identificadores, y tu dirección IP no se guarda.',
          'Formulario «Confiar mi caso»: lo que escribes (un nombre o seudónimo, tu medio de contacto, tu situación, tu país, los enlaces, tu mensaje y las casillas marcadas). Para bloquear envíos abusivos guardamos una huella cifrada de tu dirección IP, imposible de leer, que se borra con la solicitud.',
          'Si te conviertes en cliente: solo lo necesario para tu caso (identidad, mandato firmado, enlaces a retirar, intercambios con los sitios). Nunca te pedimos imágenes íntimas.',
        ],
      },
      {
        titre: 'Para qué y con qué base',
        paras: [
          'Responder a tu solicitud y tramitar tu caso: medidas precontractuales y ejecución del contrato (RGPD, artículo 6.1.b). La información sensible que nos confías se trata con tu consentimiento explícito (artículo 9.2.a), que puedes retirar cuando quieras.',
          'Seguridad del servicio y prevención de abusos: interés legítimo (artículo 6.1.f).',
          'Tus datos nunca se usan para publicidad, venta, demostraciones ni para entrenar inteligencia artificial.',
        ],
      },
      {
        titre: 'Durante cuánto tiempo',
        paras: ['Solicitud sin continuidad: se borra 30 días después de tratarla. Caso: se borra automáticamente 6 meses después de cerrarlo. Estadísticas: agregadas, sin datos personales.'],
      },
      {
        titre: 'Quién tiene acceso',
        paras: [
          'Solo nuestro equipo de tres personas, con acuerdo de confidencialidad y verificación en dos pasos. Nuestro proveedor técnico, Cloudflare, almacena los datos por cuenta nuestra. Nadie más.',
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
        paras: ['Devuelta, a service operated from Accra (Ghana). For any question about your data: team.devuelta@protonmail.com.'],
      },
      {
        titre: 'What we collect',
        paras: [
          'Visit statistics: we count page views per day, with the page, the site you came from (for example "google") and the country. No cookies, no identifiers, and your IP address is not stored.',
          '"Get our help" form: what you write (a first name or nickname, how to contact you, your situation, your country, the links, your message and the boxes you tick). To block abuse we keep an encrypted fingerprint of your IP address, which cannot be read back and is deleted with the request.',
          'If you become a client: only what your case needs (identity, signed mandate, links to remove, exchanges with the sites). We never ask you for intimate images.',
        ],
      },
      {
        titre: 'Why, and on what basis',
        paras: [
          'Answering your request and handling your case: pre-contractual steps, then performance of the contract (GDPR, Article 6(1)(b)). Sensitive information you share is processed with your explicit consent (Article 9(2)(a)), which you can withdraw at any time.',
          'Security of the service and preventing abuse: legitimate interest (Article 6(1)(f)).',
          'Your data is never used for advertising, sale, demonstrations or to train artificial intelligence.',
        ],
      },
      {
        titre: 'How long',
        paras: ['Request not followed up: deleted 30 days after it is handled. Case: deleted automatically 6 months after it is closed. Statistics: aggregated, no personal data.'],
      },
      {
        titre: 'Who has access',
        paras: [
          'Only our team of three, bound by a confidentiality agreement and using two-factor authentication. Our technical host, Cloudflare, stores the data on our behalf. Nobody else.',
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
      { titre: 'Éditeur', paras: ['Devuelta, service exploité depuis Accra (Ghana).', 'Contact : team.devuelta@protonmail.com'] },
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
      { titre: 'Editor', paras: ['Devuelta, servicio operado desde Acra (Ghana).', 'Contacto: team.devuelta@protonmail.com'] },
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
      { titre: 'Publisher', paras: ['Devuelta, a service operated from Accra (Ghana).', 'Contact: team.devuelta@protonmail.com'] },
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
