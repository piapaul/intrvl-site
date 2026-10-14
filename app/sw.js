/* intrvl service worker - makes the installed app work offline.
   GENERATED into app/sw.js by build.mjs (the version number below changes whenever any app file changes,
   which is what makes the phone pick up updates). Edit src/app/sw.js, not app/sw.js. */
'use strict';

var VERSION = '6ee77adfd244';
var CACHE = 'intrvl-app-' + VERSION;       // the app itself: replaced on every update
var RUNTIME = 'intrvl-pictures-v1';       // stave pictures: kept between updates
var PRECACHE = [
  "./",
  "manifest.webmanifest",
  "intrvl-chords.html",
  "intrvl-circle-of-fifths.html",
  "intrvl-clefs.html",
  "intrvl-ear.html",
  "intrvl-games.html",
  "intrvl-heaven.html",
  "intrvl-intervals.html",
  "intrvl-matchmaker.html",
  "intrvl-metronome.html",
  "intrvl-modes.html",
  "intrvl-note-spinner.html",
  "intrvl-notes.html",
  "intrvl-spelling.html",
  "intrvl-tools.html",
  "intrvl-transpose.html",
  "intrvl-tuner.html",
  "index.html",
  "fonts/fonts.css",
  "fonts/fraunces-latin.woff2",
  "fonts/raleway-latin.woff2",
  "../icons/home-180.png",
  "../icons/games-180.png",
  "../icons/tools-180.png",
  "../icons/interval-180.png",
  "../icons/enharmonic-180.png",
  "../icons/pitch-180.png",
  "../icons/seventh-180.png",
  "../icons/spelling-180.png",
  "../icons/clef-180.png",
  "../icons/note-180.png",
  "../icons/metronome-180.png",
  "../icons/tuner-180.png",
  "../icons/note-spinner-180.png",
  "../icons/circle-180.png",
  "../icons/modes-180.png",
  "../icons/transpose-180.png",
  "../icons/chords-180.png",
  "../icons/home-192.png",
  "../icons/home-512.png",
  "../icons/home-maskable-512.png"
];
var PICTURE_HOST = 'piapaul.github.io';
var PICTURE_PATH = '/music-theory-images/';
var MAX_PICTURES = 900;

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('intrvl-app-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isPicture(url) { return url.hostname === PICTURE_HOST && url.pathname.indexOf(PICTURE_PATH) === 0; }

// Pages: ask the network first (so updates arrive as soon as you're online), fall back to the saved copy.
function pageRequest(request) {
  return new Promise(function (resolve) {
    var settled = false;
    var timer = setTimeout(function () { fallback(); }, 4000);          // a bad signal shouldn't hang the app
    function fallback() {
      if (settled) return;
      caches.match(request, { ignoreSearch: true }).then(function (hit) {
        if (hit) { settled = true; clearTimeout(timer); resolve(hit); }
      });
    }
    fetch(request).then(function (res) {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(request, copy); }); }
      resolve(res);
    }).catch(function () {
      if (settled) return;
      caches.match(request, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./index.html'); }).then(function (hit) {
        settled = true; clearTimeout(timer);
        resolve(hit || new Response('You are offline and this page has not been saved yet.', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
      });
    });
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function (hit) {
    if (hit) return hit;
    return fetch(request).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(request, copy); }); }
      return res;
    });
  });
}

// Stave pictures: saved the first time they are seen, then served from the phone. Fetched with CORS so they
// are stored at their real size (an "opaque" copy counts as several megabytes against the storage quota).
function trim(cache) {
  return cache.keys().then(function (keys) {
    var extra = keys.length - MAX_PICTURES;
    return Promise.all(keys.slice(0, Math.max(0, extra)).map(function (k) { return cache.delete(k); }));
  });
}
function pictureRequest(request) {
  return caches.open(RUNTIME).then(function (cache) {
    return cache.match(request.url).then(function (hit) {
      if (hit) return hit;
      return fetch(new Request(request.url, { mode: 'cors', credentials: 'omit' })).then(function (res) {
        if (res && res.ok) { cache.put(request.url, res.clone()).then(function () { return trim(cache); }); }
        return res;
      });
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (isPicture(url)) {
    if (url.pathname.slice(-5) === '.json') {          // the note list: take the fresh one when online
      event.respondWith(fetch(request).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(RUNTIME).then(function (c) { c.put(request.url, copy); }); }
        return res;
      }).catch(function () { return caches.open(RUNTIME).then(function (c) { return c.match(request.url); }).then(function (hit) { return hit || Response.error(); }); }));
    } else {
      event.respondWith(pictureRequest(request).catch(function () { return Response.error(); }));
    }
    return;
  }
  if (url.origin !== self.location.origin) return;       // leaderboard and anything else: straight to the network
  if (request.mode === 'navigate') { event.respondWith(pageRequest(request)); return; }
  event.respondWith(cacheFirst(request).catch(function () { return Response.error(); }));
});

// A page can ask the worker to save a list of pictures ahead of time (see IV.prefetch in core.js).
self.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type !== 'prefetch' || !Array.isArray(data.urls)) return;
  var urls = data.urls.filter(function (u) { try { return isPicture(new URL(u)); } catch (e) { return false; } });
  event.waitUntil(caches.open(RUNTIME).then(function (cache) {
    var i = 0;
    function next() {
      if (i >= urls.length) return trim(cache);
      var u = urls[i++];
      return cache.match(u).then(function (hit) {
        if (hit) return null;
        return fetch(new Request(u, { mode: 'cors', credentials: 'omit' })).then(function (res) { if (res && res.ok) return cache.put(u, res); }).catch(function () {});
      }).then(next);
    }
    return next();
  }));
});
