// Dossier de passation : quand il faut un avocat ou un tribunal, Devuelta
// s'arrête et remet au client un document complet, imprimable, dans sa langue.
// Ce fichier ne fait que transformer des données déjà triées en HTML autonome :
// aucun accès à la base, aucune donnée de contact du client, aucune note interne.

import { dateGmt, dateHeureGmt } from './retractation';
import { statutContenu, statutDossier, statutEtape, typeEtape } from './libelles';
import { SITUATION_LABEL, isSituation, nomPays, type Lang } from './vocab';

export interface LienPassation {
  url: string;
  plateforme: string | null;
  domaine: string | null;
  statut: string;
  ajoute_le: string;
  verif_le: string | null;
  verif_http: number | null;
  retire_constate_le: string | null;
  registrar: string | null;
  registrar_abuse: string | null;
  hebergeur: string | null;
  hebergeur_abuse: string | null;
}

export interface CourrierPassation {
  objet: string;
  destinataire: string | null;
  envoye_le: string | null;
  /** Texte du courrier, seulement s'il a été envoyé. */
  corps: string | null;
}

export interface DemarchePassation {
  type: string;
  destinataire: string | null;
  statut: string;
  fait_le: string | null;
  reponse_le: string | null;
  courrier: CourrierPassation | null;
}

export interface FichePassation {
  titre: string;
  autorite: string | null;
  base_legale: string | null;
  procedure: string | null;
  source: string | null;
  /** Fiche interne disponible seulement en français. */
  en_francais?: boolean;
}

/** Ligne du journal de l'outil : seules les actions utiles au client sont reprises. */
export interface LigneJournal {
  le: string;
  action: string;
  details: Record<string, unknown> | null;
}

export interface DonneesPassation {
  ref: string;
  langue: Lang;
  edite_le: string;
  situation: string;
  pays: string | null;
  statut: string;
  cree_le: string;
  mandat_signe_le: string | null;
  clos_le: string | null;
  journal: LigneJournal[];
  liens: LienPassation[];
  demarches: DemarchePassation[];
  /** Courriers envoyés qui ne sont rattachés à aucune démarche (ex. : mandat). */
  courriers: CourrierPassation[];
  fiches: FichePassation[];
}

// Textes ---------------------------------------------------------------------------

