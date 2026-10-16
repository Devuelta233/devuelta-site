// Accès base de données (Cloudflare D1) : paramètres, références, journal.

import type { Lang } from '../shared/vocab';
import { nowIso } from './util';

export async function getParam(db: D1Database, cle: string, fallback: string): Promise<string> {
  const r = await db.prepare('SELECT valeur FROM parametres WHERE cle = ?').bind(cle).first<{ valeur: string }>();
  return r?.valeur ?? fallback;
}

export async function getParamInt(db: D1Database, cle: string, fallback: number): Promise<number> {
  const v = Number(await getParam(db, cle, String(fallback)));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export async function setParam(db: D1Database, cle: string, valeur: string): Promise<void> {
  await db
    .prepare('INSERT INTO parametres (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur')
    .bind(cle, valeur)
    .run();
}

/** Référence lisible et unique : D-2026-0007 (demande), DV-2026-0012 (dossier), R-2026-0001 (rétractation). */
export async function nextRef(db: D1Database, prefix: 'D' | 'DV' | 'R'): Promise<string> {
  const year = new Date().getUTCFullYear();
  const nom = `${prefix}-${year}`;
  const r = await db
    .prepare(
      'INSERT INTO compteurs (nom, valeur) VALUES (?, 1) ON CONFLICT(nom) DO UPDATE SET valeur = valeur + 1 RETURNING valeur',
    )
    .bind(nom)
    .first<{ valeur: number }>();
  const n = r?.valeur ?? 1;
  return `${nom}-${String(n).padStart(4, '0')}`;
}

export interface JournalEntry {
  utilisateur_id?: string | null;
  action: string;
  objet?: string | null;
  objet_id?: string | null;
  dossier_id?: string | null;
  details?: unknown;
}

export function journalStmt(db: D1Database, e: JournalEntry): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO journal (le, utilisateur_id, action, objet, objet_id, dossier_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      nowIso(),
      e.utilisateur_id ?? null,
      e.action,
      e.objet ?? null,
      e.objet_id ?? null,
      e.dossier_id ?? null,
      e.details === undefined ? null : JSON.stringify(e.details),
    );
}

export async function journal(db: D1Database, e: JournalEntry): Promise<void> {
  await journalStmt(db, e).run();
}

/**
 * Attribution automatique par langue : règle explicite si l'administrateur en
 * a fixé une, sinon le premier membre actif qui parle cette langue.
 */
export async function assigneePourLangue(db: D1Database, langue: Lang): Promise<string | null> {
  try {
    const regles = JSON.parse(await getParam(db, 'attribution', '{}')) as Partial<Record<Lang, string>>;
    const id = regles[langue];
    if (id) {
      const u = await db.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(id).first<{ id: string }>();
      if (u) return u.id;
    }
  } catch {
    /* règle illisible : on retombe sur la règle par défaut */
  }
  const u = await db
    .prepare('SELECT id FROM utilisateurs WHERE langue = ? AND actif = 1 ORDER BY cree_le LIMIT 1')
    .bind(langue)
    .first<{ id: string }>();
  return u?.id ?? null;
}
