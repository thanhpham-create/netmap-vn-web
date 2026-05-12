// Browser-side push subscription helpers.

import { api } from './api';
import type { JwtTokens } from './auth';

export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

// Allocate via explicit ArrayBuffer (not SharedArrayBuffer) so TS 5.7+ narrows
// Uint8Array<ArrayBuffer>, which satisfies BufferSource for pushManager.subscribe.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Subscribe + POST to backend. Returns the PushSubscription. */
export async function subscribePush(
  tokens: JwtTokens,
  opts: { latitude?: number; longitude?: number; radiusM?: number; carriers?: string[] } = {},
): Promise<PushSubscription> {
  if (!isPushSupported()) throw new Error('Trình duyệt không hỗ trợ Push notification.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Bạn cần cho phép thông báo.');

  const reg = await navigator.serviceWorker.ready;

  // Get VAPID public key from backend
  const { publicKey } = await api.pushVapidKey();

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Send subscription to backend
  const json = sub.toJSON();
  await api.pushSubscribe({
    endpoint: json.endpoint!,
    keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
    ...opts,
  }, tokens);

  return sub;
}

/** Unsubscribe + tell backend. */
export async function unsubscribePush(tokens: JwtTokens): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  await api.pushUnsubscribe(sub.endpoint, tokens);
  await sub.unsubscribe();
  return true;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}
