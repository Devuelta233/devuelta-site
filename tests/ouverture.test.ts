// Message d’ouverture : qui suit le dossier et comment lui écrire (par e-mail
// ou dans la conversation Telegram, jamais WhatsApp) ; il contient aussi le rappel anti-arnaque.

import { describe, expect, it } from 'vitest';
import { texteOuverture } from '../shared/ouverture';
import { LANGS } from '../shared/vocab';

describe('message d’ouverture du dossier', () => {
  const o = { pseudo: 'Awa', ref: 'DV-2026-0012', prenom: 'Paola' };
  it('numéro de dossier et prénom de la personne qui suit le dossier, réponse par e-mail, dans les 3 langues', () => {
    for (const l of LANGS) {
      const t = texteOuverture(o, l);
      for (const x of ['Awa', 'DV-2026-0012', 'Paola', 'Devuelta']) expect(t).toContain(x);
      expect(t).not.toMatch(/whatsapp/i);
    }
    expect(texteOuverture(o, 'fr')).toContain('répondez à cet e-mail');
    expect(texteOuverture(o, 'es')).toContain('responde a este correo');
    expect(texteOuverture(o, 'en')).toContain('reply to this email');
  });
  it('client venu par Telegram : il répond dans la même conversation, pas par e-mail', () => {
    for (const l of LANGS) {
      const t = texteOuverture(o, l, 'telegram');
      for (const x of ['Awa', 'DV-2026-0012', 'Paola', 'Devuelta']) expect(t).toContain(x);
      expect(t).not.toMatch(/whatsapp|e-mail|correo|email/i);
    }
    expect(texteOuverture(o, 'fr', 'telegram')).toContain('répondez simplement dans cette conversation');
    expect(texteOuverture(o, 'es', 'telegram')).toContain('responde simplemente en esta conversación');
    expect(texteOuverture(o, 'en', 'telegram')).toContain('simply reply in this conversation');
  });
  it('rappel anti-arnaque', () => {
    expect(texteOuverture(o, 'fr')).toContain('jamais d’images intimes');
    expect(texteOuverture(o, 'es')).toContain('Nunca te pediremos');
    expect(texteOuverture(o, 'en')).toContain('never ask you');
  });
});
