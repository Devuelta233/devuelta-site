// Alertes sur le téléphone : abonnement Web Push (messages vides, voir server/push.ts).

import { get, post } from './api';

export function pushPossible(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function estIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function estInstalle(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function cleVersOctets(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64url.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function enregistrerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/outil/sw.js', { scope: '/outil/' });
  } catch {
    return null;
  }
}

export async function etatPush(): Promise<'actif' | 'inactif' | 'bloque' | 'impossible'> {
  if (!pushPossible()) return 'impossible';
  if (Notification.permission === 'denied') return 'bloque';
  const reg = await navigator.serviceWorker.getRegistration('/outil/');
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'actif' : 'inactif';
}

export async function activerPush(): Promise<'actif' | 'bloque' | 'impossible'> {
  if (!pushPossible()) return 'impossible';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'bloque';
  const reg = (await enregistrerServiceWorker()) ?? (await navigator.serviceWorker.ready);
  const { cle } = await get<{ cle: string }>('/push/cle');
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cleVersOctets(cle) });
  }
  const appareil = estIos() ? 'iPhone/iPad' : /android/i.test(navigator.userAgent) ? 'Android' : 'Ordinateur';
  await post('/push/abonner', { endpoint: sub.endpoint, appareil });
  return 'actif';
}

export async function desactiverPush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration('/outil/');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await post('/push/desabonner', { endpoint: sub.endpoint }).catch(() => undefined);
    await sub.unsubscribe();
  }
}
