// Équipe (administrateur) : comptes, mots de passe provisoires, double
// authentification, activation, historique des connexions.

import { useState } from 'preact/hooks';
import { LANGS, ROLES } from '../../../shared/vocab';
import { get, patch, post } from '../api';
import { code, date, t, tr } from '../i18n';
import { Champ, Chargement, Copier, MessageErreur, Pastille, useAction, useCharger, valeur } from '../ui';

interface Membre {
  id: string;
  email: string;
  nom: string;
  langue: string;
  role: string;
  actif: number;
  totp_actif: number;
  mdp_a_changer: number;
  nda_version: string | null;
  nda_accepte_le: string | null;
  cree_le: string;
  derniere_connexion: string | null;
  bloque_jusqua: string | null;
  nb_appareils: number;
  whatsapp: string | null;
}

export interface Connexion {
  le: string;
  resultat: string;
  ip: string | null;
  pays: string | null;
  ville: string | null;
  reseau: string | null;
  agent: string | null;
  nouveau_pays: number;
  email: string | null;
  nom: string | null;
}

const ADRESSE_OUTIL = 'https://getdevuelta.com/outil/';

function messageAcces(nom: string, email: string, mdp: string, langue: string): string {
  if (langue === 'es') {
    return `Hola ${nom}: tu acceso a EraseOps\n${ADRESSE_OUTIL}\nUsuario: ${email}\nContraseña provisional: ${mdp}\nTendrás que cambiarla al entrar. Instala antes una app de autenticación (Proton Pass o Google Authenticator). Borra este mensaje cuando hayas entrado.`;
  }
  if (langue === 'en') {
    return `Hi ${nom}, your EraseOps access\n${ADRESSE_OUTIL}\nLogin: ${email}\nTemporary password: ${mdp}\nYou will have to change it when you log in. Install an authenticator app first (Proton Pass or Google Authenticator). Delete this message once you are in.`;
  }
  return `Bonjour ${nom}, ton accès à EraseOps\n${ADRESSE_OUTIL}\nIdentifiant : ${email}\nMot de passe provisoire : ${mdp}\nTu devras le changer à la première connexion. Installe avant une application d’authentification (Proton Pass ou Google Authenticator). Supprime ce message une fois connecté·e.`;
}

function MotDePasseProvisoire({ p, fermer }: { p: { nom: string; email: string; mdp: string; langue: string }; fermer: () => void }) {
  return (
    <div class="o-encadre o-alerte" role="alert">
      <p>
        <strong>{p.nom}</strong> — {t('mdpProvisoire')}
      </p>
      <p class="o-cle">{p.mdp}</p>
      <div class="o-actions">
        <Copier texte={p.mdp} />
        <Copier texte={messageAcces(p.nom, p.email, p.mdp, p.langue)} libelle={tr('Copier le message d’accès', 'Copiar el mensaje de acceso', 'Copy the access message')} />
        <button class="o-bouton o-petit" onClick={fermer}>
          {t('fermer')}
        </button>
      </div>
    </div>
  );
}

export function ListeConnexions({ lignes }: { lignes: Connexion[] }) {
  if (!lignes.length) return <p class="o-muet">{t('aucun')}</p>;
  return (
    <ul class="o-liste-simple o-connexions">
      {lignes.map((c) => (
        <li class={c.resultat !== 'ok' ? 'o-echec' : c.nouveau_pays ? 'o-nouveau' : ''}>
          <span>{date(c.le, true)}</span> · <strong>{c.nom ?? c.email ?? '—'}</strong> · {code(`cx-${c.resultat}`)}
          <span class="o-muet">
            {' '}
            · {[c.pays, c.ville].filter(Boolean).join(' ') || '—'}
            {c.reseau ? ` · ${c.reseau}` : ''}
          </span>
          {c.nouveau_pays ? <Pastille ton="alerte">{tr('nouveau pays', 'país nuevo', 'new country')}</Pastille> : null}
        </li>
      ))}
    </ul>
  );
}

function Historique({ id }: { id: string }) {
  const { donnees, err, enCours } = useCharger(() => get<{ connexions: Connexion[] }>(`/connexions?utilisateur=${id}`), [id]);
  if (enCours && !donnees) return <Chargement />;
  if (!donnees) return <MessageErreur texte={err} />;
  return <ListeConnexions lignes={donnees.connexions.slice(0, 30)} />;
}

