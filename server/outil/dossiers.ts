// Dossiers : liens à faire retirer, démarches (étapes), courriers, notes.
// Règle d'or : rien ne part d'ici. L'outil prépare, un humain valide,
// puis envoie lui-même depuis la boîte Proton et le note.

import {
  PRIORITES,
  STATUTS_CONTENU,
  STATUTS_DOSSIER,
  STATUTS_DOSSIER_FERMES,
  STATUTS_ETAPE,
  TYPES_ETAPE,
  delaiEtape,
  isLang,
  isPays,
  isSituation,
  type Lang,
} from '../../shared/vocab';
import { newId } from '../crypto';
import { getParamInt, journalStmt, nextRef } from '../db';
import { HttpError, addDays, bool, cleanEmail, cleanPhone, cleanText, cleanUrls, json, nowIso, readJson } from '../util';
import { dossierVisible, filtreDossiers, objetVisible } from './access';
import { hoteDe, identifier, plateformeDuLien, type Identification } from './identification';
import { ETAPE_DU_MODELE, contientMarqueur, genererCourrier, resumeModeles, trouverModele } from './modeles';
import { fichesPour, planPourLien } from './plan';
import { enAttente, pourDossier } from './retractations';
import { pourDossier as signaturePourDossier } from './signatures';
import { pourDossier as paiementsPourDossier } from './paiements';
import { paiementActif } from '../paiement';
import type { Ctx } from './router';

const FERMES = STATUTS_DOSSIER_FERMES as readonly string[];

function isoDateOrNull(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v !== 'string') throw new HttpError(400, 'date-invalide');
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, 'date-invalide');
  return d.toISOString();
}