const T = {
  fr: {
    titre: 'Dossier de passation',
    dossier: 'Dossier',
    edite: 'Édité le',
    remis: 'Remis par l’équipe Devuelta',
    astuce: 'Pour enregistrer ce document en PDF : menu Imprimer du navigateur (Ctrl+P ou Cmd+P), puis « Enregistrer au format PDF ».',
    intro:
      'Ce document rassemble tout ce que Devuelta a fait pour ce dossier, pour que vous ou l’avocat de votre choix puissiez continuer sans rien perdre.',
    s1: '1. Résumé de la situation',
    situation: 'Situation',
    pays: 'Pays',
    paysInconnu: 'Non renseigné',
    etat: 'État du dossier',
    ouvertLe: 'Dossier ouvert le',
    mandat: 'Mandat signé le',
    mandatAbsent: 'Mandat : non enregistré',
    closLe: 'Dossier clôturé le',
    s2: '2. Chronologie',
    date: 'Date',
    evenement: 'Événement',
    rienChrono: 'Aucun événement enregistré.',
    s3: '3. Liens et preuves',
    rienLiens: 'Aucun lien enregistré.',
    plateforme: 'Plateforme ou domaine',
    statut: 'Statut',
    ajouteLe: 'Ajouté au dossier le',
    verifLe: 'Dernière vérification automatique',
    code: 'code HTTP',
    retireLe: 'Retrait constaté le',
    ident: 'Identification technique',
    registrar: 'registrar',
    hebergeur: 'hébergeur',
    abuse: 'contact abuse',
    s4: '4. Démarches faites',
    rienDemarches: 'Aucune démarche enregistrée.',
    destinataire: 'Destinataire',
    faitLe: 'Fait le',
    reponseLe: 'Réponse le',
    courrier: 'Courrier associé',
    objet: 'Objet',
    envoyeLe: 'envoyé le',
    nonEnvoye: 'non envoyé',
    texteCourrier: 'Texte du courrier envoyé',
    autresCourriers: 'Autres courriers envoyés',
    s5: '5. Réponses reçues',
    rienReponses: 'Aucune réponse enregistrée à ce jour.',
    s6: '6. Recours applicables',
    rienFiches: 'Aucune fiche de recours applicable n’est enregistrée pour cette situation et ce pays.',
    autorite: 'Autorité ou plateforme',
    base: 'Base légale',
    procedure: 'Procédure (résumé)',
    source: 'Source',
    enFrancais: 'Fiche interne, disponible en français seulement.',
    fichesNote: 'Ces fiches viennent du référentiel public de Devuelta. Elles décrivent des procédures officielles ; elles ne disent rien de vos chances.',
    s7: '7. Et maintenant ?',
    suite: [
      'Ce dossier vous appartient. Vous pouvez continuer seul·e les démarches, ou le confier à l’avocat de votre choix. Devuelta ne recommande aucun avocat et ne vous représente jamais devant un tribunal ni devant une autorité.',
      'Si votre avocat le souhaite, Devuelta peut poursuivre les démarches techniques (signalements aux plateformes, courriers aux hébergeurs, vérification des liens) sous sa direction. Ce travail reste payé par vous, selon nos tarifs, et rien ne part sans votre accord.',
      'Information, pas conseil juridique : ce document décrit ce qui a été fait et les procédures qui existent. Il ne constitue pas un avis sur votre affaire.',
      'Une question ? Répondez au dernier message de l’équipe.',
    ],
    pied: 'Devuelta · dossier',
    page: 'Document remis au client. Ne contient ni coordonnées ni notes internes.',
  },
  es: {
    titre: 'Expediente de traspaso',
    dossier: 'Caso',
    edite: 'Emitido el',
    remis: 'Entregado por el equipo de Devuelta',
    astuce: 'Para guardar este documento en PDF: menú Imprimir del navegador (Ctrl+P o Cmd+P), luego «Guardar como PDF».',
    intro: 'Este documento reúne todo lo que Devuelta ha hecho en este caso, para que tú o el abogado que elijas puedan continuar sin perder nada.',
    s1: '1. Resumen de la situación',
    situation: 'Situación',
    pays: 'País',
    paysInconnu: 'Sin indicar',
    etat: 'Estado del caso',
    ouvertLe: 'Caso abierto el',
    mandat: 'Mandato firmado el',
    mandatAbsent: 'Mandato: no registrado',
    closLe: 'Caso cerrado el',
    s2: '2. Cronología',
    date: 'Fecha',
    evenement: 'Evento',
    rienChrono: 'Ningún evento registrado.',
    s3: '3. Enlaces y pruebas',
    rienLiens: 'Ningún enlace registrado.',
    plateforme: 'Plataforma o dominio',
    statut: 'Estado',
    ajouteLe: 'Añadido al caso el',
    verifLe: 'Última verificación automática',
    code: 'código HTTP',
    retireLe: 'Retirada comprobada el',
    ident: 'Identificación técnica',
    registrar: 'registrador',
    hebergeur: 'alojamiento',
    abuse: 'contacto abuse',
    s4: '4. Gestiones realizadas',
    rienDemarches: 'Ninguna gestión registrada.',
    destinataire: 'Destinatario',
    faitLe: 'Hecha el',
    reponseLe: 'Respuesta el',
    courrier: 'Carta asociada',
    objet: 'Asunto',
    envoyeLe: 'enviada el',
    nonEnvoye: 'no enviada',
    texteCourrier: 'Texto de la carta enviada',
    autresCourriers: 'Otras cartas enviadas',
    s5: '5. Respuestas recibidas',
    rienReponses: 'Ninguna respuesta registrada hasta hoy.',
    s6: '6. Recursos aplicables',
    rienFiches: 'No hay ninguna ficha de recurso registrada para esta situación y este país.',
    autorite: 'Autoridad o plataforma',
    base: 'Base legal',
    procedure: 'Procedimiento (resumen)',
    source: 'Fuente',
    enFrancais: 'Ficha interna, disponible solo en francés.',
    fichesNote: 'Estas fichas vienen del referencial público de Devuelta. Describen procedimientos oficiales; no dicen nada sobre tus posibilidades.',
    s7: '7. ¿Y ahora?',
    suite: [
      'Este caso es tuyo. Puedes seguir las gestiones por tu cuenta, o confiarlo al abogado que elijas. Devuelta no recomienda ningún abogado y nunca te representa ante un tribunal ni ante una autoridad.',
      'Si tu abogado lo desea, Devuelta puede seguir con las gestiones técnicas (denuncias a las plataformas, cartas a los proveedores de alojamiento, verificación de los enlaces) bajo su dirección. Ese trabajo lo sigues pagando tú, según nuestros precios, y nada sale sin tu acuerdo.',
      'Información, no asesoramiento jurídico: este documento describe lo que se ha hecho y los procedimientos que existen. No es una opinión sobre tu caso.',
      '¿Una pregunta? Responde al último mensaje del equipo.',
    ],
    pied: 'Devuelta · caso',
    page: 'Documento entregado al cliente. No contiene datos de contacto ni notas internas.',
  },
  en: {
    titre: 'Handover file',
    dossier: 'Case',
    edite: 'Issued on',
    remis: 'Handed over by the Devuelta team',
    astuce: 'To save this document as a PDF: use the browser’s Print menu (Ctrl+P or Cmd+P), then “Save as PDF”.',
    intro: 'This document gathers everything Devuelta did on this case, so that you or the lawyer of your choice can carry on without losing anything.',
    s1: '1. Summary of the situation',
    situation: 'Situation',
    pays: 'Country',
    paysInconnu: 'Not given',
    etat: 'Case status',
    ouvertLe: 'Case opened on',
    mandat: 'Authorization signed on',
    mandatAbsent: 'Authorization: not recorded',
    closLe: 'Case closed on',
    s2: '2. Timeline',
    date: 'Date',
    evenement: 'Event',
    rienChrono: 'No event recorded.',
    s3: '3. Links and evidence',
    rienLiens: 'No link recorded.',
    plateforme: 'Platform or domain',
    statut: 'Status',
    ajouteLe: 'Added to the case on',
    verifLe: 'Last automatic check',
    code: 'HTTP code',
    retireLe: 'Removal confirmed on',
    ident: 'Technical identification',
    registrar: 'registrar',
    hebergeur: 'host',
    abuse: 'abuse contact',
    s4: '4. Steps taken',
    rienDemarches: 'No step recorded.',
    destinataire: 'Recipient',
    faitLe: 'Done on',
    reponseLe: 'Reply on',
    courrier: 'Related letter',
    objet: 'Subject',
    envoyeLe: 'sent on',
    nonEnvoye: 'not sent',
    texteCourrier: 'Text of the letter sent',
    autresCourriers: 'Other letters sent',
    s5: '5. Replies received',
    rienReponses: 'No reply recorded so far.',
    s6: '6. Applicable remedies',
    rienFiches: 'No remedy sheet is recorded for this situation and country.',
    autorite: 'Authority or platform',
    base: 'Legal basis',
    procedure: 'Procedure (summary)',
    source: 'Source',
    enFrancais: 'Internal sheet, available in French only.',
    fichesNote: 'These sheets come from Devuelta’s public dataset. They describe official procedures; they say nothing about your chances.',
    s7: '7. What now?',
    suite: [
      'This case is yours. You can carry on with the steps yourself, or hand the case to the lawyer of your choice. Devuelta does not recommend any lawyer and never represents you before a court or an authority.',
      'If your lawyer wishes, Devuelta can continue the technical steps (reports to platforms, letters to hosts, link checks) under their direction. You keep paying for that work, at our prices, and nothing is sent without your approval.',
      'Information, not legal advice: this document describes what was done and the procedures that exist. It is not an opinion on your case.',
      'A question? Reply to the last message from the team.',
    ],
    pied: 'Devuelta · case',
    page: 'Document handed to the client. Contains no contact details and no internal notes.',
  },
};

