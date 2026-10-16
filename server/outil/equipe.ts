// Équipe, historique de connexion, réglages, purge manuelle et export.

import { LANGS, ROLES, isLang } from '../../shared/vocab';
import { hashPassword, newId, temporaryPassword } from '../crypto';
import { getParam, journalStmt, setParam } from '../db';
import { HttpError, cleanEmail, cleanText, json, nowIso, readJson } from '../util';
import { iterations } from './auth';
import type { Ctx } from './router';
import { elementsAPurger, purgerElements } from '../taches';

export async function liste({ env, auth }: Ctx): Promise<Response> {
  if (auth.user.role === 'admin') {
    const rows = await env.DB.prepare(
      `SELECT id, email, nom, langue, role, actif, totp_actif, mdp_a_changer, nda_version, nda_accepte_le,
              cree_le, derniere_connexion, bloque_jusqua,
              (SELECT COUNT(*) FROM push_abonnements p WHERE p.utilisateur_id = utilisateurs.id) AS nb_appareils
         FROM utilisateurs ORDER BY actif DESC, cree_le`,
    ).all();
    return json({ ok: true, equipe: rows.results });
  }
  // Un membre ne voit que les noms (pour savoir à qui un dossier est attribué).
  const rows = await env.DB.prepare('SELECT id, nom, langue, role FROM utilisateurs WHERE actif = 1 ORDER BY nom').all();
  return json({ ok: true, equipe: rows.results });
}

export async function creer({ request, env, auth }: Ctx): Promise<Response> {
  const body = await readJson(request, 4_000);
  const email = cleanEmail(body.email)!;
  const nom = cleanText(body.nom, 80, { required: true })!;
  const langue = isLang(body.langue) ? body.langue : 'fr';
  const role = (ROLES as readonly string[]).includes(String(body.role)) ? String(body.role) : 'membre';
  const exists = await env.DB.prepare('SELECT 1 FROM utilisateurs WHERE email = ?').bind(email).first();
  if (exists) throw new HttpError(409, 'email-deja-utilise');
  const provisoire = temporaryPassword();
  const id = newId();
  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO utilisateurs (id, email, nom, langue, role, mdp_hash, mdp_a_changer, cree_le) VALUES (?,?,?,?,?,?,1,?)',
    ).bind(id, email, nom, langue, role, await hashPassword(provisoire, iterations(env)), nowIso()),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'compte-cree', objet: 'utilisateur', objet_id: id, details: { email, role } }),
  ]);
  // Le mot de passe provisoire n'est montré qu'une fois et n'est stocké nulle part en clair.
  return json({ ok: true, id, mot_de_passe_provisoire: provisoire });
}

