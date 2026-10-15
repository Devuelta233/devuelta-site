// Diagnostic guidé : 4 à 6 questions, un plan d'action personnalisé.
// Tout se passe dans le navigateur. Rien n'est envoyé, sauf un compteur
// anonyme « diagnostic terminé » (sans aucune réponse).

import { useEffect, useRef, useState } from 'preact/hooks';
import { PAYS, PAYS_LABEL, PAYS_UE, SITUATIONS, SITUATION_LABEL, type Lang, type Situation } from '../../shared/vocab';
import { TEXTES_DIAGNOSTIC } from './diagnostic-textes';
import { compter } from './compteur';

export interface ActionD {
  situation: string;
  titre: string;
  etapes: string[];
  url: string;
  connexion_requise?: boolean;
}
export interface PlateformeD {
  id: string;
  nom: string;
  type: string;
  actions: ActionD[];
}
export interface GuideD {
  titre: string;
  resume: string;
  href: string;
  situations: string[];
  pays: string[];
  mineurs: boolean;
}
export interface RessourceD {
  type: string;
  nom: string;
  telephone?: string | null;
  url?: string | null;
  description: string;
  gratuit?: boolean | null;
  horaires?: string | null;
}
export interface PaysD {
  code: string;
  nom: string;
  ressources: RessourceD[];
}
export interface DonneesDiagnostic {
  lang: Lang;
  plateformes: PlateformeD[];
  guides: GuideD[];
  pays: PaysD[];
  international: RessourceD[];
  liens: { confier: string; urgence: string; situations: Record<string, string>; whatsapp: string };
  verifieLe: string;
}

type Reponses = {
  situation?: Situation;
  mineur?: 'oui' | 'non' | 'nsp';
  menace?: 'oui' | 'non';
  lieu?: string;
  pays?: string;
  publie?: 'oui' | 'non' | 'nr';
};

const AVEC_PUBLIE: Situation[] = ['contenu-intime', 'donnees-personnelles'];
const INTIMES: Situation[] = ['contenu-intime', 'deepfake', 'chantage'];
const MOTEUR: Partial<Record<Situation, Situation[]>> = {
  'contenu-intime': ['contenu-intime'],
  deepfake: ['deepfake', 'contenu-intime'],
  chantage: ['contenu-intime'],
  'donnees-personnelles': ['donnees-personnelles'],
  diffamation: ['diffamation'],
  usurpation: ['donnees-personnelles'],
};

