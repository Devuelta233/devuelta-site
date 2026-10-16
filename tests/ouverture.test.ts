// Message d'ouverture : le seul moment où le client reçoit le WhatsApp de la
// personne qui suit son dossier ; il contient aussi le rappel anti-arnaque.

import { describe, expect, it } from 'vitest';
import { texteOuverture } from '../shared/ouverture';
import { LANGS } from '../shared/vocab';

describe('message d’ouverture du dossier', () => {
  const o = { pseudo: 'Awa', ref: 'DV-2026-0012', prenom: 'Paola', whatsapp: '+34600000000' };
  it('numéro de dossier, prénom et WhatsApp de la personne qui suit le dossier, dans les 3 langues', () => {
    for (const l of LANGS) {
      const t = texteOuverture(o, l);
      for (const x of ['Awa', 'DV-2026-0012', 'Paola', '+34600000000', 'Devuelta']) expect(t).toContain(x);
    }
  });
  it('rappel anti-arnaque', () => {
    expect(texteOuverture(o, 'fr')).toContain('jamais d’images intimes');
    expect(texteOuverture(o, 'es')).toContain('Nunca te pediremos');
    expect(texteOuverture(o, 'en')).toContain('never ask you');
  });
});
