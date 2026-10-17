// Outil : répondre sur Telegram (demande ou dossier) et état du robot.
// Chaque réponse est écrite et envoyée par une personne de l'équipe.

import { newId } from '../crypto';
import { journalStmt } from '../db';
import { brancherWebhook, etatRobot, repondreSurTelegram } from '../telegram';
import { HttpError, cleanText, json, nowIso, readJson } from '../util';
import { dossierVisible } from './access';
import { marquerLus } from './conversations';
import { charger } from './demandes';
import type { Ctx } from './router';

const DATE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

async function envoyer(ctx: Ctx, demandeId: string, chatId: string, dossierId: string | null): Promise<Response> {
  const body = await readJson(ctx.request, 20_000);
  const texte = cleanText(body.texte, 4000, { required: true, multiline: true })!;
  // Dernier message affiché au moment de répondre : ceux-là sont lus, pas ceux arrivés pendant qu'on écrivait.
  const vu = typeof body.vu_jusqua === 'string' && DATE_ISO.test(body.vu_jusqua) ? body.vu_jusqua : null;
  await repondreSurTelegram(ctx.env, chatId, texte);
  const now = nowIso();
  await ctx.env.DB.batch([
    ctx.env.DB.prepare("INSERT INTO messages (id, demande_id, canal, sens, texte, le, auteur) VALUES (?, ?, 'telegram', 'sortant', ?, ?, ?)").bind(
      newId(),
      demandeId,
      texte,
      now,
      ctx.auth.user.id,
    ),
    // Le journal garde la trace de l'envoi, jamais son contenu.
    journalStmt(ctx.env.DB, {
      utilisateur_id: ctx.auth.user.id,
      action: 'telegram-envoye',
      objet: dossierId ? 'dossier' : 'demande',
      objet_id: dossierId ?? demandeId,
      dossier_id: dossierId,
    }),
  ]);
  if (vu) await marquerLus(ctx.env.DB, demandeId, vu);
  return json({ ok: true });
}

export async function repondreDemande(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  if (r.contact_mode !== 'telegram') throw new HttpError(400, 'contact-pas-telegram');
  // Devenue dossier, la conversation se suit dans le dossier (et seulement par ceux qui le voient).
  if (r.dossier_id) throw new HttpError(409, 'telegram-voir-dossier');
  return envoyer(ctx, String(r.id), String(r.contact_valeur), null);
}

export async function repondreDossier(ctx: Ctx): Promise<Response> {
  const d = await dossierVisible(ctx.env.DB, ctx.auth.user, ctx.params.id);
  if (!d.client_telegram || !d.demande_id) throw new HttpError(400, 'contact-pas-telegram');
  return envoyer(ctx, String(d.demande_id), String(d.client_telegram), d.id);
}

/** État du robot pour l'administrateur : nom, branchement, dernière erreur. */
export async function etat({ env }: Ctx): Promise<Response> {
  try {
    return json({ ok: true, ...(await etatRobot(env)) });
  } catch {
    return json({ ok: true, actif: true, injoignable: true });
  }
}

/** Rebranche le robot (si la mise en ligne n'a pas pu le faire). */
export async function brancher({ env, auth }: Ctx): Promise<Response> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new HttpError(503, 'telegram-inactif');
  try {
    await brancherWebhook(env);
  } catch {
    throw new HttpError(503, 'telegram-indisponible');
  }
  await env.DB.batch([journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'telegram-branche', objet: 'systeme' })]);
  return json({ ok: true, ...(await etatRobot(env)) });
}
