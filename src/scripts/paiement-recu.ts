// Page « paiement reçu » : Paystack y ajoute la référence du paiement.
// On demande au site (qui redemande à Paystack) si le paiement est confirmé,
// pour l'afficher tout de suite. Rien n'est gardé dans le navigateur.

const zone = document.getElementById('etat-paiement');
const params = new URLSearchParams(location.search);
const reference = params.get('reference') || params.get('trxref') || '';

async function verifier(essai: number): Promise<void> {
  if (!zone || !reference) return;
  try {
    const r = await fetch(`/api/paiement/verifier?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' });
    const j = (await r.json()) as { statut?: string };
    if (j.statut === 'paye') {
      if (zone.dataset.paye) zone.textContent = zone.dataset.paye;
      return;
    }
  } catch {
    /* réseau coupé : le texte « en cours de confirmation » reste affiché */
  }
  // Mobile Money : la confirmation peut prendre quelques secondes.
  if (essai < 5) setTimeout(() => verifier(essai + 1), 4000);
}

void verifier(1);
