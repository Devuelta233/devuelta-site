// Pages de confiance : « Faux sauveteurs » (signaux d'alerte décrits par la FTC,
// puis nos engagements) et « L'aide gratuite d'abord » (services officiels ou
// associatifs). Mêmes garde-fous que les articles : trois langues, aucune
// promesse, rien qui identifie l'équipe, phrases courtes, sources officielles.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AIDE_GRATUITE, FAUX_SAUVETEURS } from '../src/i18n/pages';
import { SLUGS, page, versionsPage, type PageFixe } from '../src/i18n/routes';
import { toutesLesRoutes } from '../src/routes-table';
import { LANGS, type Lang } from '../shared/vocab';

const fichier = (chemin: string) => readFileSync(new URL(`../${chemin}`, import.meta.url), 'utf-8');

const INTERDITS = /garanti|guarantee|garantiz|conseil juridique|asesoramiento jur[ií]dico|legal advice/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PAGES: PageFixe[] = ['faux-sauveteurs', 'aide-gratuite'];

// Tous les textes affichés d'une page, dans une langue.
function textes(l: Lang): Record<PageFixe & string, string[]> {
  const F = FAUX_SAUVETEURS;
  const A = AIDE_GRATUITE;
  return {
    'faux-sauveteurs': [
      F.intro[l],
      F.maintenant[l],
      ...F.ftc[l],
      ...F.signaux[l].flat(),
      F.verifier[l],
      F.engagementsIntro[l],
      ...F.engagements[l].flat(),
      F.aideGratuite[l],
    ],
    'aide-gratuite': [
      A.intro[l],
      A.mineurs[l],
      A.quand[l],
      A.fauxSauveteurs[l],
      A.renvoi[l],
      ...A.services.flatMap((s) => [s.quoi[l], s.pourQui[l], s.autres?.[l] ?? '']),
    ],
  } as Record<PageFixe & string, string[]>;
}

