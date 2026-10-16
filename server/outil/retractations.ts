// Rétractations reçues par « Renoncer au contrat ici » : l'équipe les voit sur
// le tableau de bord, copie l'accusé de réception prêt à envoyer, puis le marque
// comme envoyé. L'accusé doit partir sans délai (au plus tard le jour ouvré suivant).

import { journalStmt } from '../db';
import { HttpError, json, nowIso } from '../util';
import type { UserRow } from './auth';
import type { Ctx } from './router';

const COLONNES = `r.id, r.ref, r.recue_le, r.langue, r.nom, r.dossier_ref, r.dossier_id, r.contact_mode,
  r.contact_valeur, r.message, r.accuse_le, d.ref AS dossier_trouve`;

/** Visibles : tout pour un admin ; sinon celles de ses dossiers, ou sans dossier dans sa langue. */
function filtre(user: UserRow): { sql: string; binds: unknown[] } {
  if (user.role === 'admin') return { sql: '1 = 1', binds: [] };
  return {
    sql: '((d.id IS NOT NULL AND (d.assigne_a = ? OR d.cree_par = ?)) OR (r.dossier_id IS NULL AND r.langue = ?))',
    binds: [user.id, user.id, user.langue],
  };
}

export async function enAttente(db: D1Database, user: UserRow) {
  const f = filtre(user);
  const rows = await db
    .prepare(
      `SELECT ${COLONNES} FROM retractations r LEFT JOIN dossiers d ON d.id = r.dossier_id
        WHERE r.accuse_le IS NULL AND ${f.sql} ORDER BY r.recue_le ASC LIMIT 20`,
    )
    .bind(...f.binds)
    .all();
  return rows.results;
}

export async function pourDossier(db: D1Database, dossierId: string) {
  const rows = await db
    .prepare('SELECT ref, recue_le, accuse_le FROM retractations WHERE dossier_id = ? ORDER BY recue_le')
    .bind(dossierId)
    .all();
  return rows.results;
}

export async function accuser({ env, params, auth }: Ctx): Promise<Response> {
  const f = filtre(auth.user);
  const r = await env.DB.prepare(
    `SELECT r.id, r.ref, r.dossier_id, r.accuse_le FROM retractations r LEFT JOIN dossiers d ON d.id = r.dossier_id
      WHERE r.id = ? AND ${f.sql}`,
  )
    .bind(params.id, ...f.binds)
    .first<{ id: string; ref: string; dossier_id: string | null; accuse_le: string | null }>();
  if (!r) throw new HttpError(404, 'introuvable');
  if (r.accuse_le) return json({ ok: true, accuse_le: r.accuse_le });
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare('UPDATE retractations SET accuse_le = ?, accuse_par = ? WHERE id = ?').bind(now, auth.user.id, r.id),
    journalStmt(env.DB, {
      utilisateur_id: auth.user.id,
      action: 'retractation-accusee',
      objet: 'retractation',
      objet_id: r.id,
      dossier_id: r.dossier_id,
      details: { ref: r.ref },
    }),
  ]);
  return json({ ok: true, accuse_le: now });
}