// Chronologie ---------------------------------------------------------------------

interface Evenement {
  le: string;
  texte: string;
}

const EVENEMENTS: Record<string, (d: Record<string, unknown>, lang: Lang) => string | null> = {
  'dossier-cree': (_d, l) => ({ fr: 'Ouverture du dossier', es: 'Apertura del caso', en: 'Case opened' })[l],
  'liens-ajoutes': (d, l) => {
    const n = Number(d.nombre ?? 0) || 0;
    return { fr: `${n} lien(s) ajouté(s) au dossier`, es: `${n} enlace(s) añadido(s) al caso`, en: `${n} link(s) added to the case` }[l];
  },
  'lien-modifie': (d, l) =>
    d.statut ? { fr: `Statut d’un lien mis à jour : ${statutContenu(String(d.statut), l)}`, es: `Estado de un enlace actualizado: ${statutContenu(String(d.statut), l)}`, en: `Link status updated: ${statutContenu(String(d.statut), l)}` }[l] : null,
  'lien-identifie': (_d, l) => ({ fr: 'Identification technique d’un lien (registrar, hébergeur)', es: 'Identificación técnica de un enlace (registrador, alojamiento)', en: 'Technical identification of a link (registrar, host)' })[l],
  'liens-identifies-auto': (d, l) => {
    const n = Number(d.nombre ?? 0) || 0;
    return { fr: `Identification technique automatique de ${n} lien(s)`, es: `Identificación técnica automática de ${n} enlace(s)`, en: `Automatic technical identification of ${n} link(s)` }[l];
  },
  'signature-demandee': (_d, l) => ({ fr: 'Devis et mandat envoyés pour signature', es: 'Presupuesto y mandato enviados para firma', en: 'Quote and authorization sent for signature' })[l],
  'mandat-signe-en-ligne': (_d, l) => ({ fr: 'Mandat signé en ligne', es: 'Mandato firmado en línea', en: 'Authorization signed online' })[l],
  'paiement-recu': (d, l) => {
    const solde = d.type === 'solde';
    return {
      fr: solde ? 'Paiement du solde reçu' : 'Paiement d’ouverture reçu',
      es: solde ? 'Pago del saldo recibido' : 'Pago de apertura recibido',
      en: solde ? 'Balance payment received' : 'Opening payment received',
    }[l];
  },
  'retractation-recue': (_d, l) => ({ fr: 'Rétractation reçue : arrêt des démarches', es: 'Desistimiento recibido: fin de las gestiones', en: 'Withdrawal received: steps stopped' })[l],
  'retractation-accusee': (_d, l) => ({ fr: 'Accusé de réception de la rétractation envoyé', es: 'Acuse de recibo del desistimiento enviado', en: 'Withdrawal acknowledgement sent' })[l],
  'dossier-clos': (d, l) => {
    const s = d.statut ? statutDossier(String(d.statut), l) : '';
    return { fr: `Clôture du dossier${s ? ` : ${s}` : ''}`, es: `Cierre del caso${s ? `: ${s}` : ''}`, en: `Case closed${s ? `: ${s}` : ''}` }[l];
  },
  'dossier-rouvert': (_d, l) => ({ fr: 'Réouverture du dossier', es: 'Reapertura del caso', en: 'Case reopened' })[l],
};

