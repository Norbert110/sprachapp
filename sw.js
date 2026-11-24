'use strict';

// Service worker of the app on an internet address (see "Use without internet" in app.js). It keeps the app
// itself on the device and answers the requests for sign videos from the copies that app.js keeps.
//
// tools/build.js writes a version below that changes with every changed build. The browser then installs this
// file again, which fetches the new app. The open app keeps running; the new one shows on the next start.

const VERSION = 'a18a53330737';
const SHELL_CACHE = 'speech-app-shell-' + VERSION;
const VIDEO_CACHE = 'speech-app-signs-v1';   // the same name is used in app.js
const SHELL_FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const SCOPE = new URL('./', self.location.href);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // "reload" goes past the cache of the browser, so a new version never keeps an old page.
    await cache.addAll(SHELL_FILES.map((file) => new Request(new URL(file, SCOPE).href, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('speech-app-shell-') && name !== SHELL_CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  const address = url.origin + url.pathname;
  if (url.pathname.startsWith(SCOPE.pathname + 'signs/')) event.respondWith(videoAnswer(request, address));
  // Every way of opening the app (with or without "index.html", with a "?...") gets the one kept page.
  else if (request.mode === 'navigate') event.respondWith(keptOrNetwork(SCOPE.href, request));
  else event.respondWith(keptOrNetwork(address, request));
});

async function keptOrNetwork(address, request) {
  const cache = await caches.open(SHELL_CACHE);
  return (await cache.match(address, { ignoreVary: true })) || fetch(request);
}

// Answers the request for a sign video from the kept copy; a video that is not kept comes from the network.
// A video element asks for parts of the file ("Range"), and Safari plays nothing unless it gets exactly the
// part it asked for. So the part is cut out of the kept file here, the way a web server does it.
async function videoAnswer(request, address) {
  const cache = await caches.open(VIDEO_CACHE);
  const kept = await cache.match(address, { ignoreVary: true });
  if (!kept) return fetch(request);
  const range = request.headers.get('range');
  if (!range) return kept;

  const data = await kept.arrayBuffer();
  const size = data.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = 0;
  let end = size - 1;
  let valid = Boolean(match) && (match[1] !== '' || match[2] !== '');
  if (valid && match[1] === '') {
    // "-500" asks for the last 500 bytes.
    valid = Number(match[2]) > 0;
    start = Math.max(0, size - Number(match[2]));
  } else if (valid) {
    start = Number(match[1]);
    if (match[2] !== '') end = Math.min(Number(match[2]), size - 1);
  }
  if (!valid || start > end || start >= size) {
    return new Response(null, { status: 416, statusText: 'Range Not Satisfiable', headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(data.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': kept.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}
