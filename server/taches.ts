// Le travail automatique quotidien (déclenché chaque matin par Cloudflare).
// Tout ce qui est préparé ici attend une validation humaine : rien ne part
// vers l'extérieur, à l'exception des notifications vers nos propres téléphones,
// des vérifications de liens (simples visites) et du signalement des pages
// du site aux moteurs de recherche (IndexNow).

import guidesData from '../shared/guides.json';
import plateformesData from '../shared/plateformes.json';
import { INDEXNOW_KEY, SITE_HOST, SITE_URL } from '../shared/site';
import urgencesData from '../shared/urgences.json';
import { isLang, type Lang } from '../shared/vocab';
import { newId } from './crypto';
import { getParam, getParamInt, journalStmt, setParam } from './db';
import { trouverModele, genererCourrier } from './outil/modeles';
import { notifier } from './push';
import { ensureSchema } from './schema';
import { addDays, nowIso, type Env } from './util';

const UA = `Mozilla/5.0 (compatible; DevueltaVerif/1.0; +${SITE_URL})`;

// Purge ---------------------------------------------------------------------------

export async function elementsAPurger(db: D1Database) {
  const now = nowIso();
  const jours = await getParamInt(db, 'retention_demande_jours', 30);
  const dossiers = await db
    .prepare('SELECT id, ref, statut, clos_le, purger_apres FROM dossiers WHERE purger_apres IS NOT NULL AND purger_apres <= ? ORDER BY purger_apres')
    .bind(now)
    .all<{ id: string; ref: string; statut: string; clos_le: string; purger_apres: string }>();
  const demandes = await db
    .prepare(
      "SELECT id, ref, statut, recue_le, traitee_le FROM demandes WHERE statut IN ('orientee','refusee','spam') AND COALESCE(traitee_le, recue_le) <= ? ORDER BY recue_le",
    )
    .bind(addDays(now, -jours))
    .all<{ id: string; ref: string; statut: string; recue_le: string; traitee_le: string | null }>();
  return { dossiers: dossiers.results, demandes: demandes.results };
}

export async function purgerElements(db: D1Database, dossiers: string[], demandes: string[], par: string | null) {
  const stmts: D1PreparedStatement[] = [];
  for (const id of dossiers) {
    stmts.push(db.prepare('DELETE FROM demandes WHERE dossier_id = ?').bind(id));
    stmts.push(db.prepare('DELETE FROM retractations WHERE dossier_id = ?').bind(id));
    // Liens, étapes, courriers et notes partent avec le dossier (cascade).
    stmts.push(db.prepare('DELETE FROM dossiers WHERE id = ?').bind(id));
    stmts.push(db.prepare('UPDATE journal SET details = NULL WHERE dossier_id = ?').bind(id));
  }
  for (const id of demandes) {
    stmts.push(db.prepare('DELETE FROM demandes WHERE id = ?').bind(id));
    stmts.push(db.prepare("UPDATE journal SET details = NULL WHERE objet = 'demande' AND objet_id = ?").bind(id));
  }
  if (stmts.length === 0) return { dossiers: 0, demandes: 0 };
  stmts.push(journalStmt(db, { utilisateur_id: par, action: par ? 'purge' : 'purge-automatique', objet: 'donnees', details: { dossiers: dossiers.length, demandes: demandes.length } }));
  await db.batch(stmts);
  return { dossiers: dossiers.length, demandes: demandes.length };
}

async function purgeAutomatique(db: D1Database) {
  const dus = await elementsAPurger(db);
  const n = await purgerElements(
    db,
    dus.dossiers.map((d) => d.id),
    dus.demandes.map((d) => d.id),
    null,
  );
  const now = nowIso();
  await db.batch([
    db.prepare('DELETE FROM sessions WHERE expire_le <= ?').bind(now),
    db.prepare('DELETE FROM connexions WHERE le <= ?').bind(addDays(now, -365)),
    db.prepare('DELETE FROM journal WHERE le <= ? AND dossier_id IS NULL').bind(addDays(now, -730)),
    // Preuve d'une rétractation : gardée 2 ans (délai pour agir d'un professionnel contre un consommateur).
    db.prepare('DELETE FROM retractations WHERE recue_le <= ?').bind(addDays(now, -730)),
  ]);
  return n;
}

// Relances préparées --------------------------------------------------------------

