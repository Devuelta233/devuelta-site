// Réglages : mon compte, alertes sur ce téléphone, connexions, et pour
// l'administrateur : conservation des données, attribution, sauvegarde,
// suppression des données échues, état du fonctionnement automatique et du
// robot Telegram.

import { useEffect, useState } from 'preact/hooks';
import { LANGS, type Lang } from '../../../shared/vocab';
import { get, post, put } from '../api';
import { code, date, t, tr } from '../i18n';
import { activerPush, desactiverPush, estInstalle, estIos, etatPush, pushPossible } from '../push';
import { Champ, Chargement, LienExterne, MessageErreur, Pastille, useAction, useCharger, valeur } from '../ui';
import { erreur } from '../i18n';
import { ChangerMdp, type Etat } from './Acces';
import { ListeConnexions, type Connexion } from './Equipe';

type Utilisateur = NonNullable<Etat['utilisateur']>;


function MonCompte({ u, surDeconnexion }: { u: Utilisateur; surDeconnexion: () => void }) {
  const [ok, setOk] = useState(false);
  const [mdp, setMdp] = useState(false);
  const a = useAction();
  return (
    <section class="o-encadre">
      <h2>{t('monCompte')}</h2>
      <p>
        <strong>{u.nom}</strong> · {u.email} · {code(`role-${u.role}`)} · {u.langue.toUpperCase()}
      </p>
      {ok && <p class="o-encadre o-ok">{tr('Mot de passe changé. Vos autres appareils sont déconnectés.', 'Contraseña cambiada. Tus otros dispositivos se han desconectado.', 'Password changed. Your other devices have been logged out.')}</p>}
      {mdp ? (
        <ChangerMdp
          volontaire
          suite={() => {
            setMdp(false);
            setOk(true);
          }}
        />
      ) : (
        <div class="o-actions">
          <button class="o-bouton" onClick={() => setMdp(true)}>
            {t('changerMdp')}
          </button>
          <button
            class="o-bouton"
            disabled={a.occupe}
            onClick={() => {
              if (!confirm(`${t('deconnecterPartout')} ?`)) return;
              a.lancer(() => post('/auth/deconnexion-partout'), surDeconnexion);
            }}
          >
            {t('deconnecterPartout')}
          </button>
        </div>
      )}
      <MessageErreur texte={a.err} />
    </section>
  );
}

function Alertes() {
  const [etat, setEtat] = useState('…');
  const [msg, setMsg] = useState('');
  const a = useAction();
  useEffect(() => {
    etatPush().then(setEtat);
  }, []);
  const impossible = !pushPossible() || (estIos() && !estInstalle());
  return (
    <section class="o-encadre">
      <h2>{tr('Alertes sur ce téléphone', 'Alertas en este teléfono', 'Alerts on this phone')}</h2>
      <p class="o-muet">
        {tr(
          'Chaque matin et à chaque nouvelle demande, une alerte neutre (« EraseOps : 2 demandes à traiter ») : aucun nom, aucun détail.',
          'Cada mañana y con cada solicitud nueva, una alerta neutra («EraseOps: 2 solicitudes por atender»): sin nombres ni detalles.',
          'Every morning and with each new request, a neutral alert ("EraseOps: 2 requests to handle"): no names, no details.',
        )}
      </p>
      {impossible ? (
        <p>{t('notifIos')}</p>
      ) : etat === 'bloque' ? (
        <p>{t('notifRefusees')}</p>
      ) : etat === 'actif' ? (
        <div class="o-actions">
          <Pastille ton="ok">{t('notifActives')}</Pastille>
          <button
            class="o-bouton o-petit"
            disabled={a.occupe}
            onClick={() =>
              a.lancer(
                () => post<{ envoyes: number }>('/push/tester'),
                (r) => setMsg(r.envoyes > 0 ? tr('Alerte envoyée.', 'Alerta enviada.', 'Alert sent.') : tr('Aucun appareil joignable.', 'Ningún dispositivo disponible.', 'No reachable device.')),
              )
            }
          >
            {t('notifTester')}
          </button>
          <button
            class="o-bouton o-petit"
            onClick={async () => {
              await desactiverPush();
              setEtat(await etatPush());
              setMsg('');
            }}
          >
            {t('notifDesactiver')}
          </button>
        </div>
      ) : (
        <button
          class="o-bouton o-principal"
          onClick={async () => {
            const r = await activerPush().catch(() => 'impossible' as const);
            setEtat(r);
            if (r === 'actif') setMsg(t('notifActives'));
          }}
        >
          🔔 {t('notifActiver')}
        </button>
      )}
      {msg && <p>{msg}</p>}
      <MessageErreur texte={a.err} />
    </section>
  );
}

