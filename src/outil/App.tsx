// Application EraseOps : enchaînement de la connexion, menu et écrans.
// Navigation par l'adresse (#/dossiers/…) pour que le bouton Retour fonctionne.

import { useEffect, useState } from 'preact/hooks';
import { get, post, quandDeconnecte } from './api';
import { langue, t, tr, type Cle } from './i18n';
import { enregistrerServiceWorker } from './push';
import { Chargement } from './ui';
import { Activer2fa, ChangerMdp, Code2fa, Connexion, Nda, type Etat } from './vues/Acces';
import { Aide } from './vues/Aide';
import { DetailDemande, ListeDemandes } from './vues/Demandes';
import { FicheDossier } from './vues/Dossier';
import { ListeDossiers, NouveauDossier } from './vues/Dossiers';
import { Equipe } from './vues/Equipe';
import { Floutage } from './vues/Floutage';
import { Referentiel } from './vues/Referentiel';
import { Reglages } from './vues/Reglages';
import { Stats } from './vues/Stats';
import { Tableau } from './vues/Tableau';

interface Route {
  vue: string;
  id?: string;
  onglet?: string;
}

function lireRoute(): Route {
  const p = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (p[0] === 'demandes' && p[1]) return { vue: 'demande', id: p[1] };
  if (p[0] === 'dossiers' && p[1] === 'nouveau') return { vue: 'nouveau' };
  if (p[0] === 'dossiers' && p[1]) return { vue: 'dossier', id: p[1], onglet: p[2] };
  if (p[0] === 'referentiel' && p[1]) return { vue: 'referentiel', id: p[1] };
  return { vue: p[0] || 'tableau' };
}

interface Compteurs {
  demandes: number;
  echeances: number;
  courriers: number;
  alertes: number;
}

const MENU: Array<{ vue: string; cle: Cle; admin?: boolean }> = [
  { vue: 'tableau', cle: 'mTableau' },
  { vue: 'demandes', cle: 'mDemandes' },
  { vue: 'dossiers', cle: 'mDossiers' },
  { vue: 'referentiel', cle: 'mReferentiel' },
  { vue: 'floutage', cle: 'mFloutage' },
  { vue: 'stats', cle: 'mStats', admin: true },
  { vue: 'equipe', cle: 'mEquipe', admin: true },
  { vue: 'reglages', cle: 'mReglages' },
  { vue: 'aide', cle: 'mAide' },
];

function mettreBadge(n: number): void {
  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  try {
    if (n > 0) nav.setAppBadge?.(n)?.catch(() => undefined);
    else nav.clearAppBadge?.()?.catch(() => undefined);
  } catch {
    /* pastille d'icône non disponible */
  }
}

