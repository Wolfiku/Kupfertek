const CACHE_NAME = 'limbo-kupfertek-v1';

// Alle Dateien, die offline verfügbar sein sollen
const ASSETS_TO_CACHE = [
    '/', // index.html
    '/index.html',
    '/limbo-base/workflows/startup.html',
    '/limbo-base/assets/system/errors/startup-error.md',
    '/limbo-base/code/manifest.json',
];

// Install Event: Dateien werden gecached
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate Event: alten Cache löschen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

// Fetch Event: zuerst Cache, dann Netzwerk
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request)
                    .catch(() => {
                        // Wenn offline und Datei nicht im Cache ist, Error anzeigen
                        if (event.request.url.endsWith('startup.html')) {
                            return caches.match('/limbo-base/assets/system/errors/startup-error.md');
                        }
                    });
            })
    );
});
