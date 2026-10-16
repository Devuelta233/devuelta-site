// Outil : préparer le lien de signature électronique (devis + mandat) d'un dossier.
// Un seul lien actif par dossier : en créer un nouveau annule le précédent.

import { sujetSignature } from '../../shared/emails';
import {
  CHEMIN_SIGNATURE,
  DESCRIPTION_GENERIQUE,
  NOM_A_SIGNER,
  mandatPourSignature,
  messageSignature,
  texteDevis,
  type ResumeDevis,
} from '../../shared/signature';
import { SITE_URL } from '../../shared/site';
import { calculerPrix, zoneDuPays } from '../../shared/tarifs';
import { isLang, type Lang } from '../../shared/vocab';
import { randomBytes, sha256Hex, toB64Url, newId } from '../crypto';
import { journalStmt } from '../db';
import { envoyerCourriel } from '../email';
import { HttpError, addDays, json, nowIso } from '../util';
import { dossierVisible } from './access';
import { contientMarqueur, genererCourrier, trouverModele } from './modeles';
import type { Ctx } from './router';

const CONDITIONS: Record<Lang, string> = { fr: '/conditions-de-vente/', es: '/es/condiciones-de-venta/', en: '/en/terms-of-sale/' };
const VALIDITE_JOURS = 14;

export async function creer({ env, params, auth }: Ctx): Promise<Response> {
  const d = await dossierVisible(env.DB, auth.user, params.id);
  if (d.mandat_signe_le) throw new HttpError(409, 'mandat-deja-signe');
  const lang: Lang = isLang(d.langue) ? d.langue : 'fr';
  const rows = await env.DB.prepare(
    "SELECT url FROM contenus WHERE dossier_id = ? AND statut NOT IN ('retire','a-valider','refuse') ORDER BY ajoute_le",
  )
    .bind(d.id)
    .all<{ url: string }>();
  const urls = rows.results.map((r) => r.url);
  if (urls.length === 0) throw new HttpError(400, 'liens-manquants');
  const zone = zoneDuPays(d.pays as string | null);
  if (!zone) throw new HttpError(400, 'pays-manquant');
  const prix = calculerPrix(urls.length, 0, zone, !!d.client_pro);
  if (prix.total === null) throw new HttpError(400, 'sur-devis');
  const modele = trouverModele('mandat', lang);
  if (!modele) throw new HttpError(500, 'modele-introuvable');

  const { corps } = genererCourrier({
    modele,
    dossier: { ...d, client_nom: (d.client_nom as string | null) || NOM_A_SIGNER[lang] },
    urls,
    representant: auth.user.nom,
    description_contenu: DESCRIPTION_GENERIQUE[lang],
  });
  const devis = texteDevis({ ref: String(d.ref), nbLiens: urls.length, prix, urlConditions: `${SITE_URL}${CONDITIONS[lang]}` }, lang);
  const document = `${devis}\n\n${mandatPourSignature(corps, lang)}`;
  if (contientMarqueur(document)) throw new HttpError(400, 'mandat-incomplet');

  const jeton = toB64Url(randomBytes(32));
  const now = nowIso();
  const expire = addDays(now, VALIDITE_JOURS);
  const resume: ResumeDevis = { ref: String(d.ref), liens: urls.length, total: prix.total, ouverture: prix.ouverture!, solde: prix.soldeMaximum! };
  await env.DB.batch([
    env.DB.prepare('UPDATE signatures SET annule_le = ? WHERE dossier_id = ? AND signe_le IS NULL AND annule_le IS NULL').bind(now, d.id),
    env.DB.prepare(
      `INSERT INTO signatures (id, dossier_id, jeton_hash, langue, document, document_hash, resume, representant, cree_le, cree_par, expire_le)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      newId(),
      d.id,
      await sha256Hex(jeton),
      lang,
      document,
      await sha256Hex(document),
      JSON.stringify(resume),
      auth.user.nom,
      now,
      auth.user.id,
      expire,
    ),
    journalStmt(env.DB, { utilisateur_id: auth.user.id, action: 'signature-demandee', objet: 'dossier', objet_id: d.id, dossier_id: d.id, details: { liens: urls.length, total: prix.total } }),
  ]);
  const url = `${SITE_URL}${CHEMIN_SIGNATURE[lang]}#${jeton}`;
  const message = messageSignature({ pseudo: String(d.client_pseudo), ref: String(d.ref), url }, lang);
  // Envoi direct par e-mail quand c'est possible ; sinon l'outil affiche le message à copier.
  const envoye = await envoyerCourriel(env, d.client_email as string | null, { sujet: sujetSignature(String(d.ref), lang), texte: message }, {
    type: 'signature',
    objet: 'dossier',
    objet_id: d.id,
    dossier_id: d.id,
    utilisateur_id: auth.user.id,
  });
  return json({ ok: true, url, expire_le: expire, message, langue: lang, envoye });
}

/** Dernière demande de signature du dossier (pour l'écran du dossier). */
export async function pourDossier(db: D1Database, dossierId: string) {
  return db
    .prepare(
      `SELECT cree_le, expire_le, annule_le, signe_le, nom_signe, debut_immediat, document_signe, langue, resume
         FROM signatures WHERE dossier_id = ? ORDER BY cree_le DESC LIMIT 1`,
    )
    .bind(dossierId)
    .first();
}
