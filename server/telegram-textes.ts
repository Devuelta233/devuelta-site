// Textes du robot Telegram de Devuelta, en trois langues. Messages fixes, écrits
// par l'équipe : jamais d'intelligence artificielle ici. Ils parlent comme Steven
// (direct, simple, chaleureux, « on » plutôt que « nous », sans jargon ni
// promesse), mais sans son nom ni rien de personnel. Le robot dit qu'il est un
// robot (« je ») ; « on » et « une vraie personne », c'est l'équipe, qui prend le
// relais dans la même conversation. Les conseils (menaces, personnes mineures)
// viennent des mêmes textes que le site, pour dire partout la même chose.

import { typoProfonde } from '../shared/typo';
import type { Lang } from '../shared/vocab';

export interface TextesRobot {
  accueil: string;
  qAge: string;
  ageOui: string;
  ageNon: string;
  qSituation: string;
  qMenace: string;
  oui: string;
  non: string;
  menaceTitre: string;
  qAccord: string;
  accordOui: string;
  accordNon: string;
  confirmation: string;
  refus: string;
  rienGarde: string;
  fichierRefuse: string;
  fichierRetire: string;
  texteEnAttente: string;
  accuse: string;
  liensAjoutes: string;
  dejaDemande: string;
  aide: string;
  choisirLangue: string;
  langueChoisie: string;
  dejaRepondu: string;
  boutonGuide: string;
  boutonQueFaire: string;
  boutonDiagnostic: string;
  boutonUrgence: string;
  boutonFaq: string;
  boutonTakeItDown: string;
  boutonConfidentialite: string;
}

