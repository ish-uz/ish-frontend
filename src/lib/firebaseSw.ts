export function buildFirebaseMessagingSw(env: Record<string, string>): string {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };
  return `/* ISH Firebase messaging SW */
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
  self.skipWaiting();
});
self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

function payloadParts(payload) {
  payload = payload || {};
  const data = payload.data || {};
  const n = payload.notification || {};
  return {
    title: n.title || data.title || 'ISH',
    body: n.body || data.body || '',
    url: data.url || '/dashboard'
  };
}

function showPush(payload) {
  const parts = payloadParts(payload);
  return self.registration.showNotification(parts.title, {
    body: parts.body,
    icon: '/favicon.png',
    data: { url: parts.url }
  });
}

messaging.onBackgroundMessage(function (payload) {
  return showPush(payload);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
`;
}
