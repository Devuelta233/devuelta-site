// Demandes reçues depuis le site : qualifier, ouvrir un dossier ou orienter.

import { useState } from 'preact/hooks';
import { PAYS_LABEL, SITUATION_LABEL, isPays, isSituation } from '../../../shared/vocab';
import { get, post } from '../api';
import { code, date, langue, t, tr } from '../i18n';
import { Champ, Chargement, LienExterne, MessageErreur, Pastille, aller, useAction, useCharger, valeur } from '../ui';

interface Ligne {
  id: string;
  ref: string;
  recue_le: string;
  langue: string;
  pays: string | null;
  situation: string;
  pseudo: string;
  contact_mode: string;
  menace: number;
  statut: string;
  assigne_nom: string | null;
  dossier_id: string | null;
  nb_liens: number;
}

const FILTRES = ['nouvelle', 'convertie', 'orientee', 'refusee', 'spam', ''];

const NOMS: Record<string, string> = {
  x: 'X (Twitter)',
  'google-maps': 'Google Maps',
  onlyfans: 'OnlyFans',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  pornhub: 'Pornhub',
  xvideos: 'XVideos',
};

export function nomPlateforme(id: string): string {
  if (id === 'autre-site') return tr('Autre site', 'Otro sitio', 'Other site');
  return NOMS[id] ?? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
}

