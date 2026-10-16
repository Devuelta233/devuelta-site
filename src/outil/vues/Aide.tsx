// Règles et aide : ce que chaque membre doit savoir, dans sa langue.

import { typoProfonde } from '../../../shared/typo';
import { indexLangue } from '../i18n';

type T3 = [string, string, string];

const REGLES: T3[] = typoProfonde([
  [
    'Rien ne part sans double accord : la personne approuve le courrier, un membre de l’équipe le relit et le valide, puis l’envoie lui-même depuis team.devuelta@protonmail.com. L’outil ne fait que préparer.',
    'Nada sale sin doble acuerdo: la persona aprueba la carta, un miembro del equipo la revisa y la valida, y luego la envía él mismo desde team.devuelta@protonmail.com. La herramienta solo prepara.',
    'Nothing goes out without a double yes: the person approves the letter, a team member reviews and validates it, then sends it themselves from team.devuelta@protonmail.com. The tool only prepares.',
  ],
  [
    'Mandat signé avant tout courrier envoyé au nom de la personne.',
    'Mandato firmado antes de cualquier carta enviada en nombre de la persona.',
    'Signed mandate before any letter sent on the person’s behalf.',
  ],
  [
    'Jamais de « garantie de suppression », jamais de « conseil juridique ». Nous faisons de l’assistance technique et administrative ; les modèles sont choisis avec la personne.',
    'Nunca «garantía de eliminación», nunca «asesoramiento jurídico». Hacemos asistencia técnica y administrativa; las plantillas se eligen con la persona.',
    'Never a “removal guarantee”, never “legal advice”. We provide technical and administrative assistance; templates are chosen with the person.',
  ],
  [
    'Jamais d’avis sur les chances, jamais de « c’est de la diffamation » : on présente les procédures officielles, la personne choisit et valide chaque texte. On refuse toute demande qui vise une critique honnête, un avis réel, une information d’intérêt public ou une décision de justice.',
    'Nunca opinar sobre las posibilidades ni decir «esto es difamación»: presentamos los procedimientos oficiales, la persona elige y valida cada texto. Rechazamos toda solicitud contra una crítica honesta, una reseña real, una información de interés público o una resolución judicial.',
    'Never give an opinion on the chances or say “this is defamation”: we present the official procedures, the person chooses and approves each text. We turn down any request aimed at honest criticism, a genuine review, information of public interest or a court decision.',
  ],
  [
    'Mineur·e, ou doute sur l’âge : uniquement les canaux officiels et gratuits (Take It Down, 3018, Canal Prioritario…). Jamais de dossier payant.',
    'Menor, o duda sobre la edad: solo los canales oficiales y gratuitos (Take It Down, 3018, Canal Prioritario…). Nunca un caso de pago.',
    'A minor, or any doubt about age: official, free channels only (Take It Down, 3018, Canal Prioritario…). Never a paid case.',
  ],
  [
    'Aucun contenu intime n’est ouvert, téléchargé ou conservé : on travaille à partir des liens.',
    'Ningún contenido íntimo se abre, descarga ni conserva: se trabaja a partir de los enlaces.',
    'No intimate content is opened, downloaded or kept: we work from the links.',
  ],
  [
    'Discrétion : jamais la nature de la situation dans l’objet d’un e-mail ni dans le premier message.',
    'Discreción: nunca la naturaleza de la situación en el asunto de un correo ni en el primer mensaje.',
    'Discretion: never the nature of the situation in an email subject or in the first message.',
  ],
  [
    'Pièce d’identité : toujours masquée avant envoi (écran « Masquer une pièce »), avec une mention « copie pour… ».',
    'Documento de identidad: siempre ocultado antes de enviarlo (pantalla «Ocultar un documento»), con una marca «copia para…».',
    'ID document: always redacted before sending (“Redact an ID” screen), with a “copy for…” watermark.',
  ],
  [
    'Menace, chantage ou danger : d’abord la police ou les urgences. On ne négocie jamais, on ne paie jamais.',
    'Amenaza, chantaje o peligro: primero la policía o emergencias. Nunca se negocia, nunca se paga.',
    'Threats, blackmail or danger: police or emergency services first. Never negotiate, never pay.',
  ],
]);

const AUTO: T3[] = typoProfonde([
  ['prépare les relances des démarches restées sans réponse (brouillons à valider) ;', 'prepara los recordatorios de gestiones sin respuesta (borradores por validar);', 'prepares follow-ups for steps with no reply (drafts to validate);'],
  ['contrôle les liens des dossiers et signale « semble retiré » ou « semble réapparu » (à confirmer par vous) ;', 'controla los enlaces de los casos e indica «parece retirado» o «parece reaparecido» (a confirmar por ti);', 'checks case links and flags “seems removed” or “seems back” (for you to confirm);'],
  ['supprime définitivement les données arrivées à échéance ;', 'borra definitivamente los datos vencidos;', 'permanently deletes data past its retention period;'],
  ['vérifie que les liens officiels du site fonctionnent ;', 'comprueba que los enlaces oficiales del sitio funcionan;', 'checks that the site’s official links work;'],
  ['signale les pages nouvelles ou modifiées aux moteurs de recherche ;', 'avisa a los buscadores de las páginas nuevas o modificadas;', 'notifies search engines of new or updated pages;'],
  ['envoie l’alerte du matin sur les téléphones de l’équipe.', 'envía la alerta de la mañana a los teléfonos del equipo.', 'sends the morning alert to the team’s phones.'],
]);

