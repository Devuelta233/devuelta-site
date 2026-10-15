// Référentiel des recours : la même source (shared/referentiel.json) que le site public.
// Lecture seule ici ; une correction se fait dans le fichier, puis mise en ligne.

import { useEffect, useRef, useState } from 'preact/hooks';
import { typo } from '../../../shared/typo';
import { get } from '../api';
import { date, indexLangue, t, tr } from '../i18n';
import { Chargement, LienExterne, MessageErreur, Pastille, useCharger, valeur } from '../ui';

interface Fiche {
  id: string;
  pays: string;
  code_pays: string;
  categorie: string;
  statut: string;
  a_reverifier: boolean;
  [k: string]: unknown;
}

export const CATEGORIES: Record<string, [string, string, string]> = {
  'contenu-intime': ['Contenu intime', 'Contenido íntimo', 'Intimate content'],
  deepfake: ['Deepfake', 'Deepfake', 'Deepfake'],
  usurpation: ['Usurpation / faux profil', 'Suplantación / perfil falso', 'Impersonation / fake profile'],
  diffamation: ['Diffamation', 'Difamación', 'Defamation'],
  'donnees-personnelles': ['Données personnelles', 'Datos personales', 'Personal data'],
  'droit-auteur': ['Droit d’auteur', 'Derechos de autor', 'Copyright'],
  'piratage-compte': ['Compte piraté', 'Cuenta hackeada', 'Hacked account'],
  transversal: ['Transversal', 'Transversal', 'Cross-cutting'],
};

export const STATUTS: Record<string, { ton: 'ok' | 'info' | 'alerte'; l: [string, string, string] }> = {
  verifie: { ton: 'ok', l: ['Vérifié', 'Verificado', 'Verified'] },
  a_approfondir: { ton: 'info', l: ['À approfondir', 'Por profundizar', 'Needs more work'] },
  a_surveiller: { ton: 'alerte', l: ['À surveiller', 'A vigilar', 'To watch'] },
};

// Champs affichés, dans l'ordre utile pour agir.
const CHAMPS: Array<[string, [string, string, string]]> = [
  ['action_immediate', ['Action immédiate', 'Acción inmediata', 'Immediate action']],
  ['delai_couperet', ['Délai couperet', 'Plazo límite', 'Hard deadline']],
  ['role_devuelta', ['Rôle de Devuelta', 'Papel de Devuelta', 'Devuelta’s role']],
  ['autorite_ou_plateforme', ['Autorité ou plateforme', 'Autoridad o plataforma', 'Authority or platform']],
  ['base_legale', ['Base légale', 'Base legal', 'Legal basis']],
  ['procedure_resume', ['Procédure', 'Procedimiento', 'Procedure']],
  ['pieces_requises', ['Pièces requises', 'Documentos necesarios', 'Required documents']],
  ['delai_constate', ['Délai constaté', 'Plazo observado', 'Observed timeframe']],
  ['cout', ['Coût', 'Coste', 'Cost']],
  ['constat_terrain', ['Constat terrain', 'Observación práctica', 'Field notes']],
  ['taux_efficacite_connu', ['Efficacité connue', 'Eficacia conocida', 'Known effectiveness']],
  ['limites_connues', ['Limites', 'Límites', 'Limits']],
  ['sanction_non_conformite', ['Sanction en cas de non-respect', 'Sanción por incumplimiento', 'Penalty for non-compliance']],
  ['public_cible', ['Public', 'Público', 'Audience']],
  ['bascule_mineur', ['Si mineur', 'Si es menor', 'If a minor']],
  ['partenaire_ong_associe', ['Partenaire / association', 'Socio / asociación', 'Partner / NGO']],
  ['plateformes_partenaires', ['Plateformes partenaires', 'Plataformas asociadas', 'Partner platforms']],
  ['module_courrier_associe', ['Modèle de courrier', 'Plantilla de carta', 'Letter template']],
];

function Valeur({ v }: { v: unknown }) {
  if (v === true) return <>{tr('Oui — passer par les canaux officiels pour mineurs, jamais en payant.', 'Sí — usar los canales oficiales para menores, nunca de pago.', 'Yes — use official channels for minors, never paid.')}</>;
  if (v === false) return <>{t('non')}</>;
  if (Array.isArray(v)) {
    return (
      <ul>
        {v.map((x) => (
          <li>{typo(String(x))}</li>
        ))}
      </ul>
    );
  }
  return <>{typo(String(v))}</>;
}

function Source({ url }: { url: unknown }) {
  const s = String(url ?? '');
  const m = s.match(/https?:\/\/[^\s)]+/);
  if (!m) return <span>{s || '—'}</span>;
  const reste = s.replace(m[0], '').replace(/^\s*[—-]\s*/, '').trim();
  return (
    <span>
      <LienExterne href={m[0]}>{m[0]}</LienExterne>
      {reste ? ` — ${reste}` : ''}
    </span>
  );
}

