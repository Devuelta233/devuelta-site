// Page « Signer » : le client lit son devis et son mandat, tape son nom et signe.
// Le lien personnel porte un jeton après # : il ne quitte jamais le navigateur,
// sauf pour être vérifié par notre serveur.

import { useEffect, useRef, useState } from 'preact/hooks';
import { dateHeureGmt } from '../../shared/retractation';
import { euros } from '../../shared/tarifs';
import { typoProfonde } from '../../shared/typo';
import type { Lang } from '../../shared/vocab';

export interface DonneesSignature {
  lang: Lang;
  conditions: string;
  confidentialite: string;
}

interface Resume {
  ref: string;
  liens: number;
  total: number;
  ouverture: number;
  solde: number;
}

type Etat =
  | { statut: 'chargement' }
  | { statut: 'introuvable' }
  | { statut: 'expire' }
  | { statut: 'annule' }
  | { statut: 'a-signer'; document: string; resume: Resume }
  | { statut: 'signe'; documentSigne: string; signeLe: string; copieEnvoyee: boolean | null };

const FR = {
  chargement: 'Chargement de votre document…',
  recap: 'En bref',
  dossier: 'Dossier',
  liens: 'Nombre de liens',
  total: 'Prix total',
  ouverture: 'À payer à l’ouverture',
  solde: 'Le reste, au plus',
  soldeAide: 'seulement pour les liens retirés',
  document: 'Le document complet',
  nom: 'Votre nom et prénom',
  nomAide: 'Comme sur votre pièce d’identité. Il vaut signature.',
  cgv: 'J’ai lu le devis, le mandat et les conditions de vente, et je les accepte.',
  lireConditions: 'Lire les conditions de vente',
  debut:
    'Je demande que Devuelta commence tout de suite, sans attendre la fin du délai de rétractation de 14 jours. Si je me rétracte ensuite, je paie seulement le travail déjà fait. Je sais que je perds ce droit une fois le service entièrement exécuté.',
  debutAide: 'Facultatif. Sans cette case, nous commençons après les 14 jours.',
  bouton: 'Je signe et je m’engage à payer',
  envoi: 'Signature…',
  merciTitre: 'C’est signé. Merci.',
  signeLe: 'Signé le',
  copieOui: 'Une copie vient de vous être envoyée par e-mail. Pensez à regarder dans les indésirables.',
  copieNon: 'Gardez une copie : imprimez cette page ou enregistrez-la en PDF.',
  suite: 'Prochaine étape : nous vous envoyons le lien de paiement d’ouverture. Nous ne vous demanderons jamais d’images intimes.',
  dejaSigne: 'Ce document est déjà signé. Voici votre copie.',
  imprimer: 'Imprimer ou enregistrer en PDF',
  expire: 'Ce lien n’est plus valable. Écrivez-nous à team.devuelta@protonmail.com : nous vous en envoyons un nouveau.',
  annule: 'Ce lien a été remplacé par un plus récent. Utilisez le dernier lien reçu, ou écrivez-nous à team.devuelta@protonmail.com.',
  introuvable: 'Ce lien est incomplet ou inconnu. Ouvrez le lien en entier, directement depuis notre message.',
  donnees: 'Votre nom, la date et l’heure de signature sont gardés avec le document, comme preuve.',
  confidentialite: 'Politique de confidentialité',
  obligatoire: 'obligatoire',
  erreurs: {
    'nom-invalide': 'Tapez votre nom et votre prénom.',
    'champ-manquant': 'Tapez votre nom et votre prénom.',
    'champ-trop-long': 'Le nom est trop long.',
    'cgv-requises': 'Cochez la case pour accepter le devis et les conditions.',
    'deja-signe': 'Ce document est déjà signé.',
    'lien-expire': 'Ce lien n’est plus valable. Écrivez-nous pour en recevoir un nouveau.',
    'lien-annule': 'Ce lien a été remplacé par un plus récent.',
    defaut: 'La signature n’a pas fonctionné. Réessayez, ou écrivez-nous à team.devuelta@protonmail.com.',
  } as Record<string, string>,
};

type Textes = typeof FR;