export function stmtEcheance(db: D1Database, dossierId: string): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE dossiers SET maj_le = ?, prochaine_echeance = (
         SELECT MIN(echeance) FROM etapes
          WHERE dossier_id = ? AND statut IN ('a-faire','envoye') AND echeance IS NOT NULL)
       WHERE id = ?`,
    )
    .bind(nowIso(), dossierId, dossierId);
}

// Tableau de bord ----------------------------------------------------------------

export async function tableau({ env, auth }: Ctx): Promise<Response> {
  const f = filtreDossiers(auth.user);
  const now = nowIso();
  const echeances = await env.DB.prepare(
    `SELECT e.id, e.type, e.statut, e.echeance, e.destinataire, e.dossier_id, e.relance_preparee,
            d.ref, d.client_pseudo, d.priorite, d.menace, u.nom AS assigne_nom
       FROM etapes e JOIN dossiers d ON d.id = e.dossier_id LEFT JOIN utilisateurs u ON u.id = d.assigne_a
      WHERE ${f.sql} AND e.statut IN ('a-faire','envoye') AND e.echeance IS NOT NULL
        AND d.statut NOT IN ('resolu','clos','oriente')
      ORDER BY e.echeance ASC LIMIT 60`,
  )
    .bind(...f.binds)
    .all();
  const ouverts = await env.DB.prepare(
    `SELECT COUNT(*) AS n, SUM(CASE WHEN d.assigne_a = ? THEN 1 ELSE 0 END) AS miens,
            SUM(CASE WHEN d.prochaine_echeance IS NULL THEN 1 ELSE 0 END) AS sans_echeance
       FROM dossiers d WHERE ${f.sql} AND d.statut NOT IN ('resolu','clos','oriente')`,
  )
    .bind(auth.user.id, ...f.binds)
    .first<{ n: number; miens: number; sans_echeance: number }>();
  const fd =
    auth.user.role === 'admin'
      ? { sql: '1 = 1', binds: [] as unknown[] }
      : { sql: '(dm.assigne_a = ? OR (dm.assigne_a IS NULL AND dm.langue = ?))', binds: [auth.user.id, auth.user.langue] as unknown[] };
  const demandes = await env.DB.prepare(
    `SELECT dm.id, dm.ref, dm.recue_le, dm.langue, dm.situation, dm.menace, dm.pseudo
       FROM demandes dm WHERE ${fd.sql} AND dm.statut = 'nouvelle' ORDER BY dm.menace DESC, dm.recue_le ASC LIMIT 20`,
  )
    .bind(...fd.binds)
    .all();
  const aValider = await env.DB.prepare(
    `SELECT c.id, c.dossier_id, c.modele, c.langue, c.maj_le, c.automatique, d.ref FROM courriers c JOIN dossiers d ON d.id = c.dossier_id
      WHERE ${f.sql} AND c.statut IN ('brouillon','valide') ORDER BY c.maj_le DESC LIMIT 20`,
  )
    .bind(...f.binds)
    .all();
  const alertesLiens = await env.DB.prepare(
    `SELECT c.id, c.url, c.verif_alerte, c.verif_le, c.dossier_id, d.ref FROM contenus c JOIN dossiers d ON d.id = c.dossier_id
      WHERE ${f.sql} AND c.verif_alerte IS NOT NULL ORDER BY c.verif_le DESC LIMIT 20`,
  )
    .bind(...f.binds)
    .all();
  const alertes = await env.DB.prepare(
    `SELECT c.le, c.pays, c.ville, c.email, u.nom FROM connexions c LEFT JOIN utilisateurs u ON u.id = c.utilisateur_id
      WHERE c.nouveau_pays = 1 AND c.le > ? ${auth.user.role === 'admin' ? '' : 'AND c.utilisateur_id = ?'}
      ORDER BY c.le DESC LIMIT 10`,
  )
    .bind(...(auth.user.role === 'admin' ? [addDays(now, -30)] : [addDays(now, -30), auth.user.id]))
    .all();
  const bientotSupprimes = await env.DB.prepare(
    `SELECT d.id, d.ref, d.purger_apres FROM dossiers d WHERE ${f.sql} AND d.purger_apres IS NOT NULL AND d.purger_apres <= ?
      ORDER BY d.purger_apres LIMIT 20`,
  )
    .bind(...f.binds, addDays(now, 7))
    .all();
  const retractations = await enAttente(env.DB, auth.user);
  return json({
    ok: true,
    maintenant: now,
    retractations,
    echeances: echeances.results,
    dossiers: { ouverts: ouverts?.n ?? 0, miens: ouverts?.miens ?? 0, sans_echeance: ouverts?.sans_echeance ?? 0 },
    demandes: demandes.results,
    courriers_a_traiter: aValider.results,
    alertes_liens: alertesLiens.results,
    alertes_connexion: alertes.results,
    bientot_supprimes: bientotSupprimes.results,
  });
}

// Liste et fiche ------------------------------------------------------------------

export async function liste({ env, url, auth }: Ctx): Promise<Response> {
  const f = filtreDossiers(auth.user);
  const where = [f.sql];
  const binds = [...f.binds];
  const p = url.searchParams;
  const statut = p.get('statut');
  if (statut === 'ouverts') where.push("d.statut NOT IN ('resolu','clos','oriente')");
  else if (statut === 'fermes') where.push("d.statut IN ('resolu','clos','oriente')");
  else if (statut && (STATUTS_DOSSIER as readonly string[]).includes(statut)) {
    where.push('d.statut = ?');
    binds.push(statut);
  }
  const assigne = p.get('assigne');
  if (assigne === 'moi') {
    where.push('d.assigne_a = ?');
    binds.push(auth.user.id);
  } else if (assigne === 'personne') where.push('d.assigne_a IS NULL');
  else if (assigne && /^[0-9a-f-]{36}$/.test(assigne)) {
    where.push('d.assigne_a = ?');
    binds.push(assigne);
  }
  const situation = p.get('situation');
  if (situation && isSituation(situation)) {
    where.push('d.situation = ?');
    binds.push(situation);
  }
  const langue = p.get('langue');
  if (langue && isLang(langue)) {
    where.push('d.langue = ?');
    binds.push(langue);
  }
  const q = (p.get('q') ?? '').trim().slice(0, 80);
  if (q) {
    where.push(
      `(d.ref LIKE ? OR d.client_pseudo LIKE ? OR d.client_nom LIKE ? OR d.client_email LIKE ? OR EXISTS (
          SELECT 1 FROM contenus c WHERE c.dossier_id = d.id AND (c.url LIKE ? OR c.domaine LIKE ?)))`,
    );
    const like = `%${q.replace(/[%_]/g, '')}%`;
    binds.push(like, like, like, like, like, like);
  }
  const rows = await env.DB.prepare(
    `SELECT d.id, d.ref, d.statut, d.priorite, d.menace, d.langue, d.pays, d.situation, d.client_pseudo,
            d.assigne_a, u.nom AS assigne_nom, d.prochaine_echeance, d.maj_le, d.cree_le, d.purger_apres,
            (SELECT COUNT(*) FROM contenus c WHERE c.dossier_id = d.id) AS nb_contenus,
            (SELECT COUNT(*) FROM contenus c WHERE c.dossier_id = d.id AND c.statut = 'retire') AS nb_retires
       FROM dossiers d LEFT JOIN utilisateurs u ON u.id = d.assigne_a
      WHERE ${where.join(' AND ')}
      ORDER BY CASE WHEN d.statut IN ('resolu','clos','oriente') THEN 1 ELSE 0 END,
               d.menace DESC,
               CASE d.priorite WHEN 'mineur-immediat' THEN 0 WHEN 'prioritaire' THEN 1 ELSE 2 END,
               COALESCE(d.prochaine_echeance, '9999') ASC, d.maj_le DESC
      LIMIT 300`,
  )
    .bind(...binds)
    .all();
  return json({ ok: true, dossiers: rows.results });
}

function lireIdent(row: Record<string, unknown>): Identification | null {
  try {
    return row.ident_json ? (JSON.parse(String(row.ident_json)) as Identification) : null;
  } catch {
    return null;
  }
}

export async function detail({ env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const [contenus, etapes, courriers, notes] = await Promise.all([
    env.DB.prepare('SELECT * FROM contenus WHERE dossier_id = ? ORDER BY ajoute_le').bind(d.id).all<Record<string, unknown>>(),
    env.DB.prepare(
      'SELECT e.*, u.nom AS cree_par_nom FROM etapes e LEFT JOIN utilisateurs u ON u.id = e.cree_par WHERE e.dossier_id = ? ORDER BY COALESCE(e.fait_le, e.cree_le) DESC',
    )
      .bind(d.id)
      .all(),
    env.DB.prepare(
      `SELECT c.*, a.nom AS cree_par_nom, v.nom AS valide_par_nom, s.nom AS envoye_par_nom FROM courriers c
         LEFT JOIN utilisateurs a ON a.id = c.cree_par LEFT JOIN utilisateurs v ON v.id = c.valide_par
         LEFT JOIN utilisateurs s ON s.id = c.envoye_par
        WHERE c.dossier_id = ? ORDER BY c.cree_le DESC`,
    )
      .bind(d.id)
      .all(),
    env.DB.prepare(
      'SELECT n.*, u.nom AS auteur_nom FROM notes n LEFT JOIN utilisateurs u ON u.id = n.auteur WHERE n.dossier_id = ? ORDER BY n.cree_le DESC',
    )
      .bind(d.id)
      .all(),
  ]);
  const assigne = d.assigne_a
    ? await env.DB.prepare('SELECT nom, whatsapp FROM utilisateurs WHERE id = ?').bind(d.assigne_a).first<{ nom: string; whatsapp: string | null }>()
    : null;
  const retractations = await pourDossier(env.DB, d.id);
  const signature = await signaturePourDossier(env.DB, d.id);
  const paiements = await paiementsPourDossier(env.DB, d.id);
  const liens = contenus.results.map((c) => {
    const ident = lireIdent(c);
    const row: Record<string, unknown> = { ...c, ident };
    delete row.ident_json;
    row.plan = planPourLien({
      situation: String(d.situation),
      pays_client: (d.pays as string | null) ?? null,
      priorite: String(d.priorite),
      plateforme: (c.plateforme as string | null) ?? null,
      registrar: ident?.registrar ?? null,
      registrar_abuse: ident?.registrar_abuse ?? null,
      hebergeur: ident?.hebergeur ?? null,
      hebergeur_abuse: ident?.hebergeur_abuse ?? null,
      pays_reseau: ident?.pays_reseau ?? null,
      derriere_cloudflare: !!ident?.derriere_cloudflare,
    });
    return row;
  });
  const fiches = fichesPour(String(d.situation), (d.pays as string | null) ?? null).map((f) => ({
    id: f.id,
    pays: f.pays,
    categorie: f.categorie,
    statut: f.statut,
    role_devuelta: f.role_devuelta ?? null,
    delai_couperet: f.delai_couperet ?? null,
    action_immediate: f.action_immediate ?? null,
    niveau_urgence: f.niveau_urgence ?? null,
  }));
  return json({
    ok: true,
    dossier: { ...d, assigne_nom: assigne?.nom ?? null, assigne_whatsapp: assigne?.whatsapp ?? null },
    contenus: liens,
    etapes: etapes.results,
    courriers: courriers.results,
    notes: notes.results,
    fiches,
    retractations,
    signature,
    paiements,
    paiement_actif: paiementActif(env),
  });
}

// Création et modification ------------------------------------------------------

export async function creer({ request, env, auth, exec }: Ctx): Promise<Response> {
  const body = await readJson(request, 20_000);
  const langue: Lang = isLang(body.langue) ? body.langue : auth.user.langue;
  const situation = isSituation(body.situation) ? body.situation : 'autre';
  const pseudo = cleanText(body.client_pseudo, 60, { required: true })!;
  const priorite = (PRIORITES as readonly string[]).includes(String(body.priorite)) ? String(body.priorite) : 'normal';
  let assigne = typeof body.assigne_a === 'string' && body.assigne_a ? body.assigne_a : auth.user.id;
  const u = await env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(assigne).first();
  if (!u) assigne = auth.user.id;
  const liens = cleanUrls(body.liens, 50);
  const id = newId();
  const ref = await nextRef(env.DB, 'DV');
  const now = nowIso();
  const stmts = [
    env.DB.prepare(
      `INSERT INTO dossiers (id, ref, cree_le, maj_le, cree_par, statut, priorite, menace, langue, pays, situation, assigne_a,
         client_pseudo, client_nom, client_email, client_whatsapp, contact_prefere, publie_par_soi, resume)
       VALUES (?,?,?,?,?,'ouvert',?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      ref,
      now,
      now,
      auth.user.id,
      priorite,
      bool(body.menace) ? 1 : 0,
      langue,
      isPays(body.pays) ? body.pays : null,
      situation,
      assigne,
      pseudo,
      cleanText(body.client_nom, 120),
      cleanEmail(body.client_email, false),
      cleanPhone(body.client_whatsapp, false),
      body.contact_prefere === 'whatsapp' ? 'whatsapp' : body.contact_prefere === 'email' ? 'email' : null,
      body.publie_par_soi === true ? 1 : body.publie_par_soi === false ? 0 : null,
      cleanText(body.resume, 4000, { multiline: true }),
    ),
  ];
  for (const lien of liens) {
    const hote = hoteDe(lien);
    stmts.push(
      env.DB.prepare(
        "INSERT INTO contenus (id, dossier_id, url, domaine, plateforme, statut, origine, ajoute_le, ajoute_par) VALUES (?,?,?,?,?,'a-traiter','manuel',?,?)",
      ).bind(newId(), id, lien, hote, plateformeDuLien(lien), now, auth.user.id),
    );
  }
  stmts.push(journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'dossier-cree', objet: 'dossier', objet_id: id, dossier_id: id, details: { ref } }));
  await env.DB.batch(stmts);
  if (liens.length) exec.waitUntil(identifierTousLesLiens(env.DB, id).catch(() => undefined));
  return json({ ok: true, id, ref });
}

