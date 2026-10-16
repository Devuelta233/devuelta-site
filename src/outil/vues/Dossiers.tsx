// Liste des dossiers (filtres, recherche) et création d'un dossier.

import { useState } from 'preact/hooks';
import { LANGS, PAYS, PAYS_LABEL, PRIORITES, SITUATIONS, SITUATION_LABEL, autresPays, isSituation } from '../../../shared/vocab';
import { get, post } from '../api';
import { code, date, langue, t } from '../i18n';
import { Champ, Chargement, MessageErreur, Pastille, aller, useAction, useCharger, valeur } from '../ui';

interface Ligne {
  id: string;
  ref: string;
  statut: string;
  priorite: string;
  menace: number;
  langue: string;
  pays: string | null;
  situation: string;
  client_pseudo: string;
  assigne_nom: string | null;
  prochaine_echeance: string | null;
  maj_le: string;
  purger_apres: string | null;
  nb_contenus: number;
  nb_retires: number;
}

export function ListeDossiers() {
  const [statut, setStatut] = useState('ouverts');
  const [assigne, setAssigne] = useState('');
  const [q, setQ] = useState('');
  const [recherche, setRecherche] = useState('');
  const params = new URLSearchParams();
  if (statut) params.set('statut', statut);
  if (assigne) params.set('assigne', assigne);
  if (recherche) params.set('q', recherche);
  const { donnees, err, enCours } = useCharger(() => get<{ dossiers: Ligne[] }>(`/dossiers?${params.toString()}`), [statut, assigne, recherche]);
  const lang = langue.value;
  return (
    <div>
      <div class="o-titre-ligne">
        <h1>{t('mDossiers')}</h1>
        <a class="o-bouton o-principal" href="#/dossiers/nouveau">
          + {t('mNouveau')}
        </a>
      </div>
      <div class="o-filtres">
        {[
          ['ouverts', t('ouverts')],
          ['fermes', t('fermes')],
          ['', t('tous')],
        ].map(([v, l]) => (
          <button class={`o-filtre ${statut === v ? 'o-actif' : ''}`} onClick={() => setStatut(v)}>
            {l}
          </button>
        ))}
        <button class={`o-filtre ${assigne === 'moi' ? 'o-actif' : ''}`} onClick={() => setAssigne(assigne === 'moi' ? '' : 'moi')}>
          {t('aMoi')}
        </button>
      </div>
      <form
        class="o-recherche"
        onSubmit={(e) => {
          e.preventDefault();
          setRecherche(q);
        }}
      >
        <input type="search" placeholder={t('rechercher')} value={q} onInput={(e) => setQ(valeur(e))} />
      </form>
      <MessageErreur texte={err} />
      {enCours && !donnees ? (
        <Chargement />
      ) : donnees?.dossiers.length ? (
        <ul class="o-liste">
          {donnees.dossiers.map((d) => {
            const retard = d.prochaine_echeance && new Date(d.prochaine_echeance) < new Date();
            return (
              <li>
                <a href={`#/dossiers/${d.id}`}>
                  <strong>{d.ref}</strong> · {d.client_pseudo} · {isSituation(d.situation) ? SITUATION_LABEL[d.situation][lang] : d.situation}
                  <span class="o-muet">
                    {' '}
                    · {d.nb_retires}/{d.nb_contenus} {t('retires')} · {d.assigne_nom ?? t('personne')}
                  </span>
                  <span class="o-pastilles">
                    <Pastille>{code(d.statut)}</Pastille>
                    {d.priorite !== 'normal' && <Pastille ton="fort">{code(d.priorite)}</Pastille>}
                    {d.menace ? <Pastille ton="alerte">{t('menace')}</Pastille> : null}
                    {d.prochaine_echeance && (
                      <Pastille ton={retard ? 'alerte' : 'info'}>
                        {t('echeance')} {date(d.prochaine_echeance)}
                      </Pastille>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p class="o-muet">{t('aucunDossier')}</p>
      )}
    </div>
  );
}

export function NouveauDossier() {
  const equipe = useCharger(() => get<{ equipe: Array<{ id: string; nom: string; langue: string }> }>('/equipe'));
  const [f, setF] = useState({
    client_pseudo: '',
    client_nom: '',
    client_email: '',
    client_whatsapp: '',
    contact_prefere: 'whatsapp',
    langue: langue.value as string,
    pays: '',
    situation: 'autre',
    priorite: 'normal',
    menace: false,
    publie_par_soi: '' as '' | 'oui' | 'non',
    assigne_a: '',
    liens: '',
    resume: '',
  });
  const a = useAction();
  const set = (k: keyof typeof f) => (e: Event) => setF({ ...f, [k]: valeur(e) });
  const lang = langue.value;
  return (
    <div>
      <p>
        <a href="#/dossiers">← {t('mDossiers')}</a>
      </p>
      <h1>{t('mNouveau')}</h1>
      <form
        class="o-form"
        onSubmit={(e) => {
          e.preventDefault();
          a.lancer(
            () =>
              post<{ id: string }>('/dossiers', {
                ...f,
                publie_par_soi: f.publie_par_soi === 'oui' ? true : f.publie_par_soi === 'non' ? false : null,
                liens: f.liens.split(/\s+/).filter(Boolean),
                assigne_a: f.assigne_a || undefined,
              }),
            (r) => aller(`/dossiers/${r.id}`),
          );
        }}
      >
        <div class="o-grille">
          <Champ label={t('pseudo')}>
            <input type="text" required value={f.client_pseudo} onInput={set('client_pseudo')} />
          </Champ>
          <Champ label={t('nomLegal')}>
            <input type="text" value={f.client_nom} onInput={set('client_nom')} />
          </Champ>
          <Champ label={t('email')}>
            <input type="email" value={f.client_email} onInput={set('client_email')} />
          </Champ>
          <Champ label={t('whatsapp')}>
            <input type="tel" value={f.client_whatsapp} onInput={set('client_whatsapp')} placeholder="+33…" />
          </Champ>
          <Champ label={t('situation')}>
            <select value={f.situation} onChange={set('situation')}>
              {SITUATIONS.map((s) => (
                <option value={s}>{SITUATION_LABEL[s][lang]}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('pays')}>
            <select value={f.pays} onChange={set('pays')}>
              <option value="">—</option>
              {PAYS.filter((p) => p !== 'ZZ').map((p) => (
                <option value={p}>{PAYS_LABEL[p][lang]}</option>
              ))}
              <optgroup label={t('autresPays')}>
                {autresPays(lang).map((p) => (
                  <option value={p.code}>{p.nom}</option>
                ))}
              </optgroup>
              <option value="ZZ">{PAYS_LABEL.ZZ[lang]}</option>
            </select>
          </Champ>
          <Champ label={t('langueDossier')}>
            <select value={f.langue} onChange={set('langue')}>
              {LANGS.map((l) => (
                <option value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('priorite')}>
            <select value={f.priorite} onChange={set('priorite')}>
              {PRIORITES.map((p) => (
                <option value={p}>{code(p)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('assigneA')}>
            <select value={f.assigne_a} onChange={set('assigne_a')}>
              <option value="">{t('aMoi')}</option>
              {equipe.donnees?.equipe.map((u) => (
                <option value={u.id}>{u.nom}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('publieParSoi')}>
            <select value={f.publie_par_soi} onChange={set('publie_par_soi')}>
              <option value="">{t('inconnu')}</option>
              <option value="oui">{t('oui')}</option>
              <option value="non">{t('non')}</option>
            </select>
          </Champ>
        </div>
        <label class="o-case">
          <input type="checkbox" checked={f.menace} onChange={() => setF({ ...f, menace: !f.menace })} />
          <span>{t('menace')}</span>
        </label>
        <Champ label={t('ajouterLiens')}>
          <textarea rows={4} value={f.liens} onInput={set('liens')} placeholder="https://…" />
        </Champ>
        <Champ label={t('resume')}>
          <textarea rows={4} value={f.resume} onInput={set('resume')} />
        </Champ>
        <MessageErreur texte={a.err} />
        <button class="o-bouton o-principal" disabled={a.occupe}>
          {t('creerDossier')}
        </button>
      </form>
    </div>
  );
}
