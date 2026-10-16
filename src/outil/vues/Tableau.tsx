// Tableau de bord : ce qui demande une action aujourd'hui.

import { useEffect, useState } from 'preact/hooks';
import { texteAccuse } from '../../../shared/retractation';
import { typo } from '../../../shared/typo';
import { SITUATION_LABEL, isLang, isSituation } from '../../../shared/vocab';
import { get, post } from '../api';
import { code, date, langue, t } from '../i18n';
import { activerPush, estInstalle, estIos, etatPush, pushPossible } from '../push';
import { Chargement, Copier, MessageErreur, Pastille, useAction, useCharger } from '../ui';

interface Retractation {
  id: string;
  ref: string;
  recue_le: string;
  langue: string;
  nom: string;
  dossier_ref: string | null;
  dossier_id: string | null;
  contact_mode: 'email' | 'whatsapp';
  contact_valeur: string;
  message: string | null;
}

interface Donnees {
  maintenant: string;
  retractations: Retractation[];
  echeances: Array<{ id: string; type: string; statut: string; echeance: string; destinataire: string | null; dossier_id: string; ref: string; client_pseudo: string; priorite: string; menace: number; assigne_nom: string | null; relance_preparee: number }>;
  dossiers: { ouverts: number; miens: number; sans_echeance: number };
  demandes: Array<{ id: string; ref: string; recue_le: string; langue: string; situation: string; menace: number; pseudo: string }>;
  courriers_a_traiter: Array<{ id: string; dossier_id: string; modele: string; langue: string; maj_le: string; automatique: number; ref: string }>;
  alertes_liens: Array<{ id: string; url: string; verif_alerte: string; verif_le: string; dossier_id: string; ref: string }>;
  alertes_connexion: Array<{ le: string; pays: string; ville: string; email: string; nom: string | null }>;
  bientot_supprimes: Array<{ id: string; ref: string; purger_apres: string }>;
}

// Rétractation : accusé de réception prêt à copier, dans la langue de la personne.
function BlocRetractations({ liste, recharger }: { liste: Retractation[]; recharger: () => void }) {
  const { occupe, err, lancer } = useAction();
  return (
    <section class="o-encadre o-alerte">
      <h2>
        {t('retractationsTitre')} <Pastille ton="alerte">{liste.length}</Pastille>
      </h2>
      <p>{t('retractationsAide')}</p>
      <ul class="o-liste">
        {liste.map((r) => {
          const lang = isLang(r.langue) ? r.langue : 'fr';
          return (
            <li>
              <p>
                <strong>{r.ref}</strong> · {date(r.recue_le, true)} · {r.nom}
              </p>
              <p>
                {r.dossier_id ? (
                  <a href={`#/dossiers/${r.dossier_id}`}>{r.dossier_ref}</a>
                ) : r.dossier_ref ? (
                  <span>
                    {r.dossier_ref} <Pastille ton="alerte">{t('dossierNonTrouve')}</Pastille>
                  </span>
                ) : (
                  <span class="o-muet">{t('sansDossier')}</span>
                )}
                {' · '}
                {r.contact_mode === 'email' ? 'E-mail' : 'WhatsApp'} : <span class="o-url">{r.contact_valeur}</span>
              </p>
              {r.message && <p class="o-muet">« {r.message} »</p>}
              <p class="o-actions">
                <Copier texte={lang === 'fr' ? typo(texteAccuse(r, lang)) : texteAccuse(r, lang)} libelle={t('copierAccuse')} />
                <button
                  class="o-bouton o-principal"
                  type="button"
                  disabled={occupe}
                  onClick={() => lancer(() => post(`/retractations/${r.id}/accuse`), recharger)}
                >
                  {t('accuseEnvoye')}
                </button>
              </p>
            </li>
          );
        })}
      </ul>
      {err && <p class="o-erreur">{err}</p>}
    </section>
  );
}

function BlocNotifications() {
  const [etat, setEtat] = useState<string>('…');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    etatPush().then(setEtat);
  }, []);
  if (etat === 'actif' || etat === '…') return null;
  if (!pushPossible() || (estIos() && !estInstalle())) {
    return <div class="o-encadre o-info">{t('notifIos')}</div>;
  }
  return (
    <div class="o-encadre o-info">
      {etat === 'bloque' ? (
        <p>{t('notifRefusees')}</p>
      ) : (
        <button
          class="o-bouton o-principal"
          onClick={async () => {
            const r = await activerPush().catch(() => 'impossible' as const);
            setEtat(r);
            if (r === 'actif') {
              setMsg(t('notifActives'));
              post('/push/tester').catch(() => undefined);
            }
          }}
        >
          🔔 {t('notifActiver')}
        </button>
      )}
      {msg && <p>{msg}</p>}
    </div>
  );
}

