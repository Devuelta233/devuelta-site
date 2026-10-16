// Formulaire « Renoncer au contrat ici » : nom, dossier concerné, et l'adresse
// e-mail où recevoir l'accusé de réception. Le bouton d'envoi porte le libellé imposé
// (« Confirmer la rétractation ») ; rien ne part sans lui.

import { useEffect, useRef, useState } from 'preact/hooks';
import { LIBELLE_RETRACTATION, dateHeureGmt } from '../../shared/retractation';
import { typoProfonde } from '../../shared/typo';
import type { Lang } from '../../shared/vocab';

export interface DonneesRetractation {
  lang: Lang;
  confidentialite: string;
}

const FR = {
  titre: 'Votre rétractation',
  nom: 'Votre nom et prénom',
  nomAide: 'Ou le nom donné à l’ouverture du dossier.',
  dossier: 'Numéro de dossier (facultatif)',
  dossierAide: 'Il commence par DV-, par exemple DV-2026-0012. Il figure sur nos messages.',
  adresse: 'Votre adresse e-mail, pour l’accusé de réception',
  message: 'Un message (facultatif)',
  donnees: 'Ces informations servent seulement à traiter votre rétractation.',
  confidentialite: 'Politique de confidentialité',
  obligatoire: 'obligatoire',
  envoi: 'Envoi…',
  merciTitre: 'Votre rétractation est enregistrée.',
  merciRef: 'Référence',
  merciDate: 'Reçue le',
  merciTexte: 'Nous arrêtons les démarches. Vous recevez un accusé de réception par e-mail, au plus tard le jour ouvré suivant. Faites une capture de cet écran pour garder une trace.',
  merciAccuse: 'Nous arrêtons les démarches. L’accusé de réception vient de vous être envoyé par e-mail (regardez aussi dans les indésirables). Faites une capture de cet écran pour garder une trace.',
  erreurs: {
    'champ-manquant': 'Un champ obligatoire est vide.',
    'email-invalide': 'L’adresse e-mail semble incorrecte.',
    'telephone-invalide': 'Le numéro semble incorrect. Ajoutez l’indicatif du pays (ex. +33…).',
    'champ-trop-long': 'Un texte est trop long. Raccourcissez-le.',
    'trop-de-demandes': 'Trop d’envois depuis cette connexion. Réessayez dans une heure, ou écrivez-nous à team.devuelta@protonmail.com.',
    defaut: 'L’envoi n’a pas fonctionné. Réessayez, ou écrivez-nous à team.devuelta@protonmail.com : votre message vaut rétractation.',
  } as Record<string, string>,
};

type Textes = typeof FR;

const ES: Textes = {
  titre: 'Tu desistimiento',
  nom: 'Tu nombre y apellidos',
  nomAide: 'O el nombre que diste al abrir el caso.',
  dossier: 'Número de caso (opcional)',
  dossierAide: 'Empieza por DV-, por ejemplo DV-2026-0012. Aparece en nuestros mensajes.',
  adresse: 'Tu correo electrónico, para el acuse de recibo',
  message: 'Un mensaje (opcional)',
  donnees: 'Estos datos solo sirven para tramitar tu desistimiento.',
  confidentialite: 'Política de privacidad',
  obligatoire: 'obligatorio',
  envoi: 'Enviando…',
  merciTitre: 'Tu desistimiento está registrado.',
  merciRef: 'Referencia',
  merciDate: 'Recibido el',
  merciTexte: 'Detenemos las gestiones. Recibirás un acuse de recibo por correo electrónico a más tardar el siguiente día hábil. Haz una captura de esta pantalla para guardar constancia.',
  merciAccuse: 'Detenemos las gestiones. Te acabamos de enviar el acuse de recibo por correo (mira también en spam). Haz una captura de esta pantalla para guardar constancia.',
  erreurs: {
    'champ-manquant': 'Falta un campo obligatorio.',
    'email-invalide': 'El correo electrónico no parece correcto.',
    'telephone-invalide': 'El número no parece correcto. Añade el prefijo del país (p. ej. +34…).',
    'champ-trop-long': 'Un texto es demasiado largo. Acórtalo.',
    'trop-de-demandes': 'Demasiados envíos desde esta conexión. Inténtalo dentro de una hora o escríbenos a team.devuelta@protonmail.com.',
    defaut: 'El envío no ha funcionado. Inténtalo de nuevo o escríbenos a team.devuelta@protonmail.com: tu mensaje vale como desistimiento.',
  },
};