const ES: Textes = {
  chargement: 'Cargando tu documento…',
  recap: 'En resumen',
  dossier: 'Caso',
  liens: 'Número de enlaces',
  total: 'Precio total',
  ouverture: 'A pagar al abrir el caso',
  solde: 'El resto, como máximo',
  soldeAide: 'solo por los enlaces retirados',
  document: 'El documento completo',
  nom: 'Tu nombre y apellidos',
  nomAide: 'Como en tu documento de identidad. Vale como firma.',
  cgv: 'He leído el presupuesto, el mandato y las condiciones de venta, y los acepto.',
  lireConditions: 'Leer las condiciones de venta',
  debut:
    'Pido que Devuelta empiece ya, sin esperar al final del plazo de desistimiento de 14 días. Si desisto después, solo pago el trabajo ya hecho. Sé que pierdo este derecho una vez prestado el servicio por completo.',
  debutAide: 'Opcional. Sin esta casilla, empezamos después de los 14 días.',
  bouton: 'Firmo y me comprometo a pagar',
  envoi: 'Firmando…',
  merciTitre: 'Ya está firmado. Gracias.',
  signeLe: 'Firmado el',
  copieOui: 'Te acabamos de enviar una copia por correo. Mira también en la carpeta de spam.',
  copieNon: 'Guarda una copia: imprime esta página o guárdala en PDF.',
  suite: 'Siguiente paso: te enviamos el enlace de pago de apertura. Nunca te pediremos imágenes íntimas.',
  dejaSigne: 'Este documento ya está firmado. Aquí tienes tu copia.',
  imprimer: 'Imprimir o guardar en PDF',
  expire: 'Este enlace ya no es válido. Escríbenos a team.devuelta@protonmail.com y te enviamos uno nuevo.',
  annule: 'Este enlace se ha sustituido por uno más reciente. Usa el último enlace recibido, o escríbenos a team.devuelta@protonmail.com.',
  introuvable: 'Este enlace está incompleto o no existe. Ábrelo entero, directamente desde nuestro mensaje.',
  donnees: 'Tu nombre, la fecha y la hora de la firma se guardan con el documento, como prueba.',
  confidentialite: 'Política de privacidad',
  obligatoire: 'obligatorio',
  erreurs: {
    'nom-invalide': 'Escribe tu nombre y apellidos.',
    'champ-manquant': 'Escribe tu nombre y apellidos.',
    'champ-trop-long': 'El nombre es demasiado largo.',
    'cgv-requises': 'Marca la casilla para aceptar el presupuesto y las condiciones.',
    'deja-signe': 'Este documento ya está firmado.',
    'lien-expire': 'Este enlace ya no es válido. Escríbenos para recibir uno nuevo.',
    'lien-annule': 'Este enlace se ha sustituido por uno más reciente.',
    defaut: 'La firma no ha funcionado. Inténtalo de nuevo, o escríbenos a team.devuelta@protonmail.com.',
  },
};

const EN: Textes = {
  chargement: 'Loading your document…',
  recap: 'In short',
  dossier: 'Case',
  liens: 'Number of links',
  total: 'Total price',
  ouverture: 'To pay when the case opens',
  solde: 'The rest, at most',
  soldeAide: 'only for the links removed',
  document: 'The full document',
  nom: 'Your full name',
  nomAide: 'As on your ID. It counts as your signature.',
  cgv: 'I have read the quote, the authorization and the terms of sale, and I accept them.',
  lireConditions: 'Read the terms of sale',
  debut:
    'I ask Devuelta to start right away, without waiting for the 14-day withdrawal period to end. If I withdraw later, I only pay for the work already done. I know I lose this right once the service has been fully performed.',
  debutAide: 'Optional. Without it, we start after the 14 days.',
  bouton: 'Sign and agree to pay',
  envoi: 'Signing…',
  merciTitre: 'It is signed. Thank you.',
  signeLe: 'Signed on',
  copieOui: 'A copy has just been sent to you by email. Check your spam folder too.',
  copieNon: 'Keep a copy: print this page or save it as a PDF.',
  suite: 'Next step: we send you the opening payment link. We will never ask you for intimate images.',
  dejaSigne: 'This document is already signed. Here is your copy.',
  imprimer: 'Print or save as PDF',
  expire: 'This link is no longer valid. Write to team.devuelta@protonmail.com and we will send you a new one.',
  annule: 'This link has been replaced by a newer one. Use the latest link you received, or write to team.devuelta@protonmail.com.',
  introuvable: 'This link is incomplete or unknown. Open the full link, straight from our message.',
  donnees: 'Your name and the date and time of signing are kept with the document, as proof.',
  confidentialite: 'Privacy policy',
  obligatoire: 'required',
  erreurs: {
    'nom-invalide': 'Type your first and last name.',
    'champ-manquant': 'Type your first and last name.',
    'champ-trop-long': 'The name is too long.',
    'cgv-requises': 'Tick the box to accept the quote and the terms.',
    'deja-signe': 'This document is already signed.',
    'lien-expire': 'This link is no longer valid. Write to us to get a new one.',
    'lien-annule': 'This link has been replaced by a newer one.',
    defaut: 'Signing failed. Try again, or write to team.devuelta@protonmail.com.',
  },
};

const TEXTES: Record<Lang, Textes> = typoProfonde({ fr: FR, es: ES, en: EN });

