// Ce service worker ne fait rien
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());