/** Événements datés, du plus ancien au plus récent : journal utile au client, démarches, courriers. */
export function chronologie(d: DonneesPassation): Evenement[] {
  const l = d.langue;
  const out: Evenement[] = [];
  for (const j of d.journal) {
    const f = EVENEMENTS[j.action];
    if (!f) continue;
    const texte = f(j.details ?? {}, l);
    if (texte) out.push({ le: j.le, texte });
  }
  // Mandat signé sur papier : la date est au dossier, pas dans le journal.
  if (d.mandat_signe_le && !d.journal.some((j) => j.action === 'mandat-signe-en-ligne')) {
    out.push({ le: d.mandat_signe_le, texte: { fr: 'Mandat signé', es: 'Mandato firmado', en: 'Authorization signed' }[l] });
  }
  for (const e of d.demarches) {
    const type = typeEtape(e.type, l);
    const dest = e.destinataire ? ` → ${e.destinataire}` : '';
    if (e.fait_le) {
      const objet = e.courrier?.objet ? ` (${e.courrier.objet})` : '';
      out.push({ le: e.fait_le, texte: { fr: `Démarche faite : ${type}${dest}${objet}`, es: `Gestión realizada: ${type}${dest}${objet}`, en: `Step done: ${type}${dest}${objet}` }[l] });
    }
    if (e.reponse_le) {
      const s = statutEtape(e.statut, l);
      out.push({ le: e.reponse_le, texte: { fr: `${s} : ${type}${dest}`, es: `${s}: ${type}${dest}`, en: `${s}: ${type}${dest}` }[l] });
    }
  }
  for (const c of d.courriers) {
    if (!c.envoye_le) continue;
    const dest = c.destinataire ? ` → ${c.destinataire}` : '';
    out.push({ le: c.envoye_le, texte: { fr: `Courrier envoyé${dest} : ${c.objet}`, es: `Carta enviada${dest}: ${c.objet}`, en: `Letter sent${dest}: ${c.objet}` }[l] });
  }
  return out.sort((a, b) => a.le.localeCompare(b.le));
}

// HTML ------------------------------------------------------------------------------