function Connexions() {
  const { donnees, err, enCours } = useCharger(() => get<{ connexions: Connexion[] }>('/connexions'));
  return (
    <section class="o-encadre">
      <h2>{t('historiqueConnexions')}</h2>
      {enCours && !donnees ? <Chargement /> : donnees ? <ListeConnexions lignes={donnees.connexions.slice(0, 40)} /> : <MessageErreur texte={err} />}
    </section>
  );
}

interface Parametres {
  retention_dossier_jours: number;
  retention_demande_jours: number;
  attribution: Partial<Record<Lang, string>>;
}

function ParametresAdmin() {
  const p = useCharger(() => get<{ parametres: Parametres }>('/parametres'));
  const eq = useCharger(() => get<{ equipe: Array<{ id: string; nom: string; langue: string; actif?: number }> }>('/equipe'));
  const [f, setF] = useState<Parametres | null>(null);
  const [ok, setOk] = useState(false);
  const a = useAction();
  useEffect(() => {
    if (p.donnees) setF(p.donnees.parametres);
  }, [p.donnees]);
  if (!f) return p.err ? <MessageErreur texte={p.err} /> : <Chargement />;
  const actifs = (eq.donnees?.equipe ?? []).filter((u) => u.actif !== 0);
  return (
    <section class="o-encadre">
      <h2>{tr('Données et attribution', 'Datos y asignación', 'Data & assignment')}</h2>
      <form
        class="o-form"
        onSubmit={(e) => {
          e.preventDefault();
          setOk(false);
          a.lancer(() => put('/parametres', f), () => setOk(true));
        }}
      >
        <div class="o-grille">
          <Champ label={t('retentionDossier')} aide={tr('Entre 30 et 1095 jours.', 'Entre 30 y 1095 días.', 'Between 30 and 1095 days.')}>
            <input type="number" min={30} max={1095} value={f.retention_dossier_jours} onInput={(e) => setF({ ...f, retention_dossier_jours: Number(valeur(e)) })} />
          </Champ>
          <Champ label={t('retentionDemande')} aide={tr('Entre 7 et 365 jours.', 'Entre 7 y 365 días.', 'Between 7 and 365 days.')}>
            <input type="number" min={7} max={365} value={f.retention_demande_jours} onInput={(e) => setF({ ...f, retention_demande_jours: Number(valeur(e)) })} />
          </Champ>
        </div>
        <h3>{t('attribution')}</h3>
        <p class="o-muet">
          {tr(
            'Automatique = le premier membre actif qui parle la langue de la demande.',
            'Automático = el primer miembro activo que habla el idioma de la solicitud.',
            'Automatic = the first active member who speaks the request’s language.',
          )}
        </p>
        <div class="o-grille">
          {LANGS.map((l) => (
            <Champ label={l.toUpperCase()}>
              <select
                value={f.attribution[l] ?? ''}
                onChange={(e) => {
                  const v = valeur(e);
                  const attribution = { ...f.attribution };
                  if (v) attribution[l] = v;
                  else delete attribution[l];
                  setF({ ...f, attribution });
                }}
              >
                <option value="">{t('parDefaut')}</option>
                {actifs.map((u) => (
                  <option value={u.id}>
                    {u.nom} ({u.langue.toUpperCase()})
                  </option>
                ))}
              </select>
            </Champ>
          ))}
        </div>
        <MessageErreur texte={a.err} />
        {ok && <p class="o-encadre o-ok">{tr('Enregistré.', 'Guardado.', 'Saved.')}</p>}
        <button class="o-bouton o-principal" disabled={a.occupe}>
          {t('enregistrer')}
        </button>
      </form>
    </section>
  );
}

