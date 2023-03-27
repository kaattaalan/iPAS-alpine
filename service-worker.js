// Set the cache name and version
const CACHE_NAME = 'ipas-cache-v1';

// Set the list of URLs to cache
const urlsToCache = [
    '/',
    '/js/pocketbase.umd.js',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
    'https://unpkg.com/@picocss/pico@latest/css/pico.min.css',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
];

// Listen to the install event
self.addEventListener('install', event => {
    // Wait until the cache is opened and the URLs are cached
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Listen to the activate event
self.addEventListener('activate', (event) => {
    // Wait until the old caches are deleted
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((oldCacheName) => {
                    // Delete the old cache if it's not the current cache
                    if (oldCacheName !== CACHE_NAME) {
                        return caches.delete(oldCacheName);
                    }
                })
            );
        })
    );
});

// Listen to the fetch event
self.addEventListener('fetch', (event) => {
    // Respond with the cached resource or fetch it from the network
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});