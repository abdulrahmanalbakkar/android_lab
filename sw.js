/* Android Lab offline support.
   The shell (page, styles, app, every script listed in index.html) is cache-first, refreshed in the background,
   so a second visit works offline and picks up edits on the visit after. Anything else is network-first with
   the cache as fallback. Bump VERSION to drop every old cache at once. Paths are relative to this file, so the
   site works from a subpath such as /android_lab/. */
const VERSION = 'v9';
const CACHE = 'android-lab-' + VERSION;
const CORE = ['./', 'index.html', 'style.css', 'js/app.js', 'favicon.svg', 'manifest.webmanifest', 'icon-512.png', 'icon-192.png', 'icon-maskable-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// Track scripts are read from index.html, so adding a track needs no change here.
async function shellUrls() {
  try {
    const html = await (await fetch('index.html', { cache: 'no-cache' })).text();
    return CORE.concat([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m => m[1]).filter(u => !/^[a-z]+:|^\/\//i.test(u)));
  } catch (e) { return CORE; }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // One by one: a script that 404s (say a track not written yet) must not fail the whole install.
    await Promise.all((await shellUrls()).map(u => cache.add(new Request(u, { cache: 'no-cache' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('android-lab-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isShell = url => url.origin === location.origin && /(\/|\.html|\.css|\.js|\.svg|\.webmanifest)$/.test(url.pathname) && !url.pathname.endsWith('/sw.js');

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;

  if (req.mode === 'navigate' || isShell(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      // Navigations to the folder or index.html share one entry; the #route never reaches the server.
      const hit = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
      const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
      if (hit) { event.waitUntil(fresh.catch(() => {})); return hit; }
      return fresh;
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    } catch (e) {
      const hit = await cache.match(req);
      if (hit) return hit;
      throw e;
    }
  })());
});
