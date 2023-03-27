const CACHE_NAME = 'doodoo-cache';
const urlsToCache = [
    '/',
    '/js/pocketbase.umd.js',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
    'https://unpkg.com/@picocss/pico@latest/css/pico.min.css',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    // Check if the request is for an HTML file
    if (event.request.headers.get('Accept').includes('text/html')) {
        // Add a cache-busting URL parameter
        const url = new URL(event.request.url);
        url.searchParams.set('cache-bust', Date.now());
        const cacheBustedRequest = new Request(url, event.request);
        event.respondWith(fetch(cacheBustedRequest));
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});