const CHAMPS_PERSONNELS = ['client_nom', 'client_email', 'client_whatsapp', 'client_pseudo', 'resume'];

export async function modifier({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 20_000);
  const sets: string[] = [];
  const binds: unknown[] = [];
  const changes: string[] = [];
  const set = (col: string, val: unknown) => {
    sets.push(`${col} = ?`);
    binds.push(val);
    changes.push(col);
  };
  if ('statut' in body) {
    const s = String(body.statut);
    if (!['ouvert', 'en-cours', 'en-attente'].includes(s)) throw new HttpError(400, 'statut-invalide');
    if (FERMES.includes(String(d.statut))) throw new HttpError(409, 'dossier-ferme');
    set('statut', s);
  }
  if ('priorite' in body) {
    if (!(PRIORITES as readonly string[]).includes(String(body.priorite))) throw new HttpError(400, 'priorite-invalide');
    set('priorite', body.priorite);
  }
  if ('menace' in body) set('menace', bool(body.menace) ? 1 : 0);
  if ('langue' in body) {
    if (!isLang(body.langue)) throw new HttpError(400, 'langue-invalide');
    set('langue', body.langue);
  }
  if ('pays' in body) set('pays', isPays(body.pays) ? body.pays : null);
  if ('situation' in body) {
    if (!isSituation(body.situation)) throw new HttpError(400, 'situation-invalide');
    set('situation', body.situation);
  }
  if ('assigne_a' in body) {
    if (auth.user.role !== 'admin' && d.assigne_a !== auth.user.id) throw new HttpError(403, 'reattribution-refusee');
    const cible = body.assigne_a ? String(body.assigne_a) : null;
    if (cible) {
      const u = await env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(cible).first();
      if (!u) throw new HttpError(400, 'utilisateur-invalide');
    }
    set('assigne_a', cible);
  }
  if ('client_pseudo' in body) set('client_pseudo', cleanText(body.client_pseudo, 60, { required: true }));
  if ('client_nom' in body) set('client_nom', cleanText(body.client_nom, 120));
  if ('client_email' in body) set('client_email', cleanEmail(body.client_email, false));
  if ('client_whatsapp' in body) set('client_whatsapp', cleanPhone(body.client_whatsapp, false));
  if ('contact_prefere' in body) {
    set('contact_prefere', body.contact_prefere === 'whatsapp' ? 'whatsapp' : body.contact_prefere === 'email' ? 'email' : null);
  }
  if ('publie_par_soi' in body) set('publie_par_soi', body.publie_par_soi === true ? 1 : body.publie_par_soi === false ? 0 : null);
  for (const col of ['mandat_signe_le', 'identite_verifiee_le', 'consentement_recherche_le'] as const) {
    if (col in body) set(col, isoDateOrNull(body[col]));
  }
  if ('resume' in body) set('resume', cleanText(body.resume, 4000, { multiline: true }));
  if ('prochaine_action' in body) set('prochaine_action', cleanText(body.prochaine_action, 300));
  if ('client_pro' in body) set('client_pro', body.client_pro === true ? 1 : 0);
  if ('temps_minutes' in body) {
    const n = Number(body.temps_minutes);
    if (!Number.isInteger(n) || n < 0 || n > 100_000) throw new HttpError(400, 'temps-invalide');
    set('temps_minutes', n);
  }
  if (sets.length === 0) return json({ ok: true });
  sets.push('maj_le = ?');
  binds.push(nowIso());
  const valeurs: Record<string, unknown> = {};
  for (const c of changes) if (!CHAMPS_PERSONNELS.includes(c)) valeurs[c] = body[c];
  await env.DB.batch([
    env.DB.prepare(`UPDATE dossiers SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, d.id),
    // On journalise les champs modifiés, jamais leur contenu personnel.
    journalStmt(env.DB, {
      utilisateur_id: auth.user.id,
      action: 'dossier-modifie',
      objet: 'dossier',
      objet_id: d.id,
      dossier_id: d.id,
      details: { champs: changes, valeurs },
    }),
  ]);
  return json({ ok: true });
}

export async function clore({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 6_000);
  const statut = String(body.statut);
  if (!FERMES.includes(statut)) throw new HttpError(400, 'statut-invalide');
  const resultat = cleanText(body.resultat, 3000, { multiline: true, required: true });
  const now = nowIso();
  const jours = await getParamInt(env.DB, 'retention_dossier_jours', 180);
  await env.DB.batch([
    env.DB.prepare(
      'UPDATE dossiers SET statut = ?, resultat = ?, clos_le = ?, purger_apres = ?, maj_le = ?, prochaine_echeance = NULL WHERE id = ?',
    ).bind(statut, resultat, now, addDays(now, jours), now, d.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'dossier-clos', objet: 'dossier', objet_id: d.id, dossier_id: d.id, details: { statut } }),
  ]);
  return json({ ok: true });
}

export async function rouvrir({ env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  if (!FERMES.includes(String(d.statut))) throw new HttpError(409, 'dossier-ouvert');
  await env.DB.batch([
    env.DB.prepare("UPDATE dossiers SET statut = 'en-cours', clos_le = NULL, purger_apres = NULL, maj_le = ? WHERE id = ?").bind(nowIso(), d.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'dossier-rouvert', objet: 'dossier', objet_id: d.id, dossier_id: d.id }),
    stmtEcheance(env.DB, d.id),
  ]);
  return json({ ok: true });
}

export async function journalDossier({ env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const rows = await env.DB.prepare(
    'SELECT j.le, j.action, j.objet, j.details, u.nom FROM journal j LEFT JOIN utilisateurs u ON u.id = j.utilisateur_id WHERE j.dossier_id = ? ORDER BY j.le DESC LIMIT 300',
  )
    .bind(d.id)
    .all();
  return json({ ok: true, journal: rows.results });
}

export async function ajouterNote({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 10_000);
  const texte = cleanText(body.texte, 5000, { multiline: true, required: true })!;
  const id = newId();
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO notes (id, dossier_id, auteur, texte, cree_le) VALUES (?,?,?,?,?)').bind(id, d.id, auth.user.id, texte, now),
    env.DB.prepare('UPDATE dossiers SET maj_le = ? WHERE id = ?').bind(now, d.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'note-ajoutee', objet: 'note', objet_id: id, dossier_id: d.id }),
  ]);
  return json({ ok: true, id });
}

// Liens ---------------------------------------------------------------------------

export async function ajouterContenus({ request, env, params, auth, exec }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 40_000);
  const urls = cleanUrls(body.urls, 100);
  if (urls.length === 0) throw new HttpError(400, 'aucun-lien');
  const origine = body.origine === 'recherche-inversee' ? 'recherche-inversee' : 'manuel';
  if (origine === 'recherche-inversee' && !d.consentement_recherche_le) throw new HttpError(409, 'consentement-recherche-manquant');
  const existants = new Set(
    (await env.DB.prepare('SELECT url FROM contenus WHERE dossier_id = ?').bind(d.id).all<{ url: string }>()).results.map((r) => r.url),
  );
  const now = nowIso();
  const stmts: D1PreparedStatement[] = [];
  let ajoutes = 0;
  for (const url of urls) {
    if (existants.has(url)) continue;
    const hote = hoteDe(url);
    stmts.push(
      env.DB.prepare(
        'INSERT INTO contenus (id, dossier_id, url, domaine, plateforme, statut, origine, ajoute_le, ajoute_par) VALUES (?,?,?,?,?,?,?,?,?)',
      ).bind(
        newId(),
        d.id,
        url,
        hote,
        plateformeDuLien(url),
        // Les liens issus d'une recherche inversée attendent une validation humaine.
        origine === 'recherche-inversee' ? 'a-valider' : 'a-traiter',
        origine,
        now,
        auth.user.id,
      ),
    );
    ajoutes++;
  }
  if (ajoutes === 0) return json({ ok: true, ajoutes: 0 });
  stmts.push(env.DB.prepare('UPDATE dossiers SET maj_le = ? WHERE id = ?').bind(now, d.id));
  stmts.push(journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'liens-ajoutes', objet: 'dossier', objet_id: d.id, dossier_id: d.id, details: { nombre: ajoutes, origine } }));
  await env.DB.batch(stmts);
  exec.waitUntil(identifierTousLesLiens(env.DB, d.id).catch(() => undefined));
  return json({ ok: true, ajoutes });
}

export async function modifierContenu({ request, env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'contenus', params.id);
  const body = await readJson(request, 6_000);
  const sets: string[] = [];
  const binds: unknown[] = [];
  if ('statut' in body) {
    const s = String(body.statut);
    if (!(STATUTS_CONTENU as readonly string[]).includes(s)) throw new HttpError(400, 'statut-invalide');
    sets.push('statut = ?', 'verif_alerte = NULL');
    binds.push(s);
    if (s === 'retire') {
      sets.push('retire_constate_le = ?');
      binds.push(nowIso());
    }
  }
  if ('ignorer_alerte' in body && bool(body.ignorer_alerte)) sets.push('verif_alerte = NULL');
  if ('note' in body) {
    sets.push('note = ?');
    binds.push(cleanText(body.note, 2000, { multiline: true }));
  }
  if (sets.length === 0) return json({ ok: true });
  await env.DB.batch([
    env.DB.prepare(`UPDATE contenus SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, row.id),
    env.DB.prepare('UPDATE dossiers SET maj_le = ? WHERE id = ?').bind(nowIso(), dossier.id),
    journalStmt(env.DB, {
      utilisateur_id: auth.user.id,
      action: 'lien-modifie',
      objet: 'contenu',
      objet_id: String(row.id),
      dossier_id: dossier.id,
      details: { statut: body.statut ?? null },
    }),
  ]);
  return json({ ok: true });
}

