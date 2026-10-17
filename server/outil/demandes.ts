// Demandes reçues depuis le site public : les qualifier, les transformer en
// dossier, ou les orienter vers un canal officiel.

import { newId } from '../crypto';
import { journalStmt, nextRef } from '../db';
import { HttpError, cleanText, json, nowIso, readJson } from '../util';
import { filtreDemandes, peutVoirDemande } from './access';
import { SQL_NON_LUS, conversationPour } from './conversations';
import { identifierTousLesLiens } from './dossiers';
import { hoteDe, plateformeDuLien } from './identification';
import type { Ctx } from './router';

const STATUTS_MANUELS = ['nouvelle', 'orientee', 'refusee', 'spam'];
const SITUATIONS_PRIORITAIRES = ['contenu-intime', 'deepfake', 'chantage'];

export function parseDemande(r: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...r };
  for (const k of ['plateformes', 'liens']) {
    try {
      out[k] = r[k] ? JSON.parse(String(r[k])) : [];
    } catch {
      out[k] = [];
    }
  }
  delete out.ip_hash;
  return out;
}

export async function liste({ env, url, auth }: Ctx): Promise<Response> {
  const f = filtreDemandes(auth.user);
  const statut = url.searchParams.get('statut');
  const where = [f.sql];
  const binds = [...f.binds];
  if (statut && STATUTS_MANUELS.concat('convertie').includes(statut)) {
    where.push('dm.statut = ?');
    binds.push(statut);
  }
  const rows = await env.DB.prepare(
    `SELECT dm.id, dm.ref, dm.recue_le, dm.langue, dm.pays, dm.situation, dm.pseudo, dm.contact_mode, dm.menace,
            dm.statut, dm.assigne_a, u.nom AS assigne_nom, dm.dossier_id,
            json_array_length(dm.liens) AS nb_liens, ${SQL_NON_LUS} AS non_lus
       FROM demandes dm LEFT JOIN utilisateurs u ON u.id = dm.assigne_a
      WHERE ${where.join(' AND ')}
      ORDER BY (${SQL_NON_LUS} > 0) DESC, CASE dm.statut WHEN 'nouvelle' THEN 0 ELSE 1 END, dm.menace DESC, dm.recue_le DESC
      LIMIT 300`,
  )
    .bind(...binds)
    .all();
  return json({ ok: true, demandes: rows.results });
}

export async function charger(ctx: Ctx) {
  const r = await ctx.env.DB.prepare('SELECT * FROM demandes WHERE id = ?').bind(ctx.params.id).first<Record<string, unknown>>();
  if (!r || !peutVoirDemande(ctx.auth.user, r as { assigne_a: string | null; langue: string })) {
    throw new HttpError(404, 'introuvable');
  }
  return r;
}

export async function detail(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  // Demande venue de Telegram : le fil des messages écrits, pour répondre dans la même conversation.
  // Devenue dossier, la conversation se suit dans le dossier (et seulement par ceux qui le voient).
  const conversation =
    r.contact_mode === 'telegram' && !r.dossier_id
      ? await conversationPour(ctx.env.DB, String(r.id), ctx.auth.user, (r.assigne_a as string | null) ?? null)
      : null;
  return json({ ok: true, demande: parseDemande(r), conversation, telegram_actif: !!ctx.env.TELEGRAM_BOT_TOKEN });
}

export async function changerStatut(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  if (r.statut === 'convertie') throw new HttpError(409, 'deja-convertie');
  const body = await readJson(ctx.request, 4_000);
  const statut = String(body.statut ?? '');
  if (!STATUTS_MANUELS.includes(statut)) throw new HttpError(400, 'statut-invalide');
  const note = cleanText(body.note, 1000, { multiline: true });
  const now = nowIso();
  await ctx.env.DB.batch([
    ctx.env.DB.prepare('UPDATE demandes SET statut = ?, note_traitement = ?, traitee_par = ?, traitee_le = ? WHERE id = ?').bind(
      statut,
      note,
      statut === 'nouvelle' ? null : ctx.auth.user.id,
      statut === 'nouvelle' ? null : now,
      r.id,
    ),
    journalStmt(ctx.env.DB, {
      utilisateur_id: ctx.auth.user.id,
      action: 'demande-statut',
      objet: 'demande',
      objet_id: String(r.id),
      details: { ref: r.ref, statut },
    }),
  ]);
  return json({ ok: true });
}