// Même découpage que le contrôle de lisibilité des articles (tests/contenus.test.ts).
function lisibilite(blocs: string[]) {
  const mots = (t: string) => t.match(/[0-9A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+(?:[’'-][0-9A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+)*/g) ?? [];
  const phrases = blocs.flatMap((b) => b.split(/(?<=[.!?…])\s+/)).filter((p) => /\w/.test(p));
  const longueurs = phrases.map((p) => mots(p).length);
  return {
    tropLongues: phrases.filter((p) => mots(p).length > 25).map((p) => p.slice(0, 60)),
    partLongues: longueurs.filter((n) => n > 20).length / Math.max(1, longueurs.length),
  };
}

describe('pages de confiance : adresses et versions', () => {
  const routes = toutesLesRoutes();
  for (const p of PAGES) {
    it(`${p} : une adresse par langue, en minuscules, reliées entre elles (hreflang, plan du site)`, () => {
      for (const l of LANGS) {
        expect(SLUGS[p][l]).toMatch(SLUG);
        const r = routes.find((x) => x.chemin === page(p, l));
        expect(r, `${p}/${l}`).toBeDefined();
        expect(r!.props).toEqual({ type: p, lang: l });
        expect(r!.groupe).toBe(`page:${p}`);
      }
      expect(routes.filter((x) => x.groupe === `page:${p}`)).toHaveLength(3);
      expect(versionsPage(p)).toEqual({ fr: page(p, 'fr'), es: page(p, 'es'), en: page(p, 'en') });
      expect(new Set(LANGS.map((l) => page(p, l))).size).toBe(3);
    });
  }
  it('chaque page a sa vue et des liens depuis les pages voulues', () => {
    const route = fichier('src/pages/[...route].astro');
    expect(route).toContain("p.type === 'faux-sauveteurs'");
    expect(route).toContain("p.type === 'aide-gratuite'");
    expect(fichier('src/views/Methode.astro')).toContain("page('faux-sauveteurs', lang)");
    expect(fichier('src/components/Engagements.astro')).toContain("page('faux-sauveteurs', lang)");
    expect(fichier('src/views/Contact.astro')).toContain("page('aide-gratuite', lang)");
    expect(fichier('src/views/Urgence.astro')).toContain("page('aide-gratuite', lang)");
    // Les deux pages finissent par le diagnostic gratuit, dans chaque langue.
    for (const v of ['src/views/FauxSauveteurs.astro', 'src/views/AideGratuite.astro']) {
      expect(fichier(v)).toContain("page('diagnostic', lang)");
      expect(fichier(v)).toContain('C.ctaDiagnostic[lang]');
    }
  });
});

describe('pages de confiance : contenu', () => {
  it('titres et descriptions dans les trois langues, aux bonnes longueurs', () => {
    for (const x of [FAUX_SAUVETEURS, AIDE_GRATUITE]) {
      for (const l of LANGS) {
        expect(x.seo[l].length, x.seo[l]).toBeLessThanOrEqual(60);
        expect(x.meta[l].length, x.meta[l]).toBeLessThanOrEqual(160);
        expect(x.h1[l].length).toBeGreaterThan(5);
      }
      expect(x.verifie_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('aucune promesse ni « conseil juridique », aucun prénom ni numéro de l’équipe', () => {
    const tout = JSON.stringify([FAUX_SAUVETEURS, AIDE_GRATUITE, fichier('src/views/FauxSauveteurs.astro'), fichier('src/views/AideGratuite.astro')]);
    expect(tout).not.toMatch(INTERDITS);
    for (const x of ['41768232468', '41783169306', '233592151139', 'wa.me', 'Paola', 'Michael', 'Steven']) expect(tout).not.toContain(x);
  });

  it('faux sauveteurs : accusations attribuées à la FTC, affaire en cours, communiqué officiel en source', () => {
    for (const l of LANGS) {
      expect(FAUX_SAUVETEURS.signaux[l]).toHaveLength(5);
      for (const [, detail] of FAUX_SAUVETEURS.signaux[l]) expect(detail).toMatch(/FTC/);
      expect(FAUX_SAUVETEURS.ftc[l].join(' ')).toMatch(/accusations|acusaciones|allegations/);
      expect(FAUX_SAUVETEURS.engagements[l]).toHaveLength(8);
    }
    const urls = FAUX_SAUVETEURS.sources.map((s) => s.url);
    expect(urls.some((u) => u.startsWith('https://www.ftc.gov/news-events/news/press-releases/2026/10/'))).toBe(true);
  });

  it('aide gratuite : chaque service a un site officiel en https, un public et un pays connu', () => {
    const pays = new Set(AIDE_GRATUITE.services.map((s) => s.pays));
    for (const p of ['INTL', 'FR', 'ES', 'GB', 'US', 'GH']) expect(pays.has(p as never), p).toBe(true);
    for (const s of AIDE_GRATUITE.services) {
      expect(s.url, s.nom).toMatch(/^https:\/\//);
      for (const l of LANGS) {
        expect(s.quoi[l].length, `${s.nom}/${l}`).toBeGreaterThan(20);
        expect(s.pourQui[l].length, `${s.nom}/${l}`).toBeGreaterThan(10);
      }
    }
    // Les mineurs sont orientés vers l'aide officielle gratuite, jamais vers une offre payante.
    for (const l of LANGS) expect(AIDE_GRATUITE.mineurs[l]).toMatch(/Take It Down/);
    for (const s of AIDE_GRATUITE.sources) expect(s.url).toMatch(/^https:\/\//);
  });

  // Compréhensible par tous, comme les articles (docs/redaction-articles.md) :
  // aucune phrase de plus de 25 mots, au plus 15 % de phrases de plus de 20 mots.
  for (const p of PAGES) {
    it(`${p} : lisible par tous (FR, ES, EN)`, () => {
      for (const l of LANGS) {
        const r = lisibilite(textes(l)[p].filter(Boolean));
        expect(r.tropLongues, `${l} : phrases de plus de 25 mots → ${r.tropLongues.join(' | ')}`).toEqual([]);
        expect(r.partLongues, `${l} : ${Math.round(r.partLongues * 100)} % de phrases de plus de 20 mots`).toBeLessThanOrEqual(0.15);
      }
    });
  }
});