export function ListeDemandes() {
  const [statut, setStatut] = useState('nouvelle');
  const { donnees, err, enCours } = useCharger(() => get<{ demandes: Ligne[] }>(`/demandes${statut ? `?statut=${statut}` : ''}`), [statut]);
  const lang = langue.value;
  return (
    <div>
      <h1>{t('mDemandes')}</h1>
      <div class="o-filtres">
        {FILTRES.map((f) => (
          <button class={`o-filtre ${statut === f ? 'o-actif' : ''}`} onClick={() => setStatut(f)}>
            {f ? code(f) : t('tous')}
          </button>
        ))}
      </div>
      <MessageErreur texte={err} />
      {enCours && !donnees ? (
        <Chargement />
      ) : donnees?.demandes.length ? (
        <ul class="o-liste">
          {donnees.demandes.map((d) => (
            <li>
              <a href={`#/demandes/${d.id}`}>
                <strong>{d.ref}</strong> · {d.pseudo} · {isSituation(d.situation) ? SITUATION_LABEL[d.situation][lang] : d.situation}
                {d.menace ? <Pastille ton="alerte">{t('menace')}</Pastille> : null}
                <span class="o-muet">
                  {' '}
                  · {d.langue.toUpperCase()} · {date(d.recue_le, true)} · {d.nb_liens} {t('liens').toLowerCase()} · {d.assigne_nom ?? t('personne')}
                </span>
                <Pastille>{code(d.statut)}</Pastille>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p class="o-muet">{t('aucuneDemande')}</p>
      )}
    </div>
  );
}

interface Detail {
  id: string;
  ref: string;
  recue_le: string;
  langue: string;
  pays: string | null;
  situation: string;
  plateformes: string[];
  liens: string[];
  message: string | null;
  pseudo: string;
  contact_mode: string;
  contact_valeur: string;
  menace: number;
  deja_signale: number;
  publie_par_soi: number | null;
  statut: string;
  assigne_a: string | null;
  dossier_id: string | null;
  note_traitement: string | null;
}

export function DetailDemande({ id }: { id: string }) {
  const { donnees, err, enCours, recharger } = useCharger(() => get<{ demande: Detail }>(`/demandes/${id}`), [id]);
  const equipe = useCharger(() => get<{ equipe: Array<{ id: string; nom: string; langue: string }> }>('/equipe'));
  const [note, setNote] = useState('');
  const a = useAction();
  if (enCours && !donnees) return <Chargement />;
  if (!donnees) return <MessageErreur texte={err} />;
  const d = donnees.demande;
  const lang = langue.value;
  const tel = d.contact_mode === 'whatsapp' ? d.contact_valeur.replace(/[^\d]/g, '') : '';
  return (
    <div>
      <p>
        <a href="#/demandes">← {t('mDemandes')}</a>
      </p>
      <h1>
        {d.ref} · {d.pseudo}
      </h1>
      <p>
        <Pastille>{code(d.statut)}</Pastille> {d.menace ? <Pastille ton="alerte">{t('menace')}</Pastille> : null}
        {d.deja_signale ? <Pastille ton="info">{t('dejaSignale')}</Pastille> : null}
      </p>
      <dl class="o-dl">
        <dt>{t('recueLe')}</dt>
        <dd>{date(d.recue_le, true)}</dd>
        <dt>{t('situation')}</dt>
        <dd>{isSituation(d.situation) ? SITUATION_LABEL[d.situation][lang] : d.situation}</dd>
        <dt>{t('pays')}</dt>
        <dd>{d.pays && isPays(d.pays) ? PAYS_LABEL[d.pays][lang] : t('inconnu')}</dd>
        <dt>{t('langueDossier')}</dt>
        <dd>{d.langue.toUpperCase()}</dd>
        <dt>{t('publieParSoi')}</dt>
        <dd>{d.publie_par_soi === null ? t('inconnu') : d.publie_par_soi ? t('oui') : t('non')}</dd>
        <dt>{t('contactPar')}</dt>
        <dd>
          {d.contact_mode === 'whatsapp' ? 'WhatsApp' : t('email')} : <span class="o-mono">{d.contact_valeur}</span>
        </dd>
        {d.plateformes.length > 0 && (
          <>
            <dt>{tr('Plateformes', 'Plataformas', 'Platforms')}</dt>
            <dd>{d.plateformes.map(nomPlateforme).join(', ')}</dd>
          </>
        )}
      </dl>
      <div class="o-actions">
        {d.contact_mode === 'whatsapp' ? (
          <LienExterne href={`https://wa.me/${tel}`}>
            <span class="o-bouton">{t('repondreWhatsapp')}</span>
          </LienExterne>
        ) : (
          <a class="o-bouton" href={`mailto:${d.contact_valeur}`}>
            {t('repondreEmail')}
          </a>
        )}
      </div>
      <p class="o-muet">{t('rappelDiscretion')}</p>
      {d.liens.length > 0 && (
        <section>
          <h2>{t('liens')}</h2>
          <ul class="o-liste-simple">
            {d.liens.map((l) => (
              <li class="o-url">
                <LienExterne href={l}>{l}</LienExterne>
              </li>
            ))}
          </ul>
        </section>
      )}
      {d.message && (
        <section>
          <h2>{t('message')}</h2>
          <p class="o-texte">{d.message}</p>
        </section>
      )}
      {d.statut === 'convertie' && d.dossier_id ? (
        <p>
          <a class="o-bouton o-principal" href={`#/dossiers/${d.dossier_id}`}>
            → {t('mDossiers')}
          </a>
        </p>
      ) : (
        <section class="o-encadre">
          <Champ label={t('attribueeA')}>
            <select
              value={d.assigne_a ?? ''}
              onChange={(e) => a.lancer(() => post(`/demandes/${d.id}/assigner`, { assigne_a: valeur(e) || null }), recharger)}
            >
              <option value="">{t('personne')}</option>
              {equipe.donnees?.equipe.map((u) => (
                <option value={u.id}>
                  {u.nom} ({u.langue.toUpperCase()})
                </option>
              ))}
            </select>
          </Champ>
          <div class="o-actions">
            <button
              class="o-bouton o-principal"
              disabled={a.occupe}
              onClick={() => a.lancer(() => post<{ id: string }>(`/demandes/${d.id}/convertir`, { assigne_a: d.assigne_a }), (r) => aller(`/dossiers/${r.id}`))}
            >
              {t('convertir')}
            </button>
          </div>
          <Champ label={t('noteTraitement')}>
            <input type="text" value={note} onInput={(e) => setNote(valeur(e))} />
          </Champ>
          <div class="o-actions">
            {(['orientee', 'refusee', 'spam'] as const).map((s) => (
              <button class="o-bouton" disabled={a.occupe} onClick={() => a.lancer(() => post(`/demandes/${d.id}/statut`, { statut: s, note }), recharger)}>
                {code(s)}
              </button>
            ))}
            {d.statut !== 'nouvelle' && (
              <button class="o-bouton" onClick={() => a.lancer(() => post(`/demandes/${d.id}/statut`, { statut: 'nouvelle' }), recharger)}>
                {t('remettreNouvelle')}
              </button>
            )}
          </div>
          {d.note_traitement && <p class="o-muet">{d.note_traitement}</p>}
          <MessageErreur texte={a.err} />
        </section>
      )}
    </div>
  );
}