export async function supprimerContenu({ env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'contenus', params.id);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM contenus WHERE id = ?').bind(row.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'lien-supprime', objet: 'contenu', objet_id: String(row.id), dossier_id: dossier.id }),
  ]);
  return json({ ok: true });
}

function stmtIdent(db: D1Database, id: string, ident: Identification): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE contenus SET ident_le = ?, domaine = ?, plateforme = COALESCE(?, plateforme), registrar = ?, registrar_abuse = ?,
         hebergeur = ?, hebergeur_abuse = ?, ips = ?, derriere_cloudflare = ?, ident_json = ? WHERE id = ?`,
    )
    .bind(
      ident.le,
      ident.hote,
      ident.plateforme,
      ident.registrar,
      ident.registrar_abuse,
      ident.hebergeur,
      ident.hebergeur_abuse,
      JSON.stringify(ident.ips),
      ident.derriere_cloudflare ? 1 : 0,
      JSON.stringify(ident),
      id,
    );
}

export async function identifierContenu({ env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'contenus', params.id);
  let ident: Identification;
  try {
    ident = await identifier(String(row.url));
  } catch {
    throw new HttpError(400, 'lien-invalide');
  }
  await env.DB.batch([
    stmtIdent(env.DB, String(row.id), ident),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'lien-identifie', objet: 'contenu', objet_id: String(row.id), dossier_id: dossier.id }),
  ]);
  return json({ ok: true, identification: ident });
}

/** Identifie automatiquement les liens pas encore identifiés d'un dossier (8 au plus par passage). */
export async function identifierTousLesLiens(db: D1Database, dossierId: string): Promise<number> {
  const rows = await db
    .prepare('SELECT id, url, plateforme FROM contenus WHERE dossier_id = ? AND ident_le IS NULL LIMIT 8')
    .bind(dossierId)
    .all<{ id: string; url: string; plateforme: string | null }>();
  let n = 0;
  for (const r of rows.results) {
    try {
      const ident = await identifier(r.url);
      await stmtIdent(db, r.id, ident).run();
      n++;
    } catch {
      /* lien illisible : laissé à l'équipe */
    }
  }
  if (n) await journalStmt(db, { action: 'liens-identifies-auto', objet: 'dossier', objet_id: dossierId, dossier_id: dossierId, details: { nombre: n } }).run();
  return n;
}

// Étapes (démarches) -------------------------------------------------------------

export async function ajouterEtape({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 6_000);
  const type = String(body.type ?? '');
  if (!TYPES_ETAPE.includes(type as never)) throw new HttpError(400, 'type-invalide');
  const statut = body.statut === 'envoye' ? 'envoye' : 'a-faire';
  let contenuId: string | null = null;
  if (body.contenu_id) {
    const c = await env.DB.prepare('SELECT id FROM contenus WHERE id = ? AND dossier_id = ?').bind(String(body.contenu_id), d.id).first<{ id: string }>();
    if (!c) throw new HttpError(400, 'lien-invalide');
    contenuId = c.id;
  }
  const faitLe = statut === 'envoye' ? (isoDateOrNull(body.fait_le) ?? nowIso()) : null;
  const delai = delaiEtape(type);
  const echeance = isoDateOrNull(body.echeance) ?? (delai > 0 ? addDays(faitLe ?? nowIso(), delai) : null);
  const id = newId();
  const stmts: D1PreparedStatement[] = [
    env.DB.prepare(
      'INSERT INTO etapes (id, dossier_id, contenu_id, type, destinataire, statut, fait_le, echeance, note, cree_par, cree_le) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    ).bind(id, d.id, contenuId, type, cleanText(body.destinataire, 200), statut, faitLe, echeance, cleanText(body.note, 2000, { multiline: true }), auth.user.id, nowIso()),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'etape-ajoutee', objet: 'etape', objet_id: id, dossier_id: d.id, details: { type, statut } }),
  ];
  if (contenuId && statut === 'envoye') {
    stmts.push(env.DB.prepare("UPDATE contenus SET statut = 'signale' WHERE id = ? AND statut IN ('a-traiter','reapparu')").bind(contenuId));
  }
  if (d.statut === 'ouvert') stmts.push(env.DB.prepare("UPDATE dossiers SET statut = 'en-cours' WHERE id = ?").bind(d.id));
  stmts.push(stmtEcheance(env.DB, d.id));
  await env.DB.batch(stmts);
  return json({ ok: true, id });
}

export async function modifierEtape({ request, env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'etapes', params.id);
  const body = await readJson(request, 6_000);
  const sets: string[] = [];
  const binds: unknown[] = [];
  if ('statut' in body) {
    const s = String(body.statut);
    if (!(STATUTS_ETAPE as readonly string[]).includes(s)) throw new HttpError(400, 'statut-invalide');
    sets.push('statut = ?');
    binds.push(s);
    if (s === 'envoye' && !row.fait_le) {
      const fait = nowIso();
      sets.push('fait_le = ?');
      binds.push(fait);
      if (!('echeance' in body)) {
        const delai = delaiEtape(String(row.type));
        sets.push('echeance = ?');
        binds.push(delai > 0 ? addDays(fait, delai) : null);
      }
    }
    if (['reponse', 'succes', 'refus'].includes(s)) {
      sets.push('reponse_le = ?');
      binds.push(isoDateOrNull(body.reponse_le) ?? nowIso());
    }
  }
  if ('echeance' in body) {
    sets.push('echeance = ?');
    binds.push(isoDateOrNull(body.echeance));
  }
  if ('note' in body) {
    sets.push('note = ?');
    binds.push(cleanText(body.note, 2000, { multiline: true }));
  }
  if ('destinataire' in body) {
    sets.push('destinataire = ?');
    binds.push(cleanText(body.destinataire, 200));
  }
  if (sets.length === 0) return json({ ok: true });
  await env.DB.batch([
    env.DB.prepare(`UPDATE etapes SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, row.id),
    journalStmt(env.DB, {
      utilisateur_id: auth.user.id,
      action: 'etape-modifiee',
      objet: 'etape',
      objet_id: String(row.id),
      dossier_id: dossier.id,
      details: { type: row.type, statut: body.statut ?? null },
    }),
    stmtEcheance(env.DB, dossier.id),
  ]);
  return json({ ok: true });
}

