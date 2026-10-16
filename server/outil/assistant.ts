// Outil : brouillon de réponse à une demande, préparé par l'IA de Cloudflare
// (Workers AI), puis relu, corrigé et envoyé par une personne de l'équipe.

import { assemblerBrouillon, brouillonAVerifier, consignesBrouillon, donneesBrouillon } from '../../shared/assistant';
import { phrasePrix } from '../../shared/emails';
import { SITE_URL } from '../../shared/site';
import { calculerPrix, zoneDuPays } from '../../shared/tarifs';
import { typo } from '../../shared/typo';
import { SITUATION_LABEL, isLang, isPays, isSituation, nomPays, type Lang } from '../../shared/vocab';
import { situationPath } from '../../src/i18n/routes';
import { journal } from '../db';
import { envoyerCourriel } from '../email';
import { HttpError, cleanText, json, readJson } from '../util';
import { charger, parseDemande } from './demandes';
import type { Ctx } from './router';

const MODELE = '@cf/mistralai/mistral-small-3.1-24b-instruct';
const QUE_FAIRE: Record<Lang, string> = { fr: '/que-faire/', es: '/es/que-hacer/', en: '/en/what-to-do/' };

export async function brouillon(ctx: Ctx): Promise<Response> {
  const r = parseDemande(await charger(ctx)) as Record<string, any>;
  if (!ctx.env.AI) throw new HttpError(503, 'ia-indisponible');
  const lang: Lang = isLang(r.langue) ? r.langue : 'fr';
  const liens: string[] = Array.isArray(r.liens) ? r.liens : [];
  const pays = typeof r.pays === 'string' && isPays(r.pays) && r.pays !== 'ZZ' ? r.pays : null;
  const zone = zoneDuPays(pays) ?? 'standard';
  const p = calculerPrix(liens.length, 0, zone);
  const prix = phrasePrix({ liens: liens.length, total: p.total, ouverture: p.ouverture, aPartirDe: calculerPrix(1, 0, zone).total ?? 0 }, lang, false);
  const manques = [...(liens.length === 0 ? ['les adresses (liens) des contenus à retirer'] : []), ...(pays ? [] : ['le pays où vit la personne'])];
  const situation = isSituation(r.situation) ? SITUATION_LABEL[r.situation].fr : String(r.situation);
  const guide = isSituation(r.situation) && r.situation !== 'autre' ? `${SITE_URL}${situationPath(r.situation, lang)}` : `${SITE_URL}${QUE_FAIRE[lang]}`;

  let ia = '';
  try {
    const res = (await ctx.env.AI.run(MODELE as any, {
      messages: [
        { role: 'system', content: consignesBrouillon(lang) },
        {
          role: 'user',
          content: donneesBrouillon({
            situation,
            plateformes: Array.isArray(r.plateformes) ? r.plateformes : [],
            nbLiens: liens.length,
            pays: pays ? nomPays(pays, 'fr') : 'non précisé',
            menace: !!r.menace,
            pseudo: String(r.pseudo),
            message: (r.message as string | null) ?? null,
            manques,
          }),
        },
      ],
      max_tokens: 700,
      temperature: 0.4,
    } as any)) as { response?: string };
    ia = (res.response ?? '').trim();
  } catch {
    throw new HttpError(503, 'ia-indisponible');
  }
  if (!ia) throw new HttpError(503, 'ia-indisponible');
  const { texte, mineur } = assemblerBrouillon(ia, { lang, guide, prix });
  const final = lang === 'fr' ? typo(texte) : texte;
  await journal(ctx.env.DB, { utilisateur_id: ctx.auth.user.id, action: 'brouillon-ia', objet: 'demande', objet_id: String(r.id) });
  return json({ ok: true, texte: final, mineur, a_verifier: brouillonAVerifier(final) });
}

/** Envoie la réponse relue par l'équipe, depuis Team Devuelta, à l'adresse de la demande. */
export async function repondre(ctx: Ctx): Promise<Response> {
  const r = await charger(ctx);
  if (r.contact_mode !== 'email') throw new HttpError(400, 'contact-pas-email');
  const body = await readJson(ctx.request, 20_000);
  const texte = cleanText(body.texte, 8000, { required: true, multiline: true })!;
  const lang: Lang = isLang(r.langue) ? r.langue : 'fr';
  const sujet = { fr: typo(`Devuelta : votre demande ${r.ref}`), es: `Devuelta: tu solicitud ${r.ref}`, en: `Devuelta: your request ${r.ref}` }[lang];
  const envoye = await envoyerCourriel(ctx.env, String(r.contact_valeur), { sujet, texte }, {
    type: 'reponse',
    objet: 'demande',
    objet_id: String(r.id),
    utilisateur_id: ctx.auth.user.id,
  });
  if (!envoye) throw new HttpError(503, 'email-indisponible');
  return json({ ok: true });
}