export async function modifier({ request, env, params, auth }: Ctx): Promise<Response> {
  const cible = await env.DB.prepare('SELECT id, role, actif FROM utilisateurs WHERE id = ?').bind(params.id).first<{ id: string; role: string; actif: number }>();
  if (!cible) throw new HttpError(404, 'introuvable');
  const body = await readJson(request, 4_000);
  const sets: string[] = [];
  const binds: unknown[] = [];
  const details: Record<string, unknown> = {};
  if ('nom' in body) {
    sets.push('nom = ?');
    binds.push(cleanText(body.nom, 80, { required: true }));
    details.nom = true;
  }
  if ('langue' in body) {
    if (!isLang(body.langue)) throw new HttpError(400, 'langue-invalide');
    sets.push('langue = ?');
    binds.push(body.langue);
    details.langue = body.langue;
  }
  if ('role' in body) {
    if (!(ROLES as readonly string[]).includes(String(body.role))) throw new HttpError(400, 'role-invalide');
    if (cible.id === auth.user.id && body.role !== 'admin') throw new HttpError(409, 'auto-retrogradation');
    sets.push('role = ?');
    binds.push(body.role);
    details.role = body.role;
  }
  if ('actif' in body) {
    const actif = body.actif ? 1 : 0;
    if (cible.id === auth.user.id && !actif) throw new HttpError(409, 'auto-desactivation');
    sets.push('actif = ?');
    binds.push(actif);
    details.actif = actif;
  }
  if (sets.length === 0) return json({ ok: true });
  const stmts = [
    env.DB.prepare(`UPDATE utilisateurs SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, cible.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'compte-modifie', objet: 'utilisateur', objet_id: cible.id, details }),
  ];
  if ('actif' in body && !body.actif) {
    stmts.push(env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ?').bind(cible.id));
    stmts.push(env.DB.prepare('DELETE FROM push_abonnements WHERE utilisateur_id = ?').bind(cible.id));
  }
  await env.DB.batch(stmts);
  return json({ ok: true });
}

export async function reinitialiserMdp({ env, params, auth }: Ctx): Promise<Response> {
  const cible = await env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ?').bind(params.id).first<{ id: string }>();
  if (!cible) throw new HttpError(404, 'introuvable');
  const provisoire = temporaryPassword();
  await env.DB.batch([
    env.DB.prepare('UPDATE utilisateurs SET mdp_hash = ?, mdp_a_changer = 1, echecs = 0, bloque_jusqua = NULL WHERE id = ?').bind(
      await hashPassword(provisoire, iterations(env)),
      cible.id,
    ),
    env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ?').bind(cible.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'mdp-reinitialise', objet: 'utilisateur', objet_id: cible.id }),
  ]);
  return json({ ok: true, mot_de_passe_provisoire: provisoire });
}

export async function reinitialiser2fa({ env, params, auth }: Ctx): Promise<Response> {
  const cible = await env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ?').bind(params.id).first<{ id: string }>();
  if (!cible) throw new HttpError(404, 'introuvable');
  await env.DB.batch([
    env.DB.prepare('UPDATE utilisateurs SET totp_secret = NULL, totp_actif = 0, totp_dernier_compteur = 0 WHERE id = ?').bind(cible.id),
    env.DB.prepare('DELETE FROM sessions WHERE utilisateur_id = ?').bind(cible.id),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: '2fa-reinitialisee', objet: 'utilisateur', objet_id: cible.id }),
  ]);
  return json({ ok: true });
}

export async function connexions({ env, url, auth }: Ctx): Promise<Response> {
  const qui = url.searchParams.get('utilisateur');
  const where: string[] = [];
  const binds: unknown[] = [];
  if (auth.user.role !== 'admin') {
    where.push('c.utilisateur_id = ?');
    binds.push(auth.user.id);
  } else if (qui && /^[0-9a-f-]{36}$/.test(qui)) {
    where.push('c.utilisateur_id = ?');
    binds.push(qui);
  }
  const rows = await env.DB.prepare(
    `SELECT c.le, c.resultat, c.ip, c.pays, c.ville, c.reseau, c.agent, c.nouveau_pays, c.email, u.nom
       FROM connexions c LEFT JOIN utilisateurs u ON u.id = c.utilisateur_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY c.le DESC LIMIT 200`,
  )
    .bind(...binds)
    .all();
  return json({ ok: true, connexions: rows.results });
}

export async function lireParametres({ env }: Ctx): Promise<Response> {
  let attribution: unknown = {};
  try {
    attribution = JSON.parse(await getParam(env.DB, 'attribution', '{}'));
  } catch {
    attribution = {};
  }
  return json({
    ok: true,
    parametres: {
      retention_dossier_jours: Number(await getParam(env.DB, 'retention_dossier_jours', '180')),
      retention_demande_jours: Number(await getParam(env.DB, 'retention_demande_jours', '30')),
      attribution,
    },
  });
}

export async function ecrireParametres({ request, env, auth }: Ctx): Promise<Response> {
  const body = await readJson(request, 4_000);
  const rd = Number(body.retention_dossier_jours);
  const rq = Number(body.retention_demande_jours);
  if (!Number.isInteger(rd) || rd < 30 || rd > 1095) throw new HttpError(400, 'retention-invalide');
  if (!Number.isInteger(rq) || rq < 7 || rq > 365) throw new HttpError(400, 'retention-invalide');
  const attribution: Record<string, string> = {};
  const a = (body.attribution ?? {}) as Record<string, unknown>;
  for (const l of LANGS) {
    const v = a[l];
    if (typeof v === 'string' && v) {
      const u = await env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(v).first();
      if (!u) throw new HttpError(400, 'utilisateur-invalide');
      attribution[l] = v;
    }
  }
  await setParam(env.DB, 'retention_dossier_jours', String(rd));
  await setParam(env.DB, 'retention_demande_jours', String(rq));
  await setParam(env.DB, 'attribution', JSON.stringify(attribution));
  await journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'parametres-modifies', objet: 'parametres', details: { rd, rq, attribution } }).run();
  return json({ ok: true });
}

export async function listePurge({ env }: Ctx): Promise<Response> {
  return json({ ok: true, ...(await elementsAPurger(env.DB)) });
}

/** Suppression immédiate, confirmée par un administrateur, des données arrivées à échéance. */
export async function purger({ request, env, auth }: Ctx): Promise<Response> {
  const body = await readJson(request, 40_000);
  const dus = await elementsAPurger(env.DB);
  const dossiersOk = new Set(dus.dossiers.map((d) => d.id));
  const demandesOk = new Set(dus.demandes.map((d) => d.id));
  const ids = Array.isArray(body.dossiers) ? body.dossiers.map(String).filter((i) => dossiersOk.has(i)) : [];
  const dm = Array.isArray(body.demandes) ? body.demandes.map(String).filter((i) => demandesOk.has(i)) : [];
  const n = await purgerElements(env.DB, ids, dm, auth.user.id);
  return json({ ok: true, ...n });
}

/** Sauvegarde complète en JSON (administrateur). Les secrets ne sont jamais exportés. */
export async function exporter({ env, auth }: Ctx): Promise<Response> {
  const tables = ['dossiers', 'contenus', 'etapes', 'courriers', 'notes', 'demandes', 'messages', 'retractations', 'signatures', 'paiements'];
  const out: Record<string, unknown> = { exporte_le: nowIso(), par: auth.user.email, version: 1 };
  for (const t of tables) {
    const rows = await env.DB.prepare(`SELECT * FROM ${t}`).all<Record<string, unknown>>();
    out[t] = rows.results.map((r) => {
      const c = { ...r };
      delete c.ip_hash;
      return c;
    });
  }
  const users = await env.DB.prepare('SELECT id, email, nom, langue, role, actif, cree_le FROM utilisateurs').all();
  out.utilisateurs = users.results;
  await journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'export', objet: 'donnees' }).run();
  return new Response(JSON.stringify(out, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="eraseops-export-${nowIso().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}