async function appel(chemin: string, corps: unknown): Promise<{ ok: boolean; status: number; j: Record<string, any> }> {
  const r = await fetch(chemin, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
  const j = (await r.json().catch(() => ({}))) as Record<string, any>;
  return { ok: r.ok && j.ok === true, status: r.status, j };
}

export function Signature({ d }: { d: DonneesSignature }) {
  const t = TEXTES[d.lang];
  const [jeton] = useState(() => (typeof location !== 'undefined' ? location.hash.replace(/^#/, '').trim() : ''));
  const [etat, setEtat] = useState<Etat>({ statut: 'chargement' });
  const [nom, setNom] = useState('');
  const [cgv, setCgv] = useState(false);
  const [debut, setDebut] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const zoneErreur = useRef<HTMLParagraphElement>(null);
  const zoneFin = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!jeton) {
      setEtat({ statut: 'introuvable' });
      return;
    }
    appel('/api/signature/lire', { jeton })
      .then(({ ok, j }) => {
        if (!ok) return setEtat({ statut: 'introuvable' });
        if (j.statut === 'a-signer') return setEtat({ statut: 'a-signer', document: j.document, resume: j.resume });
        if (j.statut === 'signe') return setEtat({ statut: 'signe', documentSigne: j.document_signe, signeLe: j.signe_le, copieEnvoyee: null });
        setEtat({ statut: j.statut === 'expire' ? 'expire' : 'annule' });
      })
      .catch(() => setEtat({ statut: 'introuvable' }));
  }, [jeton]);
  useEffect(() => {
    if (erreur) zoneErreur.current?.focus();
  }, [erreur]);
  useEffect(() => {
    if (etat.statut === 'signe') zoneFin.current?.focus();
  }, [etat.statut]);

  const signer = async (e: Event) => {
    e.preventDefault();
    setErreur('');
    if (nom.replace(/[^\p{L}]/gu, '').length < 3) return setErreur(t.erreurs['nom-invalide']);
    if (!cgv) return setErreur(t.erreurs['cgv-requises']);
    setEnvoi(true);
    try {
      const { ok, j } = await appel('/api/signature/signer', { jeton, nom, cgv: true, debut_immediat: debut });
      if (ok) setEtat({ statut: 'signe', documentSigne: j.document_signe, signeLe: j.signe_le, copieEnvoyee: !!j.copie_envoyee });
      else setErreur(t.erreurs[j.erreur ?? ''] ?? t.erreurs.defaut);
    } catch {
      setErreur(t.erreurs.defaut);
    } finally {
      setEnvoi(false);
    }
  };

  if (etat.statut === 'chargement') return <p>{t.chargement}</p>;
  if (etat.statut === 'introuvable') return <p class="encadre">{t.introuvable}</p>;
  if (etat.statut === 'expire' || etat.statut === 'annule') return <p class="encadre">{t[etat.statut]}</p>;

  if (etat.statut === 'signe') {
    return (
      <div>
        <div class="encadre recu" role="status">
          <h2 class="sans-marge" tabIndex={-1} ref={zoneFin}>
            {etat.copieEnvoyee === null ? t.dejaSigne : t.merciTitre}
          </h2>
          <p>
            {t.signeLe} {dateHeureGmt(etat.signeLe, d.lang)}
          </p>
          {etat.copieEnvoyee !== null && <p>{etat.copieEnvoyee ? t.copieOui : t.copieNon}</p>}
          {etat.copieEnvoyee !== null && <p>{t.suite}</p>}
          <p class="pas-imprimer">
            <button type="button" class="bouton" onClick={() => window.print()}>
              {t.imprimer}
            </button>
          </p>
        </div>
        <pre class="document-signe">{etat.documentSigne}</pre>
      </div>
    );
  }

  const r = etat.resume;
  return (
    <div>
      <div class="encadre">
        <h2 class="sans-marge">{t.recap}</h2>
        <ul class="recap">
          <li>
            {t.dossier} : <strong>{r.ref}</strong>
          </li>
          <li>
            {t.liens} : <strong>{r.liens}</strong>
          </li>
          <li>
            {t.total} : <strong>{euros(r.total, d.lang)}</strong>
          </li>
          <li>
            {t.ouverture} : <strong>{euros(r.ouverture, d.lang)}</strong>
          </li>
          <li>
            {t.solde} : <strong>{euros(r.solde, d.lang)}</strong>, {t.soldeAide}
          </li>
        </ul>
      </div>
      <details class="document" open>
        <summary>{t.document}</summary>
        <pre class="document-signe">{etat.document}</pre>
      </details>
      <form class="formulaire" onSubmit={signer} noValidate>
        <div class="champ">
          <label for="s-nom">
            {t.nom} <span class="aide-inline">({t.obligatoire})</span>
          </label>
          <input id="s-nom" type="text" autocomplete="name" maxLength={120} value={nom} onInput={(e) => setNom((e.target as HTMLInputElement).value)} />
          <span class="aide">{t.nomAide}</span>
        </div>
        <div class="choix">
          <label>
            <input type="checkbox" checked={cgv} onChange={(e) => setCgv((e.target as HTMLInputElement).checked)} />
            <span>
              {t.cgv} <a href={d.conditions} target="_blank" rel="noopener">{t.lireConditions}</a>
            </span>
          </label>
          <label>
            <input type="checkbox" checked={debut} onChange={(e) => setDebut((e.target as HTMLInputElement).checked)} />
            <span>
              {t.debut} <span class="aide">{t.debutAide}</span>
            </span>
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
            {envoi ? t.envoi : t.bouton}
          </button>
        </div>
      </form>
    </div>
  );
}
