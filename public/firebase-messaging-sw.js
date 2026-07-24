importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your_actual_api_key",
  authDomain: "your_actual_auth_domain",
  projectId: "your_actual_project_id",
  storageBucket: "your_actual_storage_bucket",
  messagingSenderId: "your_actual_messaging_sender_id",
  appId: "your_actual_app_id",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, link } = payload.data;
  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { link },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.link || '/')
  );
});