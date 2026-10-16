// Outil : envoyer le lien de paiement d'un dossier (ouverture ou solde).
// Le montant vient du devis signé ; le solde, des liens retirés (au prorata).

import { emailLienPaiement } from '../../shared/emails';
import type { ResumeDevis } from '../../shared/signature';
import { calculerPrix, euros, zoneDuPays } from '../../shared/tarifs';
import { isLang, type Lang } from '../../shared/vocab';
import { envoyerCourriel } from '../email';
import { lienPaiement, modeTest, paiementActif, type TypePaiement } from '../paiement';
import { HttpError, json, readJson } from '../util';
import { dossierVisible, type DossierRow } from './access';
import type { Ctx } from './router';

const arrondi = (n: number) => Math.round(n * 100) / 100;

async function montantDu(db: D1Database, d: DossierRow, type: TypePaiement): Promise<number> {
  const liens = await db
    .prepare("SELECT statut FROM contenus WHERE dossier_id = ? AND statut != 'a-valider'")
    .bind(d.id)
    .all<{ statut: string }>();
  const retires = liens.results.filter((l) => l.statut === 'retire').length;
  const sig = await db
    .prepare('SELECT resume FROM signatures WHERE dossier_id = ? AND signe_le IS NOT NULL ORDER BY signe_le DESC LIMIT 1')
    .bind(d.id)
    .first<{ resume: string }>();
  if (sig) {
    const r = JSON.parse(sig.resume) as ResumeDevis;
    return type === 'ouverture' ? r.ouverture : arrondi((r.solde * Math.min(retires, r.liens)) / r.liens);
  }
  // Mandat signé sur papier : même calcul que l'encadré « Tarif » du dossier.
  const zone = zoneDuPays(d.pays as string | null);
  if (!zone) throw new HttpError(400, 'pays-manquant');
  const p = calculerPrix(liens.results.length, retires, zone, !!d.client_pro);
  if (p.ouverture === null || p.soldeDu === null) throw new HttpError(400, 'sur-devis');
  return type === 'ouverture' ? p.ouverture : p.soldeDu;
}

export async function demander({ request, env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  const body = await readJson(request, 2_000);
  const type: TypePaiement = body.type === 'solde' ? 'solde' : 'ouverture';
  if (!paiementActif(env)) throw new HttpError(503, 'paiement-non-configure');
  if (!d.mandat_signe_le) throw new HttpError(400, 'mandat-manquant');
  const email = d.client_email as string | null;
  if (!email) throw new HttpError(400, 'email-client-manquant');
  // Un paiement de test ne compte pas comme un vrai paiement (et inversement).
  const deja = await env.DB.prepare("SELECT 1 AS x FROM paiements WHERE dossier_id = ? AND type = ? AND statut = 'paye' AND test = ?")
    .bind(d.id, type, modeTest(env) ? 1 : 0)
    .first();
  if (deja) throw new HttpError(409, 'deja-paye');
  const montant = await montantDu(env.DB, d, type);
  if (!(montant > 0)) throw new HttpError(400, 'rien-a-payer');
  const lang: Lang = isLang(d.langue) ? d.langue : 'fr';
  const ref = String(d.ref);
  const l = await lienPaiement(env, { dossierId: d.id, ref, lang, email, type, montantEur: montant, utilisateurId: auth.user.id });
  if (!l) throw new HttpError(503, 'paiement-non-configure');
  const courriel = emailLienPaiement({ pseudo: String(d.client_pseudo), ref, montant: euros(montant, lang), type, lien: l.lien, devise: l.devise }, lang);
  const envoye = await envoyerCourriel(env, email, courriel, {
    type: 'paiement',
    objet: 'dossier',
    objet_id: d.id,
    dossier_id: d.id,
    utilisateur_id: auth.user.id,
  });
  return json({ ok: true, lien: l.lien, montant_eur: montant, envoye, message: courriel.texte });
}

export async function pourDossier(db: D1Database, dossierId: string) {
  const r = await db
    .prepare('SELECT type, montant_eur, devise, statut, cree_le, paye_le, lien, canal, test FROM paiements WHERE dossier_id = ? ORDER BY cree_le DESC')
    .bind(dossierId)
    .all();
  return r.results;
}