const EN: Textes = {
  titre: 'Your withdrawal',
  nom: 'Your full name',
  nomAide: 'Or the name you gave when the case was opened.',
  dossier: 'Case number (optional)',
  dossierAide: 'It starts with DV-, for example DV-2026-0012. You will find it in our messages.',
  adresse: 'Your email address, for the acknowledgement',
  message: 'A message (optional)',
  donnees: 'We only use this information to process your withdrawal.',
  confidentialite: 'Privacy policy',
  obligatoire: 'required',
  envoi: 'Sending…',
  merciTitre: 'Your withdrawal is recorded.',
  merciRef: 'Reference',
  merciDate: 'Received on',
  merciTexte: 'We are stopping work on your case. You will get an acknowledgement by email by the next working day at the latest. Take a screenshot of this screen to keep a record.',
  merciAccuse: 'We are stopping work on your case. The acknowledgement has just been sent to you by email (check your spam folder too). Take a screenshot of this screen to keep a record.',
  erreurs: {
    'champ-manquant': 'A required field is empty.',
    'email-invalide': 'The email address looks wrong.',
    'telephone-invalide': 'The number looks wrong. Add the country code (e.g. +44…).',
    'champ-trop-long': 'A text is too long. Please shorten it.',
    'trop-de-demandes': 'Too many submissions from this connection. Try again in an hour, or write to team.devuelta@protonmail.com.',
    defaut: 'Sending failed. Try again, or write to team.devuelta@protonmail.com: your message counts as a withdrawal.',
  },
};

const TEXTES: Record<Lang, Textes> = typoProfonde({ fr: FR, es: ES, en: EN });

export function Retractation({ d }: { d: DonneesRetractation }) {
  const t = TEXTES[d.lang];
  const libelle = LIBELLE_RETRACTATION[d.lang];
  const [nom, setNom] = useState('');
  const [dossier, setDossier] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [piege, setPiege] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [recu, setRecu] = useState<{ ref: string; le: string; accuse: boolean } | null>(null);
  const zoneErreur = useRef<HTMLParagraphElement>(null);
  const zoneRecu = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (erreur) zoneErreur.current?.focus();
  }, [erreur]);
  useEffect(() => {
    if (recu) zoneRecu.current?.focus();
  }, [recu]);

  const envoyer = async (e: Event) => {
    e.preventDefault();
    setErreur('');
    if (!nom.trim() || !contact.trim()) {
      setErreur(t.erreurs['champ-manquant']);
      return;
    }
    setEnvoi(true);
    try {
      const r = await fetch('/api/retractation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          langue: d.lang,
          nom,
          dossier,
          contact_mode: 'email',
          contact_valeur: contact,
          message,
          confirme: true,
          site_web: piege,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; ref?: string; recue_le?: string; erreur?: string; accuse?: boolean };
      if (r.ok && j.ok && j.ref && j.recue_le) setRecu({ ref: j.ref, le: j.recue_le, accuse: !!j.accuse });
      else setErreur(t.erreurs[j.erreur ?? ''] ?? t.erreurs.defaut);
    } catch {
      setErreur(t.erreurs.defaut);
    } finally {
      setEnvoi(false);
    }
  };

  if (recu) {
    return (
      <div class="encadre recu" role="status">
        <h2 class="sans-marge" tabIndex={-1} ref={zoneRecu}>
          {t.merciTitre}
        </h2>
        <p>
          {t.merciRef} : <span class="reference">{recu.ref}</span>
        </p>
        <p>
          {t.merciDate} {dateHeureGmt(recu.le, d.lang)}
        </p>
        <p>{recu.accuse ? t.merciAccuse : t.merciTexte}</p>
      </div>
    );
  }

  return (
    <form class="formulaire" onSubmit={envoyer} noValidate>
      <h2>{t.titre}</h2>
      <div class="champ">
        <label for="r-nom">
          {t.nom} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <input id="r-nom" type="text" autocomplete="name" maxLength={80} value={nom} onInput={(e) => setNom((e.target as HTMLInputElement).value)} />
        <span class="aide">{t.nomAide}</span>
      </div>
      <div class="champ">
        <label for="r-dossier">{t.dossier}</label>
        <input id="r-dossier" type="text" autocomplete="off" maxLength={40} value={dossier} onInput={(e) => setDossier((e.target as HTMLInputElement).value)} />
        <span class="aide">{t.dossierAide}</span>
      </div>
      <div class="champ">
        <label for="r-contact">
          {t.adresse} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <input
          id="r-contact"
          type="email"
          autocomplete="email"
          inputMode="email"
          value={contact}
          onInput={(e) => setContact((e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="champ">
        <label for="r-message">{t.message}</label>
        <textarea id="r-message" rows={3} maxLength={1000} value={message} onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)} />
      </div>
      <div class="piege" aria-hidden="true">
        <label>
          Site web
          <input type="text" tabIndex={-1} autocomplete="off" value={piege} onInput={(e) => setPiege((e.target as HTMLInputElement).value)} />
        </label>
      </div>
      <p class="petit">
        {t.donnees} <a href={d.confidentialite}>{t.confidentialite}</a>
      </p>
      {erreur && (
        <p class="erreur" role="alert" tabIndex={-1} ref={zoneErreur}>
          {erreur}
        </p>
      )}
      <div class="actions">
        <button class="bouton principal" type="submit" disabled={envoi}>
          {envoi ? t.envoi : libelle.confirmer}
        </button>
      </div>
    </form>
  );
}