async function preparerRelances(db: D1Database): Promise<number> {
  const now = nowIso();
  const dues = await db
    .prepare(
      `SELECT d.*, e.id AS etape_id, e.fait_le, e.destinataire, e.contenu_id, c.langue AS courrier_langue,
              c.destinataire_email, c.modele AS modele_initial, u.nom AS assigne_nom
         FROM etapes e
         JOIN courriers c ON c.id = e.courrier_id
         JOIN dossiers d ON d.id = e.dossier_id
         LEFT JOIN utilisateurs u ON u.id = d.assigne_a
        WHERE e.statut = 'envoye' AND e.relance_preparee = 0 AND e.echeance IS NOT NULL AND e.echeance <= ?
          AND d.statut NOT IN ('resolu','clos','oriente')
        LIMIT 25`,
    )
    .bind(now)
    .all<Record<string, unknown>>();
  let n = 0;
  for (const r of dues.results) {
    const langue = (isLang(r.courrier_langue) ? r.courrier_langue : isLang(r.langue) ? r.langue : 'fr') as Lang;
    const modele = trouverModele('relance', langue);
    const stmts: D1PreparedStatement[] = [db.prepare('UPDATE etapes SET relance_preparee = 1 WHERE id = ?').bind(r.etape_id)];
    if (modele) {
      let urls: string[] = [];
      if (r.contenu_id) {
        const c = await db.prepare('SELECT url FROM contenus WHERE id = ?').bind(r.contenu_id).first<{ url: string }>();
        if (c) urls = [c.url];
      }
      const { objet, corps } = genererCourrier({
        modele,
        dossier: r,
        urls,
        representant: String(r.assigne_nom ?? 'Devuelta'),
        destinataire: (r.destinataire as string | null) ?? null,
        date_demande_initiale: (r.fait_le as string | null) ?? null,
      });
      const id = newId();
      stmts.push(
        db
          .prepare(
            "INSERT INTO courriers (id, dossier_id, contenu_id, modele, langue, destinataire, destinataire_email, objet, corps, statut, automatique, cree_le, maj_le) VALUES (?,?,?,?,?,?,?,?,?,'brouillon',1,?,?)",
          )
          .bind(id, r.id, r.contenu_id ?? null, 'relance', langue, r.destinataire ?? null, r.destinataire_email ?? null, objet, corps, now, now),
      );
      stmts.push(journalStmt(db, { action: 'relance-preparee-auto', objet: 'courrier', objet_id: id, dossier_id: String(r.id) }));
      n++;
    }
    await db.batch(stmts);
  }
  return n;
}

// Le contenu signalé a-t-il disparu ? Est-il revenu ? -----------------------------

type Verdict = { http: number | null; alerte: string | null };

async function sonder(url: string): Promise<{ http: number | null; erreur: string | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } });
    try {
      await r.body?.cancel();
    } catch {
      /* rien à lire */
    }
    return { http: r.status, erreur: null };
  } catch (e) {
    return { http: null, erreur: e instanceof Error ? e.name : 'erreur' };
  } finally {
    clearTimeout(t);
  }
}

function verdict(statut: string, http: number | null, erreur: string | null): Verdict {
  const disparu = http === 404 || http === 410 || http === 451 || (http === null && erreur !== 'AbortError');
  if (statut === 'signale' && disparu) return { http, alerte: 'semble-retire' };
  if (statut === 'retire' && http !== null && http >= 200 && http < 300) return { http, alerte: 'semble-reapparu' };
  return { http, alerte: null };
}

async function verifierContenus(db: D1Database): Promise<{ verifies: number; reapparus: string[] }> {
  const now = nowIso();
  const limite = await getParamInt(db, 'verif_par_jour', 15);
  const rows = await db
    .prepare(
      `SELECT c.id, c.url, c.statut, d.assigne_a FROM contenus c JOIN dossiers d ON d.id = c.dossier_id
        WHERE c.plateforme IS NULL AND d.statut NOT IN ('clos','oriente') AND (
          (c.statut = 'signale' AND (c.verif_le IS NULL OR c.verif_le <= ?)) OR
          (c.statut = 'retire' AND (c.verif_le IS NULL OR c.verif_le <= ?)))
        ORDER BY COALESCE(c.verif_le, '0') ASC LIMIT ?`,
    )
    .bind(addDays(now, -2), addDays(now, -7), limite)
    .all<{ id: string; url: string; statut: string; assigne_a: string | null }>();
  const reapparus: string[] = [];
  for (const r of rows.results) {
    const s = await sonder(r.url);
    const v = verdict(r.statut, s.http, s.erreur);
    await db
      .prepare('UPDATE contenus SET verif_le = ?, verif_http = ?, verif_alerte = COALESCE(?, verif_alerte) WHERE id = ?')
      .bind(nowIso(), v.http, v.alerte, r.id)
      .run();
    if (v.alerte === 'semble-reapparu' && r.assigne_a) reapparus.push(r.assigne_a);
  }
  return { verifies: rows.results.length, reapparus };
}

