// Petits composants partagés par les écrans de l'outil.

import type { ComponentChildren } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { erreur, t } from './i18n';

export function useCharger<T>(f: () => Promise<T>, deps: unknown[] = []) {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [err, setErr] = useState('');
  const [enCours, setEnCours] = useState(true);
  const recharger = useCallback(async () => {
    setEnCours(true);
    try {
      setDonnees(await f());
      setErr('');
    } catch (e) {
      setErr(erreur(e));
    } finally {
      setEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    recharger();
  }, [recharger]);
  return { donnees, err, enCours, recharger };
}

/** Exécute une action, affiche l'erreur éventuelle, puis rappelle `apres`. */
export function useAction() {
  const [occupe, setOccupe] = useState(false);
  const [err, setErr] = useState('');
  const lancer = async <T,>(f: () => Promise<T>, apres?: (r: T) => void) => {
    setOccupe(true);
    setErr('');
    try {
      const r = await f();
      apres?.(r);
      return r;
    } catch (e) {
      setErr(erreur(e));
      return null;
    } finally {
      setOccupe(false);
    }
  };
  return { occupe, err, lancer, setErr };
}

export function Chargement() {
  return <p class="o-muet">{t('chargement')}</p>;
}

export function MessageErreur({ texte }: { texte: string }) {
  if (!texte) return null;
  return (
    <p class="o-erreur" role="alert">
      {texte}
    </p>
  );
}

export function Pastille({ children, ton = 'neutre' }: { children: ComponentChildren; ton?: 'neutre' | 'alerte' | 'ok' | 'info' | 'fort' }) {
  return <span class={`o-pastille o-${ton}`}>{children}</span>;
}

export function Copier({ texte, libelle }: { texte: string; libelle?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      class="o-bouton o-petit"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* presse-papiers indisponible */
        }
      }}
    >
      {ok ? `✓ ${t('copie')}` : (libelle ?? t('copier'))}
    </button>
  );
}

export function Champ({ label, children, aide }: { label: string; children: ComponentChildren; aide?: string }) {
  return (
    <label class="o-champ">
      <span class="o-label">{label}</span>
      {children}
      {aide && <span class="o-aide">{aide}</span>}
    </label>
  );
}

export function LienExterne({ href, children }: { href: string; children: ComponentChildren }) {
  if (!/^https?:\/\//i.test(href)) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  );
}

export function aller(chemin: string): void {
  window.location.hash = chemin;
}

export function valeur(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

export function jourInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}