const FR: TextesRobot = {
  accueil: [
    'Bonjour, et merci de nous écrire. Ici, c\'est Devuelta.',
    '',
    'On aide les gens à faire retirer d\'Internet ce qui leur nuit : photo intime diffusée, faux profil, compte piraté, faux avis, adresse ou papiers exposés.',
    '',
    'Je suis le robot de l\'équipe : je vous pose juste trois questions. Ensuite, c\'est une vraie personne qui vous répond, ici même, en général sous 24 à 48 heures. Rien ne se fait sans votre accord.',
    '',
    'Important : ne nous envoyez jamais d\'images. On ne vous demandera jamais de mot de passe, de code reçu par SMS, ni de payer autrement que par le lien de paiement Devuelta.',
  ].join('\n'),
  qAge: [
    '1/3 — La personne concernée a 18 ans ou plus ?',
    '(Si des photos ou des vidéos ont été prises avant ses 18 ans, répondez « Non ».)',
  ].join('\n'),
  ageOui: 'Oui, 18 ans ou plus',
  ageNon: 'Non',
  qSituation: '2/3 — Qu\'est-ce qui vous arrive ? Choisissez ce qui ressemble le plus à votre situation.',
  qMenace: '3/3 — Est-ce que quelqu\'un vous menace ou vous fait du chantage en ce moment ?',
  oui: 'Oui',
  non: 'Non',
  menaceTitre: 'D\'abord : vous n\'êtes pas seul·e, et ce n\'est pas de votre faute. Voilà ce qu\'il faut faire tout de suite :',
  qAccord: [
    'Dernière chose avant que je passe votre demande à l\'équipe.',
    '',
    'On garde vos réponses, votre prénom Telegram et les messages écrits que vous nous envoyez ici. Jamais d\'images. Seule notre équipe y a accès. Si votre demande n\'a pas de suite, tout est effacé 30 jours après son traitement.',
    '',
    'Vous êtes d\'accord ?',
  ].join('\n'),
  accordOui: 'Oui, j\'envoie ma demande',
  accordNon: 'Non merci',
  confirmation: [
    'C\'est noté, merci de votre confiance. Votre numéro de demande : {ref}.',
    '',
    'Une vraie personne de l\'équipe vous répond ici, en général sous 24 à 48 heures.',
    '',
    'En attendant, vous pouvez déjà nous écrire ici ce qui se passe, en quelques mots, et nous envoyer les adresses (liens) des pages où le contenu apparaît. Pas d\'images : les liens suffisent.',
  ].join('\n'),
  refus: [
    'Pas de souci. On n\'a rien gardé de cette conversation.',
    '',
    'Nos guides gratuits sont là si vous voulez avancer de votre côté, et vous pouvez revenir quand vous voulez : il suffit d\'écrire /start.',
  ].join('\n'),
  rienGarde: 'On n\'a rien gardé de cette conversation.',
  fichierRefuse: [
    'Pour votre sécurité, ici on ne reçoit que des messages écrits : pas de photos, de vidéos, de fichiers, de messages vocaux ni de numéros de téléphone. On ne l\'a pas gardé.',
    '',
    'Si un contenu vous concerne, envoyez-nous plutôt l\'adresse (le lien) de la page où il apparaît.',
  ].join('\n'),
  fichierRetire: [
    'Pour votre sécurité, ici on ne reçoit que des messages écrits : pas de photos, de vidéos, de fichiers, de messages vocaux ni de numéros de téléphone. Je l\'ai retiré de la conversation, et on ne l\'a pas gardé.',
    '',
    'Si un contenu vous concerne, envoyez-nous plutôt l\'adresse (le lien) de la page où il apparaît.',
  ].join('\n'),
  texteEnAttente: 'Merci, c\'est noté : je le joins à votre demande. Pour que la bonne personne vous réponde, choisissez d\'abord une réponse ci-dessous.',
  accuse: 'Bien reçu, merci. Une personne de l\'équipe vous répond ici, en général sous 24 à 48 heures.',
  liensAjoutes: 'C\'est ajouté à votre demande.',
  dejaDemande: 'Votre demande {ref} est bien entre nos mains. Si vous avez du nouveau, écrivez-le ici : une personne de l\'équipe vous répond dans cette conversation.',
  aide: [
    'Ici, vous parlez à l\'équipe Devuelta. Écrivez-nous en quelques mots : une vraie personne vous répond dans cette conversation.',
    '',
    '/start : commencer, ou voir où en est votre demande',
    '/langue : changer de langue',
    '',
    'On ne vous demandera jamais d\'images, de mot de passe, de code reçu par SMS, ni de payer autrement que par le lien de paiement Devuelta.',
  ].join('\n'),
  choisirLangue: 'Vous préférez qu\'on vous écrive dans quelle langue ?',
  langueChoisie: 'C\'est noté : on vous écrit en français.',
  dejaRepondu: 'Cette question a déjà une réponse.',
  boutonGuide: 'Le guide gratuit pour votre situation',
  boutonQueFaire: 'Que faire maintenant',
  boutonDiagnostic: 'Le diagnostic gratuit (3 minutes)',
  boutonUrgence: 'Aide urgente : les numéros par pays',
  boutonFaq: 'Questions fréquentes',
  boutonTakeItDown: 'Take It Down (images prises avant 18 ans)',
  boutonConfidentialite: 'Notre politique de confidentialité',
};

