// Écrans d'accès : connexion, code 2FA, premier mot de passe, activation de
// la double authentification, accord de confidentialité, installation.

import qrcode from 'qrcode-generator';
import { useEffect, useState } from 'preact/hooks';
import { LANGS, NDA_VERSION, type Lang } from '../../../shared/vocab';
import { post } from '../api';
import { NDA, langue, t } from '../i18n';
import { Champ, MessageErreur, useAction, valeur } from '../ui';

export interface Etat {
  etape: string;
  initialisation?: boolean;
  utilisateur?: { id: string; nom: string; email: string; langue: Lang; role: string; whatsapp?: string | null };
  alerte_nouveau_pays?: boolean;
}

type Suite = (e: Etat) => void;

function Cadre({ titre, children }: { titre: string; children: preact.ComponentChildren }) {
  return (
    <div class="o-acces">
      <div class="o-acces-carte">
        <p class="o-marque">
          <img class="o-logo-carte" src="/logo-devuelta.svg" alt="Devuelta" width="787" height="174" />
          <span>EraseOps</span>
        </p>
        <h1>{titre}</h1>
        {children}
      </div>
    </div>
  );
}

export function Connexion({ suite, initialisation }: { suite: Suite; initialisation: boolean }) {
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [mode, setMode] = useState<'connexion' | 'init'>(initialisation ? 'init' : 'connexion');
  const a = useAction();
  if (mode === 'init') return <Initialisation retour={() => setMode('connexion')} />;
  return (
    <Cadre titre={t('connexion')}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          a.lancer(() => post<Etat>('/auth/connexion', { email, mot_de_passe: mdp }), suite);
        }}
      >
        <Champ label={t('email')}>
          <input type="email" autocomplete="username" value={email} onInput={(e) => setEmail(valeur(e))} required />
        </Champ>
        <Champ label={t('motDePasse')}>
          <input type="password" autocomplete="current-password" value={mdp} onInput={(e) => setMdp(valeur(e))} required />
        </Champ>
        <MessageErreur texte={a.err} />
        <button class="o-bouton o-principal o-large" disabled={a.occupe}>
          {t('seConnecter')}
        </button>
      </form>
      {initialisation && (
        <p>
          <button type="button" class="o-lien" onClick={() => setMode('init')}>
            {t('initTitre')}
          </button>
        </p>
      )}
    </Cadre>
  );
}

function Initialisation({ retour }: { retour: () => void }) {
  const [f, setF] = useState({ code: '', nom: '', email: '', langue: langue.value as string, mot_de_passe: '', confirmation: '' });
  const [fait, setFait] = useState(false);
  const a = useAction();
  const set = (k: keyof typeof f) => (e: Event) => setF({ ...f, [k]: valeur(e) });
  if (fait) {
    return (
      <Cadre titre={t('initTitre')}>
        <p>{t('initOk')}</p>
        <button class="o-bouton o-principal" onClick={retour}>
          {t('seConnecter')}
        </button>
      </Cadre>
    );
  }
  return (
    <Cadre titre={t('initTitre')}>
      <p class="o-muet">{t('initAide')}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (f.mot_de_passe !== f.confirmation) return a.setErr(t('mdpDifferents'));
          a.lancer(() => post('/init', f), () => setFait(true));
        }}
      >
        <Champ label={t('codeInit')}>
          <input type="text" autocomplete="off" value={f.code} onInput={set('code')} required />
        </Champ>
        <Champ label={t('nom')}>
          <input type="text" autocomplete="name" value={f.nom} onInput={set('nom')} required />
        </Champ>
        <Champ label={t('email')}>
          <input type="email" autocomplete="username" value={f.email} onInput={set('email')} required />
        </Champ>
        <Champ label={t('langueUi')}>
          <select value={f.langue} onChange={set('langue')}>
            {LANGS.map((l) => (
              <option value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </Champ>
        <Champ label={t('nouveauMdp')} aide={t('changerMdpAide')}>
          <input type="password" autocomplete="new-password" value={f.mot_de_passe} onInput={set('mot_de_passe')} required minLength={12} />
        </Champ>
        <Champ label={t('confirmerMdp')}>
          <input type="password" autocomplete="new-password" value={f.confirmation} onInput={set('confirmation')} required />
        </Champ>
        <MessageErreur texte={a.err} />
        <button class="o-bouton o-principal o-large" disabled={a.occupe}>
          {t('creerCompte')}
        </button>
      </form>
    </Cadre>
  );
}

export function Code2fa({ suite }: { suite: Suite }) {
  const [code, setCode] = useState('');
  const a = useAction();
  return (
    <Cadre titre={t('code2fa')}>
      <p class="o-muet">{t('code2faAide')}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          a.lancer(() => post<Etat>('/auth/code', { code }), suite);
        }}
      >
        <input
          class="o-code"
          type="text"
          inputMode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onInput={(e) => setCode(valeur(e).replace(/\D/g, ''))}
          aria-label={t('code2fa')}
          required
        />
        <MessageErreur texte={a.err} />
        <button class="o-bouton o-principal o-large" disabled={a.occupe || code.length !== 6}>
          {t('valider')}
        </button>
      </form>
    </Cadre>
  );
}