// Liens officiels publiés sur le site : toujours valides ? --------------------------

export function liensOfficiels(): string[] {
  const set = new Set<string>();
  const add = (u: unknown) => {
    if (typeof u === 'string' && /^https:\/\//.test(u)) set.add(u);
  };
  for (const p of ((plateformesData as { plateformes?: Array<{ actions: Array<{ url?: string; url_par_langue?: Record<string, string> }> }> }).plateformes ?? [])) {
    for (const a of p.actions) {
      add(a.url);
      for (const u of Object.values(a.url_par_langue ?? {})) add(u);
    }
  }
  const urg = urgencesData as { pays?: Array<{ ressources: Array<{ url?: string }> }>; international?: Array<{ url?: string }> };
  for (const p of urg.pays ?? []) for (const r of p.ressources) add(r.url);
  for (const r of urg.international ?? []) add(r.url);
  for (const f of ((guidesData as { fiches?: Array<{ source_officielle?: { url?: string }; liens_utiles?: Array<{ url?: string }> }> }).fiches ?? [])) {
    add(f.source_officielle?.url);
    for (const l of f.liens_utiles ?? []) add(l.url);
  }
  return [...set];
}

async function verifierLiensOfficiels(db: D1Database): Promise<{ verifies: number; casses: number }> {
  const tous = liensOfficiels();
  if (tous.length === 0) return { verifies: 0, casses: 0 };
  const limite = await getParamInt(db, 'liens_par_jour', 15);
  const connus = await db.prepare('SELECT url, verifie_le FROM liens_officiels').all<{ url: string; verifie_le: string }>();
  const quand = new Map(connus.results.map((r) => [r.url, r.verifie_le]));
  // On retire de la table les liens qui ne sont plus publiés.
  const publies = new Set(tous);
  for (const r of connus.results) if (!publies.has(r.url)) await db.prepare('DELETE FROM liens_officiels WHERE url = ?').bind(r.url).run();
  const aFaire = tous.sort((a, b) => (quand.get(a) ?? '0').localeCompare(quand.get(b) ?? '0')).slice(0, limite);
  let casses = 0;
  for (const url of aFaire) {
    const s = await sonder(url);
    const casse = s.http === 404 || s.http === 410 || (s.http === null && s.erreur !== 'AbortError');
    if (casse) casses++;
    await db
      .prepare(
        `INSERT INTO liens_officiels (url, verifie_le, http, ok, erreur) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(url) DO UPDATE SET verifie_le = excluded.verifie_le, http = excluded.http, ok = excluded.ok, erreur = excluded.erreur`,
      )
      .bind(url, nowIso(), s.http, casse ? 0 : 1, s.erreur)
      .run();
  }
  return { verifies: aFaire.length, casses };
}

// Signaler les pages nouvelles ou modifiées aux moteurs (Bing, Yandex, Seznam…) ----

async function indexNow(env: Env): Promise<number> {
  let build: { pages?: Record<string, string> } | null = null;
  try {
    const r = await env.ASSETS.fetch('https://assets.local/build.json');
    if (r.ok) build = await r.json();
  } catch {
    build = null;
  }
  if (!build?.pages) return 0;
  let avant: Record<string, string> = {};
  try {
    avant = JSON.parse(await getParam(env.DB, 'indexnow_pages', '{}'));
  } catch {
    avant = {};
  }
  const changees = Object.entries(build.pages)
    .filter(([u, h]) => avant[u] !== h)
    .map(([u]) => `${SITE_URL}${u}`);
  if (changees.length === 0) return 0;
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: changees.slice(0, 10_000),
    }),
  });
  if (r.status === 200 || r.status === 202) {
    await setParam(env.DB, 'indexnow_pages', JSON.stringify(build.pages));
    return changees.length;
  }
  throw new Error(`IndexNow ${r.status}`);
}

// Résumé du matin sur les téléphones ---------------------------------------------

