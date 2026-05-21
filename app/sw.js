const CACHE_NAME = 'rezepte-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/d1_zutaten_mapping.json',
  './data/d2_mealprep.json',
  './data/d3_snacks.json',
  './data/d4_fruehstueck.json',
  './data/d5_backen.json',
  './data/d6_brotzeit.json',
  './data/d7_finedining.json'
];

// Install: alle Dateien cachen
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: alten Cache löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first, dann Netzwerk
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
