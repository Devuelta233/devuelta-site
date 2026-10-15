// Comptage anonyme d'un événement (aucune donnée personnelle, aucun cookie).
export function compter(e: string): void {
  try {
    const corps = new Blob([JSON.stringify({ e })], { type: 'application/json' });
    navigator.sendBeacon('/api/evenement', corps);
  } catch {
    /* le comptage n'est jamais bloquant */
  }
}