async function telechargerExport(): Promise<void> {
  const r = await fetch('/api/outil/export', { credentials: 'same-origin', headers: { 'X-Devuelta-Outil': '1' } });
  if (!r.ok) throw Object.assign(new Error('export'), { code: `http-${r.status}` });
  const b = await r.blob();
  const url = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eraseops-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Sauvegarde() {
  const a = useAction();
  return (
    <section class="o-encadre">
      <h2>{tr('Sauvegarde', 'Copia de seguridad', 'Backup')}</h2>
      <p class="o-muet">
        {tr(
          'Fichier complet des dossiers (sans mots de passe ni secrets). À ranger dans un espace chiffré (Proton Drive), jamais sur un ordinateur partagé.',
          'Archivo completo de los casos (sin contraseñas ni secretos). Guárdalo en un espacio cifrado (Proton Drive), nunca en un ordenador compartido.',
          'Full case file (no passwords or secrets). Store it in encrypted storage (Proton Drive), never on a shared computer.',
        )}
      </p>
      <button class="o-bouton" disabled={a.occupe} onClick={() => a.lancer(telechargerExport)}>
        {t('exporter')}
      </button>
      <MessageErreur texte={a.err} />
    </section>
  );
}

interface APurger {
  dossiers: Array<{ id: string; ref: string; statut: string; clos_le: string; purger_apres: string }>;
  demandes: Array<{ id: string; ref: string; statut: string; recue_le: string }>;
}

function Purge() {
  const { donnees, err, enCours, recharger } = useCharger(() => get<APurger>('/purge'));
  const a = useAction();
  if (enCours && !donnees) return <Chargement />;
  if (!donnees) return <MessageErreur texte={err} />;
  const n = donnees.dossiers.length + donnees.demandes.length;
  return (
    <section class="o-encadre">
      <h2>{t('purgeManuelle')}</h2>
      {n === 0 ? (
        <p class="o-muet">{t('aucun')}.</p>
      ) : (
        <>
          <ul class="o-liste-simple">
            {donnees.dossiers.map((d) => (
              <li>
                {d.ref} · {code(d.statut)} · {t('purgeLe')} {date(d.purger_apres)}
              </li>
            ))}
            {donnees.demandes.map((d) => (
              <li>
                {d.ref} · {code(d.statut)} · {date(d.recue_le)}
              </li>
            ))}
          </ul>
          <button
            class="o-bouton o-danger"
            disabled={a.occupe}
            onClick={() => {
              if (!confirm(`${t('purgerMaintenant')} (${n}) ?`)) return;
              a.lancer(() => post('/purge', { dossiers: donnees.dossiers.map((d) => d.id), demandes: donnees.demandes.map((d) => d.id) }), recharger);
            }}
          >
            {t('purgerMaintenant')}
          </button>
        </>
      )}
      <p class="o-muet">{t('purgeAuto')}</p>
      <MessageErreur texte={a.err} />
    </section>
  );
}

interface Systeme {
  tache: { derniere_execution: string; resultat: Record<string, unknown> | null } | null;
  liens_officiels: { total: number; verifies: number; casses: Array<{ url: string; verifie_le: string; http: number | null; erreur: string | null }> };
  fiches_a_reverifier: Array<{ id: string; date: string | null }>;
  nda_version: string;
}

function EtatSysteme() {
  const { donnees: s, err, enCours } = useCharger(() => get<Systeme>('/systeme'));
  if (enCours && !s) return <Chargement />;
  if (!s) return <MessageErreur texte={err} />;
  const derniere = s.tache?.derniere_execution;
  const enRetard = !!derniere && Date.now() - new Date(derniere).getTime() > 36 * 3600 * 1000;
  return (
    <section class="o-encadre">
      <h2>{t('systeme')}</h2>
      <p>
        {t('derniereTache')} : <strong>{date(derniere, true)}</strong>{' '}
        {!derniere ? (
          <Pastille ton="info">{tr('premier passage demain matin', 'primer pase mañana por la mañana', 'first run tomorrow morning')}</Pastille>
        ) : enRetard ? (
          <Pastille ton="alerte">{tr('en retard : vérifiez Cloudflare', 'con retraso: revisa Cloudflare', 'late: check Cloudflare')}</Pastille>
        ) : (
          <Pastille ton="ok">OK</Pastille>
        )}
      </p>
      {s.tache?.resultat && (
        <details>
          <summary>{tr('Détail du dernier passage', 'Detalle del último pase', 'Last run details')}</summary>
          <pre class="o-pre">{JSON.stringify(s.tache.resultat, null, 2)}</pre>
        </details>
      )}
      <h3>
        {t('liensCasses')}{' '}
        <span class="o-muet">
          ({s.liens_officiels.verifies}/{s.liens_officiels.total} {tr('contrôlés', 'controlados', 'checked')})
        </span>
      </h3>
      {s.liens_officiels.casses.length === 0 ? (
        <p class="o-muet">{t('aucunLienCasse')}</p>
      ) : (
        <ul class="o-liste-simple">
          {s.liens_officiels.casses.map((l) => (
            <li class="o-url">
              <LienExterne href={l.url}>{l.url}</LienExterne> <span class="o-muet">· {l.http ?? l.erreur ?? '?'} · {date(l.verifie_le)}</span>
            </li>
          ))}
        </ul>
      )}
      <h3>{t('aReverifier')}</h3>
      {s.fiches_a_reverifier.length === 0 ? (
        <p class="o-muet">{t('aucun')}.</p>
      ) : (
        <ul class="o-liste-simple">
          {s.fiches_a_reverifier.map((f) => (
            <li>
              <span class="o-mono">{f.id}</span> · {date(f.date)}
            </li>
          ))}
        </ul>
      )}
      <p class="o-muet">NDA : {s.nda_version}</p>
    </section>
  );
}

interface EtatTelegram {
  actif: boolean;
  robot?: string;
  branche?: boolean;
  en_attente?: number;
  derniere_erreur?: string | null;
  derniere_erreur_le?: string | null;
  injoignable?: boolean;
}

// Robot Telegram officiel : branché ? dernière erreur ? (administrateur seulement)
function RobotTelegram() {
  const { donnees: e, err, enCours, recharger } = useCharger(() => get<EtatTelegram>('/telegram/etat'));
  const a = useAction();
  if (enCours && !e) return <Chargement />;
  if (!e) return <MessageErreur texte={err} />;
  const recente = !!e.derniere_erreur_le && Date.now() - new Date(e.derniere_erreur_le).getTime() < 48 * 3600 * 1000;
  return (
    <section class="o-encadre">
      <h2>{tr('Robot Telegram', 'Robot de Telegram', 'Telegram bot')}</h2>
      {!e.actif ? (
        <p class="o-muet">
          {tr(
            'Pas encore activé : la clé du robot (secret GitHub TELEGRAM_BOT_TOKEN) n’est pas posée.',
            'Aún no activado: falta la clave del robot (secreto de GitHub TELEGRAM_BOT_TOKEN).',
            'Not activated yet: the bot key (GitHub secret TELEGRAM_BOT_TOKEN) is not set.',
          )}
        </p>
      ) : e.injoignable ? (
        <p class="o-encadre o-alerte">{tr('Telegram ne répond pas pour l’instant.', 'Telegram no responde por ahora.', 'Telegram is not responding right now.')}</p>
      ) : (
        <>
          <p>
            <LienExterne href={`https://t.me/${e.robot}`}>@{e.robot}</LienExterne>{' '}
            {e.branche ? (
              <Pastille ton="ok">{tr('branché', 'conectado', 'connected')}</Pastille>
            ) : (
              <Pastille ton="alerte">{tr('pas branché', 'no conectado', 'not connected')}</Pastille>
            )}
          </p>
          {e.derniere_erreur && recente && (
            <div class="o-encadre o-alerte">
              <p>
                {tr('Dernière erreur signalée par Telegram', 'Último error indicado por Telegram', 'Last error reported by Telegram')} ({date(e.derniere_erreur_le, true)}) :{' '}
                <span class="o-mono">{e.derniere_erreur}</span>
              </p>
              <p>
                {tr(
                  'Si l’erreur parle de 403, la protection anti-robots de Cloudflare (Bot Fight Mode) bloque Telegram : désactivez-la dans Cloudflare.',
                  'Si el error habla de 403, la protección antibots de Cloudflare (Bot Fight Mode) bloquea Telegram: desactívala en Cloudflare.',
                  'If the error mentions 403, Cloudflare’s anti-bot protection (Bot Fight Mode) is blocking Telegram: turn it off in Cloudflare.',
                )}
              </p>
            </div>
          )}
          {!!e.en_attente && (
            <p class="o-muet">
              {e.en_attente} {tr('envoi(s) en attente chez Telegram', 'envío(s) en espera en Telegram', 'update(s) waiting at Telegram')}
            </p>
          )}
          <p class="o-actions">
            <button class="o-bouton" disabled={a.occupe} onClick={() => a.lancer(() => post('/telegram/brancher'), recharger)}>
              {tr('Rebrancher le robot', 'Volver a conectar el robot', 'Reconnect the bot')}
            </button>
          </p>
          <MessageErreur texte={a.err} />
        </>
      )}
    </section>
  );
}

export function Reglages({ utilisateur, surDeconnexion }: { utilisateur: Utilisateur; surDeconnexion: () => void }) {
  const admin = utilisateur.role === 'admin';
  return (
    <div>
      <h1>{t('mReglages')}</h1>
      <MonCompte u={utilisateur} surDeconnexion={surDeconnexion} />
      <Alertes />
      {admin && (
        <>
          <EtatSysteme />
          <RobotTelegram />
          <ParametresAdmin />
          <Purge />
          <Sauvegarde />
        </>
      )}
      <Connexions />
    </div>
  );
}
