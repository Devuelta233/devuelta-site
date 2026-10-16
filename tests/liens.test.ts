import { describe, expect, it } from 'vitest';
import { extraireLiens } from '../src/outil/liens';

describe('liens repérés dans un texte collé', () => {
  it('garde les adresses, écarte le texte, la ponctuation finale et PimEyes', () => {
    const texte = `Résultats PimEyes (92 %) :
      https://exemple.com/photo/123, voir aussi (https://blog.exemple.org/a?b=1).
      www.autre-site.net/page ; https://pimeyes.com/en/results/abc
      https://exemple.com/photo/123
      Match 87% — https://cdn.site.fr/img.jpg»`;
    expect(extraireLiens(texte)).toEqual([
      'https://exemple.com/photo/123',
      'https://blog.exemple.org/a?b=1',
      'www.autre-site.net/page',
      'https://cdn.site.fr/img.jpg',
    ]);
  });
  it('texte sans lien : rien', () => {
    expect(extraireLiens('Bonjour, voici mon problème')).toEqual([]);
  });
});
