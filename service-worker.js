const CACHE = 'etos-v0.1.3-dev';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/app.css', './js/app.js',
  './assets/img/ellison-tanaka-logo.png', './assets/img/icon-192.png', './assets/img/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);
  const isCoreCode = requestURL.pathname.endsWith('.html') ||
    requestURL.pathname.endsWith('.css') ||
    requestURL.pathname.endsWith('.js') ||
    requestURL.pathname.endsWith('.webmanifest') ||
    requestURL.pathname.endsWith('/ETOS/');

  if (isCoreCode) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
