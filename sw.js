// Simple cache-first service worker
const CACHE = 'postit-layers-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))) .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(resp => resp || fetch(e.request))
    );
  }
});
