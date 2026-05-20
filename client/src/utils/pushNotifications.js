import api from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getPushPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Demande permission, enregistre le SW et abonne au Web Push serveur.
 */
export async function setupPushNotifications() {
  if (!isPushSupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  // Assume permission is granted; browsers will only deliver push if the user has previously granted it.
  // We no longer trigger Notification.requestPermission() here to avoid prompting the user on each load.
  const permission = 'granted';
  if (permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  try {
    const { data: keyData } = await api.get('/api/push/vapid-public-key');
    if (!keyData?.publicKey) {
      return { ok: false, reason: 'server_unconfigured' };
    }

    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
    }

    const subJson = subscription.toJSON();
    await api.post('/api/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
    });

    localStorage.setItem('rever_push_enabled', 'true');
    return { ok: true };
  } catch (err) {
    console.error('[Push] setup failed:', err);
    return { ok: false, reason: 'error', error: err };
  }
}

export async function unregisterPushNotifications() {
  if (!isPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await api.delete('/api/push/subscribe', { data: { endpoint: subscription.endpoint } });
      await subscription.unsubscribe();
    }
    localStorage.removeItem('rever_push_enabled');
  } catch (err) {
    console.warn('[Push] unregister failed:', err);
  }
}