export function echapper(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const e = echapper;

function dl(lignes: Array<[string, string | null | undefined]>): string {
  const items = lignes.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`);
  return items.length ? `<dl>${items.join('')}</dl>` : '';
}

const STYLE = `
:root{color-scheme:light}
body{margin:0;background:#fff;color:#2b2624;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:11pt;line-height:1.5}
main{max-width:46rem;margin:0 auto;padding:1.5rem 1.25rem 3rem}
header.tete{border-bottom:3px solid #b5502f;padding-bottom:.75rem;margin-bottom:1.25rem}
header.tete h1{margin:0 0 .25rem;font-size:1.6rem}
header.tete p{margin:.15rem 0;color:#5c524c}
.ref{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;color:#2b2624}
.astuce{background:#efe5dc;border-radius:6px;padding:.75rem 1rem;margin:0 0 1.25rem;font-size:.95rem}
h2{font-size:1.2rem;margin:1.75rem 0 .5rem;border-bottom:1px solid #e0d5cb;padding-bottom:.2rem;break-after:avoid}
h3{font-size:1rem;margin:1rem 0 .3rem;break-after:avoid}
dl{display:grid;grid-template-columns:minmax(9rem,max-content) 1fr;gap:.2rem .9rem;margin:.4rem 0}
dt{color:#5c524c}
dd{margin:0}
table{border-collapse:collapse;width:100%;margin:.5rem 0}
th,td{text-align:left;vertical-align:top;padding:.35rem .5rem;border-bottom:1px solid #e0d5cb}
th{font-size:.9rem;color:#5c524c}
td.date{white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9rem}
.carte{border:1px solid #e0d5cb;border-radius:6px;padding:.75rem 1rem;margin:.75rem 0;break-inside:avoid}
.url{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9rem;overflow-wrap:anywhere;margin:0 0 .4rem}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:.95rem;background:#fbf8f5;border:1px solid #e0d5cb;border-radius:6px;padding:.75rem 1rem;margin:.4rem 0}
.muet{color:#6e625b;font-size:.92rem}
.nouvelle-page{break-before:page}
footer.pied{margin-top:2.5rem;padding-top:.5rem;border-top:1px solid #e0d5cb;font-size:.85rem;color:#6e625b}
@page{margin:18mm}
@media print{.pas-imprimer{display:none!important}main{max-width:none;padding:0}body{font-size:10.5pt}a{color:inherit;text-decoration:none}}
`;

/** Le document complet, prêt à être ouvert ou imprimé par le navigateur. */
export function htmlPassation(d: DonneesPassation): string {
  const l = d.langue;
  const t = T[l];
  const quand = dateHeureGmt(d.edite_le, l);
  const jour = (iso: string | null | undefined) => (iso ? dateGmt(iso, l) : '');
  const situation = isSituation(d.situation) ? SITUATION_LABEL[d.situation][l] : d.situation;

  // 1. Résumé
  const resume = dl([
    [t.situation, situation],
    [t.pays, d.pays ? nomPays(d.pays, l) : t.paysInconnu],
    [t.etat, statutDossier(d.statut, l)],
    [t.ouvertLe, jour(d.cree_le)],
    [d.mandat_signe_le ? t.mandat : t.mandatAbsent, d.mandat_signe_le ? jour(d.mandat_signe_le) : '—'],
    [t.closLe, jour(d.clos_le)],
  ]);

  // 2. Chronologie
  const evenements = chronologie(d);
  const chrono = evenements.length
    ? `<table><thead><tr><th>${e(t.date)}</th><th>${e(t.evenement)}</th></tr></thead><tbody>${evenements
        .map((x) => `<tr><td class="date">${e(jour(x.le))}</td><td>${e(x.texte)}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muet">${e(t.rienChrono)}</p>`;

  // 3. Liens
  const liens = d.liens.length
    ? d.liens
        .map((c) => {
          const ident: string[] = [];
          if (c.registrar) ident.push(`${t.registrar} : ${c.registrar}${c.registrar_abuse ? ` (${t.abuse} : ${c.registrar_abuse})` : ''}`);
          if (c.hebergeur) ident.push(`${t.hebergeur} : ${c.hebergeur}${c.hebergeur_abuse ? ` (${t.abuse} : ${c.hebergeur_abuse})` : ''}`);
          return `<section class="carte"><p class="url">${e(c.url)}</p>${dl([
            [t.plateforme, c.plateforme ?? c.domaine],
            [t.statut, statutContenu(c.statut, l)],
            [t.ajouteLe, jour(c.ajoute_le)],
            [t.verifLe, c.verif_le ? `${jour(c.verif_le)}${c.verif_http ? ` (${t.code} ${c.verif_http})` : ''}` : null],
            [t.retireLe, jour(c.retire_constate_le)],
            [t.ident, ident.length ? ident.join(' · ') : null],
          ])}</section>`;
        })
        .join('')
    : `<p class="muet">${e(t.rienLiens)}</p>`;

  // 4. Démarches (et courriers envoyés sans démarche)
  const demarche = (x: DemarchePassation) => {
    const c = x.courrier;
    const courrier = c ? `${c.objet} — ${c.envoye_le ? `${t.envoyeLe} ${jour(c.envoye_le)}` : t.nonEnvoye}` : null;
    return `<section class="carte"><h3>${e(typeEtape(x.type, l))}</h3>${dl([
      [t.destinataire, x.destinataire],
      [t.statut, statutEtape(x.statut, l)],
      [t.faitLe, jour(x.fait_le)],
      [t.reponseLe, jour(x.reponse_le)],
      [t.courrier, courrier],
    ])}${c?.corps ? `<p class="muet">${e(t.texteCourrier)}</p><pre>${e(c.corps)}</pre>` : ''}</section>`;
  };
  const courrierSeul = (c: CourrierPassation) =>
    `<section class="carte"><h3>${e(c.objet)}</h3>${dl([
      [t.destinataire, c.destinataire],
      [t.envoyeLe, jour(c.envoye_le)],
    ])}${c.corps ? `<pre>${e(c.corps)}</pre>` : ''}</section>`;
  const courriersSeuls = d.courriers.filter((c) => c.envoye_le);
  const demarches =
    d.demarches.length || courriersSeuls.length
      ? d.demarches.map(demarche).join('') + (courriersSeuls.length ? `<h3>${e(t.autresCourriers)}</h3>${courriersSeuls.map(courrierSeul).join('')}` : '')
      : `<p class="muet">${e(t.rienDemarches)}</p>`;

  // 5. Réponses (jamais la note, qui peut être interne)
  const avecReponse = d.demarches.filter((x) => ['reponse', 'refus', 'succes'].includes(x.statut));
  const reponses = avecReponse.length
    ? `<table><thead><tr><th>${e(t.date)}</th><th>${e(t.evenement)}</th><th>${e(t.statut)}</th></tr></thead><tbody>${avecReponse
        .map((x) => `<tr><td class="date">${e(jour(x.reponse_le ?? x.fait_le))}</td><td>${e(typeEtape(x.type, l))}${x.destinataire ? ` → ${e(x.destinataire)}` : ''}</td><td>${e(statutEtape(x.statut, l))}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muet">${e(t.rienReponses)}</p>`;

  // 6. Fiches
  const fiches = d.fiches.length
    ? `<p class="muet">${e(t.fichesNote)}</p>${d.fiches
        .map(
          (f) =>
            `<section class="carte"><h3>${e(f.titre)}</h3>${f.en_francais ? `<p class="muet">${e(t.enFrancais)}</p>` : ''}${dl([
              [t.autorite, f.autorite],
              [t.base, f.base_legale],
              [t.procedure, f.procedure],
              [t.source, f.source],
            ])}</section>`,
        )
        .join('')}`
    : `<p class="muet">${e(t.rienFiches)}</p>`;

  // 7. Et maintenant
  const suite = t.suite.map((p) => `<p>${e(p)}</p>`).join('');

  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${e(t.titre)} — ${e(d.ref)}</title>
<style>${STYLE}</style>
</head>
<body>
<main>
<header class="tete">
<h1>${e(t.titre)}</h1>
<p>${e(t.dossier)} <span class="ref">${e(d.ref)}</span></p>
<p>${e(t.edite)} ${e(quand)}</p>
<p>${e(t.remis)}</p>
</header>
<p class="astuce pas-imprimer">${e(t.astuce)}</p>
<p>${e(t.intro)}</p>
<h2>${e(t.s1)}</h2>
${resume}
<h2>${e(t.s2)}</h2>
${chrono}
<h2>${e(t.s3)}</h2>
${liens}
<h2>${e(t.s4)}</h2>
${demarches}
<h2>${e(t.s5)}</h2>
${reponses}
<h2>${e(t.s6)}</h2>
${fiches}
<section class="nouvelle-page">
<h2>${e(t.s7)}</h2>
${suite}
</section>
<footer class="pied">${e(t.pied)} ${e(d.ref)} · ${e(quand)} · ${e(t.page)}</footer>
</main>
</body>
</html>
`;
}
