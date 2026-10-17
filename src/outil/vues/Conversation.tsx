// Conversation Telegram d'un client : ses messages écrits (jamais d'image) et
// les réponses de l'équipe. Chaque réponse est écrite (ou relue) par une
// personne de l'équipe, puis envoyée dans la même conversation, au nom de Devuelta.

import { useState } from 'preact/hooks';
import { post } from '../api';
import { date, t, tr } from '../i18n';
import { Champ, MessageErreur, useAction, valeur } from '../ui';

export interface MessageFil {
  id: string;
  sens: 'entrant' | 'sortant';
  texte: string;
  le: string;
  auteur_nom: string | null;
  lu_le: string | null;
}

export interface ConversationTelegram {
  canal: 'telegram';
  bloque: boolean;
  messages: MessageFil[];
}

export function Conversation({
  conv,
  envoi,
  brouillon,
  actif,
  pseudo,
  recharger,
}: {
  conv: ConversationTelegram;
  /** Adresse de l'API qui envoie la réponse (demande ou dossier). */
  envoi: string;
  /** Adresse de l'API qui prépare un brouillon (demandes seulement). */
  brouillon?: string;
  actif: boolean;
  pseudo: string;
  recharger: () => void;
}) {
  const a = useAction();
  const prep = useAction();
  const [texte, setTexte] = useState('');
  const [alertes, setAlertes] = useState<{ mineur: boolean; a_verifier: boolean } | null>(null);
  return (
    <section class="o-encadre">
      <h2>{tr('Conversation Telegram', 'Conversación de Telegram', 'Telegram conversation')}</h2>
      <p class="o-muet">
        {tr(
          'La personne écrit à notre robot Telegram officiel. Votre réponse part dans la même conversation, au nom de Devuelta. Jamais d’images, de mot de passe ni de code demandé.',
          'La persona escribe a nuestro robot oficial de Telegram. Tu respuesta va en la misma conversación, en nombre de Devuelta. Nunca pidas imágenes, contraseñas ni códigos.',
          'The person writes to our official Telegram bot. Your reply goes into the same conversation, on behalf of Devuelta. Never ask for images, passwords or codes.',
        )}
      </p>
      {!actif && (
        <p class="o-encadre o-alerte">
          {tr('Robot Telegram inactif : sa clé n’est pas posée.', 'Robot de Telegram inactivo: falta su clave.', 'Telegram bot inactive: its key is not set.')}
        </p>
      )}
      {conv.bloque && (
        <p class="o-encadre o-alerte">
          {tr(
            'La personne a bloqué le robot ou supprimé la conversation : vos messages ne lui parviennent plus.',
            'La persona bloqueó el robot o borró la conversación: tus mensajes ya no le llegan.',
            'The person blocked the bot or deleted the chat: your messages no longer reach them.',
          )}
        </p>
      )}
      {conv.messages.length === 0 ? (
        <p class="o-muet">
          {tr('Aucun message écrit depuis la demande.', 'Ningún mensaje escrito desde la solicitud.', 'No written message since the request.')}
        </p>
      ) : (
        <ol class="o-fil">
          {conv.messages.map((m) => (
            <li class={`o-msg o-msg-${m.sens}`}>
              <span class="o-msg-qui">
                {m.sens === 'entrant' ? pseudo : (m.auteur_nom ?? 'Devuelta')} · {date(m.le, true)}
              </span>
              <p class="o-texte">{m.texte}</p>
            </li>
          ))}
        </ol>
      )}
      <Champ label={tr('Votre réponse', 'Tu respuesta', 'Your reply')}>
        <textarea class="o-texte-long o-reponse-courte" rows={6} value={texte} onInput={(e) => setTexte(valeur(e))} />
      </Champ>
      {alertes?.mineur && <p class="o-encadre o-alerte">{t('reponseMineur')}</p>}
      {alertes?.a_verifier && <p class="o-encadre o-alerte">{t('reponseVerifier')}</p>}
      <p class="o-actions">
        {brouillon && (
          <button
            class="o-bouton"
            disabled={prep.occupe}
            onClick={() =>
              prep.lancer(
                () => post<{ texte: string; mineur: boolean; a_verifier: boolean }>(brouillon, {}),
                (r) => {
                  setTexte(r.texte);
                  setAlertes({ mineur: r.mineur, a_verifier: r.a_verifier });
                },
              )
            }
          >
            {prep.occupe ? t('chargement') : t('reponsePreparer')}
          </button>
        )}
        <button
          class="o-bouton o-principal"
          disabled={a.occupe || !actif || !texte.trim()}
          onClick={() =>
            a.lancer(
              // Les messages affichés jusqu'ici passent « lus », pas ceux arrivés pendant qu'on écrivait.
              () => post(envoi, { texte, vu_jusqua: conv.messages.at(-1)?.le }),
              () => {
                setTexte('');
                setAlertes(null);
                recharger();
              },
            )
          }
        >
          {tr('Envoyer sur Telegram', 'Enviar por Telegram', 'Send on Telegram')}
        </button>
      </p>
      <MessageErreur texte={a.err || prep.err} />
    </section>
  );
}
