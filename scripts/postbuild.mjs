// Après la construction : liste des pages publiques avec une empreinte de leur
// contenu (dist/build.json). La tâche du matin la compare à la précédente pour
// signaler aux moteurs (IndexNow) uniquement les pages nouvelles ou modifiées.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

function fichiersHtml(dossier) {
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const p = join(dossier, nom);
    if (statSync(p).isDirectory()) out.push(...fichiersHtml(p));
    else if (nom.endsWith('.html')) out.push(p);
  }
  return out;
}
const pages = (dossier) => fichiersHtml(dossier).filter((f) => f.endsWith(`${sep}index.html`));

// 1. Typographie française dans le texte des pages (jamais dans les scripts,
//    styles, champs ni attributs) : espace fine insécable avant ; : ! ? » et après «.
const FINE = '\u202F';
const typo = (t) => t.replace(/(?<=\S)[ \u00A0](?=[;:!?»])/g, FINE).replace(/«[ \u00A0]/g, `«${FINE}`);
let corrections = 0;
for (const fichier of fichiersHtml(DIST)) {
  const html = readFileSync(fichier, 'utf8');
  let protege = null;
  const morceaux = html.split(/(<[^>]+>)/);
  for (let i = 0; i < morceaux.length; i++) {
    const m = morceaux[i];
    if (m.startsWith('<')) {
      const ouvre = m.match(/^<(script|style|textarea|pre|code)[\s>]/i);
      const ferme = m.match(/^<\/(script|style|textarea|pre|code)>/i);
      if (ouvre && !protege) protege = ouvre[1].toLowerCase();
      else if (ferme && protege === ferme[1].toLowerCase()) protege = null;
      continue;
    }
    if (!protege && m) {
      const t = typo(m);
      if (t !== m) {
        corrections++;
        morceaux[i] = t;
      }
    }
  }
  const nouveau = morceaux.join('');
  if (nouveau !== html) writeFileSync(fichier, nouveau);
}
console.log(`typographie : ${corrections} passages ajustés`);

const resultat = {};
for (const fichier of pages(DIST)) {
  const rel = relative(DIST, fichier).split(sep).slice(0, -1).join('/');
  const chemin = rel ? `/${rel}/` : '/';
  if (chemin.startsWith('/outil/')) continue;
  const html = readFileSync(fichier, 'utf8');
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  // Seul le contenu principal compte : un changement de style ne renvoie pas tout le site aux moteurs.
  const principal = (html.match(/<main[\s\S]*<\/main>/) ?? [html])[0]
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/\/_astro\/[^"' )]+/g, '');
  resultat[chemin] = createHash('sha256').update(principal).digest('hex').slice(0, 16);
}

const tries = Object.fromEntries(Object.entries(resultat).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(DIST, 'build.json'), JSON.stringify({ genere_le: new Date().toISOString(), pages: tries }, null, 1));
console.log(`build.json : ${Object.keys(tries).length} pages publiques`);
