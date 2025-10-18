const CACHE_NAME = "2025-10-17 00:00";
const urlsToCache = [
  "/pronounce-dojo/",
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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
