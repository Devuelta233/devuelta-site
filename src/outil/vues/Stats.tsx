// Statistiques du site (administrateur) : totaux agrégés par jour, sans cookie.
// Sert à mesurer ce qui rapporte : d'où viennent les visites et combien deviennent des demandes.

import { useState } from 'preact/hooks';
import { get } from '../api';
import { date, t, tr } from '../i18n';
import { Chargement, MessageErreur, useCharger } from '../ui';

interface Donnees {
  jours: number;
  vues: number;
  visites: number;
  par_jour: Array<{ jour: string; n: number }>;
  par_source: Array<{ source: string; n: number }>;
  par_pays: Array<{ pays: string; n: number }>;
  par_page: Array<{ chemin: string; n: number }>;
  evenements: Array<{ evenement: string; n: number }>;
  demandes: number;
  dossiers: number;
  dossiers_resolus: number;
}

const PERIODES = [7, 30, 90, 365];

function pourcent(n: number, sur: number): string {
  if (!sur) return '—';
  const p = (100 * n) / sur;
  return `${p < 10 ? p.toFixed(1) : Math.round(p)} %`;
}

function Barres({ points, jours }: { points: Array<{ jour: string; n: number }>; jours: number }) {
  // Complète les jours sans visite pour que la courbe reste lisible.
  const parJour = new Map(points.map((p) => [p.jour, p.n]));
  const serie: Array<{ jour: string; n: number }> = [];
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - jours + 1);
  for (let i = 0; i < jours; i++) {
    const j = d.toISOString().slice(0, 10);
    serie.push({ jour: j, n: parJour.get(j) ?? 0 });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  const max = Math.max(1, ...serie.map((p) => p.n));
  return (
    <div class="o-barres" role="img" aria-label={t('vues')}>
      {serie.map((p) => (
        <span class="o-barre" title={`${date(p.jour)} : ${p.n}`} style={{ height: `${Math.max(2, (100 * p.n) / max)}%` }} />
      ))}
    </div>
  );
}

function Tableau({ titre, lignes, total }: { titre: string; lignes: Array<[string, number]>; total: number }) {
  return (
    <section class="o-encadre">
      <h2>{titre}</h2>
      {lignes.length === 0 ? (
        <p class="o-muet">{t('aucun')}</p>
      ) : (
        <table class="o-table">
          <tbody>
            {lignes.map(([l, n]) => (
              <tr>
                <td class="o-url">{l}</td>
                <td class="o-nombre">{n}</td>
                <td class="o-nombre o-muet">{pourcent(n, total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function Stats() {
  const [jours, setJours] = useState(30);
  const { donnees: d, err, enCours } = useCharger(() => get<Donnees>(`/statistiques?jours=${jours}`), [jours]);
  const ev = (k: string) => d?.evenements.find((e) => e.evenement === k)?.n ?? 0;
  return (
    <div>
      <h1>{t('mStats')}</h1>
      <p class="o-muet">{t('statsAide')}</p>
      <div class="o-filtres">
        {PERIODES.map((p) => (
          <button class={`o-filtre ${jours === p ? 'o-actif' : ''}`} onClick={() => setJours(p)}>
            {p} {t('jours')}
          </button>
        ))}
      </div>
      <MessageErreur texte={err} />
      {enCours && !d ? (
        <Chargement />
      ) : d ? (
        <>
          <div class="o-chiffres">
            <div>
              <strong>{d.visites}</strong>
              <span>{t('visites')}</span>
            </div>
            <div>
              <strong>{d.vues}</strong>
              <span>{t('vues')}</span>
            </div>
            <div>
              <strong>{ev('diagnostic')}</strong>
              <span>{t('diagnostics')}</span>
            </div>
            <div>
              <strong>{d.demandes}</strong>
              <span>{t('demandesRecues')}</span>
            </div>
            <div>
              <strong>{ev('whatsapp')}</strong>
              <span>{t('clicsWhatsapp')}</span>
            </div>
            <div>
              <strong>{ev('email')}</strong>
              <span>{t('clicsEmail')}</span>
            </div>
            <div>
              <strong>{d.dossiers}</strong>
              <span>{t('dossiersOuvertsPeriode')}</span>
            </div>
            <div>
              <strong>{d.dossiers_resolus}</strong>
              <span>{t('dossiersResolus')}</span>
            </div>
          </div>
          <section class="o-encadre">
            <h2>{t('vues')}</h2>
            <Barres points={d.par_jour} jours={d.jours} />
          </section>
          <section class="o-encadre">
            <h2>{tr('Du visiteur au dossier', 'Del visitante al caso', 'From visitor to case')}</h2>
            <table class="o-table">
              <tbody>
                {(
                  [
                    [t('visites'), d.visites],
                    [t('diagnostics'), ev('diagnostic')],
                    [tr('Formulaires ouverts', 'Formularios abiertos', 'Forms opened'), ev('formulaire-ouvert')],
                    [tr('Contacts directs (WhatsApp + e-mail)', 'Contactos directos (WhatsApp + correo)', 'Direct contacts (WhatsApp + email)'), ev('whatsapp') + ev('email')],
                    [t('demandesRecues'), d.demandes],
                    [t('dossiersOuvertsPeriode'), d.dossiers],
                    [t('dossiersResolus'), d.dossiers_resolus],
                  ] as Array<[string, number]>
                ).map(([l, n]) => (
                  <tr>
                    <td>{l}</td>
                    <td class="o-nombre">{n}</td>
                    <td class="o-nombre o-muet">{pourcent(n, d.visites)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <Tableau titre={t('sources')} lignes={d.par_source.map((s) => [s.source, s.n])} total={d.visites} />
          <Tableau titre={t('topPages')} lignes={d.par_page.map((p) => [p.chemin, p.n])} total={d.vues} />
          <Tableau titre={t('paysVisiteurs')} lignes={d.par_pays.map((p) => [p.pays, p.n])} total={d.vues} />
        </>
      ) : null}
    </div>
  );
}