export function Tableau({ nom }: { nom: string }) {
  const { donnees: d, err, enCours, recharger } = useCharger(() => get<Donnees>('/tableau'));
  if (enCours && !d) return <Chargement />;
  if (!d) return <MessageErreur texte={err} />;
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  const urgentes = d.echeances.filter((e) => new Date(e.echeance) <= fin);
  const rien =
    d.retractations.length === 0 &&
    urgentes.length === 0 &&
    d.demandes.length === 0 &&
    d.courriers_a_traiter.length === 0 &&
    d.alertes_liens.length === 0 &&
    d.alertes_connexion.length === 0;
  const lang = langue.value;
  return (
    <div>
      <h1>
        {t('bonjour')} {nom}
      </h1>
      <p class="o-muet">
        {d.dossiers.ouverts} {t('dossiersOuverts')} · {t('dontMiens')} {d.dossiers.miens}
      </p>
      <BlocNotifications />
      {rien && <div class="o-encadre o-ok">{t('rienAFaire')}</div>}

      {d.retractations.length > 0 && <BlocRetractations liste={d.retractations} recharger={recharger} />}

      {d.alertes_connexion.length > 0 && (
        <section class="o-encadre o-alerte">
          <h2>{t('alertesConnexion')}</h2>
          <ul>
            {d.alertes_connexion.map((a) => (
              <li>
                {date(a.le, true)} — {a.nom ?? a.email} — {a.pays} {a.ville}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.demandes.length > 0 && (
        <section>
          <h2>
            {t('nouvellesDemandes')} <Pastille ton="fort">{d.demandes.length}</Pastille>
          </h2>
          <ul class="o-liste">
            {d.demandes.map((x) => (
              <li>
                <a href={`#/demandes/${x.id}`}>
                  <strong>{x.ref}</strong> · {x.pseudo} · {isSituation(x.situation) ? SITUATION_LABEL[x.situation][lang] : x.situation}
                  {x.menace ? <Pastille ton="alerte">{t('menace')}</Pastille> : null}
                  <span class="o-muet"> · {date(x.recue_le, true)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.echeances.length > 0 && (
        <section>
          <h2>{t('echeances')}</h2>
          <ul class="o-liste">
            {d.echeances.map((e) => {
              const depassee = new Date(e.echeance) < new Date();
              return (
                <li>
                  <a href={`#/dossiers/${e.dossier_id}`}>
                    <strong>{e.ref}</strong> · {code(e.type)}
                    {e.destinataire ? ` · ${e.destinataire}` : ''}
                    <span class="o-muet"> · {date(e.echeance)}</span>
                    {depassee ? <Pastille ton="alerte">{t('enRetard')}</Pastille> : new Date(e.echeance) <= fin ? <Pastille ton="info">{t('aujourdhui')}</Pastille> : null}
                    {e.relance_preparee ? <Pastille ton="ok">{t('relanceAuto')}</Pastille> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {d.courriers_a_traiter.length > 0 && (
        <section>
          <h2>{t('courriersATraiter')}</h2>
          <ul class="o-liste">
            {d.courriers_a_traiter.map((c) => (
              <li>
                <a href={`#/dossiers/${c.dossier_id}/courriers`}>
                  <strong>{c.ref}</strong> · {c.modele} ({c.langue.toUpperCase()})
                  {c.automatique ? <Pastille ton="info">{t('prepareAuto')}</Pastille> : null}
                  <span class="o-muet"> · {date(c.maj_le)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.alertes_liens.length > 0 && (
        <section>
          <h2>{t('alertesLiens')}</h2>
          <ul class="o-liste">
            {d.alertes_liens.map((l) => (
              <li>
                <a href={`#/dossiers/${l.dossier_id}/liens`}>
                  <strong>{l.ref}</strong> · <Pastille ton={l.verif_alerte === 'semble-reapparu' ? 'alerte' : 'ok'}>{code(l.verif_alerte)}</Pastille>
                  <span class="o-url">{l.url}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.bientot_supprimes.length > 0 && (
        <section>
          <h2>{t('bientotSupprimes')}</h2>
          <ul class="o-liste">
            {d.bientot_supprimes.map((b) => (
              <li>
                <a href={`#/dossiers/${b.id}`}>
                  <strong>{b.ref}</strong> · {date(b.purger_apres)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
