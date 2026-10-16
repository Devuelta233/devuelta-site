// Contenus : modèles de courriers, référentiel, coordonnées publiques.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import referentiel from '../shared/referentiel.json';
import { CONTACT_EMAIL, LANGS } from '../shared/vocab';
import { EMAIL, NOM_CONTACT } from '../src/config';
import { MODELES, contientMarqueur, genererCourrier } from '../server/outil/modeles';

const fichier = (chemin: string) => readFileSync(new URL(`../${chemin}`, import.meta.url), 'utf-8');

const DOSSIER = {
  ref: 'DV-2026-0001',
  client_nom: 'Alex Martin',
  pays: 'FR',
  publie_par_soi: 0,
};

describe('modèles de courriers', () => {
  it('24 modèles, identifiants uniques par langue', () => {
    expect(MODELES.length).toBe(24);
    const cles = MODELES.map((m) => `${m.id}/${m.langue}`);
    expect(new Set(cles).size).toBe(cles.length);
  });

  it('les modèles généraux existent dans les trois langues', () => {
    for (const id of ['rgpd-art17', 'dsa-art16', 'registrar-abuse', 'hebergeur-abuse', 'relance', 'mandat', 'dereferencement']) {
      for (const l of LANGS) expect(MODELES.some((m) => m.id === id && m.langue === l), `${id}/${l}`).toBe(true);
    }
  });

  for (const m of MODELES) {
    it(`${m.id} (${m.langue}) : complet quand le dossier est complet`, () => {
      const r = genererCourrier({
        modele: m,
        dossier: DOSSIER,
        urls: ['https://exemple.com/contenu/1'],
        representant: 'Devuelta',
        destinataire: 'Service abuse',
        description_contenu: 'image publiée sans accord',
        date_demande_initiale: '2026-10-01T10:00:00.000Z',
        oeuvre: 'photographie prise par la personne elle-même',
        date_publication: '2026-09-30',
      });
      expect(contientMarqueur(r.objet + r.corps), `${r.objet}\n${r.corps}`).toBe(false);
      expect(r.corps.length).toBeGreaterThan(200);
    });

    it(`${m.id} (${m.langue}) : signale ce qui manque`, () => {
      const r = genererCourrier({ modele: m, dossier: { ref: 'DV-2026-0002', pays: null, publie_par_soi: null }, urls: [], representant: 'Devuelta' });
      // Un modèle qui cite la personne ou les liens doit bloquer tant qu'ils manquent.
      if (/\{\{\s*(client_nom|urls)\s*\}\}/.test(m.corps)) expect(contientMarqueur(r.corps)).toBe(true);
    });

    it(`${m.id} (${m.langue}) : aucune promesse de résultat`, () => {
      const texte = `${m.objet}\n${m.corps}`.toLowerCase();
      expect(texte).not.toMatch(/garanti|garantiz|guarantee/);
    });
  }
});