export function ChangerMdp({ suite, volontaire = false }: { suite: Suite; volontaire?: boolean }) {
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const a = useAction();
  const contenu = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (nouveau !== confirmation) return a.setErr(t('mdpDifferents'));
        a.lancer(() => post<Etat>('/auth/changer-mdp', volontaire ? { actuel, nouveau } : { nouveau }), suite);
      }}
    >
      <p class="o-muet">{t('changerMdpAide')}</p>
      {volontaire && (
        <Champ label={t('mdpActuel')}>
          <input type="password" autocomplete="current-password" value={actuel} onInput={(e) => setActuel(valeur(e))} required />
        </Champ>
      )}
      <Champ label={t('nouveauMdp')}>
        <input type="password" autocomplete="new-password" minLength={12} value={nouveau} onInput={(e) => setNouveau(valeur(e))} required />
      </Champ>
      <Champ label={t('confirmerMdp')}>
        <input type="password" autocomplete="new-password" value={confirmation} onInput={(e) => setConfirmation(valeur(e))} required />
      </Champ>
      <MessageErreur texte={a.err} />
      <button class="o-bouton o-principal" disabled={a.occupe}>
        {t('enregistrer')}
      </button>
    </form>
  );
  return volontaire ? contenu : <Cadre titre={t('changerMdpTitre')}>{contenu}</Cadre>;
}

export function Activer2fa({ suite }: { suite: Suite }) {
  const [secret, setSecret] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const a = useAction();
  useEffect(() => {
    a.lancer(() => post<{ secret: string; uri: string }>('/auth/2fa/activer'), setSecret);
  }, []);
  let svg = '';
  if (secret) {
    const qr = qrcode(0, 'M');
    qr.addData(secret.uri);
    qr.make();
    svg = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
  }
  return (
    <Cadre titre={t('activer2faTitre')}>
      <p class="o-muet">{t('activer2faAide')}</p>
      {secret && (
        <>
          <div class="o-qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <p class="o-muet">{t('cleManuelle')}</p>
          <p class="o-cle">{secret.secret.replace(/(.{4})/g, '$1 ').trim()}</p>
        </>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          a.lancer(() => post<Etat>('/auth/2fa/confirmer', { code }), suite);
        }}
      >
        <input
          class="o-code"
          type="text"
          inputMode="numeric"
          autocomplete="one-time-code"
          maxLength={6}
          value={code}
          onInput={(e) => setCode(valeur(e).replace(/\D/g, ''))}
          aria-label={t('code2fa')}
          required
        />
        <MessageErreur texte={a.err} />
        <button class="o-bouton o-principal o-large" disabled={a.occupe || code.length !== 6}>
          {t('valider')}
        </button>
      </form>
    </Cadre>
  );
}

export function Nda({ suite }: { suite: Suite }) {
  const [ok, setOk] = useState(false);
  const a = useAction();
  const n = NDA[langue.value];
  return (
    <Cadre titre={t('ndaTitre')}>
      <p>
        <strong>{n.titre}</strong>
      </p>
      <ol class="o-nda">
        {n.points.map((p) => (
          <li>{p}</li>
        ))}
      </ol>
      <p class="o-muet">{n.fin}</p>
      <label class="o-case">
        <input type="checkbox" checked={ok} onChange={() => setOk(!ok)} />
        <span>{t('ndaAccepte')}</span>
      </label>
      <MessageErreur texte={a.err} />
      <button
        class="o-bouton o-principal o-large"
        disabled={!ok || a.occupe}
        onClick={() => a.lancer(() => post<Etat>('/auth/nda', { accepte: true, version: NDA_VERSION }), suite)}
      >
        {t('valider')}
      </button>
    </Cadre>
  );
}
