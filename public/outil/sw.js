// Service worker de l'outil EraseOps : uniquement les alertes sur le téléphone.
// Aucune donnée de dossier n'est mise en cache. Le message push arrive vide :
// le texte (neutre, sans nom ni détail) est demandé au serveur avec la session
// de l'appareil, puis affiché.

const API = '/api/outil';
const ENTETES = { 'X-Devuelta-Outil': '1' };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

async function resume() {
  try {
    const r = await fetch(`${API}/notifications/resume`, { credentials: 'include', headers: ENTETES, cache: 'no-store' });
    if (r.ok) return await r.json();
  } catch (e) {
    /* hors ligne ou session expirée */
  }
  return null;
}

async function pastille(compteurs) {
  try {
    const total = compteurs ? compteurs.demandes + compteurs.echeances + compteurs.courriers + compteurs.alertes : 0;
    if (total > 0 && self.navigator.setAppBadge) await self.navigator.setAppBadge(total);
    else if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
  } catch (e) {
    /* pastille non prise en charge */
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      const r = await resume();
      await pastille(r && r.compteurs);
      await self.registration.showNotification((r && r.titre) || 'EraseOps', {
        body: (r && r.texte) || 'EraseOps',
        icon: '/outil/icon-192.png',
        badge: '/outil/badge-96.png',
        tag: 'eraseops',
        renotify: true,
        data: { url: '/outil/' },
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const f of fenetres) {
        if (new URL(f.url).pathname.startsWith('/outil')) {
          await f.focus();
          return;
        }
      }
      await self.clients.openWindow('/outil/');
    })(),
  );
});

function octets(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64url.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Si le navigateur renouvelle l'abonnement, on le réenregistre sans rien demander.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const r = await fetch(`${API}/push/cle`, { credentials: 'include', headers: ENTETES });
        if (!r.ok) return;
        const { cle } = await r.json();
        const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: octets(cle) });
        await fetch(`${API}/push/abonner`, {
          method: 'POST',
          credentials: 'include',
          headers: { ...ENTETES, 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, appareil: 'renouvellement' }),
        });
      } catch (e) {
        /* l'utilisateur réactivera les alertes depuis Réglages */
      }
    })(),
  );
});
