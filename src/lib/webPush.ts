import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import {
  clearStoredFcmToken,
  deviceService,
  getStoredFcmToken,
  storeFcmToken,
} from '@/features/notifications/services/deviceService';

function firebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

export function isWebPushConfigured(): boolean {
  const cfg = firebaseConfig();
  return Boolean(
    cfg.apiKey &&
      cfg.projectId &&
      cfg.messagingSenderId &&
      cfg.appId &&
      import.meta.env.VITE_FIREBASE_VAPID_KEY
  );
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let foregroundBound = false;
let enableInFlight: Promise<void> | null = null;

async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!(await isSupported())) {
    return null;
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig());
  }
  if (!messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
}

export async function enableWebPush(): Promise<void> {
  if (enableInFlight) {
    return enableInFlight;
  }
  enableInFlight = doEnableWebPush().finally(() => {
    enableInFlight = null;
  });
  return enableInFlight;
}

async function doEnableWebPush(): Promise<void> {
  try {
    if (!isWebPushConfigured() || !localStorage.getItem('token')) {
      return;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    await registration.update();

    const instance = await getFirebaseMessaging();
    if (!instance) {
      return;
    }

    const token = await getToken(instance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) {
      return;
    }

    storeFcmToken(token);
    await deviceService.register(token, 'web');

    if (!foregroundBound) {
      foregroundBound = true;
      onMessage(instance, (payload) => {
        const url = payload.data?.url || '/dashboard';
        const path = window.location.pathname;
        const viewingChat = path.match(/^\/chat\/(\d+)/);
        const targetChat = String(url).match(/^\/chat\/(\d+)/);
        if (viewingChat && targetChat && viewingChat[1] === targetChat[1]) {
          return;
        }
        const title = payload.notification?.title || payload.data?.title || 'ISH';
        const body = payload.notification?.body || payload.data?.body || '';
        void registration.showNotification(title, {
          body,
          icon: '/favicon.png',
          data: { url },
        });
      });
    }
  } catch (err) {
    console.warn('Web push was not enabled', err);
  }
}

export async function disableWebPush(): Promise<void> {
  const token = getStoredFcmToken();
  if (token) {
    try {
      await deviceService.unregister(token);
    } catch {
      // token may already be gone
    }
  }
  clearStoredFcmToken();
}