const PARCOURS: T3[] = typoProfonde([
  ['Demande reçue (alerte sur le téléphone)', 'Solicitud recibida (alerta en el teléfono)', 'Request received (phone alert)'],
  ['Premier contact discret, qualification', 'Primer contacto discreto, calificación', 'Discreet first contact, qualification'],
  ['Ouvrir le dossier', 'Abrir el caso', 'Open the case'],
  ['Mandat signé + identité vérifiée', 'Mandato firmado + identidad verificada', 'Signed mandate + identity checked'],
  ['Liens identifiés, plan proposé', 'Enlaces identificados, plan propuesto', 'Links identified, plan suggested'],
  ['Courriers préparés → relus → validés → envoyés', 'Cartas preparadas → revisadas → validadas → enviadas', 'Letters prepared → reviewed → validated → sent'],
  ['Relances automatiques, contrôle des liens', 'Recordatorios automáticos, control de enlaces', 'Automatic follow-ups, link checks'],
  ['Résultat, clôture, suppression automatique des données', 'Resultado, cierre, borrado automático de los datos', 'Outcome, closing, automatic data deletion'],
]);

const TEXTES = typoProfonde({
  titre: ['Règles et aide', 'Reglas y ayuda', 'Rules & help'] as T3,
  regles: ['Les règles (non négociables)', 'Las reglas (no negociables)', 'The rules (non-negotiable)'] as T3,
  auto: ['Ce que le système fait seul, chaque matin vers 5 h 30 (heure du Ghana)', 'Lo que el sistema hace solo, cada mañana hacia las 5:30 (hora de Ghana)', 'What the system does on its own, every morning around 5:30 (Ghana time)'] as T3,
  parcours: ['Le parcours d’un dossier', 'El recorrido de un caso', 'The life of a case'] as T3,
  telephone: ['Installer EraseOps sur le téléphone', 'Instalar EraseOps en el teléfono', 'Install EraseOps on your phone'] as T3,
  iphone: [
    'iPhone : ouvrez getdevuelta.com/outil dans Safari → bouton Partager → « Sur l’écran d’accueil ». Ouvrez EraseOps depuis l’icône, puis Réglages → recevoir les alertes.',
    'iPhone: abre getdevuelta.com/outil en Safari → botón Compartir → «Añadir a pantalla de inicio». Abre EraseOps desde el icono y luego Ajustes → recibir alertas.',
    'iPhone: open getdevuelta.com/outil in Safari → Share button → “Add to Home Screen”. Open EraseOps from the icon, then Settings → get alerts.',
  ] as T3,
  android: [
    'Android : ouvrez getdevuelta.com/outil dans Chrome → menu ⋮ → « Installer l’application » (ou « Ajouter à l’écran d’accueil »), puis Réglages → recevoir les alertes.',
    'Android: abre getdevuelta.com/outil en Chrome → menú ⋮ → «Instalar aplicación» (o «Añadir a pantalla de inicio») y luego Ajustes → recibir alertas.',
    'Android: open getdevuelta.com/outil in Chrome → ⋮ menu → “Install app” (or “Add to Home screen”), then Settings → get alerts.',
  ] as T3,
  probleme: ['En cas de problème', 'Si hay un problema', 'If something goes wrong'] as T3,
  perte: [
    'Téléphone perdu, message suspect, connexion inhabituelle : prévenez l’administrateur tout de suite. Il réinitialise votre mot de passe et votre double authentification en une minute.',
    'Teléfono perdido, mensaje sospechoso, acceso inusual: avisa al administrador enseguida. Restablece tu contraseña y tu verificación en dos pasos en un minuto.',
    'Lost phone, suspicious message, unusual login: tell the administrator right away. They reset your password and two-factor authentication in a minute.',
  ] as T3,
  doute: [
    'Un doute sur un dossier ? Une note dans le dossier pour l’équipe, puis on décide ensemble. Mieux vaut attendre une heure qu’envoyer un courrier faux.',
    '¿Una duda sobre un caso? Una nota en el caso para el equipo y se decide juntos. Mejor esperar una hora que enviar una carta equivocada.',
    'Unsure about a case? Leave a note in the case for the team, then decide together. Better to wait an hour than send a wrong letter.',
  ] as T3,
});

export function Aide() {
  const i = indexLangue();
  return (
    <div class="o-aide-page">
      <h1>{TEXTES.titre[i]}</h1>
      <section class="o-encadre o-alerte">
        <h2>{TEXTES.regles[i]}</h2>
        <ol>
          {REGLES.map((r) => (
            <li>{r[i]}</li>
          ))}
        </ol>
      </section>
      <section class="o-encadre">
        <h2>{TEXTES.parcours[i]}</h2>
        <ol class="o-parcours">
          {PARCOURS.map((r) => (
            <li>{r[i]}</li>
          ))}
        </ol>
      </section>
      <section class="o-encadre">
        <h2>{TEXTES.auto[i]}</h2>
        <ul>
          {AUTO.map((r) => (
            <li>{r[i]}</li>
          ))}
        </ul>
      </section>
      <section class="o-encadre">
        <h2>{TEXTES.telephone[i]}</h2>
        <p>{TEXTES.iphone[i]}</p>
        <p>{TEXTES.android[i]}</p>
      </section>
      <section class="o-encadre">
        <h2>{TEXTES.probleme[i]}</h2>
        <p>{TEXTES.perte[i]}</p>
        <p>{TEXTES.doute[i]}</p>
      </section>
    </div>
  );
}
