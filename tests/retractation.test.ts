// Rétractation en ligne : libellés imposés, accusé de réception complet
// (contenu, date et heure), reconnaissance du numéro de dossier.

import { describe, expect, it } from 'vitest';
import { C } from '../src/i18n/commun';
import { LIBELLE_RETRACTATION, dateHeureGmt, texteAccuse, type Retractation } from '../shared/retractation';
import { normaliserRefDossier } from '../server/retractation';
import { LANGS } from '../shared/vocab';

const R: Retractation = {
  ref: 'R-2026-0003',
  recue_le: '2026-10-16T13:42:05.000Z',
  nom: 'Awa Mensah',
  dossier_ref: 'DV-2026-0012',
  contact_mode: 'email',
  contact_valeur: 'awa@example.com',
  message: 'Je préfère arrêter.',
};

describe('rétractation en ligne', () => {
  it('libellés imposés dans chaque langue', () => {
    expect(LIBELLE_RETRACTATION.fr).toEqual({ fonction: 'Renoncer au contrat ici', confirmer: 'Confirmer la rétractation' });
    expect(LIBELLE_RETRACTATION.es).toEqual({ fonction: 'Desistir del contrato aquí', confirmer: 'Confirmar desistimiento' });
    expect(LIBELLE_RETRACTATION.en).toEqual({ fonction: 'Withdraw from contract here', confirmer: 'Confirm withdrawal' });
    for (const l of LANGS) expect(C.nav.retractation[l]).toBe(LIBELLE_RETRACTATION[l].fonction);
  });

  it('date et heure sans ambiguïté (GMT)', () => {
    expect(dateHeureGmt(R.recue_le, 'fr')).toBe('16 octobre 2026 à 13 h 42 (heure GMT)');
    expect(dateHeureGmt(R.recue_le, 'es')).toBe('16 de octubre de 2026 a las 13:42 (hora GMT)');
    expect(dateHeureGmt(R.recue_le, 'en')).toBe('16 October 2026 at 13:42 GMT');
  });

  it('accusé de réception : contenu, date et heure, dans les trois langues', () => {
    for (const l of LANGS) {
      const t = texteAccuse(R, l);
      for (const x of [R.ref, R.nom, 'DV-2026-0012', 'awa@example.com', 'Je préfère arrêter.', dateHeureGmt(R.recue_le, l)]) {
        expect(t).toContain(x);
      }
      expect(t).toContain('14');
    }
    const sans = texteAccuse({ ...R, dossier_ref: null, message: null, contact_mode: 'whatsapp', contact_valeur: '+233200000000' }, 'fr');
    expect(sans).toContain('Dossier : non indiqué');
    expect(sans).toContain('Message : aucun');
    expect(sans).toContain('WhatsApp : +233200000000');
  });

  it('numéro de dossier reconnu quelle que soit la saisie', () => {
    expect(normaliserRefDossier('DV-2026-0012')).toBe('DV-2026-0012');
    expect(normaliserRefDossier('dv 2026 12')).toBe('DV-2026-0012');
    expect(normaliserRefDossier('DV20260012')).toBe('DV-2026-0012');
    expect(normaliserRefDossier('je ne sais plus')).toBe('je ne sais plus');
    expect(normaliserRefDossier(null)).toBeNull();
  });
});
