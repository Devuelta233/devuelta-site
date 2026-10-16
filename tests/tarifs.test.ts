import { describe, expect, it } from 'vitest';
import { calculerPrix, DEVIS_A_PARTIR_DE, euros, FORMULES, formulePour, nombre, zoneDuPays } from '../shared/tarifs';

describe('grille de prix', () => {
  it('formules contiguës de 1 à 15 liens, prix croissants, zone réduite = moitié', () => {
    let attendu = 1;
    for (const f of FORMULES) {
      expect(f.min).toBe(attendu);
      expect(f.max).toBeGreaterThanOrEqual(f.min);
      attendu = f.max + 1;
    }
    expect(attendu).toBe(16);
    for (let i = 1; i < FORMULES.length; i++) expect(FORMULES[i].prix).toBeGreaterThan(FORMULES[i - 1].prix);
    expect(DEVIS_A_PARTIR_DE).toBeGreaterThan(FORMULES[FORMULES.length - 1].prix);
    // Prix locaux cohérents avec la moitié du prix en euros (≈ 13,3 GH¢ et 656 FCFA pour 1 €).
    for (const f of FORMULES) {
      expect(Math.abs(f.ghs / (f.prix / 2) - 13.3)).toBeLessThan(1);
      expect(Math.abs(f.fcfa / (f.prix / 2) - 656)).toBeLessThan(20);
    }
  });

  it('formule selon le nombre de liens', () => {
    expect(formulePour(0)).toBeNull();
    expect(formulePour(1)?.id).toBe('un-lien');
    expect(formulePour(2)?.id).toBe('petit');
    expect(formulePour(5)?.id).toBe('petit');
    expect(formulePour(6)?.id).toBe('dossier');
    expect(formulePour(15)?.id).toBe('dossier');
    expect(formulePour(16)).toBeNull();
  });

  it('moitié à l’ouverture, solde au prorata des liens retirés', () => {
    expect(calculerPrix(1, 0, 'standard')).toMatchObject({ total: 30, ouverture: 15, soldeMaximum: 15, soldeDu: 0 });
    expect(calculerPrix(1, 1, 'standard')).toMatchObject({ soldeDu: 15 });
    expect(calculerPrix(3, 2, 'standard')).toMatchObject({ total: 60, ouverture: 30, soldeDu: 20 });
    expect(calculerPrix(3, 9, 'standard').soldeDu).toBe(30);
    expect(calculerPrix(1, 1, 'reduite')).toMatchObject({ total: 15, ouverture: 7.5, soldeDu: 7.5 });
    expect(calculerPrix(20, 3, 'standard')).toMatchObject({ formule: null, total: null, soldeDu: null });
  });

  it('zone selon le pays', () => {
    expect(zoneDuPays('GH')).toBe('reduite');
    expect(zoneDuPays('ci')).toBe('reduite');
    expect(zoneDuPays('MX')).toBe('reduite');
    expect(zoneDuPays('FR')).toBe('standard');
    expect(zoneDuPays('CH')).toBe('standard');
    expect(zoneDuPays('US')).toBe('standard');
    expect(zoneDuPays('ZZ')).toBeNull();
    expect(zoneDuPays(null)).toBeNull();
  });

  it('affichage des montants', () => {
    expect(euros(30, 'fr')).toBe('30 €');
    expect(euros(7.5, 'fr')).toBe('7,50 €');
    expect(euros(7.5, 'en')).toBe('€7.50');
    expect(nombre(10000, 'fr')).toBe('10 000');
    expect(nombre(40000, 'en')).toBe('40,000');
  });
});
