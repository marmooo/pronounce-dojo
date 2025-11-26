const cacheName = "2025-11-27 00:00";
const urlsToCache = [
  "/pronounce-dojo/index.js",
  "/pronounce-dojo/data/0.csv",
  "/pronounce-dojo/data/1.csv",
  "/pronounce-dojo/data/2.csv",
  "/pronounce-dojo/data/3.csv",
  "/pronounce-dojo/data/4.csv",
  "/pronounce-dojo/data/5.csv",
  "/pronounce-dojo/mp3/end.mp3",
  "/pronounce-dojo/mp3/incorrect1.mp3",
  "/pronounce-dojo/mp3/correct3.mp3",
  "/pronounce-dojo/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((e) => console.warn("Failed to cache", url, e))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
