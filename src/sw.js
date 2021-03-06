var CACHE_NAME = "2022-07-24 00:46";
var urlsToCache = [
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
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