const ES: TextesRobot = {
  accueil: [
    'Hola, y gracias por escribirnos. Aquí Devuelta.',
    '',
    'Ayudamos a la gente a retirar de internet lo que le hace daño: foto íntima difundida, perfil falso, cuenta hackeada, reseñas falsas, dirección o documentos expuestos.',
    '',
    'Soy el robot del equipo: solo te hago tres preguntas. Después te responde una persona real, aquí mismo, normalmente en 24 a 48 horas. Nada se hace sin tu acuerdo.',
    '',
    'Importante: nunca nos envíes imágenes. Nunca te pediremos contraseñas, códigos recibidos por SMS, ni que pagues por otro medio que el enlace de pago de Devuelta.',
  ].join('\n'),
  qAge: [
    '1/3 — ¿La persona afectada tiene 18 años o más?',
    '(Si hay fotos o videos tomados antes de sus 18 años, responde «No».)',
  ].join('\n'),
  ageOui: 'Sí, 18 años o más',
  ageNon: 'No',
  qSituation: '2/3 — ¿Qué te está pasando? Elige lo que más se parezca a tu situación.',
  qMenace: '3/3 — ¿Alguien te amenaza o te chantajea ahora mismo?',
  oui: 'Sí',
  non: 'No',
  menaceTitre: 'Primero: no estás sol@ y no es tu culpa. Esto es lo que hay que hacer ya:',
  qAccord: [
    'Una última cosa antes de pasar tu solicitud al equipo.',
    '',
    'Guardamos tus respuestas, tu nombre de Telegram y los mensajes escritos que nos envíes aquí. Nunca imágenes. Solo nuestro equipo tiene acceso. Si tu solicitud no sigue adelante, todo se borra 30 días después de tratarla.',
    '',
    '¿Estás de acuerdo?',
  ].join('\n'),
  accordOui: 'Sí, envío mi solicitud',
  accordNon: 'No, gracias',
  confirmation: [
    'Listo, gracias por tu confianza. Tu número de solicitud: {ref}.',
    '',
    'Una persona real del equipo te responde aquí, normalmente en 24 a 48 horas.',
    '',
    'Mientras tanto, ya puedes escribirnos aquí qué está pasando, en pocas palabras, y enviarnos las direcciones (enlaces) de las páginas donde aparece el contenido. Nada de imágenes: los enlaces bastan.',
  ].join('\n'),
  refus: [
    'Sin problema. No hemos guardado nada de esta conversación.',
    '',
    'Nuestras guías gratuitas están ahí si quieres avanzar por tu cuenta, y puedes volver cuando quieras: basta con escribir /start.',
  ].join('\n'),
  rienGarde: 'No hemos guardado nada de esta conversación.',
  fichierRefuse: [
    'Por tu seguridad, aquí solo recibimos mensajes escritos: ni fotos, ni videos, ni archivos, ni mensajes de voz, ni números de teléfono. No lo hemos guardado.',
    '',
    'Si un contenido te afecta, mejor envíanos la dirección (el enlace) de la página donde aparece.',
  ].join('\n'),
  fichierRetire: [
    'Por tu seguridad, aquí solo recibimos mensajes escritos: ni fotos, ni videos, ni archivos, ni mensajes de voz, ni números de teléfono. Lo quité de la conversación, y no lo hemos guardado.',
    '',
    'Si un contenido te afecta, mejor envíanos la dirección (el enlace) de la página donde aparece.',
  ].join('\n'),
  texteEnAttente: 'Gracias, anotado: lo añado a tu solicitud. Para que te responda la persona adecuada, elige primero una respuesta aquí abajo.',
  accuse: 'Recibido, gracias. Una persona del equipo te responde aquí, normalmente en 24 a 48 horas.',
  liensAjoutes: 'Añadido a tu solicitud.',
  dejaDemande: 'Tu solicitud {ref} está en nuestras manos. Si hay novedades, escríbelas aquí: una persona del equipo te responde en esta conversación.',
  aide: [
    'Aquí hablas con el equipo de Devuelta. Escríbenos en pocas palabras: una persona real te responde en esta conversación.',
    '',
    '/start: empezar, o ver cómo va tu solicitud',
    '/idioma: cambiar de idioma',
    '',
    'Nunca te pediremos imágenes, contraseñas, códigos recibidos por SMS, ni que pagues por otro medio que el enlace de pago de Devuelta.',
  ].join('\n'),
  choisirLangue: '¿En qué idioma prefieres que te escribamos?',
  langueChoisie: 'Anotado: te escribimos en español.',
  dejaRepondu: 'Esta pregunta ya tiene respuesta.',
  boutonGuide: 'La guía gratuita para tu situación',
  boutonQueFaire: 'Qué hacer ahora',
  boutonDiagnostic: 'El diagnóstico gratuito (3 minutos)',
  boutonUrgence: 'Ayuda urgente: los números por país',
  boutonFaq: 'Preguntas frecuentes',
  boutonTakeItDown: 'Take It Down (imágenes de antes de los 18)',
  boutonConfidentialite: 'Nuestra política de privacidad',
};