export async function supprimerEtape({ env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'etapes', params.id);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM etapes WHERE id = ?').bind(row.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'etape-supprimee', objet: 'etape', objet_id: String(row.id), dossier_id: dossier.id, details: { type: row.type } }),
    stmtEcheance(env.DB, dossier.id),
  ]);
  return json({ ok: true });
}

// Courriers ------------------------------------------------------------------------

export async function listeModeles(): Promise<Response> {
  return json({ ok: true, modeles: resumeModeles() });
}

export async function creerCourrier({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 10_000);
  const modele = trouverModele(String(body.modele ?? ''), String(body.langue ?? ''));
  if (!modele) throw new HttpError(400, 'modele-introuvable');
  let urls: string[] = [];
  let contenuId: string | null = null;
  let destinataire = cleanText(body.destinataire, 200);
  let destinataireEmail = cleanEmail(body.destinataire_email, false);
  if (body.contenu_id) {
    const c = await env.DB.prepare('SELECT * FROM contenus WHERE id = ? AND dossier_id = ?')
      .bind(String(body.contenu_id), d.id)
      .first<Record<string, unknown>>();
    if (!c) throw new HttpError(400, 'lien-invalide');
    contenuId = String(c.id);
    urls = [String(c.url)];
    if (modele.destinataire_type === 'registrar') {
      destinataire ??= (c.registrar as string) ?? null;
      destinataireEmail ??= (c.registrar_abuse as string) ?? null;
    }
    if (modele.destinataire_type === 'hebergeur') {
      destinataire ??= (c.hebergeur as string) ?? null;
      destinataireEmail ??= (c.hebergeur_abuse as string) ?? null;
    }
  } else {
    const rows = await env.DB.prepare(
      "SELECT url FROM contenus WHERE dossier_id = ? AND statut NOT IN ('retire','a-valider','refuse') ORDER BY ajoute_le",
    )
      .bind(d.id)
      .all<{ url: string }>();
    urls = rows.results.map((r) => r.url);
  }
  let dateInitiale: string | null = null;
  if (modele.id === 'relance') {
    const prev = await env.DB.prepare(
      "SELECT envoye_le FROM courriers WHERE dossier_id = ? AND statut = 'envoye' ORDER BY envoye_le ASC LIMIT 1",
    )
      .bind(d.id)
      .first<{ envoye_le: string }>();
    dateInitiale = isoDateOrNull(body.date_demande_initiale) ?? prev?.envoye_le ?? null;
  }
  const { objet, corps } = genererCourrier({
    modele,
    dossier: d,
    urls,
    representant: auth.user.nom,
    destinataire,
    description_contenu: cleanText(body.description_contenu, 500, { multiline: true }),
    date_demande_initiale: dateInitiale,
    oeuvre: cleanText(body.oeuvre, 500, { multiline: true }),
    date_publication: cleanText(body.date_publication, 60),
  });
  const id = newId();
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO courriers (id, dossier_id, contenu_id, modele, langue, destinataire, destinataire_email, objet, corps, statut, cree_par, cree_le, maj_le) VALUES (?,?,?,?,?,?,?,?,?,'brouillon',?,?,?)",
    ).bind(id, d.id, contenuId, modele.id, modele.langue, destinataire, destinataireEmail, objet, corps, auth.user.id, now, now),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'courrier-prepare', objet: 'courrier', objet_id: id, dossier_id: d.id, details: { modele: modele.id, langue: modele.langue } }),
  ]);
  return json({ ok: true, id });
}

