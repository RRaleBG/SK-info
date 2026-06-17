const CACHE_NAME = 'sk-info-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instalacija i keširanje osnovnih sredstava
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktivacija i čišćenje starog keša
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Mrežni zahtevi sa fallback-om na keš
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // 1. PRESKOČI VIDEO STRIMOVE (dozvoli proxy-ju da radi)
  // Ako zahtev ide ka tvom proxy serveru ili sadrži m3u8/ts, ignoriši SW logiku
  if (url.includes('localhost:4000') || url.includes('.m3u8') || url.includes('.ts')) {
    return; // Pusti browser da direktno obradi zahtev, ne diraj ga
  }

  // 2. STANDARDNA LOGIKA ZA OSTALE FAJLOVE
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});

// Slušanje Push Obaveštenja od dispečera
self.addEventListener('push', (e) => {
  let data = { title: 'Smiljanić Komerc', body: 'Provera stanja na ruti.' };
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data.body = e.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'https://www.smiljanickomerc.rs/wp-content/uploads/2019/04/logo-web2.png',
    badge: 'https://www.smiljanickomerc.rs/wp-content/uploads/2019/04/logo-web2.png',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Otvori Portal' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Klik na obaveštenje otvara sajt
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow('./public/index.html')
  );
});
