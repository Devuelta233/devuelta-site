// Formulaire « Confier mon dossier » : envoie le strict nécessaire pour
// recontacter la personne. Aucun fichier, aucune image.

import { useEffect, useRef, useState } from 'preact/hooks';
import { PAYS, PAYS_LABEL, SITUATIONS, SITUATION_LABEL, type Lang } from '../../shared/vocab';
import { TEXTES_CONFIER } from './confier-textes';
import { compter } from './compteur';

export interface DonneesConfier {
  lang: Lang;
  plateformes: Array<{ id: string; nom: string }>;
  liens: { confidentialite: string; urgence: string; whatsapp: string; email: string };
}

const AVEC_PUBLIE = ['contenu-intime', 'donnees-personnelles'];

export function Confier({ d }: { d: DonneesConfier }) {
  const t = TEXTES_CONFIER[d.lang];
  const [situation, setSituation] = useState('');
  const [pays, setPays] = useState('');
  const [plateformes, setPlateformes] = useState<string[]>([]);
  const [liens, setLiens] = useState('');
  const [message, setMessage] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [mode, setMode] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contact, setContact] = useState('');
  const [menace, setMenace] = useState(false);
  const [dejaSignale, setDejaSignale] = useState(false);
  const [publie, setPublie] = useState<'' | 'oui' | 'non' | 'nr'>('');
  const [mineur, setMineur] = useState(false);
  const [accord, setAccord] = useState(false);
  const [piege, setPiege] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [ref, setRef] = useState('');
  const zoneErreur = useRef<HTMLParagraphElement>(null);
  const zoneMerci = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Pré-remplissage à partir du diagnostic (stocké seulement dans cet onglet).
    try {
      const brut = sessionStorage.getItem('dv-diag');
      if (brut) {
        const x = JSON.parse(brut) as { situation?: string; pays?: string; plateforme?: string; menace?: boolean; publie?: string };
        if (x.situation) setSituation(x.situation);
        if (x.pays) setPays(x.pays);
        if (x.plateforme && d.plateformes.some((p) => p.id === x.plateforme)) setPlateformes([x.plateforme]);
        if (x.menace) setMenace(true);
        if (x.publie === 'oui' || x.publie === 'non' || x.publie === 'nr') setPublie(x.publie);
      }
    } catch {
      /* rien à pré-remplir */
    }
    compter('formulaire-ouvert');
  }, []);

  useEffect(() => {
    if (erreur) zoneErreur.current?.focus();
  }, [erreur]);
  useEffect(() => {
    if (ref) zoneMerci.current?.focus();
  }, [ref]);

  const basculer = (id: string) => setPlateformes(plateformes.includes(id) ? plateformes.filter((x) => x !== id) : [...plateformes, id]);

  const envoyer = async (e: Event) => {
    e.preventDefault();
    setErreur('');
    if (mineur) return;
    if (!situation || !pays || !pseudo.trim() || !contact.trim()) {
      setErreur(t.erreurs['champ-manquant']);
      return;
    }
    if (!accord) {
      setErreur(t.erreurs['consentement-requis']);
      return;
    }
    setEnvoi(true);
    try {
      const r = await fetch('/api/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          langue: d.lang,
          situation,
          pays,
          plateformes,
          liens: liens.split(/\s+/).filter(Boolean),
          message,
          pseudo,
          contact_mode: mode,
          contact_valeur: contact,
          menace,
          deja_signale: dejaSignale,
          publie_par_soi: publie === 'oui' ? true : publie === 'non' ? false : null,
          mineur,
          consentement: accord,
          site_web: piege,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; ref?: string; erreur?: string };
      if (r.ok && j.ok && j.ref) {
        setRef(j.ref);
        try {
          sessionStorage.removeItem('dv-diag');
        } catch {
          /* rien */
        }
      } else {
        setErreur(t.erreurs[j.erreur ?? ''] ?? t.erreurs.defaut);
      }
    } catch {
      setErreur(t.erreurs.defaut);
    } finally {
      setEnvoi(false);
    }
  };

  if (ref) {
    return (
      <div class="encadre recu" role="status">
        <h2 class="sans-marge" tabIndex={-1} ref={zoneMerci}>
          {t.merciTitre}
        </h2>
        <p>
          {t.merciRef} : <span class="reference">{ref}</span>
        </p>
        <p>{t.merciTexte}</p>
      </div>
    );
  }

  return (
    <form class="formulaire" onSubmit={envoyer} noValidate>
      <div class="champ">
        <label for="f-situation">
          {t.situation} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <select id="f-situation" required value={situation} onChange={(e) => setSituation((e.target as HTMLSelectElement).value)}>
          <option value="">{t.choisir}</option>
          {SITUATIONS.map((s) => (
            <option value={s}>{SITUATION_LABEL[s][d.lang]}</option>
          ))}
        </select>
      </div>
      <div class="champ">
        <label for="f-pays">
          {t.pays} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <select id="f-pays" required value={pays} onChange={(e) => setPays((e.target as HTMLSelectElement).value)}>
          <option value="">{t.choisir}</option>
          {PAYS.map((p) => (
            <option value={p}>{PAYS_LABEL[p][d.lang]}</option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend>{t.plateformes}</legend>
        <div class="choix choix-grille">
          {[...d.plateformes, { id: 'autre-site', nom: t.autreSite }].map((p) => (
            <label>
              <input type="checkbox" checked={plateformes.includes(p.id)} onChange={() => basculer(p.id)} />
              <span>{p.nom}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div class="champ">
        <label for="f-liens">{t.liens}</label>
        <textarea id="f-liens" rows={4} value={liens} onInput={(e) => setLiens((e.target as HTMLTextAreaElement).value)} placeholder="https://…" />
        <span class="aide">{t.liensAide}</span>
      </div>
      <div class="champ">
        <label for="f-message">{t.message}</label>
        <textarea id="f-message" rows={4} maxLength={2000} value={message} onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)} />
        <span class="aide">{t.messageAide}</span>
      </div>
      {AVEC_PUBLIE.includes(situation) && (
        <fieldset>
          <legend>{t.publie}</legend>
          <div class="choix">
            {(['oui', 'non', 'nr'] as const).map((v) => (
              <label>
                <input type="radio" name="publie" checked={publie === v} onChange={() => setPublie(v)} />
                <span>{t[v]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div class="choix">
        <label>
          <input type="checkbox" checked={menace} onChange={() => setMenace(!menace)} />
          <span>{t.menace}</span>
        </label>
        <label>
          <input type="checkbox" checked={dejaSignale} onChange={() => setDejaSignale(!dejaSignale)} />
          <span>{t.dejaSignale}</span>
        </label>
        <label>
          <input type="checkbox" checked={mineur} onChange={() => setMineur(!mineur)} />
          <span>{t.mineur}</span>
        </label>
      </div>
      {mineur && (
        <div class="encadre alerte" role="note">
          <p>{t.mineurMessage}</p>
          <p>
            <a href={d.liens.urgence}>→ {d.liens.urgence}</a>
          </p>
        </div>
      )}
      <h2>{t.contact}</h2>
      <div class="champ">
        <label for="f-pseudo">
          {t.pseudo} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <input id="f-pseudo" type="text" autocomplete="given-name" maxLength={60} value={pseudo} onInput={(e) => setPseudo((e.target as HTMLInputElement).value)} />
        <span class="aide">{t.pseudoAide}</span>
      </div>
      <fieldset>
        <legend>{t.contact}</legend>
        <div class="choix choix-grille">
          <label>
            <input type="radio" name="mode" checked={mode === 'whatsapp'} onChange={() => setMode('whatsapp')} />
            <span>{t.whatsapp}</span>
          </label>
          <label>
            <input type="radio" name="mode" checked={mode === 'email'} onChange={() => setMode('email')} />
            <span>{t.email}</span>
          </label>
        </div>
      </fieldset>
      <div class="champ">
        <label for="f-contact">
          {mode === 'whatsapp' ? t.numero : t.adresse} <span class="aide-inline">({t.obligatoire})</span>
        </label>
        <input
          id="f-contact"
          type={mode === 'whatsapp' ? 'tel' : 'email'}
          autocomplete={mode === 'whatsapp' ? 'tel' : 'email'}
          inputMode={mode === 'whatsapp' ? 'tel' : 'email'}
          value={contact}
          onInput={(e) => setContact((e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="piege" aria-hidden="true">
        <label>
          Site web
          <input type="text" tabIndex={-1} autocomplete="off" value={piege} onInput={(e) => setPiege((e.target as HTMLInputElement).value)} />
        </label>
      </div>
      <label class="option">
        <input type="checkbox" checked={accord} onChange={() => setAccord(!accord)} />
        <span>
          {t.consentement} <a href={d.liens.confidentialite}>{t.confidentialite}</a>
        </span>
      </label>
      {erreur && (
        <p class="erreur" role="alert" tabIndex={-1} ref={zoneErreur}>
          {erreur}
        </p>
      )}
      <div class="actions">
        <button class="bouton principal" type="submit" disabled={envoi || mineur}>
          {envoi ? t.envoi : t.envoyer}
        </button>
      </div>
    </form>
  );
}