export async function compteursPour(db: D1Database, user: { id: string; role: string; langue: string }) {
  const now = nowIso();
  const fin = addDays(now.slice(0, 10) + 'T00:00:00.000Z', 1);
  const admin = user.role === 'admin';
  const filtreD = admin ? '1 = 1' : '(d.assigne_a = ? OR d.cree_par = ?)';
  const bindsD = admin ? [] : [user.id, user.id];
  const demandes = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM demandes dm WHERE dm.statut = 'nouvelle' AND ${admin ? '1 = 1' : '(dm.assigne_a = ? OR (dm.assigne_a IS NULL AND dm.langue = ?))'}`,
    )
    .bind(...(admin ? [] : [user.id, user.langue]))
    .first<{ n: number }>();
  const echeances = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM etapes e JOIN dossiers d ON d.id = e.dossier_id
        WHERE ${filtreD} AND e.statut IN ('a-faire','envoye') AND e.echeance IS NOT NULL AND e.echeance < ?
          AND d.statut NOT IN ('resolu','clos','oriente')`,
    )
    .bind(...bindsD, fin)
    .first<{ n: number }>();
  const courriers = await db
    .prepare(`SELECT COUNT(*) AS n FROM courriers c JOIN dossiers d ON d.id = c.dossier_id WHERE ${filtreD} AND c.statut = 'brouillon'`)
    .bind(...bindsD)
    .first<{ n: number }>();
  const alertes = await db
    .prepare(`SELECT COUNT(*) AS n FROM contenus c JOIN dossiers d ON d.id = c.dossier_id WHERE ${filtreD} AND c.verif_alerte IS NOT NULL`)
    .bind(...bindsD)
    .first<{ n: number }>();
  const retractations = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM retractations r LEFT JOIN dossiers d ON d.id = r.dossier_id WHERE r.accuse_le IS NULL AND ${
        admin ? '1 = 1' : '((d.id IS NOT NULL AND (d.assigne_a = ? OR d.cree_par = ?)) OR (r.dossier_id IS NULL AND r.langue = ?))'
      }`,
    )
    .bind(...(admin ? [] : [user.id, user.id, user.langue]))
    .first<{ n: number }>();
  return {
    retractations: retractations?.n ?? 0,
    demandes: demandes?.n ?? 0,
    echeances: echeances?.n ?? 0,
    courriers: courriers?.n ?? 0,
    alertes: alertes?.n ?? 0,
  };
}

async function resumeDuMatin(db: D1Database): Promise<number> {
  const users = await db
    .prepare('SELECT DISTINCT u.id, u.role, u.langue FROM utilisateurs u JOIN push_abonnements p ON p.utilisateur_id = u.id WHERE u.actif = 1')
    .all<{ id: string; role: string; langue: string }>();
  let n = 0;
  for (const u of users.results) {
    const c = await compteursPour(db, u);
    if (c.retractations + c.demandes + c.echeances + c.courriers + c.alertes > 0) n += await notifier(db, [u.id]);
  }
  return n;
}

// Chef d'orchestre ----------------------------------------------------------------

export async function executerTaches(env: Env): Promise<Record<string, unknown>> {
  await ensureSchema(env.DB);
  const resultat: Record<string, unknown> = { le: nowIso() };
  const etape = async (nom: string, f: () => Promise<unknown>) => {
    try {
      resultat[nom] = await f();
    } catch (e) {
      resultat[nom] = { erreur: e instanceof Error ? e.message : String(e) };
    }
  };
  await etape('purge', () => purgeAutomatique(env.DB));
  await etape('relances', () => preparerRelances(env.DB));
  let reapparus: string[] = [];
  await etape('contenus', async () => {
    const r = await verifierContenus(env.DB);
    reapparus = r.reapparus;
    return r.verifies;
  });
  await etape('liens_officiels', () => verifierLiensOfficiels(env.DB));
  // En local, on ne signale rien aux moteurs : seul le vrai site le fait.
  await etape('indexnow', () => (env.LOCAL === '1' ? Promise.resolve('ignoré en local') : indexNow(env)));
  await etape('alertes_reapparition', () => (reapparus.length ? notifier(env.DB, reapparus) : Promise.resolve(0)));
  await etape('resume_matin', () => resumeDuMatin(env.DB));
  // Auto-surveillance : une étape en erreur prévient les administrateurs (texte neutre).
  const enErreur = Object.entries(resultat).filter(([, v]) => v && typeof v === 'object' && 'erreur' in (v as object)).map(([k]) => k);
  if (enErreur.length > 0) {
    resultat.etapes_en_erreur = enErreur;
    await etape('alerte_admin', async () => {
      const admins = await env.DB.prepare("SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1").all<{ id: string }>();
      return notifier(env.DB, admins.results.map((a) => a.id));
    });
  }
  await env.DB.prepare(
    `INSERT INTO taches (nom, derniere_execution, resultat) VALUES ('quotidienne', ?, ?)
     ON CONFLICT(nom) DO UPDATE SET derniere_execution = excluded.derniere_execution, resultat = excluded.resultat`,
  )
    .bind(nowIso(), JSON.stringify(resultat))
    .run();
  return resultat;
}