function Espace({ etat, route, surDeconnexion }: { etat: Etat; route: Route; surDeconnexion: () => void }) {
  const u = etat.utilisateur!;
  const admin = u.role === 'admin';
  const [menu, setMenu] = useState(false);
  const [c, setC] = useState<Compteurs | null>(null);
  const [alertePays, setAlertePays] = useState(!!etat.alerte_nouveau_pays);

  useEffect(() => {
    setMenu(false);
    get<{ compteurs: Compteurs }>('/notifications/resume')
      .then((r) => {
        setC(r.compteurs);
        mettreBadge(r.compteurs.demandes + r.compteurs.echeances + r.compteurs.courriers + r.compteurs.alertes);
      })
      .catch(() => undefined);
  }, [route.vue, route.id]);

  useEffect(() => {
    enregistrerServiceWorker();
  }, []);

  const actif = route.vue === 'demande' ? 'demandes' : route.vue === 'dossier' || route.vue === 'nouveau' ? 'dossiers' : route.vue;
  const pastille = (vue: string): number => {
    if (!c) return 0;
    if (vue === 'demandes') return c.demandes;
    if (vue === 'tableau') return c.echeances + c.courriers + c.alertes;
    return 0;
  };

  let ecran;
  switch (route.vue) {
    case 'demandes':
      ecran = <ListeDemandes />;
      break;
    case 'demande':
      ecran = <DetailDemande id={route.id!} />;
      break;
    case 'dossiers':
      ecran = <ListeDossiers />;
      break;
    case 'nouveau':
      ecran = <NouveauDossier />;
      break;
    case 'dossier':
      ecran = <FicheDossier id={route.id!} onglet={route.onglet} />;
      break;
    case 'referentiel':
      ecran = <Referentiel ouvert={route.id} />;
      break;
    case 'floutage':
      ecran = <Floutage />;
      break;
    case 'stats':
      ecran = admin ? <Stats /> : <Tableau nom={u.nom} />;
      break;
    case 'equipe':
      ecran = admin ? <Equipe moi={u.id} /> : <Tableau nom={u.nom} />;
      break;
    case 'reglages':
      ecran = <Reglages utilisateur={u} surDeconnexion={surDeconnexion} />;
      break;
    case 'aide':
      ecran = <Aide />;
      break;
    default:
      ecran = <Tableau nom={u.nom} />;
  }

  return (
    <div class="o-app">
      <header class="o-entete">
        <a class="o-marque" href="#/">
          EraseOps
        </a>
        <button type="button" class="o-bouton-menu" aria-expanded={menu} aria-controls="o-menu" onClick={() => setMenu(!menu)}>
          {menu ? '✕' : '☰'} <span>Menu</span>
          {!menu && c && c.demandes + c.echeances + c.courriers + c.alertes > 0 ? <span class="o-point" aria-hidden="true" /> : null}
        </button>
      </header>
      <nav id="o-menu" class={`o-menu ${menu ? 'o-ouvert' : ''}`} aria-label="Menu">
        <a class="o-bouton o-principal o-nouveau" href="#/dossiers/nouveau">
          + {t('mNouveau')}
        </a>
        <ul>
          {MENU.filter((m) => !m.admin || admin).map((m) => (
            <li>
              <a href={`#/${m.vue === 'tableau' ? '' : m.vue}`} class={actif === m.vue ? 'o-actif' : ''} aria-current={actif === m.vue ? 'page' : undefined}>
                {t(m.cle)}
                {pastille(m.vue) > 0 && <span class="o-compteur">{pastille(m.vue)}</span>}
              </a>
            </li>
          ))}
        </ul>
        <p class="o-moi">
          {u.nom} · {u.langue.toUpperCase()}
        </p>
        <button type="button" class="o-bouton o-petit" onClick={() => post('/auth/deconnexion').finally(surDeconnexion)}>
          {t('deconnexion')}
        </button>
      </nav>
      <main class="o-contenu" id="contenu">
        {alertePays && (
          <div class="o-encadre o-alerte" role="alert">
            <p>{t('nouveauPays')}</p>
            <div class="o-actions">
              <a class="o-bouton o-petit" href="#/reglages" onClick={() => setAlertePays(false)}>
                {t('changerMdp')}
              </a>
              <button class="o-bouton o-petit" onClick={() => setAlertePays(false)}>
                {tr('C’était moi', 'Fui yo', 'It was me')}
              </button>
            </div>
          </div>
        )}
        {ecran}
      </main>
    </div>
  );
}

export function App() {
  const [etat, setEtat] = useState<Etat | null>(null);
  const [route, setRoute] = useState<Route>(lireRoute());

  const maj = (e: Etat) => {
    if (e.utilisateur?.langue) langue.value = e.utilisateur.langue;
    setEtat(e);
  };
  const relire = () =>
    get<Etat>('/auth/etat')
      .then(maj)
      .catch(() => setEtat({ etape: 'connexion' }));

  useEffect(() => {
    quandDeconnecte(relire);
    relire();
    const surChangement = () => {
      setRoute(lireRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', surChangement);
    return () => window.removeEventListener('hashchange', surChangement);
  }, []);

  if (!etat) return <Chargement />;
  switch (etat.etape) {
    case 'connexion':
      return <Connexion suite={maj} initialisation={!!etat.initialisation} />;
    case 'code-2fa':
      return <Code2fa suite={maj} />;
    case 'changer-mdp':
      return <ChangerMdp suite={maj} />;
    case 'activer-2fa':
      return <Activer2fa suite={maj} />;
    case 'nda':
      return <Nda suite={maj} />;
    case 'complet':
      return <Espace etat={etat} route={route} surDeconnexion={() => setEtat({ etape: 'connexion' })} />;
    default:
      return <Connexion suite={maj} initialisation={false} />;
  }
}
