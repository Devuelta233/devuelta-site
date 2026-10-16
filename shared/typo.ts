// Typographie française : espace fine insécable avant ; : ! ? » et après «,
// pour qu'un signe ne se retrouve jamais seul en début de ligne.
// Sans effet sur l'espagnol et l'anglais (pas d'espace avant ces signes).

const FINE = ' ';

export function typo(s: string): string {
  return (
    s
      .replace(/(?<=\S)[ \u00A0](?=[;:!?\u00BB])/g, FINE)
      .replace(/\u00AB[ \u00A0]/g, `\u00AB${FINE}`)
      // Dans les trois langues : apostrophe typographique entre deux lettres
      // (l\u2019usurpation, don\u2019t), comme la construction le fait pour les pages.
      .replace(/(?<=\p{L})'(?=\p{L})/gu, '\u2019')
  );
}

/** Applique `typo` à toutes les chaînes d'un objet (textes, tableaux imbriqués). */
export function typoProfonde<T>(o: T): T {
  if (typeof o === 'string') return typo(o) as T;
  if (Array.isArray(o)) return o.map((x) => typoProfonde(x)) as T;
  if (o && typeof o === 'object') {
    const r: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) r[k] = typoProfonde(v);
    return r as T;
  }
  return o;
}
