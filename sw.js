// sw.js – Service Worker minimal et robuste

const CACHE_NAME = 'suivi-bancaire-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json'
  // Ajoutez ici d'autres ressources si l'application en utilise (CSS, JS externes, etc.)
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // Force l'activation immédiate
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Prend le contrôle de toutes les pages
  );
});

// Stratégie de fetch : Cache First pour les assets, Network First pour les navigations
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes non GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Pour les navigations (pages HTML) : Network First avec fallback cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre à jour le cache avec la version fraîche
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => {
          // Si réseau indisponible, servir depuis le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Pour les autres ressources (manifest, icônes, etc.) : Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
  );
});