const EN: TextesRobot = {
  accueil: [
    'Hi, and thank you for writing to us. This is Devuelta.',
    '',
    'We help people get harmful content removed from the internet: a shared intimate photo, a fake profile, a hacked account, fake reviews, an exposed address or ID.',
    '',
    'I am the team’s bot: I will just ask you three questions. After that, a real person replies to you, right here, usually within 24 to 48 hours. Nothing happens without your agreement.',
    '',
    'Important: never send us images. We will never ask you for a password, a code sent to you by text message, or to pay any other way than through the Devuelta payment link.',
  ].join('\n'),
  qAge: [
    '1/3 — Is the person concerned 18 or over?',
    '(If any photos or videos were taken before they turned 18, answer “No”.)',
  ].join('\n'),
  ageOui: 'Yes, 18 or over',
  ageNon: 'No',
  qSituation: '2/3 — What is happening to you? Choose what is closest to your situation.',
  qMenace: '3/3 — Is someone threatening or blackmailing you right now?',
  oui: 'Yes',
  non: 'No',
  menaceTitre: 'First: you are not alone, and it is not your fault. Here is what to do right now:',
  qAccord: [
    'One last thing before I pass your request to the team.',
    '',
    'We keep your answers, your Telegram first name and the written messages you send us here. Never images. Only our team can access them. If your request goes no further, everything is deleted 30 days after it is handled.',
    '',
    'Do you agree?',
  ].join('\n'),
  accordOui: 'Yes, send my request',
  accordNon: 'No thanks',
  confirmation: [
    'Done, thank you for trusting us. Your request number: {ref}.',
    '',
    'A real person from the team will reply to you here, usually within 24 to 48 hours.',
    '',
    'In the meantime, you can already tell us here what is happening, in a few words, and send us the addresses (links) of the pages where the content appears. No images: the links are enough.',
  ].join('\n'),
  refus: [
    'No problem. We have kept nothing from this conversation.',
    '',
    'Our free guides are there if you want to move forward on your own, and you can come back whenever you like: just type /start.',
  ].join('\n'),
  rienGarde: 'We have kept nothing from this conversation.',
  fichierRefuse: [
    'For your safety, we only accept written messages here: no photos, videos, files, voice messages or phone numbers. We have not kept it.',
    '',
    'If some content concerns you, send us the address (link) of the page where it appears instead.',
  ].join('\n'),
  fichierRetire: [
    'For your safety, we only accept written messages here: no photos, videos, files, voice messages or phone numbers. I removed it from the conversation, and we have not kept it.',
    '',
    'If some content concerns you, send us the address (link) of the page where it appears instead.',
  ].join('\n'),
  texteEnAttente: 'Thank you, noted: I am adding it to your request. So that the right person replies, please choose an answer below first.',
  accuse: 'Received, thank you. A member of the team will reply to you here, usually within 24 to 48 hours.',
  liensAjoutes: 'Added to your request.',
  dejaDemande: 'Your request {ref} is in our hands. If anything changes, write it here: a member of the team replies in this conversation.',
  aide: [
    'Here you are talking to the Devuelta team. Write to us in a few words: a real person replies in this conversation.',
    '',
    '/start: begin, or see where your request stands',
    '/language: change language',
    '',
    'We will never ask you for images, a password, a code sent by text message, or to pay any other way than through the Devuelta payment link.',
  ].join('\n'),
  choisirLangue: 'Which language would you like us to write to you in?',
  langueChoisie: 'Noted: we will write to you in English.',
  dejaRepondu: 'This question already has an answer.',
  boutonGuide: 'The free guide for your situation',
  boutonQueFaire: 'What to do now',
  boutonDiagnostic: 'The free check (3 minutes)',
  boutonUrgence: 'Urgent help: numbers by country',
  boutonFaq: 'Frequently asked questions',
  boutonTakeItDown: 'Take It Down (images taken before 18)',
  boutonConfidentialite: 'Our privacy policy',
};

export const TEXTES_ROBOT: Record<Lang, TextesRobot> = typoProfonde({ fr: FR, es: ES, en: EN });
