// Aiguillage des requêtes de l'outil interne : /api/outil/...
// Chaque route déclare son niveau d'accès. Par défaut : connexion complète
// (mot de passe + 2FA + accord de confidentialité) obligatoire.

import { HttpError, errorResponse, type Env } from '../util';
import {
  accepterNda,
  activer2fa,
  changerMdp,
  checkCsrf,
  code2fa,
  confirmer2fa,
  connexion,
  deconnexion,
  etat,
  initialiser,
  loadAuth,
  type AuthState,
} from './auth';
import * as assistant from './assistant';
import * as demandes from './demandes';
import * as dossiers from './dossiers';
import * as equipe from './equipe';
import * as retractations from './retractations';
import * as paiements from './paiements';
import * as signatures from './signatures';
import * as suivi from './suivi';

export interface Ctx {
  request: Request;
  env: Env;
  exec: ExecutionContext;
  url: URL;
  params: Record<string, string>;
  auth: AuthState;
}

type Handler = (ctx: Ctx) => Promise<Response>;
type RawHandler = (request: Request, env: Env, auth: AuthState | null) => Promise<Response>;
type Access = 'publique' | 'session' | 'complete' | 'admin';

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  access: Access;
  handler: Handler | RawHandler;
}

const routes: Route[] = [];

function add(method: string, path: string, access: Access, handler: Handler | RawHandler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/:([a-z_]+)/g, (_m, k) => {
        keys.push(k);
        return '([A-Za-z0-9-]{1,64})';
      }) +
      '$',
  );
  routes.push({ method, pattern, keys, access, handler });
}

// Connexion et accueil -------------------------------------------------------------
add('GET', '/auth/etat', 'publique', (req, env) => etat(req, env));
add('POST', '/auth/connexion', 'publique', (req, env) => connexion(req, env));
add('POST', '/init', 'publique', (req, env) => initialiser(req, env));
add('POST', '/auth/code', 'session', (req, env, a) => code2fa(req, env, a!));
add('POST', '/auth/changer-mdp', 'session', (req, env, a) => changerMdp(req, env, a!));
add('POST', '/auth/2fa/activer', 'session', (req, env, a) => activer2fa(req, env, a!));
add('POST', '/auth/2fa/confirmer', 'session', (req, env, a) => confirmer2fa(req, env, a!));
add('POST', '/auth/nda', 'session', (req, env, a) => accepterNda(req, env, a!));
add('POST', '/auth/deconnexion', 'publique', (req, env, a) => deconnexion(req, env, a));
add('POST', '/auth/deconnexion-partout', 'session', (req, env, a) => deconnexion(req, env, a, true));

// Travail quotidien ----------------------------------------------------------------
add('GET', '/tableau', 'complete', dossiers.tableau);
add('GET', '/demandes', 'complete', demandes.liste);
add('GET', '/demandes/:id', 'complete', demandes.detail);
add('POST', '/demandes/:id/convertir', 'complete', demandes.convertir);
add('POST', '/demandes/:id/statut', 'complete', demandes.changerStatut);
add('POST', '/demandes/:id/assigner', 'complete', demandes.assigner);
add('POST', '/demandes/:id/brouillon', 'complete', assistant.brouillon);
add('POST', '/demandes/:id/repondre', 'complete', assistant.repondre);