export async function assigner(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  const body = await readJson(ctx.request, 1_000);
  const cible = body.assigne_a === null ? null : String(body.assigne_a ?? '');
  if (cible) {
    const u = await ctx.env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(cible).first();
    if (!u) throw new HttpError(400, 'utilisateur-invalide');
  }
  await ctx.env.DB.batch([
    ctx.env.DB.prepare('UPDATE demandes SET assigne_a = ? WHERE id = ?').bind(cible, r.id),
    journalStmt(ctx.env.DB, {
      utilisateur_id: ctx.auth.user.id,
      action: 'demande-attribuee',
      objet: 'demande',
      objet_id: String(r.id),
      details: { ref: r.ref, assigne_a: cible },
    }),
  ]);
  return json({ ok: true });
}

export async function convertir(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  if (r.statut === 'convertie' && r.dossier_id) throw new HttpError(409, 'deja-convertie');
  const body = await readJson(ctx.request, 2_000);
  let assigne = (body.assigne_a ? String(body.assigne_a) : (r.assigne_a as string | null)) ?? ctx.auth.user.id;
  const u = await ctx.env.DB.prepare('SELECT id FROM utilisateurs WHERE id = ? AND actif = 1').bind(assigne).first();
  if (!u) assigne = ctx.auth.user.id;

  const id = newId();
  const ref = await nextRef(ctx.env.DB, 'DV');
  const now = nowIso();
  const prioritaire = r.menace === 1 || SITUATIONS_PRIORITAIRES.includes(String(r.situation));
  let liens: string[] = [];
  try {
    liens = JSON.parse(String(r.liens ?? '[]'));
  } catch {
    liens = [];
  }

  const stmts = [
    ctx.env.DB.prepare(
      `INSERT INTO dossiers (id, ref, cree_le, maj_le, cree_par, statut, priorite, menace, langue, pays, situation,
         assigne_a, client_pseudo, client_email, client_whatsapp, client_telegram, contact_prefere, publie_par_soi, resume, demande_id)
       VALUES (?,?,?,?,?,'ouvert',?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      ref,
      now,
      now,
      ctx.auth.user.id,
      prioritaire ? 'prioritaire' : 'normal',
      r.menace ? 1 : 0,
      r.langue,
      r.pays ?? null,
      r.situation,
      assigne,
      r.pseudo,
      r.contact_mode === 'email' ? r.contact_valeur : null,
      r.contact_mode === 'whatsapp' ? r.contact_valeur : null,
      r.contact_mode === 'telegram' ? r.contact_valeur : null,
      r.contact_mode,
      r.publie_par_soi ?? null,
      r.message ?? null,
      r.id,
    ),
    ctx.env.DB.prepare(
      "UPDATE demandes SET statut = 'convertie', dossier_id = ?, traitee_par = ?, traitee_le = ?, assigne_a = ? WHERE id = ?",
    ).bind(id, ctx.auth.user.id, now, assigne, r.id),
  ];
  for (const lien of liens) {
    const hote = hoteDe(lien);
    stmts.push(
      ctx.env.DB.prepare(
        "INSERT INTO contenus (id, dossier_id, url, domaine, plateforme, statut, origine, ajoute_le, ajoute_par) VALUES (?,?,?,?,?,'a-traiter','demande',?,?)",
      ).bind(newId(), id, lien, hote, plateformeDuLien(lien), now, ctx.auth.user.id),
    );
  }
  stmts.push(
    journalStmt(ctx.env.DB, {
      utilisateur_id: ctx.auth.user.id,
      action: 'dossier-cree',
      objet: 'dossier',
      objet_id: id,
      dossier_id: id,
      details: { ref, depuis: r.ref },
    }),
  );
  await ctx.env.DB.batch(stmts);
  // Identification automatique de chaque lien (registrar, hébergeur), en arrière-plan.
  ctx.exec.waitUntil(identifierTousLesLiens(ctx.env.DB, id).catch(() => undefined));
  return json({ ok: true, id, ref });
}
