/* Android Lab offline support.
   The shell (page, styles, app, catalog, docs) is cached on install. Track files (tracks/*.js) are cached the first
   time a lesson from them opens. Everything is network-first with the cache as the offline fallback, so a deploy
   shows up on the next load and a visited lesson still works offline. Bump VERSION to drop every old cache at once. Paths are relative to this file, so the
   site works from a subpath such as /android_lab/. */
const VERSION = 'v16';
const CACHE = 'android-lab-' + VERSION;
const CORE = ['./', 'index.html', 'style.css', 'js/app.js', 'js/ui.js', 'favicon.svg', 'manifest.webmanifest', 'icon-512.png', 'icon-192.png', 'icon-maskable-512.png', 'js/catalog.js', 'js/docs.js'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // One by one: a file that 404s must not fail the whole install.
    await Promise.all(CORE.map(u => cache.add(new Request(u, { cache: 'no-cache' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('android-lab-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !FONT_HOSTS.includes(url.hostname)) return;
  // Network first, cache as the offline fallback. Cache-first served an old page with new track files after a deploy.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req, url.origin === location.origin ? { cache: 'no-cache' } : undefined);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
      if (hit) return hit;
      throw e;
    }
  })());
});
