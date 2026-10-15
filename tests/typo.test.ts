import { describe, expect, it } from 'vitest';
import { typo, typoProfonde } from '../shared/typo';

describe('typographie française', () => {
  it('espace fine avant ; : ! ? » et après «', () => {
    expect(typo('Que faire ? Contact : oui ; « non »')).toBe('Que faire\u202F? Contact\u202F: oui\u202F; «\u202Fnon\u202F»');
  });
  it('signes enchaînés', () => {
    expect(typo('« dossier » : ici')).toBe('«\u202Fdossier\u202F»\u202F: ici');
  });
  it('sans effet sur l’anglais, l’espagnol et les adresses', () => {
    expect(typo('Note: https://a.com/x?y=1 ¿Qué?')).toBe('Note: https://a.com/x?y=1 ¿Qué?');
  });
  it('objets imbriqués', () => {
    expect(typoProfonde({ a: ['x ?'], b: { c: 'y !' }, n: 3 })).toEqual({ a: ['x\u202F?'], b: { c: 'y\u202F!' }, n: 3 });
  });
});