describe('référentiel', () => {
  const r = referentiel as { contact: { email: string }; nombre_fiches: number; fiches: Array<Record<string, unknown>> };
  it('contact officiel', () => {
    expect(r.contact.email).toBe(CONTACT_EMAIL);
  });
  it('nombre de fiches cohérent et identifiants uniques', () => {
    expect(r.fiches.length).toBe(r.nombre_fiches);
    expect(new Set(r.fiches.map((f) => f.id)).size).toBe(r.fiches.length);
  });
  it('chaque fiche est datée et a un statut connu', () => {
    for (const f of r.fiches) {
      expect(['verifie', 'a_approfondir', 'a_surveiller'], String(f.id)).toContain(f.statut);
      expect(String(f.date_derniere_verification), String(f.id)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('coordonnées publiques', () => {
  it('adresse e-mail unique', () => {
    expect(CONTACT_EMAIL).toBe('team.devuelta@protonmail.com');
  });
  it('une seule boîte publique « Team Devuelta », aucun prénom ni numéro de l’équipe', () => {
    expect(EMAIL).toBe('team.devuelta@protonmail.com');
    expect(NOM_CONTACT).toBe('Team Devuelta');
    const publics = JSON.stringify([
      fichier('src/config.ts'),
      fichier('src/components/Contacts.astro'),
      fichier('src/views/Contact.astro'),
      fichier('src/views/Accueil.astro'),
      fichier('src/i18n/pages.ts'),
      fichier('src/i18n/commun.ts'),
    ]);
    for (const x of ['41768232468', '41783169306', '233592151139', 'wa.me', 'Paola', 'Michael', 'Steven']) expect(publics).not.toContain(x);
  });
});

// Garde-fous des contenus publiés (guides et articles, y compris ceux ajoutés
// automatiquement chaque semaine) : un contenu non conforme bloque la mise en ligne.
import guidesData from '../shared/guides.json';
import { SITUATIONS_REELLES } from '../shared/vocab';

const INTERDITS = /garanti|guarantee|garantiz|conseil juridique|asesoramiento jur[ií]dico|legal advice/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('guides publiés', () => {
  const g = (guidesData as { fiches: Array<Record<string, any>> }).fiches;
  it('14 guides au moins, identifiants et adresses uniques', () => {
    expect(g.length).toBeGreaterThanOrEqual(14);
    for (const l of LANGS) {
      const slugs = g.map((x) => x.slug[l]);
      expect(new Set(slugs).size).toBe(slugs.length);
      slugs.forEach((s: string) => expect(s).toMatch(SLUG));
    }
  });
  it('aucune promesse ni « conseil juridique » dans les textes', () => {
    for (const x of g) {
      const texte = JSON.stringify({ ...x, source_officielle: null, liens_utiles: null });
      expect(texte, x.id).not.toMatch(INTERDITS);
    }
  });
});

describe('articles publiés', () => {
  const fichiers = import.meta.glob('../shared/articles/*.json', { eager: true, import: 'default' }) as Record<
    string,
    Record<string, any>
  >;
  const a = Object.values(fichiers);
  const idsGuides = new Set((guidesData as { fiches: Array<{ id: string }> }).fiches.map((x) => x.id));
  it('un fichier par article, nommé <id>.json, identifiants et adresses uniques', () => {
    for (const [chemin, x] of Object.entries(fichiers)) expect(chemin.endsWith(`/${x.id}.json`), chemin).toBe(true);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    for (const l of LANGS) {
      const slugs = a.map((x) => x.slug[l]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
  for (const x of a) {
    it(`${x.id} : complet, sourcé, conforme`, () => {
      expect(SITUATIONS_REELLES).toContain(x.situation);
      expect(x.publie_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(x.verifie_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const l of LANGS) {
        expect(x.slug[l]).toMatch(SLUG);
        expect(x.titre[l].length).toBeLessThanOrEqual(70);
        expect(x.meta_description[l].length).toBeLessThanOrEqual(160);
        expect(x.chapo[l].length).toBeGreaterThan(40);
        // « L'essentiel en 30 secondes » : 3 ou 4 gestes courts, lisibles par tous.
        expect(Array.isArray(x.essentiel?.[l]), `essentiel.${l}`).toBe(true);
        expect(x.essentiel[l].length).toBeGreaterThanOrEqual(3);
        expect(x.essentiel[l].length).toBeLessThanOrEqual(4);
        for (const e of x.essentiel[l]) {
          expect(e.length).toBeGreaterThan(15);
          expect(e.length).toBeLessThanOrEqual(160);
        }
        expect(x.si_rien_ne_marche[l].length).toBeGreaterThan(20);
        for (const s of x.sections) {
          expect(s.titre[l].length).toBeGreaterThan(3);
          expect(s.paragraphes[l].length).toBeGreaterThan(0);
        }
      }
      expect(x.sections.length).toBeGreaterThanOrEqual(3);
      expect(x.sources.length).toBeGreaterThanOrEqual(2);
      x.sources.forEach((s: { url: string }) => expect(s.url).toMatch(/^https:\/\//));
      for (const li of x.liens_internes) {
        if (li.type === 'guide') expect(idsGuides.has(li.id), li.id).toBe(true);
        else expect(SITUATIONS_REELLES).toContain(li.id);
      }
      const sansAppel = JSON.stringify({ ...x, si_rien_ne_marche: null, sources: null });
      expect(sansAppel).not.toMatch(INTERDITS);
      expect(sansAppel).not.toMatch(/Devuelta/);
      expect(JSON.stringify(x.si_rien_ne_marche)).not.toMatch(INTERDITS);
    });

    // Compréhensible par tous, dans chaque langue : un article trop long ou trop
    // compliqué bloque la mise en ligne (règles de docs/redaction-articles.md).
    it(`${x.id} : lisible par tous (FR, ES, EN)`, () => {
      for (const l of LANGS) {
        const l2 = lisibilite(x, l);
        expect(l2.mots, `${l} : ${l2.mots} mots`).toBeGreaterThanOrEqual(600);
        expect(l2.mots, `${l} : ${l2.mots} mots`).toBeLessThanOrEqual(l === 'es' ? 1200 : 1100);
        expect(l2.tropLongues, `${l} : phrases de plus de 25 mots → ${l2.tropLongues.join(' | ')}`).toEqual([]);
        expect(l2.partLongues, `${l} : ${Math.round(l2.partLongues * 100)} % de phrases de plus de 20 mots`).toBeLessThanOrEqual(0.15);
      }
    });

    // Chaque article a son kit Instagram / TikTok, qui renvoie vers le site.
    it(`${x.id} : kit réseaux sociaux (docs/reseaux/${x.id}.md)`, () => {
      const kit = fichier(`docs/reseaux/${x.id}.md`);
      for (const titre of ['## FR', '## ES', '## EN']) expect(kit).toContain(titre);
      expect(kit).toContain('getdevuelta.com');
      expect(kit).not.toMatch(INTERDITS);
    });
  }
});

function lisibilite(x: Record<string, any>, l: string) {
  const blocs: string[] = [x.chapo[l], ...x.essentiel[l], x.si_rien_ne_marche[l]];
  for (const s of x.sections) {
    blocs.push(...s.paragraphes[l]);
    if (s.etapes) blocs.push(...s.etapes[l]);
  }
  const mots = (t: string) => t.match(/[0-9A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+(?:[’'-][0-9A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+)*/g) ?? [];
  const phrases = blocs.flatMap((b) => b.split(/(?<=[.!?…])\s+/)).filter((p) => /\w/.test(p));
  const titres: string[] = x.sections.map((s: Record<string, any>) => s.titre[l]);
  const longueurs = phrases.map((p) => mots(p).length);
  return {
    mots: [...blocs, ...titres].reduce((n, b) => n + mots(b).length, 0),
    tropLongues: phrases.filter((p) => mots(p).length > 25).map((p) => p.slice(0, 60)),
    partLongues: longueurs.filter((n) => n > 20).length / Math.max(1, longueurs.length),
  };
}
