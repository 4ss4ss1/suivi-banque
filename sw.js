// Service Worker minimal qui ne fait rien
// Juste assez pour permettre l'installation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  clients.claim();
});

// On n'intercepte aucune requête
// => aucun bug de chargement
