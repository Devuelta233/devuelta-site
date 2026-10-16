// Fiche d'un dossier : résumé, liens et plan d'action, démarches, courriers,
// notes, journal. Rien n'est envoyé par l'outil : il prépare, l'humain valide.

import { useEffect, useState } from 'preact/hooks';
import { COEF_PRO, COEF_ZONE_REDUITE, DEVIS_A_PARTIR_DE, calculerPrix, euros, nombre, zoneDuPays, type Zone } from '../../../shared/tarifs';
import { LANGS, PAYS, PAYS_LABEL, PRIORITES, SITUATIONS, SITUATION_LABEL, TYPES_ETAPE, isSituation } from '../../../shared/vocab';
import { del, get, patch, post } from '../api';
import { extraireLiens } from '../liens';
import { code, date, indexLangue, langue, t, tr } from '../i18n';
import { Champ, Chargement, Copier, LienExterne, MessageErreur, Pastille, jourInput, useAction, useCharger, valeur } from '../ui';
import { CATEGORIES, STATUTS } from './Referentiel';

interface Suggestion {
  code: string;
  modele?: string | null;
  url?: string | null;
  titre?: Record<string, string> | null;
  destinataire?: string | null;
  email?: string | null;
  condition?: string | null;
}

interface Ident {
  hote: string;
  domaine: string;
  plateforme: string | null;
  registrar: string | null;
  registrar_abuse: string | null;
  hebergeur: string | null;
  hebergeur_abuse: string | null;
  pays_reseau: string | null;
  derriere_cloudflare: boolean;
  domaine_cree_le: string | null;
  ips: string[];
  erreurs: string[];
}

interface Contenu {
  id: string;
  url: string;
  domaine: string | null;
  plateforme: string | null;
  statut: string;
  origine: string | null;
  ident: Ident | null;
  ident_le: string | null;
  verif_le: string | null;
  verif_http: number | null;
  verif_alerte: string | null;
  note: string | null;
  plan: Suggestion[];
}

interface Etape {
  id: string;
  type: string;
  destinataire: string | null;
  statut: string;
  fait_le: string | null;
  echeance: string | null;
  note: string | null;
  contenu_id: string | null;
  courrier_id: string | null;
  cree_par_nom: string | null;
}

interface Courrier {
  id: string;
  modele: string;
  langue: string;
  destinataire: string | null;
  destinataire_email: string | null;
  objet: string;
  corps: string;
  statut: string;
  automatique: number;
  contenu_id: string | null;
  cree_le: string;
  cree_par_nom: string | null;
  valide_par_nom: string | null;
  valide_le: string | null;
  envoye_par_nom: string | null;
  envoye_le: string | null;
}

interface Fiche {
  id: string;
  pays: string;
  categorie: string;
  statut: string;
  role_devuelta: string | null;
  delai_couperet: string | null;
  action_immediate: string | null;
}

interface Dossier {
  id: string;
  ref: string;
  statut: string;
  priorite: string;
  menace: number;
  langue: string;
  pays: string | null;
  situation: string;
  assigne_a: string | null;
  assigne_nom: string | null;
  client_pseudo: string;
  client_nom: string | null;
  client_email: string | null;
  client_whatsapp: string | null;
  contact_prefere: string | null;
  publie_par_soi: number | null;
  mandat_signe_le: string | null;
  identite_verifiee_le: string | null;
  consentement_recherche_le: string | null;
  resume: string | null;
  prochaine_action: string | null;
  temps_minutes: number;
  client_pro: number;
  prochaine_echeance: string | null;
  resultat: string | null;
  clos_le: string | null;
  purger_apres: string | null;
  cree_le: string;
}

interface Detail {
  dossier: Dossier;
  contenus: Contenu[];
  etapes: Etape[];
  courriers: Courrier[];
  notes: Array<{ id: string; texte: string; cree_le: string; auteur_nom: string | null }>;
  fiches: Fiche[];
  retractations: Array<{ ref: string; recue_le: string; accuse_le: string | null }>;
}

interface ModeleMeta {
  id: string;
  langue: string;
  nom: string;
  quand_utiliser: string;
  destinataire_type: string;
  pieces_jointes: string[];
  note: string;
}

const ONGLETS = ['resume', 'liens', 'demarches', 'courriers', 'notes', 'journal'] as const;
type Onglet = (typeof ONGLETS)[number];
const NOM_ONGLET: Record<Onglet, Parameters<typeof t>[0]> = {
  resume: 'ongletResume',
  liens: 'ongletLiens',
  demarches: 'ongletDemarches',
  courriers: 'ongletCourriers',
  notes: 'ongletNotes',
  journal: 'ongletJournal',
};
const FERMES = ['resolu', 'clos', 'oriente'];

