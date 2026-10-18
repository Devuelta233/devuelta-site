// Dossier de passation : GET /api/outil/dossiers/:id/passation renvoie le document
// HTML à remettre au client (voir shared/passation.ts pour le contenu). Ici, on
// choisit ce qui sort : jamais les coordonnées du client, les notes internes, les
// messages Telegram ni les noms des membres de l'équipe.

import guidesData from '../../shared/guides.json';
import { htmlPassation, type CourrierPassation, type DemarchePassation, type DonneesPassation, type FichePassation, type LienPassation, type LigneJournal } from '../../shared/passation';
import { isLang, type Lang } from '../../shared/vocab';
import { journalStmt } from '../db';
import { nowIso } from '../util';
import { dossierVisible } from './access';
import { fichesPour } from './plan';
import type { Ctx } from './router';

interface GuideTraduit {
  id: string;
  titre: Record<string, string>;
  resume: Record<string, string>;
  base_legale: Record<string, string>;
  source_officielle?: { url?: string } | null;
}

const GUIDES: GuideTraduit[] = ((guidesData as { fiches?: GuideTraduit[] }).fiches ?? []) as GuideTraduit[];

/** Fiches de recours du dossier, dans la langue du client quand le guide public existe. */
export function fichesPassation(situation: string, pays: string | null, lang: Lang): FichePassation[] {
  return fichesPour(situation, pays).map((f) => {
    const g = GUIDES.find((x) => x.id === f.id);
    if (g) {
      return {
        titre: g.titre[lang] ?? g.titre.fr ?? f.id,
        autorite: null,
        base_legale: g.base_legale[lang] ?? g.base_legale.fr ?? null,
        procedure: g.resume[lang] ?? g.resume.fr ?? null,
        source: g.source_officielle?.url ?? (f.source_url as string | undefined) ?? null,
      };
    }
    // Fiche interne sans guide public : texte en français.
    return {
      titre: `${f.pays} — ${f.id}`,
      autorite: (f.autorite_ou_plateforme as string | undefined) ?? null,
      base_legale: (f.base_legale as string | undefined) ?? null,
      procedure: (f.procedure_resume as string | undefined) ?? null,
      source: (f.source_url as string | undefined) ?? null,
      en_francais: lang !== 'fr',
    };
  });
}

function lireDetails(v: unknown): Record<string, unknown> | null {
  if (typeof v !== 'string' || !v) return null;
  try {
    const o = JSON.parse(v);
    return o && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Assemble les données du document : un accès par dossier visible, journalisé. */
export async function donneesPassation(db: D1Database, d: Record<string, unknown>): Promise<DonneesPassation> {
  const id = String(d.id);
  const lang: Lang = isLang(d.langue) ? d.langue : 'fr';
  const [contenus, etapes, courriers, journal] = await Promise.all([
    db
      .prepare(
        `SELECT url, plateforme, domaine, statut, ajoute_le, verif_le, verif_http, retire_constate_le, registrar, registrar_abuse, hebergeur, hebergeur_abuse
           FROM contenus WHERE dossier_id = ? AND statut <> 'a-valider' ORDER BY ajoute_le`,
      )
      .bind(id)
      .all<LienPassation>(),
    db
      .prepare('SELECT type, destinataire, statut, fait_le, reponse_le, courrier_id FROM etapes WHERE dossier_id = ? ORDER BY COALESCE(fait_le, cree_le)')
      .bind(id)
      .all<{ type: string; destinataire: string | null; statut: string; fait_le: string | null; reponse_le: string | null; courrier_id: string | null }>(),
    db
      .prepare("SELECT id, objet, destinataire, envoye_le, corps FROM courriers WHERE dossier_id = ? AND statut = 'envoye' ORDER BY envoye_le")
      .bind(id)
      .all<{ id: string; objet: string; destinataire: string | null; envoye_le: string | null; corps: string }>(),
    db.prepare('SELECT le, action, details FROM journal WHERE dossier_id = ? ORDER BY le').bind(id).all<{ le: string; action: string; details: string | null }>(),
  ]);
  const parId = new Map(courriers.results.map((c) => [c.id, c]));
  const rattaches = new Set<string>();
  const demarches: DemarchePassation[] = etapes.results.map((e) => {
    const c = e.courrier_id ? parId.get(e.courrier_id) : undefined;
    if (c) rattaches.add(c.id);
    const courrier: CourrierPassation | null = c ? { objet: c.objet, destinataire: c.destinataire, envoye_le: c.envoye_le, corps: c.corps } : null;
    return { type: e.type, destinataire: e.destinataire, statut: e.statut, fait_le: e.fait_le, reponse_le: e.reponse_le, courrier };
  });
  const seuls: CourrierPassation[] = courriers.results
    .filter((c) => !rattaches.has(c.id))
    .map((c) => ({ objet: c.objet, destinataire: c.destinataire, envoye_le: c.envoye_le, corps: c.corps }));
  const lignes: LigneJournal[] = journal.results.map((j) => ({ le: j.le, action: j.action, details: lireDetails(j.details) }));
  return {
    ref: String(d.ref),
    langue: lang,
    edite_le: nowIso(),
    situation: String(d.situation),
    pays: (d.pays as string | null) ?? null,
    statut: String(d.statut),
    cree_le: String(d.cree_le),
    mandat_signe_le: (d.mandat_signe_le as string | null) ?? null,
    clos_le: (d.clos_le as string | null) ?? null,
    journal: lignes,
    liens: contenus.results,
    demarches,
    courriers: seuls,
    fiches: fichesPassation(String(d.situation), (d.pays as string | null) ?? null, lang),
  };
}

export async function exporter({ env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const donnees = await donneesPassation(env.DB, d);
  await journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'passation-exportee', objet: 'dossier', objet_id: d.id, dossier_id: d.id, details: { langue: donnees.langue } }).run();
  return new Response(htmlPassation(donnees), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      // Document autonome : aucun script, aucune ressource extérieure.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'",
    },
  });
}
