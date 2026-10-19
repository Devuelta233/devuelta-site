// Recours pays par pays : fiches internes (shared/referentiel.json), guides publiés
// (shared/guides.json), pages /recours/ et diagnostic. Règle : une fiche « verifie »
// = un guide publié dans les trois langues ; une fiche à approfondir ou à surveiller
// n'est jamais publiée. Un recours non vérifié ne doit jamais atteindre le site.

import { describe, expect, it } from 'vitest';
import guidesData from '../shared/guides.json';
import referentiel from '../shared/referentiel.json';
import { LANGS, PAYS, SITUATIONS_REELLES, isPays, type Situation } from '../shared/vocab';
import { guidePath } from '../src/i18n/routes';
import { toutesLesRoutes } from '../src/routes-table';
import { recoursDuDiagnostic, type GuideD } from '../src/scripts/Diagnostic';

type Fiche = Record<string, any>;
const fiches = (referentiel as { fiches: Fiche[] }).fiches;
const guides = (guidesData as { fiches: Fiche[] }).fiches;
const ficheParId = new Map(fiches.map((f) => [f.id, f]));

const CATEGORIES = ['contenu-intime', 'deepfake', 'usurpation', 'diffamation', 'donnees-personnelles', 'droit-auteur', 'piratage-compte', 'transversal'];
const ZONES = ['UE', 'INTL'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe('référentiel : champs obligatoires de chaque fiche', () => {
  for (const f of fiches) {
    it(`${f.id} : limites connues, rôle, urgence, catégorie, pays`, () => {
      expect(typeof f.limites_connues, 'limites_connues').toBe('string');
      expect(f.limites_connues.trim().length, 'limites_connues vide').toBeGreaterThan(20);
      expect(['traitement', 'orientation_uniquement']).toContain(f.role_devuelta);
      expect(['normal', 'prioritaire', 'mineur-immediat']).toContain(f.niveau_urgence);
      expect(CATEGORIES).toContain(f.categorie);
      expect(isPays(f.code_pays) || ZONES.includes(f.code_pays), String(f.code_pays)).toBe(true);
      expect(String(f.date_derniere_verification)).toMatch(DATE);
      // Tout ce qui concerne les mineurs : orientation seulement, jamais de dossier.
      if (f.public_cible === 'mineur' || f.niveau_urgence === 'mineur-immediat') expect(f.role_devuelta).toBe('orientation_uniquement');
      // Une fiche vérifiée cite une source officielle en ligne.
      if (f.statut === 'verifie') expect(String(f.source_url)).toMatch(/https:\/\//);
    });
  }
});

describe('référentiel et guides publiés', () => {
  it('chaque fiche vérifiée a son guide publié, et seulement elles', () => {
    const verifiees = fiches.filter((f) => f.statut === 'verifie').map((f) => f.id).sort();
    expect(guides.map((g) => g.id).sort()).toEqual(verifiees);
  });

  for (const g of guides) {
    it(`${g.id} : même date, même pays et même règle pour les mineurs que sa fiche`, () => {
      const f = ficheParId.get(g.id);
      expect(f, g.id).toBeDefined();
      expect(g.verifie_le).toBe(f!.date_derniere_verification);
      expect(g.pays).toContain(f!.code_pays);
      if (g.public_mineurs) expect(f!.role_devuelta).toBe('orientation_uniquement');
    });

    it(`${g.id} : complet dans les trois langues, liens officiels en https`, () => {
      expect(g.situations.length).toBeGreaterThan(0);
      for (const s of g.situations) expect(SITUATIONS_REELLES).toContain(s);
      for (const p of g.pays) expect(isPays(p) || ZONES.includes(p), p).toBe(true);
      expect(g.source_officielle.url).toMatch(/^https:\/\//);
      for (const l of g.liens_utiles) expect(l.url).toMatch(/^https:\/\//);
      expect(g.etapes.fr.length).toBeGreaterThanOrEqual(3);
      expect(g.etapes.fr.length).toBeLessThanOrEqual(8);
      expect(g.limites.fr.length).toBeGreaterThanOrEqual(2);
      for (const l of LANGS) {
        expect(g.titre[l].length, `titre ${l}`).toBeLessThanOrEqual(70);
        expect(g.meta_description[l].length, `meta ${l}`).toBeLessThanOrEqual(160);
        for (const k of ['resume', 'pour_qui', 'delai', 'cout', 'base_legale']) expect(g[k][l].trim().length, `${k} ${l}`).toBeGreaterThan(2);
        for (const k of ['etapes', 'limites', 'a_preparer']) expect(g[k][l].length, `${k} ${l}`).toBe(g[k].fr.length);
        for (const li of g.liens_utiles) expect(li.titre[l].trim().length).toBeGreaterThan(3);
        if (g.attention) expect(g.attention[l].trim().length).toBeGreaterThan(10);
      }
    });
  }
});

describe('pages /recours/ : trois langues reliées entre elles (hreflang, plan du site)', () => {
  const routes = toutesLesRoutes();
  for (const g of guides) {
    it(g.id, () => {
      const groupe = routes.filter((r) => r.groupe === `guide:${g.id}`);
      expect(groupe).toHaveLength(3);
      for (const l of LANGS) {
        const r = groupe.find((x) => x.props.lang === l);
        expect(r?.chemin).toBe(guidePath(g.slug[l], l));
        expect(r?.maj).toBe(g.verifie_le);
      }
    });
  }
});

describe('diagnostic : chaque pays visé voit ses propres recours', () => {
  const versDiagnostic = (lang: (typeof LANGS)[number]): GuideD[] =>
    guides.map((g) => ({
      titre: g.titre[lang],
      resume: g.resume[lang],
      href: guidePath(g.slug[lang], lang),
      situations: g.situations,
      pays: g.pays,
      mineurs: g.public_mineurs,
    }));
  const idParHref = new Map(guides.flatMap((g) => LANGS.map((l) => [guidePath(g.slug[l], l), g.id] as [string, string])));

  it('Ghana, Royaume-Uni, Canada, Mexique et Colombie sont proposés', () => {
    for (const p of ['GH', 'GB', 'CA', 'MX', 'CO']) expect(PAYS as readonly string[]).toContain(p);
  });

  const CAS: Array<[string, Situation, string[]]> = [
    ['GH', 'contenu-intime', ['gh-intime-sextorsion-csa']],
    ['GH', 'chantage', ['gh-intime-sextorsion-csa']],
    ['GH', 'deepfake', ['gh-intime-sextorsion-csa']],
    ['GB', 'contenu-intime', ['gb-intime-sexual-offences-act']],
    ['GB', 'deepfake', ['gb-intime-sexual-offences-act']],
    ['CA', 'contenu-intime', ['ca-code-criminel-162-1', 'ca-bc-iipa-crt', 'ca-qc-ordonnance-images-intimes']],
    ['CA', 'deepfake', ['ca-code-criminel-162-1', 'ca-bc-iipa-crt', 'ca-qc-ordonnance-images-intimes']],
    ['CA', 'chantage', ['ca-code-criminel-162-1', 'ca-bc-iipa-crt', 'ca-qc-ordonnance-images-intimes']],
    ['MX', 'contenu-intime', ['mx-ley-olimpia']],
    ['MX', 'deepfake', ['mx-ley-olimpia']],
    ['CO', 'contenu-intime', ['co-contenido-intimo-tutela']],
    ['CO', 'chantage', ['co-contenido-intimo-tutela']],
    ['CO', 'usurpation', ['co-suplantacion-ia-ley-2502']],
    ['CO', 'deepfake', ['co-suplantacion-ia-ley-2502']],
  ];
  for (const [pays, situation, attendus] of CAS) {
    it(`${pays} / ${situation}`, () => {
      for (const lang of LANGS) {
        const liste = recoursDuDiagnostic(versDiagnostic(lang), situation, pays);
        const ids = liste.map((g) => idParHref.get(g.href));
        expect(ids).toEqual(expect.arrayContaining(attendus));
        // Jamais le recours d'un autre pays, ni une fiche pour mineurs.
        for (const g of liste) {
          expect(g.pays.includes(pays) || g.pays.includes('INTL'), `${g.href} pour ${pays}`).toBe(true);
          expect(g.mineurs).toBe(false);
        }
      }
    });
  }

  it('Nigeria : fiche interne à approfondir, jamais publiée ; seuls les recours internationaux', () => {
    const ng = fiches.filter((f) => f.code_pays === 'NG');
    expect(ng.length).toBeGreaterThan(0);
    for (const f of ng) expect(f.statut).not.toBe('verifie');
    expect(guides.some((g) => g.pays.includes('NG'))).toBe(false);
    for (const g of recoursDuDiagnostic(versDiagnostic('en'), 'contenu-intime', 'NG')) expect(g.pays).toContain('INTL');
  });

  it('logique inchangée pour les pays déjà couverts (France, Espagne)', () => {
    const fr = recoursDuDiagnostic(versDiagnostic('fr'), 'contenu-intime', 'FR').map((g) => idParHref.get(g.href));
    expect(fr).toEqual(expect.arrayContaining(['fr-adulte-intime-cnil-pharos', 'ue-dsa-notification-art16', 'intl-stopncii']));
    expect(fr).not.toContain('es-adulte-intime-aepd');
    expect(fr).not.toContain('es-mineur-canal-joven');
  });
});