export function FicheDossier({ id, onglet }: { id: string; onglet?: string }) {
  const actif: Onglet = (ONGLETS as readonly string[]).includes(onglet ?? '') ? (onglet as Onglet) : 'resume';
  const { donnees, err, enCours, recharger } = useCharger(() => get<Detail>(`/dossiers/${id}`), [id]);
  const [prefill, setPrefill] = useState<{ modele: string; contenu_id: string | null } | null>(null);
  if (enCours && !donnees) return <Chargement />;
  if (!donnees) return <MessageErreur texte={err} />;
  const d = donnees.dossier;
  const lang = langue.value;
  const ferme = FERMES.includes(d.statut);
  const nbBrouillons = donnees.courriers.filter((c) => c.statut === 'brouillon' || c.statut === 'valide').length;
  return (
    <div>
      <p>
        <a href="#/dossiers">← {t('mDossiers')}</a>
      </p>
      <h1>
        {d.ref} · {d.client_pseudo}
      </h1>
      <p class="o-pastilles">
        <Pastille>{code(d.statut)}</Pastille>
        <Pastille>{isSituation(d.situation) ? SITUATION_LABEL[d.situation][lang] : d.situation}</Pastille>
        {d.priorite !== 'normal' && <Pastille ton="fort">{code(d.priorite)}</Pastille>}
        {d.menace ? <Pastille ton="alerte">{t('menace')}</Pastille> : null}
        {!d.mandat_signe_le && <Pastille ton="alerte">{t('mandatManquant').split(':')[0]}</Pastille>}
        {d.purger_apres && (
          <Pastille ton="info">
            {t('purgeLe')} {date(d.purger_apres)}
          </Pastille>
        )}
      </p>
      {donnees.retractations.map((r) => (
        <div class="o-encadre o-alerte" role="alert">
          <p>
            <strong>
              {t('retractationRecue')} {date(r.recue_le, true)} ({r.ref}).
            </strong>{' '}
            {t('retractationStop')}
          </p>
          <p>{r.accuse_le ? `${t('accuseLe')} ${date(r.accuse_le, true)}.` : t('accuseAEnvoyer')}</p>
        </div>
      ))}
      <nav class="o-onglets">
        {ONGLETS.map((o) => (
          <a class={o === actif ? 'o-actif' : ''} href={`#/dossiers/${id}/${o}`}>
            {t(NOM_ONGLET[o])}
            {o === 'courriers' && nbBrouillons > 0 ? ` (${nbBrouillons})` : ''}
            {o === 'liens' ? ` (${donnees.contenus.length})` : ''}
          </a>
        ))}
      </nav>
      {actif === 'resume' && <OngletResume d={donnees} recharger={recharger} ferme={ferme} preparer={(p) => { setPrefill(p); window.location.hash = `/dossiers/${id}/courriers`; }} />}
      {actif === 'liens' && (
        <OngletLiens
          d={donnees}
          recharger={recharger}
          preparer={(p) => {
            setPrefill(p);
            window.location.hash = `/dossiers/${id}/courriers`;
          }}
        />
      )}
      {actif === 'demarches' && <OngletDemarches d={donnees} recharger={recharger} />}
      {actif === 'courriers' && <OngletCourriers d={donnees} recharger={recharger} prefill={prefill} />}
      {actif === 'notes' && <OngletNotes d={donnees} recharger={recharger} />}
      {actif === 'journal' && <OngletJournal id={id} />}
    </div>
  );
}

// Résumé ------------------------------------------------------------------------

