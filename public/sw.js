const CACHE_NAME = 'sk-info-v7';

const STATIC_ASSETS = [
  './',
  './index.html',
  './kanali.html',
  './manifest.json',
  './style.css',
  './site.js',
  './tv.js',
  './kanali.js',
  './channels.js',
  './m3u-parser.js',
  './favicon.ico',
  './smicom.ico',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-maskable-512.png'
];

/* =========================
   INSTALL
========================= */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* =========================
   ACTIVATE
========================= */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      ),
      self.clients.claim()
    ])
  );
});

/* =========================
   FETCH
========================= */

self.addEventListener('fetch', (event) => {

  const request = event.request;
  const url = request.url;

  // HLS streamovi - ne keširati
  if (
    url.includes('.m3u8') ||
    url.includes('.ts') ||
    url.includes('localhost:4000')
  ) {
    return;
  }

  // Samo GET zahtevi
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {

            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseClone);
              });

            return networkResponse;
          });

      })
      .catch(() => caches.match('./index.html'))
  );
});

/* =========================
   PUSH NOTIFICATIONS
========================= */

self.addEventListener('push', (event) => {

  let data = {
    title: 'Smiljanić Komerc',
    body: 'Novo obaveštenje.'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    renotify: true,
    tag: 'sk-info',
    actions: [
      {
        action: 'open',
        title: 'Otvori'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );

});

/* =========================
   NOTIFICATION CLICK
========================= */

self.addEventListener('notificationclick', (event) => {

  event.notification.close();

  event.waitUntil(

    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })

    .then(clientList => {

      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('./');
      }

    })

  );

});

/* =========================
   MESSAGE HANDLER
========================= */

self.addEventListener('message', (event) => {

  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

});