export async function modifierCourrier({ request, env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'courriers', params.id);
  if (row.statut !== 'brouillon') throw new HttpError(409, 'courrier-non-modifiable');
  const body = await readJson(request, 40_000);
  const objet = cleanText(body.objet, 300, { required: true })!;
  const corps = cleanText(body.corps, 20_000, { multiline: true, required: true })!;
  await env.DB.batch([
    env.DB.prepare('UPDATE courriers SET objet = ?, corps = ?, destinataire = ?, destinataire_email = ?, maj_le = ? WHERE id = ?').bind(
      objet,
      corps,
      cleanText(body.destinataire, 200),
      cleanEmail(body.destinataire_email, false),
      nowIso(),
      row.id,
    ),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'courrier-modifie', objet: 'courrier', objet_id: String(row.id), dossier_id: dossier.id }),
  ]);
  return json({ ok: true });
}

export async function validerCourrier({ request, env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'courriers', params.id);
  if (row.statut !== 'brouillon') throw new HttpError(409, 'courrier-non-brouillon');
  if (contientMarqueur(String(row.objet)) || contientMarqueur(String(row.corps))) throw new HttpError(422, 'courrier-incomplet');
  const mandat = String(row.modele) === 'mandat';
  if (!mandat && !dossier.mandat_signe_le) {
    // On n'écrit jamais au nom de quelqu'un sans son mandat signé, noté au dossier.
    throw new HttpError(422, 'mandat-manquant');
  }
  // Le modèle est choisi et le texte approuvé par la personne elle-même :
  // Devuelta fait de l'assistance technique et administrative, pas du conseil juridique.
  const body = await readJson(request, 1_000).catch(() => ({}) as Record<string, unknown>);
  if (!mandat && body.approuve_client !== true) throw new HttpError(422, 'approbation-client-manquante');
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare("UPDATE courriers SET statut = 'valide', valide_par = ?, valide_le = ?, maj_le = ? WHERE id = ?").bind(auth.user.id, now, now, row.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'courrier-valide', objet: 'courrier', objet_id: String(row.id), dossier_id: dossier.id, details: { modele: row.modele, approuve_client: !mandat } }),
  ]);
  return json({ ok: true });
}

