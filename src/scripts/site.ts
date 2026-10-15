// Script commun à toutes les pages publiques : bouton « Quitter » et comptage
// anonyme des clics de contact. Aucun cookie, aucun identifiant.

import { compter } from './compteur';

function quitter(): void {
  try {
    sessionStorage.clear();
  } catch {
    /* stockage indisponible */
  }
  // replace() : la page actuelle disparaît de l'historique du navigateur.
  window.location.replace('https://www.google.com/');
}

document.querySelectorAll<HTMLButtonElement>('[data-quitter]').forEach((b) => b.addEventListener('click', quitter));

// Trois appuis rapides sur Échap = quitter (raccourci discret au clavier).
let echap: number[] = [];
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  const t = Date.now();
  echap = echap.filter((x) => t - x < 1200).concat(t);
  if (echap.length >= 3) quitter();
});

document.addEventListener('click', (ev) => {
  const a = (ev.target as Element | null)?.closest?.('a[data-evenement]');
  if (a) compter(a.getAttribute('data-evenement') ?? '');
});
