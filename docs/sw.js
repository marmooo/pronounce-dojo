var CACHE_NAME="2023-02-16 09:45",urlsToCache=["/pronounce-dojo/","/pronounce-dojo/index.js","/pronounce-dojo/data/0.csv","/pronounce-dojo/data/1.csv","/pronounce-dojo/data/2.csv","/pronounce-dojo/data/3.csv","/pronounce-dojo/data/4.csv","/pronounce-dojo/data/5.csv","/pronounce-dojo/mp3/end.mp3","/pronounce-dojo/mp3/incorrect1.mp3","/pronounce-dojo/mp3/correct3.mp3","/pronounce-dojo/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})