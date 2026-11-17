// Service Worker: erst aus dem Netz laden (immer die neueste Version),
// nur ohne Internet auf die zuletzt gespeicherte Kopie zurückgreifen.
const CACHE = 'zauberspiegel-v4';
const CORE = [
  './', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './sounds/hund.wav', './sounds/katze.wav', './sounds/kuh.wav', './sounds/schaf.wav',
  './sounds/ziege.wav', './sounds/schwein.wav', './sounds/ente.wav', './sounds/elefant.wav'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || Response.error()))
  );
});
