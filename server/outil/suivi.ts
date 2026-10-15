// Suivi : notifications sur téléphone, statistiques du site, santé du système,
// référentiel. Lecture seule, sauf l'abonnement aux notifications.

import { NDA_VERSION } from '../../shared/vocab';
import { journalStmt } from '../db';
import { endpointValide, notifier, vapidPublique } from '../push';
import { compteursPour, liensOfficiels } from '../taches';
import { HttpError, addDays, cleanText, json, nowIso, readJson } from '../util';
import { FICHES, fichesAReverifier } from './plan';
import type { Ctx } from './router';

const TEXTES = {
  fr: { titre: 'EraseOps', rien: 'Rien de nouveau.', demandes: 'demande(s) à traiter', echeances: 'échéance(s) aujourd’hui ou dépassée(s)', courriers: 'courrier(s) à valider', alertes: 'lien(s) à vérifier' },
  es: { titre: 'EraseOps', rien: 'Nada nuevo.', demandes: 'solicitud(es) por atender', echeances: 'plazo(s) para hoy o vencido(s)', courriers: 'carta(s) por validar', alertes: 'enlace(s) por revisar' },
  en: { titre: 'EraseOps', rien: 'Nothing new.', demandes: 'request(s) to handle', echeances: 'deadline(s) due or overdue', courriers: 'letter(s) to validate', alertes: 'link(s) to check' },
};

/** Texte neutre affiché par le téléphone : aucun nom, aucun détail de dossier. */
export async function resumeNotification({ env, auth }: Ctx): Promise<Response> {
  const c = await compteursPour(env.DB, auth.user);
  const t = TEXTES[auth.user.langue] ?? TEXTES.fr;
  const parts: string[] = [];
  if (c.demandes) parts.push(`${c.demandes} ${t.demandes}`);
  if (c.echeances) parts.push(`${c.echeances} ${t.echeances}`);
  if (c.courriers) parts.push(`${c.courriers} ${t.courriers}`);
  if (c.alertes) parts.push(`${c.alertes} ${t.alertes}`);
  return json({ ok: true, titre: t.titre, texte: parts.length ? parts.join(' · ') : t.rien, compteurs: c });
}

export async function cleVapid({ env }: Ctx): Promise<Response> {
  return json({ ok: true, cle: await vapidPublique(env.DB) });
}

export async function abonner({ request, env, auth }: Ctx): Promise<Response> {
  const body = await readJson(request, 4_000);
  const endpoint = String(body.endpoint ?? '');
  if (!endpointValide(endpoint)) throw new HttpError(400, 'abonnement-invalide');
  const appareil = cleanText(body.appareil, 80);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO push_abonnements (endpoint, utilisateur_id, appareil, cree_le) VALUES (?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET utilisateur_id = excluded.utilisateur_id, appareil = excluded.appareil, echecs = 0`,
    ).bind(endpoint, auth.user.id, appareil, nowIso()),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'notifications-activees', objet: 'utilisateur', objet_id: auth.user.id, details: { appareil } }),
  ]);
  return json({ ok: true });
}

export async function desabonner({ request, env, auth }: Ctx): Promise<Response> {
  const body = await readJson(request, 4_000);
  await env.DB.prepare('DELETE FROM push_abonnements WHERE endpoint = ? AND utilisateur_id = ?').bind(String(body.endpoint ?? ''), auth.user.id).run();
  return json({ ok: true });
}

export async function testerNotification({ env, auth }: Ctx): Promise<Response> {
  const n = await notifier(env.DB, [auth.user.id]);
  return json({ ok: true, envoyes: n });
}

export async function statistiques({ env, url }: Ctx): Promise<Response> {
  const jours = Math.min(365, Math.max(7, Number(url.searchParams.get('jours')) || 30));
  const depuis = addDays(nowIso(), -jours).slice(0, 10);
  const [total, parJour, parSource, parPays, parPage, evenements, demandes, dossiers] = await Promise.all([
    env.DB.prepare('SELECT COALESCE(SUM(n),0) AS n FROM stats_vues WHERE jour >= ?').bind(depuis).first<{ n: number }>(),
    env.DB.prepare('SELECT jour, SUM(n) AS n FROM stats_vues WHERE jour >= ? GROUP BY jour ORDER BY jour').bind(depuis).all(),
    env.DB.prepare("SELECT source, SUM(n) AS n FROM stats_vues WHERE jour >= ? AND source <> 'interne' GROUP BY source ORDER BY n DESC LIMIT 15").bind(depuis).all(),
    env.DB.prepare('SELECT pays, SUM(n) AS n FROM stats_vues WHERE jour >= ? GROUP BY pays ORDER BY n DESC LIMIT 15').bind(depuis).all(),
    env.DB.prepare('SELECT chemin, SUM(n) AS n FROM stats_vues WHERE jour >= ? GROUP BY chemin ORDER BY n DESC LIMIT 25').bind(depuis).all(),
    env.DB.prepare('SELECT evenement, SUM(n) AS n FROM stats_evenements WHERE jour >= ? GROUP BY evenement').bind(depuis).all(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM demandes WHERE recue_le >= ?').bind(depuis).first<{ n: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n, SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) AS resolus FROM dossiers WHERE cree_le >= ?")
      .bind(depuis)
      .first<{ n: number; resolus: number }>(),
  ]);
  const entrees = await env.DB.prepare("SELECT COALESCE(SUM(n),0) AS n FROM stats_vues WHERE jour >= ? AND source <> 'interne'").bind(depuis).first<{ n: number }>();
  return json({
    ok: true,
    jours,
    vues: total?.n ?? 0,
    visites: entrees?.n ?? 0,
    par_jour: parJour.results,
    par_source: parSource.results,
    par_pays: parPays.results,
    par_page: parPage.results,
    evenements: evenements.results,
    demandes: demandes?.n ?? 0,
    dossiers: dossiers?.n ?? 0,
    dossiers_resolus: dossiers?.resolus ?? 0,
  });
}

export async function systeme({ env }: Ctx): Promise<Response> {
  const tache = await env.DB.prepare("SELECT derniere_execution, resultat FROM taches WHERE nom = 'quotidienne'").first<{ derniere_execution: string; resultat: string }>();
  const casses = await env.DB.prepare('SELECT url, verifie_le, http, erreur FROM liens_officiels WHERE ok = 0 ORDER BY verifie_le DESC').all();
  const verifies = await env.DB.prepare('SELECT COUNT(*) AS n FROM liens_officiels').first<{ n: number }>();
  let resultat: unknown = null;
  try {
    resultat = tache?.resultat ? JSON.parse(tache.resultat) : null;
  } catch {
    resultat = null;
  }
  return json({
    ok: true,
    tache: tache ? { derniere_execution: tache.derniere_execution, resultat } : null,
    liens_officiels: { total: liensOfficiels().length, verifies: verifies?.n ?? 0, casses: casses.results },
    fiches_a_reverifier: fichesAReverifier().map((f) => ({ id: f.id, date: f.date_derniere_verification ?? null })),
    nda_version: NDA_VERSION,
  });
}

export async function referentiel(): Promise<Response> {
  const vieilles = new Set(fichesAReverifier().map((f) => f.id));
  return json({ ok: true, fiches: FICHES.map((f) => ({ ...f, a_reverifier: vieilles.has(f.id) })) });
}
