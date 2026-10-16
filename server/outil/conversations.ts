// Outil : fil des messages écrits échangés avec un client sur Telegram
// (jamais d'image). Rattaché à la demande, il suit la demande puis le dossier.

import { nowIso } from '../util';

export interface MessageFil {
  id: string;
  sens: 'entrant' | 'sortant';
  texte: string;
  le: string;
  auteur_nom: string | null;
  lu_le: string | null;
}

export interface Conversation {
  canal: 'telegram';
  bloque: boolean;
  messages: MessageFil[];
}

/**
 * Le fil d'une demande. Les messages du client sont marqués comme lus quand la
 * personne qui suit la demande l'affiche (ou n'importe qui, si personne ne la suit).
 */
export async function conversationPour(
  db: D1Database,
  demandeId: string,
  lecteur: { id: string },
  responsable: string | null,
  affiche = true,
): Promise<Conversation> {
  const [messages, conv] = await Promise.all([
    db
      .prepare(
        `SELECT m.id, m.sens, m.texte, m.le, m.lu_le, u.nom AS auteur_nom
           FROM messages m LEFT JOIN utilisateurs u ON u.id = m.auteur
          WHERE m.demande_id = ? ORDER BY m.le, m.rowid LIMIT 500`,
      )
      .bind(demandeId)
      .all<MessageFil>(),
    db.prepare('SELECT bloque FROM telegram_conversations WHERE demande_id = ?').bind(demandeId).first<{ bloque: number }>(),
  ]);
  if (affiche && (!responsable || responsable === lecteur.id)) {
    await db.prepare("UPDATE messages SET lu_le = ? WHERE demande_id = ? AND sens = 'entrant' AND lu_le IS NULL").bind(nowIso(), demandeId).run();
  }
  return { canal: 'telegram', bloque: !!conv?.bloque, messages: messages.results };
}

/** Nombre de messages du client pas encore lus, pour une liste (alias « dm » pour la demande). */
export const SQL_NON_LUS = "(SELECT COUNT(*) FROM messages m WHERE m.demande_id = dm.id AND m.sens = 'entrant' AND m.lu_le IS NULL)";
