// Outil : le fil Telegram d'une demande ou d'un dossier, et la réponse de l'équipe.
// Rien ne part sans une personne : elle écrit le texte et appuie sur « Envoyer ».
// Mêmes droits que le reste de l'outil (demande ou dossier visible).

import { newId } from '../crypto';
import { journalStmt } from '../db';
import { LONGUEUR_MAX, envoyerMessage, robotActif } from '../telegram';
import { HttpError, cleanText, json, nowIso, readJson } from '../util';
import { dossierVisible } from './access';
import { charger } from './demandes';
import type { Ctx } from './router';

interface DemandeTelegram {
  id: string;
  ref: string;
  dossier_id: string | null;
  telegram_chat_id: string;
}

/** La demande venue de Telegram rattachée à un dossier (la plus récente), ou null. */
async function demandeDuDossier(db: D1Database, dossierId: string): Promise<DemandeTelegram | null> {
  return db
    .prepare('SELECT id, ref, dossier_id, telegram_chat_id FROM demandes WHERE dossier_id = ? AND telegram_chat_id IS NOT NULL ORDER BY recue_le DESC LIMIT 1')
    .bind(dossierId)
    .first<DemandeTelegram>();
}

/** Pour l'écran du dossier : y a-t-il une conversation Telegram, et combien de messages à lire ? */
export async function pourDossier(db: D1Database, dossierId: string): Promise<{ non_lus: number } | null> {
  const d = await demandeDuDossier(db, dossierId);
  if (!d) return null;
  const n = await db
    .prepare("SELECT COUNT(*) AS n FROM telegram_messages WHERE demande_id = ? AND sens = 'client' AND lu_le IS NULL")
    .bind(d.id)
    .first<{ n: number }>();
  return { non_lus: n?.n ?? 0 };
}

/** Le fil, du plus ancien au plus récent ; les messages du client sont marqués comme lus. */
async function fil(ctx: Ctx, d: DemandeTelegram): Promise<Response> {
  const messages = await ctx.env.DB.prepare(
    `SELECT m.id, m.sens, m.texte, m.le, u.nom AS auteur_nom FROM telegram_messages m
       LEFT JOIN utilisateurs u ON u.id = m.auteur WHERE m.demande_id = ? ORDER BY m.le ASC LIMIT 500`,
  )
    .bind(d.id)
    .all();
  await ctx.env.DB.prepare("UPDATE telegram_messages SET lu_le = ? WHERE demande_id = ? AND sens = 'client' AND lu_le IS NULL").bind(nowIso(), d.id).run();
  return json({ ok: true, actif: robotActif(ctx.env), messages: messages.results });
}

/** Envoie le texte écrit par la personne connectée, puis le garde dans le fil. */
async function repondre(ctx: Ctx, d: DemandeTelegram): Promise<Response> {
  const body = await readJson(ctx.request, 20_000);
  const texte = cleanText(body.texte, LONGUEUR_MAX, { required: true, multiline: true })!;
  if (!robotActif(ctx.env)) throw new HttpError(503, 'telegram-inactif');
  const r = await envoyerMessage(ctx.env, d.telegram_chat_id, texte);
  const base = { utilisateur_id: ctx.auth.user.id, objet: 'demande', objet_id: d.id, dossier_id: d.dossier_id };
  if (!r.ok) {
    await journalStmt(ctx.env.DB, { ...base, action: 'telegram-echec', details: { http: r.status } }).run();
    // 403 : la personne a bloqué le robot ou supprimé la conversation.
    throw new HttpError(r.status === 403 ? 409 : 502, r.status === 403 ? 'telegram-bloque' : 'telegram-indisponible');
  }
  const now = nowIso();
  await ctx.env.DB.batch([
    ctx.env.DB.prepare("INSERT INTO telegram_messages (id, demande_id, sens, texte, auteur, le) VALUES (?, ?, 'equipe', ?, ?, ?)").bind(
      newId(),
      d.id,
      texte,
      ctx.auth.user.id,
      now,
    ),
    ctx.env.DB.prepare("UPDATE telegram_messages SET lu_le = ? WHERE demande_id = ? AND sens = 'client' AND lu_le IS NULL").bind(now, d.id),
    ...(d.dossier_id ? [ctx.env.DB.prepare('UPDATE dossiers SET maj_le = ? WHERE id = ?').bind(now, d.dossier_id)] : []),
    // On journalise l'envoi, jamais le contenu.
    journalStmt(ctx.env.DB, { ...base, action: 'telegram-reponse' }),
  ]);
  return json({ ok: true });
}

async function demandeTelegram(ctx: Ctx): Promise<DemandeTelegram> {
  const r = await charger(ctx);
  if (!r.telegram_chat_id) throw new HttpError(404, 'introuvable');
  return { id: String(r.id), ref: String(r.ref), dossier_id: (r.dossier_id as string | null) ?? null, telegram_chat_id: String(r.telegram_chat_id) };
}

async function dossierTelegram(ctx: Ctx): Promise<DemandeTelegram> {
  const dossier = await dossierVisible(ctx.env.DB, ctx.auth.user, ctx.params.id);
  const d = await demandeDuDossier(ctx.env.DB, dossier.id);
  if (!d) throw new HttpError(404, 'introuvable');
  return d;
}

export const filDemande = async (ctx: Ctx) => fil(ctx, await demandeTelegram(ctx));
export const repondreDemande = async (ctx: Ctx) => repondre(ctx, await demandeTelegram(ctx));
export const filDossier = async (ctx: Ctx) => fil(ctx, await dossierTelegram(ctx));
export const repondreDossier = async (ctx: Ctx) => repondre(ctx, await dossierTelegram(ctx));
