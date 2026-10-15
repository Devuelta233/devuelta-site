// Repère les adresses web dans un texte collé (rapport PimEyes, e-mail,
// message, liste…). Les liens vers PimEyes lui-même sont écartés : ce sont des
// pages de résultats, pas les sites où les photos sont publiées.

const OUTILS_DE_RECHERCHE = /(^|\.)pimeyes\.com$/i;

export function extraireLiens(texte: string): string[] {
  const trouves = texte.match(/\bhttps?:\/\/[^\s<>"'`]+|\bwww\.[^\s<>"'`]+/gi) ?? [];
  const propres = trouves.map((u) => u.replace(/[),.;:!?»\]]+$/u, ''));
  const out: string[] = [];
  for (const u of propres) {
    let hote = '';
    try {
      hote = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname;
    } catch {
      continue;
    }
    if (!hote.includes('.') || OUTILS_DE_RECHERCHE.test(hote)) continue;
    if (!out.includes(u)) out.push(u);
  }
  return out;
}