function Lien({ href, children, classe }: { href: string; children: preact.ComponentChildren; classe?: string }) {
  const externe = /^https?:\/\//.test(href);
  return (
    <a class={classe} href={href} {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

function Ressource({ r, t }: { r: RessourceD; t: (typeof TEXTES_DIAGNOSTIC)['fr'] }) {
  return (
    <div class="ressource">
      <h4>{r.nom}</h4>
      {r.telephone && (
        <p>
          <a class="tel" href={`tel:${r.telephone.replace(/[^\d+]/g, '')}`}>
            {r.telephone}
          </a>
          {r.gratuit ? ` · ${t.gratuit}` : ''}
          {r.horaires ? ` · ${r.horaires}` : ''}
        </p>
      )}
      <p>{r.description}</p>
      {r.url && (
        <p>
          <Lien href={r.url}>{new URL(r.url).hostname.replace(/^www\./, '')}</Lien>
        </p>
      )}
    </div>
  );
}

function ActionBloc({ a, nom, t }: { a: ActionD; nom: string; t: (typeof TEXTES_DIAGNOSTIC)['fr'] }) {
  return (
    <div class="carte">
      <span class="carte-titre">
        {nom} — {a.titre}
      </span>
      <ol class="etapes">
        {a.etapes.map((e) => (
          <li>{e}</li>
        ))}
      </ol>
      <Lien href={a.url} classe="bouton principal">
        {t.ouvrir}
        <small>{new URL(a.url).hostname.replace(/^www\./, '')}</small>
      </Lien>
      {a.connexion_requise && <span class="carte-meta">{t.connexion}</span>}
    </div>
  );
}

export function Diagnostic({ d }: { d: DonneesDiagnostic }) {
  const t = TEXTES_DIAGNOSTIC[d.lang];
  const [r, setR] = useState<Reponses>({});
  const [etape, setEtape] = useState(0);
  const [alerte, setAlerte] = useState(false);
  const titre = useRef<HTMLHeadingElement>(null);

  const questions = ['situation', 'mineur', 'menace', 'lieu', 'pays', ...(r.situation && AVEC_PUBLIE.includes(r.situation) ? ['publie'] : [])];
  const fini = etape >= questions.length || r.mineur === 'oui';
  const total = questions.length;

  useEffect(() => {
    titre.current?.focus();
    if (fini) compter('diagnostic');
  }, [etape, fini]);

  const choisir = (cle: keyof Reponses, valeur: string) => {
    setR({ ...r, [cle]: valeur });
    setAlerte(false);
  };
  const suivant = () => {
    const cle = questions[etape] as keyof Reponses;
    if (!r[cle]) {
      setAlerte(true);
      return;
    }
    setEtape(etape + 1);
  };
  const retour = () => {
    setAlerte(false);
    setEtape(Math.max(0, etape - 1));
  };
  const recommencer = () => {
    setR({});
    setEtape(0);
  };

  if (!fini) {
    const q = questions[etape];
    const options: Array<[string, string]> =
      q === 'situation'
        ? SITUATIONS.map((s) => [s, SITUATION_LABEL[s][d.lang]])
        : q === 'mineur'
          ? [
              ['non', t.non],
              ['oui', t.oui],
              ['nsp', t.nsp],
            ]
          : q === 'menace'
            ? [
                ['non', t.non],
                ['oui', t.oui],
              ]
            : q === 'lieu'
              ? [
                  ...d.plateformes.filter((p) => !['outil', 'moteur'].includes(p.type)).map((p) => [p.id, p.nom] as [string, string]),
                  ['google', t.ailleursGoogle],
                  ['autre-site', t.ailleursSite],
                  ['inconnu', t.ailleursInconnu],
                ]
              : q === 'pays'
                ? PAYS.map((p) => [p, PAYS_LABEL[p][d.lang]])
                : [
                    ['oui', t.oui],
                    ['non', t.non],
                    ['nr', t.pasRepondre],
                  ];
    const libelle = { situation: t.q1, mineur: t.q2, menace: t.q3, lieu: t.q4, pays: t.q5, publie: t.q6 }[q] ?? '';
    const aide = q === 'mineur' ? t.q2aide : q === 'publie' ? t.q6aide : null;
    const valeur = r[q as keyof Reponses];
    const largeur = Math.round(((etape + 1) / total) * 100);
    return (
      <div class="diag">
        <div class="diag-progres" aria-hidden="true">
          <span style={`width:${largeur}%`} />
        </div>
        <p class="petit">{t.etape.replace('{n}', String(etape + 1)).replace('{t}', String(total))}</p>
        <fieldset>
          <legend>
            <h2 class="sans-marge diag-question" tabIndex={-1} ref={titre}>
              {libelle}
            </h2>
            {aide && <span class="aide">{aide}</span>}
          </legend>
          <div class={`choix ${options.length > 6 ? 'choix-grille' : ''}`}>
            {options.map(([v, l]) => (
              <label>
                <input type="radio" name={q} value={v} checked={valeur === v} onChange={() => choisir(q as keyof Reponses, v)} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {alerte && (
          <p class="erreur" role="alert">
            {t.choisir}
          </p>
        )}
        <div class="diag-nav">
          {etape > 0 && (
            <button type="button" class="bouton" onClick={retour}>
              ← {t.retour}
            </button>
          )}
          <button type="button" class="bouton principal" onClick={suivant}>
            {t.suivant} →
          </button>
        </div>
        <p class="petit">🔒 {t.rienEnvoye}</p>
      </div>
    );
  }

  // Résultat -----------------------------------------------------------------
  const pays = d.pays.find((p) => p.code === r.pays);
  const enUE = !!r.pays && PAYS_UE.includes(r.pays);

  if (r.mineur === 'oui') {
    const outilMineur = d.plateformes.find((p) => p.id === 'takeitdown')?.actions[0];
    const aides = (pays?.ressources ?? []).filter((x) => ['mineurs', 'urgence', 'cyberharcelement', 'signalement-contenu'].includes(x.type));
    return (
      <div class="diag">
        <h2 class="sans-marge" tabIndex={-1} ref={titre}>
          {t.mineurTitre}
        </h2>
        <p class="lede">{t.mineurIntro}</p>
        {outilMineur && <ActionBloc a={outilMineur} nom="Take It Down (NCMEC)" t={t} />}
        {aides.length > 0 && (
          <section>
            <h3>{t.aideLocale}</h3>
            {aides.map((x) => (
              <Ressource r={x} t={t} />
            ))}
          </section>
        )}
        <p>
          <a href={d.liens.urgence}>{t.toutesAides} →</a>
        </p>
        <p class="petit">{t.mineurNote}</p>
        <div class="diag-nav">
          <button type="button" class="bouton" onClick={recommencer}>
            {t.recommencer}
          </button>
        </div>
      </div>
    );
  }

  const situation = r.situation ?? 'autre';
  const plateforme = d.plateformes.find((p) => p.id === r.lieu);
  const actionSource =
    plateforme?.actions.find((a) => a.situation === situation) ??
    (situation === 'deepfake' ? plateforme?.actions.find((a) => a.situation === 'contenu-intime') : undefined) ??
    (situation === 'chantage' ? plateforme?.actions.find((a) => a.situation === 'contenu-intime') : undefined);
  const google = d.plateformes.find((p) => p.id === 'google');
  const actionsGoogle = (MOTEUR[situation as Situation] ?? [])
    .map((s) => google?.actions.find((a) => a.situation === s))
    .filter((a): a is ActionD => !!a)
    .slice(0, 1);
  const stopncii = d.plateformes.find((p) => p.id === 'stopncii')?.actions[0];
  const recours = d.guides.filter(
    (g) =>
      !g.mineurs &&
      (situation === 'autre' || g.situations.includes(situation) || (situation === 'chantage' && g.situations.includes('contenu-intime'))) &&
      (g.pays.includes(r.pays ?? '') || g.pays.includes('INTL') || (enUE && g.pays.includes('UE'))),
  );
  const aidesUrgentes = (pays?.ressources ?? []).filter((x) => ['urgence', 'ncii', 'cyberharcelement', 'police-en-ligne', 'signalement-contenu'].includes(x.type));
  const lienSituation = d.liens.situations[situation];
  let n = 0;

  const confier = () => {
    try {
      sessionStorage.setItem(
        'dv-diag',
        JSON.stringify({ situation, pays: r.pays, plateforme: r.lieu, menace: r.menace === 'oui', publie: r.publie }),
      );
    } catch {
      /* stockage indisponible : le formulaire restera vide */
    }
  };

  return (
    <div class="diag">
      <h2 class="sans-marge" tabIndex={-1} ref={titre}>
        {t.resultat}
      </h2>
      <p class="lede">{t.resultatIntro}</p>

      {(r.menace === 'oui' || situation === 'chantage') && (
        <section class="encadre alerte">
          <h3 class="sans-marge">{t.securiteTitre}</h3>
          <p>{t.securiteIntro}</p>
          {aidesUrgentes.map((x) => (
            <Ressource r={x} t={t} />
          ))}
          <p>
            <a href={d.liens.urgence}>{t.toutesAides} →</a>
          </p>
        </section>
      )}

      {r.publie === 'oui' && (
        <div class="encadre">
          <p>{t.publieOui}</p>
        </div>
      )}

      <section>
        <h3>
          {++n}. {t.source}
        </h3>
        {actionSource && plateforme ? (
          <ActionBloc a={actionSource} nom={plateforme.nom} t={t} />
        ) : r.lieu === 'google' && actionsGoogle[0] ? (
          <ActionBloc a={actionsGoogle[0]} nom="Google" t={t} />
        ) : r.lieu === 'autre-site' ? (
          <p>{t.sourceAutre}</p>
        ) : (
          <p>{t.sourceInconnu}</p>
        )}
        {lienSituation && (
          <p>
            <a href={lienSituation}>{t.voirSituation} →</a>
          </p>
        )}
      </section>

      {INTIMES.includes(situation as Situation) && stopncii && (
        <section>
          <h3>
            {++n}. {t.propagation}
          </h3>
          <ActionBloc a={stopncii} nom="StopNCII.org" t={t} />
        </section>
      )}

      {actionsGoogle.length > 0 && r.lieu !== 'google' && (
        <section>
          <h3>
            {++n}. {t.moteurs}
          </h3>
          <ActionBloc a={actionsGoogle[0]} nom="Google" t={t} />
        </section>
      )}

      {recours.length > 0 && (
        <section>
          <h3>
            {++n}. {t.recours}
          </h3>
          <ul class="cartes">
            {recours.map((g) => (
              <li>
                <a class="carte" href={g.href}>
                  <span class="carte-titre">{g.titre}</span>
                  <span class="carte-texte">{g.resume}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="encadre">
        <h3 class="sans-marge">{t.preuves}</h3>
        <ul class="coche">
          {t.preuvesListe.map((p) => (
            <li>{p}</li>
          ))}
        </ul>
      </section>

      <section class="encadre sombre">
        <h3 class="sans-marge">{t.siBloque}</h3>
        <p>{t.siBloqueTexte}</p>
        <div class="actions">
          <a class="bouton principal" href={d.liens.confier} onClick={confier}>
            {t.confier}
            <small>{t.confierSous}</small>
          </a>
          <a class="bouton bouton-clair" href={d.liens.whatsapp} target="_blank" rel="noopener noreferrer" data-evenement="whatsapp">
            {t.whatsapp}
          </a>
        </div>
      </section>

      <div class="diag-nav pas-imprimer">
        <button type="button" class="bouton" onClick={() => window.print()}>
          {t.imprimer}
        </button>
        <button type="button" class="bouton" onClick={recommencer}>
          {t.recommencer}
        </button>
      </div>
    </div>
  );
}