function CarteFiche({ f, cible }: { f: Fiche; cible: boolean }) {
  const [ouvert, setOuvert] = useState(cible);
  const zone = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (cible) zone.current?.scrollIntoView({ block: 'start' });
  }, [cible]);
  const s = STATUTS[f.statut];
  const idx = indexLangue();
  const cat = CATEGORIES[f.categorie]?.[idx] ?? f.categorie;
  return (
    <li class="o-carte" ref={zone}>
      <button type="button" class="o-carte-tete" aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
        <span>
          <strong>{f.pays}</strong> · {cat}
          <span class="o-muet o-mono"> · {f.id}</span>
        </span>
        <span class="o-pastilles">
          {s && <Pastille ton={s.ton}>{s.l[idx]}</Pastille>}
          {f.niveau_urgence === 'prioritaire' && <Pastille ton="fort">{tr('Prioritaire', 'Prioritaria', 'Priority')}</Pastille>}
          {f.a_reverifier && <Pastille ton="alerte">{t('aReverifier')}</Pastille>}
        </span>
      </button>
      {ouvert && (
        <div class="o-carte-corps">
          <dl class="o-dl">
            {CHAMPS.filter(([k]) => f[k] !== undefined && f[k] !== null && f[k] !== '').map(([k, l]) => (
              <>
                <dt>{l[idx]}</dt>
                <dd class={k === 'delai_couperet' || k === 'action_immediate' ? 'o-fort' : ''}>
                  <Valeur v={f[k]} />
                </dd>
              </>
            ))}
            <dt>{tr('Source officielle', 'Fuente oficial', 'Official source')}</dt>
            <dd class="o-url">
              <Source url={f.source_url} />
            </dd>
            <dt>{tr('Dernière vérification', 'Última verificación', 'Last checked')}</dt>
            <dd>{date(String(f.date_derniere_verification ?? ''))}</dd>
          </dl>
        </div>
      )}
    </li>
  );
}

export function Referentiel({ ouvert }: { ouvert?: string }) {
  const { donnees, err, enCours } = useCharger(() => get<{ fiches: Fiche[] }>('/referentiel'));
  const [categorie, setCategorie] = useState('');
  const [q, setQ] = useState('');
  if (enCours && !donnees) return <Chargement />;
  if (!donnees) return <MessageErreur texte={err} />;
  const idx = indexLangue();
  const cats = [...new Set(donnees.fiches.map((f) => f.categorie))];
  const recherche = q.trim().toLowerCase();
  const fiches = donnees.fiches.filter(
    (f) => (!categorie || f.categorie === categorie) && (!recherche || JSON.stringify(f).toLowerCase().includes(recherche)),
  );
  const nbVieilles = donnees.fiches.filter((f) => f.a_reverifier).length;
  return (
    <div>
      <h1>{t('mReferentiel')}</h1>
      <p class="o-muet">{t('refIntro')}</p>
      <p class="o-encadre o-info">
        {tr(
          'Base de travail interne, pas un conseil juridique. Avant d’utiliser un délai couperet, relisez la source officielle.',
          'Base de trabajo interna, no es asesoramiento jurídico. Antes de usar un plazo límite, revisa la fuente oficial.',
          'Internal working base, not legal advice. Before relying on a hard deadline, re-read the official source.',
        )}
        {nbVieilles > 0 && (
          <>
            {' '}
            <strong>
              {nbVieilles} {t('aReverifier').toLowerCase()}.
            </strong>
          </>
        )}
      </p>
      <div class="o-filtres">
        <button class={`o-filtre ${categorie === '' ? 'o-actif' : ''}`} onClick={() => setCategorie('')}>
          {t('tous')}
        </button>
        {cats.map((c) => (
          <button class={`o-filtre ${categorie === c ? 'o-actif' : ''}`} onClick={() => setCategorie(c)}>
            {CATEGORIES[c]?.[idx] ?? c}
          </button>
        ))}
      </div>
      <div class="o-recherche">
        <input type="search" placeholder={t('rechercher')} value={q} onInput={(e) => setQ(valeur(e))} />
      </div>
      <ul class="o-liste-cartes">
        {fiches.map((f) => (
          <CarteFiche f={f} cible={f.id === ouvert} />
        ))}
      </ul>
      <p class="o-muet">
        {tr('Version publique :', 'Versión pública:', 'Public version:')}{' '}
        <a href="/referentiel.json" target="_blank" rel="noopener">
          /referentiel.json
        </a>
      </p>
    </div>
  );
}
