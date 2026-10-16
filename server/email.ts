// Envoi des e-mails automatiques (Cloudflare Email Service, liaison « EMAIL »).
// Expéditeur : Team Devuelta <team@getdevuelta.com> ; les réponses arrivent dans
// la boîte de l'équipe (team.devuelta@protonmail.com). Sans la liaison (poste de
// développement, domaine pas encore activé), rien n'est envoyé : l'outil affiche
// alors le message à copier, comme avant.

import type { Courriel } from '../shared/emails';
import { CONTACT_EMAIL } from '../shared/vocab';
import { journal } from './db';
import type { Env } from './util';

export const EXPEDITEUR = 'team@getdevuelta.com';

export interface Trace {
  /** Type de message, pour le journal (jamais l'adresse ni le contenu). */
  type: 'demande-recue' | 'signature' | 'signe' | 'accuse-retractation' | 'paiement' | 'paiement-recu';
  objet: string;
  objet_id: string;
  dossier_id?: string | null;
  utilisateur_id?: string | null;
}

export async function envoyerCourriel(env: Env, a: string | null | undefined, c: Courriel, trace: Trace): Promise<boolean> {
  if (!env.EMAIL || !a) return false;
  try {
    await env.EMAIL.send({
      from: { email: EXPEDITEUR, name: 'Team Devuelta' },
      to: a,
      replyTo: CONTACT_EMAIL,
      subject: c.sujet,
      text: c.texte,
    });
    await journal(env.DB, { ...base(trace), action: 'email-envoye', details: { type: trace.type } }).catch(() => undefined);
    return true;
  } catch (e) {
    const code = (e as { code?: unknown }).code;
    await journal(env.DB, {
      ...base(trace),
      action: 'email-echec',
      details: { type: trace.type, code: typeof code === 'string' ? code : 'inconnu' },
    }).catch(() => undefined);
    return false;
  }
}

function base(t: Trace) {
  return { utilisateur_id: t.utilisateur_id ?? null, objet: t.objet, objet_id: t.objet_id, dossier_id: t.dossier_id ?? null };
}
