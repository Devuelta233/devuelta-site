// Qui voit quoi : l'administrateur voit tout ; un membre voit les dossiers
// qui lui sont attribués (ou qu'il a créés) et les demandes de sa langue.

import { HttpError } from '../util';
import type { UserRow } from './auth';

export interface DossierAcces {
  id: string;
  assigne_a: string | null;
  cree_par: string | null;
}

export type DossierRow = Record<string, unknown> & DossierAcces;

export function peutVoirDossier(user: UserRow, d: DossierAcces): boolean {
  if (user.role === 'admin') return true;
  return d.assigne_a === user.id || d.cree_par === user.id;
}

export async function dossierVisible(db: D1Database, user: UserRow, id: string): Promise<DossierRow> {
  const d = await db.prepare('SELECT * FROM dossiers WHERE id = ?').bind(id).first<DossierRow>();
  if (!d || !peutVoirDossier(user, d)) throw new HttpError(404, 'introuvable');
  return d;
}

/** Filtre SQL des dossiers visibles (alias « d »), à combiner avec AND. */
export function filtreDossiers(user: UserRow): { sql: string; binds: unknown[] } {
  if (user.role === 'admin') return { sql: '1 = 1', binds: [] };
  return { sql: '(d.assigne_a = ? OR d.cree_par = ?)', binds: [user.id, user.id] };
}

/** Filtre SQL des demandes visibles (alias « dm »). */
export function filtreDemandes(user: UserRow): { sql: string; binds: unknown[] } {
  if (user.role === 'admin') return { sql: '1 = 1', binds: [] };
  return { sql: '(dm.assigne_a = ? OR (dm.assigne_a IS NULL AND dm.langue = ?))', binds: [user.id, user.langue] };
}

export interface DemandeAcces {
  assigne_a: string | null;
  langue: string;
}

export function peutVoirDemande(user: UserRow, d: DemandeAcces): boolean {
  if (user.role === 'admin') return true;
  return d.assigne_a === user.id || (d.assigne_a === null && d.langue === user.langue);
}

/** Vérifie que l'objet (lien, étape, courrier) appartient à un dossier visible. */
export async function objetVisible(db: D1Database, user: UserRow, table: 'contenus' | 'etapes' | 'courriers', id: string) {
  const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Record<string, unknown> & { id: string; dossier_id: string }>();
  if (!row) throw new HttpError(404, 'introuvable');
  const dossier = await dossierVisible(db, user, row.dossier_id);
  return { row, dossier };
}