export async function marquerEnvoye({ request, env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'courriers', params.id);
  if (row.statut !== 'valide') throw new HttpError(409, 'courrier-non-valide');
  const body = await readJson(request, 2_000);
  const envoyeLe = isoDateOrNull(body.envoye_le) ?? nowIso();
  if (envoyeLe > addDays(nowIso(), 1)) throw new HttpError(400, 'date-invalide');
  const typeEtape = ETAPE_DU_MODELE[String(row.modele)] ?? null;
  const modele = trouverModele(String(row.modele), String(row.langue));
  const delai = modele?.delai_reponse_jours ?? (typeEtape ? delaiEtape(typeEtape) : 0);
  const stmts: D1PreparedStatement[] = [
    env.DB.prepare("UPDATE courriers SET statut = 'envoye', envoye_par = ?, envoye_le = ?, maj_le = ? WHERE id = ?").bind(auth.user.id, envoyeLe, nowIso(), row.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'courrier-envoye', objet: 'courrier', objet_id: String(row.id), dossier_id: dossier.id, details: { modele: row.modele } }),
  ];
  if (typeEtape) {
    stmts.push(
      env.DB.prepare(
        "INSERT INTO etapes (id, dossier_id, contenu_id, type, destinataire, statut, fait_le, echeance, courrier_id, cree_par, cree_le) VALUES (?,?,?,?,?,'envoye',?,?,?,?,?)",
      ).bind(newId(), dossier.id, row.contenu_id ?? null, typeEtape, row.destinataire ?? null, envoyeLe, delai > 0 ? addDays(envoyeLe, delai) : null, row.id, auth.user.id, nowIso()),
    );
    if (row.contenu_id) {
      stmts.push(env.DB.prepare("UPDATE contenus SET statut = 'signale' WHERE id = ? AND statut IN ('a-traiter','reapparu')").bind(row.contenu_id));
    }
  }
  if (dossier.statut === 'ouvert') stmts.push(env.DB.prepare("UPDATE dossiers SET statut = 'en-cours' WHERE id = ?").bind(dossier.id));
  stmts.push(stmtEcheance(env.DB, dossier.id));
  await env.DB.batch(stmts);
  return json({ ok: true });
}

export async function annulerCourrier({ env, params, auth }: Ctx): Promise<Response> {
  const { row, dossier } = await objetVisible(env.DB, auth.user, 'courriers', params.id);
  if (!['brouillon', 'valide'].includes(String(row.statut))) throw new HttpError(409, 'courrier-non-annulable');
  await env.DB.batch([
    env.DB.prepare("UPDATE courriers SET statut = 'annule', maj_le = ? WHERE id = ?").bind(nowIso(), row.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'courrier-annule', objet: 'courrier', objet_id: String(row.id), dossier_id: dossier.id }),
  ]);
  return json({ ok: true });
}