add('GET', '/dossiers', 'complete', dossiers.liste);
add('POST', '/dossiers', 'complete', dossiers.creer);
add('GET', '/dossiers/:id', 'complete', dossiers.detail);
add('PATCH', '/dossiers/:id', 'complete', dossiers.modifier);
add('POST', '/dossiers/:id/clore', 'complete', dossiers.clore);
add('POST', '/dossiers/:id/rouvrir', 'complete', dossiers.rouvrir);
add('GET', '/dossiers/:id/journal', 'complete', dossiers.journalDossier);
add('POST', '/dossiers/:id/notes', 'complete', dossiers.ajouterNote);
add('POST', '/dossiers/:id/contenus', 'complete', dossiers.ajouterContenus);
add('PATCH', '/contenus/:id', 'complete', dossiers.modifierContenu);
add('DELETE', '/contenus/:id', 'complete', dossiers.supprimerContenu);
add('POST', '/contenus/:id/identifier', 'complete', dossiers.identifierContenu);
add('POST', '/dossiers/:id/etapes', 'complete', dossiers.ajouterEtape);
add('PATCH', '/etapes/:id', 'complete', dossiers.modifierEtape);
add('DELETE', '/etapes/:id', 'complete', dossiers.supprimerEtape);
add('GET', '/modeles', 'complete', dossiers.listeModeles);
add('POST', '/dossiers/:id/courriers', 'complete', dossiers.creerCourrier);
add('PATCH', '/courriers/:id', 'complete', dossiers.modifierCourrier);
add('POST', '/courriers/:id/valider', 'complete', dossiers.validerCourrier);
add('POST', '/courriers/:id/envoye', 'complete', dossiers.marquerEnvoye);
add('POST', '/courriers/:id/annuler', 'complete', dossiers.annulerCourrier);
add('GET', '/referentiel', 'complete', suivi.referentiel);
add('POST', '/retractations/:id/accuse', 'complete', retractations.accuser);
add('POST', '/dossiers/:id/signature', 'complete', signatures.creer);
add('POST', '/dossiers/:id/paiement', 'complete', paiements.demander);

// Notifications, suivi, équipe et réglages ----------------------------------------
add('GET', '/notifications/resume', 'complete', suivi.resumeNotification);
add('GET', '/push/cle', 'complete', suivi.cleVapid);
add('POST', '/push/abonner', 'complete', suivi.abonner);
add('POST', '/push/desabonner', 'complete', suivi.desabonner);
add('POST', '/push/tester', 'complete', suivi.testerNotification);
add('GET', '/statistiques', 'admin', suivi.statistiques);
add('GET', '/systeme', 'admin', suivi.systeme);

add('GET', '/equipe', 'complete', equipe.liste);
add('POST', '/equipe', 'admin', equipe.creer);
add('PATCH', '/equipe/:id', 'admin', equipe.modifier);
add('POST', '/equipe/:id/reinitialiser-mdp', 'admin', equipe.reinitialiserMdp);
add('POST', '/equipe/:id/reinitialiser-2fa', 'admin', equipe.reinitialiser2fa);
add('GET', '/connexions', 'complete', equipe.connexions);
add('GET', '/parametres', 'admin', equipe.lireParametres);
add('PUT', '/parametres', 'admin', equipe.ecrireParametres);
add('GET', '/purge', 'admin', equipe.listePurge);
add('POST', '/purge', 'admin', equipe.purger);
add('GET', '/export', 'admin', equipe.exporter);

export async function handleOutil(request: Request, env: Env, exec: ExecutionContext): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/outil/, '') || '/';
    const candidates = routes.filter((r) => r.pattern.test(path));
    if (candidates.length === 0) throw new HttpError(404, 'introuvable');
    const route = candidates.find((r) => r.method === request.method);
    if (!route) throw new HttpError(405, 'methode-non-autorisee');

    checkCsrf(request);

    const m = path.match(route.pattern)!;
    const params: Record<string, string> = {};
    route.keys.forEach((k, i) => (params[k] = m[i + 1]));

    if (route.access === 'publique') {
      const auth = path.startsWith('/auth/deconnexion') ? await loadAuth(request, env) : null;
      return await (route.handler as RawHandler)(request, env, auth);
    }
    const auth = await loadAuth(request, env);
    if (!auth) throw new HttpError(401, 'non-connecte');
    if (route.access === 'session') return await (route.handler as RawHandler)(request, env, auth);
    if (auth.etape !== 'complet') throw new HttpError(403, 'connexion-incomplete');
    if (route.access === 'admin' && auth.user.role !== 'admin') throw new HttpError(403, 'reserve-admin');
    return await (route.handler as Handler)({ request, env, exec, url, params, auth });
  } catch (e) {
    return errorResponse(e);
  }
}