function OngletResume({ d, recharger, ferme, preparer }: { d: Detail; recharger: () => void; ferme: boolean; preparer: (p: { modele: string; contenu_id: string | null }) => void }) {
  const x = d.dossier;
  const lang = langue.value;
  const equipe = useCharger(() => get<{ equipe: Array<{ id: string; nom: string }> }>('/equipe'));
  const [f, setF] = useState({ ...x });
  const [resultat, setResultat] = useState('');
  const [statutFin, setStatutFin] = useState('resolu');
  const a = useAction();
  useEffect(() => setF({ ...x }), [x]);
  const set = (k: keyof Dossier) => (e: Event) => setF({ ...f, [k]: valeur(e) });
  const sauver = () =>
    a.lancer(
      () =>
        patch(`/dossiers/${x.id}`, {
          client_pseudo: f.client_pseudo,
          client_nom: f.client_nom,
          client_email: f.client_email,
          client_whatsapp: f.client_whatsapp,
          contact_prefere: f.contact_prefere,
          langue: f.langue,
          pays: f.pays || null,
          situation: f.situation,
          priorite: f.priorite,
          menace: !!Number(f.menace),
          publie_par_soi: f.publie_par_soi === null || (f.publie_par_soi as unknown) === '' ? null : Number(f.publie_par_soi) === 1,
          mandat_signe_le: f.mandat_signe_le || null,
          identite_verifiee_le: f.identite_verifiee_le || null,
          consentement_recherche_le: f.consentement_recherche_le || null,
          resume: f.resume,
          prochaine_action: f.prochaine_action,
          temps_minutes: Math.max(0, Math.round(Number(f.temps_minutes) || 0)),
          client_pro: !!Number(f.client_pro),
          ...(f.assigne_a !== x.assigne_a ? { assigne_a: f.assigne_a || null } : {}),
          ...(!ferme && f.statut !== x.statut ? { statut: f.statut } : {}),
        }),
      recharger,
    );
  return (
    <div>
      {!x.mandat_signe_le && (
        <div class="o-encadre o-alerte">
          <p>{t('mandatManquant')}</p>
          <button class="o-bouton" onClick={() => preparer({ modele: 'mandat', contenu_id: null })}>
            {t('preparerMandat')}
          </button>
        </div>
      )}
      <TarifDossier d={d} />
      {d.fiches.some((f) => f.delai_couperet || f.action_immediate) && (
        <div class="o-encadre o-alerte">
          <strong>{t('delaiCouperet')}</strong>
          <ul>
            {d.fiches
              .filter((f) => f.delai_couperet || f.action_immediate)
              .map((f) => (
                <li>
                  <span class="o-mono">{f.id}</span> — {f.action_immediate ?? f.delai_couperet}
                </li>
              ))}
          </ul>
        </div>
      )}
      <div class="o-grille">
        <Champ label={t('pseudo')}>
          <input type="text" value={f.client_pseudo} onInput={set('client_pseudo')} />
        </Champ>
        <Champ label={t('nomLegal')}>
          <input type="text" value={f.client_nom ?? ''} onInput={set('client_nom')} />
        </Champ>
        <Champ label={t('email')}>
          <input type="email" value={f.client_email ?? ''} onInput={set('client_email')} />
        </Champ>
        <Champ label={t('whatsapp')}>
          <input type="tel" value={f.client_whatsapp ?? ''} onInput={set('client_whatsapp')} />
        </Champ>
        <Champ label={t('contactPrefere')}>
          <select value={f.contact_prefere ?? ''} onChange={set('contact_prefere')}>
            <option value="">—</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
          </select>
        </Champ>
        <Champ label={t('langueDossier')}>
          <select value={f.langue} onChange={set('langue')}>
            {LANGS.map((l) => (
              <option value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </Champ>
        <Champ label={t('situation')}>
          <select value={f.situation} onChange={set('situation')}>
            {SITUATIONS.map((s) => (
              <option value={s}>{SITUATION_LABEL[s][lang]}</option>
            ))}
          </select>
        </Champ>
        <Champ label={t('pays')}>
          <select value={f.pays ?? ''} onChange={set('pays')}>
            <option value="">—</option>
            {PAYS.map((p) => (
              <option value={p}>{PAYS_LABEL[p][lang]}</option>
            ))}
          </select>
        </Champ>
        <Champ label={t('priorite')}>
          <select value={f.priorite} onChange={set('priorite')}>
            {PRIORITES.map((p) => (
              <option value={p}>{code(p)}</option>
            ))}
          </select>
        </Champ>
        {!ferme && (
          <Champ label={t('statut')}>
            <select value={f.statut} onChange={set('statut')}>
              {['ouvert', 'en-cours', 'en-attente'].map((s) => (
                <option value={s}>{code(s)}</option>
              ))}
            </select>
          </Champ>
        )}
        <Champ label={t('assigneA')}>
          <select value={f.assigne_a ?? ''} onChange={set('assigne_a')}>
            <option value="">{t('personne')}</option>
            {equipe.donnees?.equipe.map((u) => (
              <option value={u.id}>{u.nom}</option>
            ))}
          </select>
        </Champ>
        <Champ label={t('publieParSoi')}>
          <select
            value={f.publie_par_soi === null ? '' : String(f.publie_par_soi)}
            onChange={(e) => setF({ ...f, publie_par_soi: valeur(e) === '' ? null : Number(valeur(e)) })}
          >
            <option value="">{t('inconnu')}</option>
            <option value="1">{t('oui')}</option>
            <option value="0">{t('non')}</option>
          </select>
        </Champ>
        <Champ label={t('mandatSigne')}>
          <input type="date" value={jourInput(f.mandat_signe_le)} onInput={set('mandat_signe_le')} />
        </Champ>
        <Champ label={t('identiteVerifiee')}>
          <input type="date" value={jourInput(f.identite_verifiee_le)} onInput={set('identite_verifiee_le')} />
        </Champ>
        <Champ label={t('consentementRecherche')}>
          <input type="date" value={jourInput(f.consentement_recherche_le)} onInput={set('consentement_recherche_le')} />
        </Champ>
      </div>
      <label class="o-case">
        <input type="checkbox" checked={!!Number(f.menace)} onChange={() => setF({ ...f, menace: Number(f.menace) ? 0 : 1 })} />
        <span>{t('menace')}</span>
      </label>
      <label class="o-case">
        <input type="checkbox" checked={!!Number(f.client_pro)} onChange={() => setF({ ...f, client_pro: Number(f.client_pro) ? 0 : 1 })} />
        <span>{t('clientPro')}</span>
      </label>
      <Champ label={t('prochaineAction')}>
        <input type="text" value={f.prochaine_action ?? ''} onInput={set('prochaine_action')} />
      </Champ>
      <Champ label={t('tempsPasse')}>
        <div class="o-temps">
          <input type="number" min="0" step="5" inputMode="numeric" value={f.temps_minutes ?? 0} onInput={set('temps_minutes')} />
          <button type="button" class="o-bouton o-petit" onClick={() => setF({ ...f, temps_minutes: (Number(f.temps_minutes) || 0) + 15 })}>
            +15 min
          </button>
        </div>
      </Champ>
      <Champ label={t('resume')}>
        <textarea rows={5} value={f.resume ?? ''} onInput={set('resume')} />
      </Champ>
      <MessageErreur texte={a.err} />
      <div class="o-actions">
        <button class="o-bouton o-principal" disabled={a.occupe} onClick={sauver}>
          {t('enregistrer')}
        </button>
      </div>

      {d.fiches.length > 0 && (
        <section>
          <h2>{t('fichesUtiles')}</h2>
          <ul class="o-liste-simple">
            {d.fiches.map((fi) => (
              <li>
                <a href={`#/referentiel/${fi.id}`}>
                  {String(fi.pays ?? '')} · {CATEGORIES[String(fi.categorie)]?.[indexLangue()] ?? String(fi.categorie ?? '')}
                </a>{' '}
                <span class="o-muet o-mono">{fi.id}</span>{' '}
                <Pastille ton={STATUTS[fi.statut]?.ton ?? 'info'}>{STATUTS[fi.statut]?.l[indexLangue()] ?? fi.statut}</Pastille>
                {fi.role_devuelta === 'orientation_uniquement' && <Pastille ton="alerte">{tr('orientation seulement', 'solo orientación', 'referral only')}</Pastille>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="o-encadre">
        {FERMES.includes(x.statut) ? (
          <>
            <p>
              <strong>{code(x.statut)}</strong> — {date(x.clos_le)}
            </p>
            {x.resultat && <p class="o-texte">{x.resultat}</p>}
            <button class="o-bouton" onClick={() => a.lancer(() => post(`/dossiers/${x.id}/rouvrir`), recharger)}>
              {t('rouvrir')}
            </button>
          </>
        ) : (
          <>
            <h2>{t('cloreDossier')}</h2>
            <Champ label={t('statut')}>
              <select value={statutFin} onChange={(e) => setStatutFin(valeur(e))}>
                {FERMES.map((s) => (
                  <option value={s}>{code(s)}</option>
                ))}
              </select>
            </Champ>
            <Champ label={t('resultat')}>
              <textarea rows={3} value={resultat} onInput={(e) => setResultat(valeur(e))} />
            </Champ>
            <button
              class="o-bouton"
              disabled={!resultat.trim() || a.occupe}
              onClick={() => confirm(t('sur')) && a.lancer(() => post(`/dossiers/${x.id}/clore`, { statut: statutFin, resultat }), recharger)}
            >
              {t('cloreDossier')}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

// Tarif : même grille que la page Tarifs du site (shared/tarifs.ts). La moitié
// à l'ouverture, le solde au prorata des liens retirés.

function TarifDossier({ d }: { d: Detail }) {
  const lang = langue.value;
  const liens = d.contenus.filter((c) => c.statut !== 'a-valider');
  const n = liens.length;
  const retires = liens.filter((c) => c.statut === 'retire').length;
  const zone = zoneDuPays(d.dossier.pays);
  const pro = !!Number(d.dossier.client_pro);
  const ligne = (z: Zone) => {
    const p = calculerPrix(n, retires, z, pro);
    if (!p.formule || p.total === null || p.ouverture === null || p.soldeDu === null || p.soldeMaximum === null) return null;
    // Taux implicites de la grille (prix en zone réduite, en cedis et en francs CFA).
    const base = p.formule.prix * COEF_ZONE_REDUITE;
    const local = (eur: number) =>
      z === 'reduite' ? ` (GH¢ ${nombre((eur * p.formule!.ghs) / base, lang)} · ${nombre((eur * p.formule!.fcfa) / base, lang)} F)` : '';
    return (
      <ul>
        <li>
          {tr('Total :', 'Total:', 'Total:')} <strong>{euros(p.total, lang)}</strong>
          {local(p.total)}
        </li>
        <li>
          {tr('À l’ouverture :', 'Al abrir el caso:', 'When the case opens:')} <strong>{euros(p.ouverture, lang)}</strong>
          {local(p.ouverture)}
        </li>
        <li>
          {tr('Solde dû à ce jour :', 'Saldo debido a la fecha:', 'Balance due so far:')} <strong>{euros(p.soldeDu, lang)}</strong>
          {local(p.soldeDu)} —{' '}
          {tr(
            `${retires} lien(s) retiré(s) sur ${n}, solde maximum ${euros(p.soldeMaximum, lang)}`,
            `${retires} enlace(s) retirado(s) de ${n}, saldo máximo ${euros(p.soldeMaximum, lang)}`,
            `${retires} of ${n} link(s) removed, maximum balance ${euros(p.soldeMaximum, lang)}`,
          )}
        </li>
      </ul>
    );
  };
  let corps;
  if (n === 0) {
    corps = <p>{tr('Ajoutez et validez les liens pour calculer le tarif.', 'Añade y valida los enlaces para calcular el precio.', 'Add and approve the links to work out the price.')}</p>;
  } else if (n > 15) {
    corps = (
      <p>
        {tr('Plus de 15 liens : sur devis, à partir de', 'Más de 15 enlaces: con presupuesto, desde', 'More than 15 links: quoted, from')} {euros(DEVIS_A_PARTIR_DE * (pro ? COEF_PRO : 1), lang)} (
        {tr('zone réduite :', 'zona reducida:', 'reduced zone:')} {euros(DEVIS_A_PARTIR_DE * COEF_ZONE_REDUITE * (pro ? COEF_PRO : 1), lang)}).
      </p>
    );
  } else if (zone) {
    corps = ligne(zone);
  } else {
    corps = (
      <>
        <p>{tr('Pays à préciser. Tarif standard :', 'País por precisar. Precio estándar:', 'Country to confirm. Standard price:')}</p>
        {ligne('standard')}
        <p>{tr('Afrique, Amérique latine et Caraïbes :', 'África, América Latina y Caribe:', 'Africa, Latin America and the Caribbean:')}</p>
        {ligne('reduite')}
      </>
    );
  }
  return (
    <section class="o-encadre o-info">
      <strong>
        {tr('Tarif', 'Precio', 'Price')} — {n} {tr('lien(s)', 'enlace(s)', 'link(s)')}
        {zone === 'reduite' ? ` · ${tr('zone réduite (prix divisés par deux)', 'zona reducida (precios a mitad)', 'reduced zone (half price)')}` : ''}
        {pro ? ` · ${tr('client professionnel (prix × 2)', 'cliente profesional (precio × 2)', 'business client (price × 2)')}` : ''}
      </strong>
      {corps}
      <p class="o-muet">
        {tr(
          'Personne mineure : aucun paiement, orientation vers les services officiels gratuits. Cas difficile : devis possible avant de commencer.',
          'Persona menor de edad: ningún pago, orientación hacia los servicios oficiales gratuitos. Caso difícil: presupuesto posible antes de empezar.',
          'Minor: no payment, refer to official free services. Difficult case: a quote is possible before starting.',
        )}
      </p>
    </section>
  );
}

// Liens et plan ---------------------------------------------------------------------

function OngletLiens({ d, recharger, preparer }: { d: Detail; recharger: () => void; preparer: (p: { modele: string; contenu_id: string | null }) => void }) {
  const [nouveaux, setNouveaux] = useState('');
  const [recherche, setRecherche] = useState(false);
  const a = useAction();
  const detectes = extraireLiens(nouveaux);
  return (
    <div>
      {d.contenus.map((c) => (
        <Lien c={c} d={d} recharger={recharger} preparer={preparer} />
      ))}
      <section class="o-encadre">
        <Champ
          label={t('ajouterLiens')}
          aide={tr(
            'Collez des liens, ou tout le texte d’un rapport PimEyes, d’un e-mail ou d’un message : les adresses sont repérées automatiquement.',
            'Pega enlaces, o todo el texto de un informe de PimEyes, de un correo o de un mensaje: las direcciones se detectan automáticamente.',
            'Paste links, or the whole text of a PimEyes report, an email or a message: addresses are picked out automatically.',
          )}
        >
          <textarea rows={4} value={nouveaux} onInput={(e) => setNouveaux(valeur(e))} placeholder="https://…" />
        </Champ>
        {nouveaux.trim() && (
          <p class="o-muet">
            {detectes.length} {tr('lien(s) repéré(s)', 'enlace(s) detectado(s)', 'link(s) found')}
            {detectes.length > 100 ? ` — ${tr('100 au plus par envoi', '100 como máximo por envío', '100 at most per batch')}` : ''}
          </p>
        )}
        <label class="o-case">
          <input type="checkbox" checked={recherche} onChange={() => setRecherche(!recherche)} />
          <span>{t('origineRecherche')}</span>
        </label>
        <MessageErreur texte={a.err} />
        <button
          class="o-bouton o-principal"
          disabled={detectes.length === 0 || detectes.length > 100 || a.occupe}
          onClick={() =>
            a.lancer(
              () => post(`/dossiers/${d.dossier.id}/contenus`, { urls: detectes, origine: recherche ? 'recherche-inversee' : 'manuel' }),
              () => {
                setNouveaux('');
                setTimeout(recharger, 2500);
                recharger();
              },
            )
          }
        >
          {t('ajouter')}
        </button>
      </section>
    </div>
  );
}

function Lien({ c, d, recharger, preparer }: { c: Contenu; d: Detail; recharger: () => void; preparer: (p: { modele: string; contenu_id: string | null }) => void }) {
  const a = useAction();
  const lang = langue.value;
  const statuts = ['a-valider', 'a-traiter', 'signale', 'retire', 'refuse', 'reapparu'];
  const noterFait = (s: Suggestion) =>
    a.lancer(() => post(`/dossiers/${d.dossier.id}/etapes`, { type: s.code === 'mineur' ? 'police' : s.code, contenu_id: c.id, statut: 'envoye', destinataire: s.destinataire ?? null }), recharger);
  return (
    <section class="o-carte">
      <p class="o-url">
        <LienExterne href={c.url}>{c.url}</LienExterne>
      </p>
      <div class="o-pastilles">
        <Pastille>{code(c.statut)}</Pastille>
        {c.plateforme && <Pastille ton="info">{c.plateforme}</Pastille>}
        {c.origine === 'recherche-inversee' && <Pastille ton="info">{t('origineRecherche').split('(')[0]}</Pastille>}
      </div>
      {c.verif_alerte && (
        <div class={`o-encadre ${c.verif_alerte === 'semble-reapparu' ? 'o-alerte' : 'o-ok'}`}>
          <p>{c.verif_alerte === 'semble-reapparu' ? t('sembleReapparu') : t('semblReitire')}</p>
          <p class="o-muet">
            {t('derniereVerif')} : {date(c.verif_le, true)} {c.verif_http ? `(HTTP ${c.verif_http})` : ''}
          </p>
          <div class="o-actions">
            {c.verif_alerte === 'semble-retire' && (
              <button class="o-bouton o-principal" onClick={() => a.lancer(() => patch(`/contenus/${c.id}`, { statut: 'retire' }), recharger)}>
                ✓ {code('retire')}
              </button>
            )}
            {c.verif_alerte === 'semble-reapparu' && (
              <button class="o-bouton o-principal" onClick={() => a.lancer(() => patch(`/contenus/${c.id}`, { statut: 'reapparu' }), recharger)}>
                {code('reapparu')}
              </button>
            )}
            <button class="o-bouton" onClick={() => a.lancer(() => patch(`/contenus/${c.id}`, { ignorer_alerte: true }), recharger)}>
              {t('ignorer')}
            </button>
          </div>
        </div>
      )}
      <div class="o-grille">
        <Champ label={t('statut')}>
          <select value={c.statut} onChange={(e) => a.lancer(() => patch(`/contenus/${c.id}`, { statut: valeur(e) }), recharger)}>
            {statuts.map((s) => (
              <option value={s}>{code(s)}</option>
            ))}
          </select>
        </Champ>
      </div>
      {c.ident ? (
        <details>
          <summary>
            {t('identification')} — {date(c.ident_le)}
          </summary>
          <dl class="o-dl">
            <dt>{t('registrar')}</dt>
            <dd>
              {c.ident.registrar ?? '—'} {c.ident.registrar_abuse && <span class="o-mono">· {c.ident.registrar_abuse}</span>}
            </dd>
            <dt>{t('hebergeur')}</dt>
            <dd>
              {c.ident.hebergeur ?? '—'} {c.ident.pays_reseau ? `(${c.ident.pays_reseau})` : ''}{' '}
              {c.ident.hebergeur_abuse && <span class="o-mono">· {c.ident.hebergeur_abuse}</span>}
            </dd>
            {c.ident.derriere_cloudflare && (
              <>
                <dt>Cloudflare</dt>
                <dd>{t('derriereCloudflare')}</dd>
              </>
            )}
            <dt>{t('domaineCree')}</dt>
            <dd>{date(c.ident.domaine_cree_le)}</dd>
            <dt>IP</dt>
            <dd class="o-mono">{c.ident.ips.join(', ') || '—'}</dd>
          </dl>
        </details>
      ) : null}
      <div class="o-actions">
        <button class="o-bouton o-petit" disabled={a.occupe} onClick={() => a.lancer(() => post(`/contenus/${c.id}/identifier`), recharger)}>
          {t('identifier')}
        </button>
        <button class="o-bouton o-petit" onClick={() => confirm(t('sur')) && a.lancer(() => del(`/contenus/${c.id}`), recharger)}>
          {t('supprimer')}
        </button>
      </div>
      {c.plan.length > 0 && (
        <details open={c.statut === 'a-traiter'}>
          <summary>
            <strong>{t('planTitre')}</strong>
          </summary>
          <ol class="o-plan">
            {c.plan.map((s) => (
              <li>
                <strong>{code(s.code)}</strong>
                {s.titre?.[lang] ? ` — ${s.titre[lang]}` : ''}
                {s.destinataire ? <span class="o-muet"> · {s.destinataire}</span> : null}
                {s.email ? <span class="o-mono"> · {s.email}</span> : null}
                {s.condition && <span class="o-muet"> · {code(`cond-${s.condition}`)}</span>}
                <span class="o-actions-ligne">
                  {s.url && (
                    <LienExterne href={s.url}>
                      <span class="o-bouton o-petit">{t('ouvrirLien')} ↗</span>
                    </LienExterne>
                  )}
                  {s.modele && (
                    <button class="o-bouton o-petit" onClick={() => preparer({ modele: s.modele!, contenu_id: c.id })}>
                      {t('preparerCourrier')}
                    </button>
                  )}
                  {TYPES_ETAPE.includes(s.code as never) && (
                    <button class="o-bouton o-petit" onClick={() => noterFait(s)}>
                      {t('noterEtape')}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
      <MessageErreur texte={a.err} />
    </section>
  );
}

// Démarches ---------------------------------------------------------------------------

function OngletDemarches({ d, recharger }: { d: Detail; recharger: () => void }) {
  const [f, setF] = useState({ type: 'plateforme', destinataire: '', statut: 'envoye', contenu_id: '', echeance: '', note: '' });
  const a = useAction();
  const set = (k: keyof typeof f) => (e: Event) => setF({ ...f, [k]: valeur(e) });
  return (
    <div>
      {d.etapes.length === 0 && <p class="o-muet">{t('aucuneEtape')}</p>}
      <ul class="o-liste-simple">
        {d.etapes.map((e) => (
          <EtapeLigne e={e} d={d} recharger={recharger} />
        ))}
      </ul>
      <section class="o-encadre">
        <h2>{t('nouvelleEtape')}</h2>
        <div class="o-grille">
          <Champ label={t('typeEtape')}>
            <select value={f.type} onChange={set('type')}>
              {TYPES_ETAPE.map((x) => (
                <option value={x}>{code(x)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('destinataire')}>
            <input type="text" value={f.destinataire} onInput={set('destinataire')} />
          </Champ>
          <Champ label={t('statut')}>
            <select value={f.statut} onChange={set('statut')}>
              <option value="envoye">{t('dejaEnvoye')}</option>
              <option value="a-faire">{t('aFaire')}</option>
            </select>
          </Champ>
          <Champ label={t('lienConcerne')}>
            <select value={f.contenu_id} onChange={set('contenu_id')}>
              <option value="">—</option>
              {d.contenus.map((c) => (
                <option value={c.id}>{c.domaine ?? c.url}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('echeance')}>
            <input type="date" value={f.echeance} onInput={set('echeance')} />
          </Champ>
        </div>
        <Champ label={t('note')}>
          <input type="text" value={f.note} onInput={set('note')} />
        </Champ>
        <MessageErreur texte={a.err} />
        <button
          class="o-bouton o-principal"
          disabled={a.occupe}
          onClick={() =>
            a.lancer(
              () =>
                post(`/dossiers/${d.dossier.id}/etapes`, {
                  ...f,
                  contenu_id: f.contenu_id || null,
                  echeance: f.echeance ? `${f.echeance}T12:00:00.000Z` : null,
                }),
              () => {
                setF({ ...f, destinataire: '', note: '', echeance: '' });
                recharger();
              },
            )
          }
        >
          {t('ajouter')}
        </button>
      </section>
    </div>
  );
}

function EtapeLigne({ e, recharger }: { e: Etape; d: Detail; recharger: () => void }) {
  const a = useAction();
  const retard = e.echeance && ['a-faire', 'envoye'].includes(e.statut) && new Date(e.echeance) < new Date();
  return (
    <li class="o-carte">
      <p>
        <strong>{code(e.type)}</strong>
        {e.destinataire ? ` · ${e.destinataire}` : ''} <Pastille ton={e.statut === 'succes' ? 'ok' : e.statut === 'refus' ? 'alerte' : 'neutre'}>{code(e.statut)}</Pastille>
        {retard && <Pastille ton="alerte">{t('enRetard')}</Pastille>}
      </p>
      <p class="o-muet">
        {t('faitLe')} {date(e.fait_le)} · {t('echeance')} {date(e.echeance)} {e.cree_par_nom ? `· ${e.cree_par_nom}` : ''}
      </p>
      {e.note && <p class="o-texte">{e.note}</p>}
      <div class="o-actions">
        <select value={e.statut} onChange={(ev) => a.lancer(() => patch(`/etapes/${e.id}`, { statut: valeur(ev) }), recharger)}>
          {['a-faire', 'envoye', 'reponse', 'succes', 'refus', 'sans-reponse'].map((s) => (
            <option value={s}>{code(s)}</option>
          ))}
        </select>
        <input
          type="date"
          value={jourInput(e.echeance)}
          onChange={(ev) => a.lancer(() => patch(`/etapes/${e.id}`, { echeance: valeur(ev) ? `${valeur(ev)}T12:00:00.000Z` : null }), recharger)}
          aria-label={t('echeance')}
        />
        <button class="o-bouton o-petit" onClick={() => confirm(t('sur')) && a.lancer(() => del(`/etapes/${e.id}`), recharger)}>
          {t('supprimer')}
        </button>
      </div>
      <MessageErreur texte={a.err} />
    </li>
  );
}

// Courriers ---------------------------------------------------------------------------

function OngletCourriers({ d, recharger, prefill }: { d: Detail; recharger: () => void; prefill: { modele: string; contenu_id: string | null } | null }) {
  const modeles = useCharger(() => get<{ modeles: ModeleMeta[] }>('/modeles'));
  const ids = [...new Set((modeles.donnees?.modeles ?? []).map((m) => m.id))];
  const [f, setF] = useState({ modele: prefill?.modele ?? '', langue: '', contenu_id: prefill?.contenu_id ?? '', description_contenu: '', oeuvre: '', date_publication: '' });
  const a = useAction();
  const langues = (modeles.donnees?.modeles ?? []).filter((m) => m.id === f.modele).map((m) => m.langue);
  const meta = (modeles.donnees?.modeles ?? []).find((m) => m.id === f.modele && m.langue === (f.langue || langues[0]));
  useEffect(() => {
    if (prefill) setF((x) => ({ ...x, modele: prefill.modele, contenu_id: prefill.contenu_id ?? '' }));
  }, [prefill]);
  useEffect(() => {
    if (f.modele && !langues.includes(f.langue)) {
      const pref = langues.includes(d.dossier.langue) ? d.dossier.langue : langues[0] ?? '';
      setF((x) => ({ ...x, langue: pref }));
    }
  }, [f.modele, langues.join(',')]);
  const set = (k: keyof typeof f) => (e: Event) => setF({ ...f, [k]: valeur(e) });
  return (
    <div>
      {d.courriers.length === 0 && <p class="o-muet">{t('aucunCourrier')}</p>}
      {d.courriers.map((c) => (
        <CourrierCarte c={c} recharger={recharger} />
      ))}
      <section class="o-encadre">
        <h2>{t('nouveauCourrier')}</h2>
        <div class="o-grille">
          <Champ label={t('modele')}>
            <select value={f.modele} onChange={set('modele')}>
              <option value="">—</option>
              {ids.map((id) => (
                <option value={id}>{(modeles.donnees?.modeles ?? []).find((m) => m.id === id && m.langue === langue.value)?.nom ?? (modeles.donnees?.modeles ?? []).find((m) => m.id === id)?.nom ?? id}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('langueCourrier')}>
            <select value={f.langue} onChange={set('langue')} disabled={!f.modele}>
              {langues.map((l) => (
                <option value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('lienConcerne')}>
            <select value={f.contenu_id} onChange={set('contenu_id')}>
              <option value="">{t('tousLesLiens')}</option>
              {d.contenus.map((c) => (
                <option value={c.id}>{c.domaine ?? c.url}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('datePublication')}>
            <input type="text" value={f.date_publication} onInput={set('date_publication')} />
          </Champ>
        </div>
        {meta && (
          <div class="o-aide-modele">
            <p>
              <strong>{t('quandUtiliser')} :</strong> {meta.quand_utiliser}
            </p>
            {meta.pieces_jointes?.length > 0 && (
              <p>
                <strong>{t('piecesJointes')} :</strong> {meta.pieces_jointes.join(' ; ')}
              </p>
            )}
            <details>
              <summary>Note</summary>
              <p class="o-texte">{meta.note}</p>
            </details>
          </div>
        )}
        <Champ label={t('descriptionContenu')}>
          <input type="text" value={f.description_contenu} onInput={set('description_contenu')} />
        </Champ>
        {f.modele === 'dmca-512' && (
          <Champ label={t('oeuvre')}>
            <input type="text" value={f.oeuvre} onInput={set('oeuvre')} />
          </Champ>
        )}
        <MessageErreur texte={a.err} />
        <button
          class="o-bouton o-principal"
          disabled={!f.modele || !f.langue || a.occupe}
          onClick={() =>
            a.lancer(
              () =>
                post(`/dossiers/${d.dossier.id}/courriers`, {
                  modele: f.modele,
                  langue: f.langue,
                  contenu_id: f.contenu_id || null,
                  description_contenu: f.description_contenu || null,
                  oeuvre: f.oeuvre || null,
                  date_publication: f.date_publication || null,
                }),
              recharger,
            )
          }
        >
          {t('generer')}
        </button>
      </section>
    </div>
  );
}

function CourrierCarte({ c, recharger }: { c: Courrier; recharger: () => void }) {
  const [objet, setObjet] = useState(c.objet);
  const [corps, setCorps] = useState(c.corps);
  const [dest, setDest] = useState(c.destinataire ?? '');
  const [destEmail, setDestEmail] = useState(c.destinataire_email ?? '');
  const a = useAction();
  const [approuve, setApprouve] = useState(false);
  useEffect(() => {
    setObjet(c.objet);
    setCorps(c.corps);
    setDest(c.destinataire ?? '');
    setDestEmail(c.destinataire_email ?? '');
  }, [c.id, c.objet, c.corps]);
  const incomplet = /\[À COMPLÉTER|\{\{/.test(objet + corps);
  const modifie = objet !== c.objet || corps !== c.corps || dest !== (c.destinataire ?? '') || destEmail !== (c.destinataire_email ?? '');
  const mailto = `mailto:${encodeURIComponent(destEmail)}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
  return (
    <section class="o-carte">
      <p class="o-pastilles">
        <strong>
          {c.modele} ({c.langue.toUpperCase()})
        </strong>
        <Pastille ton={c.statut === 'envoye' ? 'ok' : c.statut === 'valide' ? 'info' : c.statut === 'annule' ? 'neutre' : 'fort'}>{code(c.statut)}</Pastille>
        {c.automatique ? <Pastille ton="info">{t('prepareAuto')}</Pastille> : null}
      </p>
      <p class="o-muet">
        {date(c.cree_le, true)}
        {c.valide_par_nom ? ` · ${t('validePar')} ${c.valide_par_nom} (${date(c.valide_le)})` : ''}
        {c.envoye_par_nom ? ` · ${t('envoyePar')} ${c.envoye_par_nom} (${date(c.envoye_le)})` : ''}
      </p>
      {c.statut === 'brouillon' ? (
        <>
          <div class="o-grille">
            <Champ label={t('destinataire')}>
              <input type="text" value={dest} onInput={(e) => setDest(valeur(e))} />
            </Champ>
            <Champ label={t('destinataireEmail')}>
              <input type="email" value={destEmail} onInput={(e) => setDestEmail(valeur(e))} />
            </Champ>
          </div>
          <Champ label={t('objet')}>
            <input type="text" value={objet} onInput={(e) => setObjet(valeur(e))} />
          </Champ>
          <Champ label={t('corps')}>
            <textarea class="o-lettre" rows={18} value={corps} onInput={(e) => setCorps(valeur(e))} />
          </Champ>
          {incomplet && <p class="o-erreur">{t('aCompleter')}</p>}
          <p class="o-muet">{t('validerAide')}</p>
          {c.modele !== 'mandat' && (
            <label class="o-case">
              <input type="checkbox" checked={approuve} onChange={() => setApprouve(!approuve)} />
              <span>{t('approuveClient')}</span>
            </label>
          )}
          <div class="o-actions">
            {modifie && (
              <button
                class="o-bouton"
                disabled={a.occupe}
                onClick={() => a.lancer(() => patch(`/courriers/${c.id}`, { objet, corps, destinataire: dest || null, destinataire_email: destEmail || null }), recharger)}
              >
                {t('enregistrer')}
              </button>
            )}
            <button
              class="o-bouton o-principal"
              disabled={incomplet || modifie || a.occupe || (c.modele !== 'mandat' && !approuve)}
              onClick={() => a.lancer(() => post(`/courriers/${c.id}/valider`, { approuve_client: c.modele !== 'mandat' && approuve }), recharger)}
            >
              ✓ {t('validerCourrier')}
            </button>
            <button class="o-bouton" onClick={() => confirm(t('sur')) && a.lancer(() => post(`/courriers/${c.id}/annuler`), recharger)}>
              {t('annulerCourrier')}
            </button>
          </div>
        </>
      ) : (
        <>
          {(c.destinataire || c.destinataire_email) && (
            <p>
              {t('destinataire')} : {c.destinataire} {c.destinataire_email && <span class="o-mono">{c.destinataire_email}</span>}
            </p>
          )}
          <details open={c.statut === 'valide'}>
            <summary>
              {t('objet')} : {c.objet}
            </summary>
            <pre class="o-lettre-lue">{c.corps}</pre>
          </details>
          {c.statut === 'valide' && (
            <>
              <p class="o-muet">{t('envoyeAide')}</p>
              <div class="o-actions">
                <Copier texte={c.objet} libelle={`${t('copier')} : ${t('objet')}`} />
                <Copier texte={c.corps} libelle={`${t('copier')} : ${t('corps')}`} />
                {mailto.length < 7500 && (
                  <a class="o-bouton" href={mailto}>
                    {t('envoyerProton')}
                  </a>
                )}
                <button class="o-bouton o-principal" disabled={a.occupe} onClick={() => confirm(t('sur')) && a.lancer(() => post(`/courriers/${c.id}/envoye`, {}), recharger)}>
                  {t('marquerEnvoye')}
                </button>
                <button class="o-bouton" onClick={() => confirm(t('sur')) && a.lancer(() => post(`/courriers/${c.id}/annuler`), recharger)}>
                  {t('annulerCourrier')}
                </button>
              </div>
            </>
          )}
        </>
      )}
      <MessageErreur texte={a.err} />
    </section>
  );
}

// Notes et journal ------------------------------------------------------------------------

function OngletNotes({ d, recharger }: { d: Detail; recharger: () => void }) {
  const [texte, setTexte] = useState('');
  const a = useAction();
  return (
    <div>
      <Champ label={t('nouvelleNote')}>
        <textarea rows={3} value={texte} onInput={(e) => setTexte(valeur(e))} />
      </Champ>
      <MessageErreur texte={a.err} />
      <button
        class="o-bouton o-principal"
        disabled={!texte.trim() || a.occupe}
        onClick={() =>
          a.lancer(
            () => post(`/dossiers/${d.dossier.id}/notes`, { texte }),
            () => {
              setTexte('');
              recharger();
            },
          )
        }
      >
        {t('ajouter')}
      </button>
      {d.notes.length === 0 && <p class="o-muet">{t('aucuneNote')}</p>}
      <ul class="o-liste-simple">
        {d.notes.map((n) => (
          <li class="o-carte">
            <p class="o-muet">
              {n.auteur_nom ?? '—'} · {date(n.cree_le, true)}
            </p>
            <p class="o-texte">{n.texte}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OngletJournal({ id }: { id: string }) {
  const { donnees, err } = useCharger(() => get<{ journal: Array<{ le: string; action: string; objet: string | null; details: string | null; nom: string | null }> }>(`/dossiers/${id}/journal`), [id]);
  if (!donnees) return <MessageErreur texte={err} />;
  return (
    <ul class="o-journal">
      {donnees.journal.map((j) => (
        <li>
          <span class="o-mono">{date(j.le, true)}</span> · {j.nom ?? 'EraseOps'} · <strong>{j.action}</strong>
        </li>
      ))}
    </ul>
  );
}