function CarteMembre({ m, moi, recharger, montrer }: { m: Membre; moi: string; recharger: () => void; montrer: (p: { nom: string; email: string; mdp: string; langue: string }) => void }) {
  const [histo, setHisto] = useState(false);
  const a = useAction();
  const bloque = m.bloque_jusqua && new Date(m.bloque_jusqua) > new Date();
  return (
    <li class="o-carte">
      <div class="o-carte-corps">
        <p>
          <strong>{m.nom}</strong> <span class="o-muet">· {m.email}</span>
        </p>
        <p class="o-pastilles">
          <Pastille ton={m.role === 'admin' ? 'fort' : 'neutre'}>{code(`role-${m.role}`)}</Pastille>
          <Pastille>{m.langue.toUpperCase()}</Pastille>
          {m.actif ? <Pastille ton="ok">{t('actif')}</Pastille> : <Pastille ton="alerte">{t('inactif')}</Pastille>}
          {m.totp_actif ? <Pastille ton="ok">2FA</Pastille> : <Pastille ton="alerte">{tr('2FA à activer', '2FA por activar', '2FA pending')}</Pastille>}
          {m.mdp_a_changer ? <Pastille ton="info">{tr('mot de passe provisoire', 'contraseña provisional', 'temporary password')}</Pastille> : null}
          {bloque ? <Pastille ton="alerte">{tr('bloqué 15 min', 'bloqueado 15 min', 'locked 15 min')}</Pastille> : null}
        </p>
        <p class="o-muet">
          {t('derniereConnexion')} : {date(m.derniere_connexion, true)} · {m.nb_appareils} {t('appareils')} · NDA {m.nda_accepte_le ? date(m.nda_accepte_le) : '—'} · WhatsApp {m.whatsapp ?? '—'}
        </p>
        <div class="o-grille">
          <Champ label={t('role')}>
            <select value={m.role} disabled={m.id === moi} onChange={(e) => a.lancer(() => patch(`/equipe/${m.id}`, { role: valeur(e) }), recharger)}>
              {ROLES.map((r) => (
                <option value={r}>{code(`role-${r}`)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('langueUi')}>
            <select value={m.langue} onChange={(e) => a.lancer(() => patch(`/equipe/${m.id}`, { langue: valeur(e) }), recharger)}>
              {LANGS.map((l) => (
                <option value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </Champ>
        </div>
        <div class="o-actions">
          <button
            class="o-bouton o-petit"
            disabled={a.occupe}
            onClick={() => {
              if (!confirm(`${t('reinitMdp')} — ${m.nom} ?`)) return;
              a.lancer(
                () => post<{ mot_de_passe_provisoire: string }>(`/equipe/${m.id}/reinitialiser-mdp`),
                (r) => {
                  montrer({ nom: m.nom, email: m.email, mdp: r.mot_de_passe_provisoire, langue: m.langue });
                  recharger();
                },
              );
            }}
          >
            {t('reinitMdp')}
          </button>
          <button
            class="o-bouton o-petit"
            disabled={a.occupe || !m.totp_actif}
            onClick={() => {
              if (!confirm(`${t('reinit2fa')} — ${m.nom} ?`)) return;
              a.lancer(() => post(`/equipe/${m.id}/reinitialiser-2fa`), recharger);
            }}
          >
            {t('reinit2fa')}
          </button>
          {m.id !== moi && (
            <button
              class="o-bouton o-petit"
              disabled={a.occupe}
              onClick={() => {
                if (m.actif && !confirm(`${t('desactiver')} — ${m.nom} ?`)) return;
                a.lancer(() => patch(`/equipe/${m.id}`, { actif: !m.actif }), recharger);
              }}
            >
              {m.actif ? t('desactiver') : t('reactiver')}
            </button>
          )}
          <button class="o-bouton o-petit" onClick={() => setHisto(!histo)}>
            {t('historiqueConnexions')}
          </button>
        </div>
        <MessageErreur texte={a.err} />
        {histo && <Historique id={m.id} />}
      </div>
    </li>
  );
}

export function Equipe({ moi }: { moi: string }) {
  const { donnees, err, enCours, recharger } = useCharger(() => get<{ equipe: Membre[] }>('/equipe'));
  const [provisoire, setProvisoire] = useState<{ nom: string; email: string; mdp: string; langue: string } | null>(null);
  const [f, setF] = useState({ nom: '', email: '', langue: 'es', role: 'membre' });
  const a = useAction();
  return (
    <div>
      <h1>{t('mEquipe')}</h1>
      {provisoire && <MotDePasseProvisoire p={provisoire} fermer={() => setProvisoire(null)} />}
      {enCours && !donnees ? (
        <Chargement />
      ) : (
        <>
          <MessageErreur texte={err} />
          <ul class="o-liste-cartes">
            {donnees?.equipe.map((m) => (
              <CarteMembre m={m} moi={moi} recharger={recharger} montrer={setProvisoire} />
            ))}
          </ul>
        </>
      )}
      <section class="o-encadre">
        <h2>{t('ajouterMembre')}</h2>
        <form
          class="o-form"
          onSubmit={(e) => {
            e.preventDefault();
            a.lancer(
              () => post<{ mot_de_passe_provisoire: string }>('/equipe', f),
              (r) => {
                setProvisoire({ nom: f.nom, email: f.email, mdp: r.mot_de_passe_provisoire, langue: f.langue });
                setF({ nom: '', email: '', langue: 'es', role: 'membre' });
                recharger();
              },
            );
          }}
        >
          <div class="o-grille">
            <Champ label={t('nom')}>
              <input type="text" required value={f.nom} onInput={(e) => setF({ ...f, nom: valeur(e) })} />
            </Champ>
            <Champ label={t('email')}>
              <input type="email" required value={f.email} onInput={(e) => setF({ ...f, email: valeur(e) })} />
            </Champ>
            <Champ label={t('langueUi')}>
              <select value={f.langue} onChange={(e) => setF({ ...f, langue: valeur(e) })}>
                {LANGS.map((l) => (
                  <option value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </Champ>
            <Champ label={t('role')}>
              <select value={f.role} onChange={(e) => setF({ ...f, role: valeur(e) })}>
                {ROLES.map((r) => (
                  <option value={r}>{code(`role-${r}`)}</option>
                ))}
              </select>
            </Champ>
          </div>
          <MessageErreur texte={a.err} />
          <button class="o-bouton o-principal" disabled={a.occupe}>
            {t('ajouterMembre')}
          </button>
        </form>
      </section>
    </div>
  );
}
