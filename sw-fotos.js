/* La Madriguera · servidor de fotos
   Las fotos subidas desde el panel viven en Firestore (colección «fotos»).
   Este service worker atiende las direcciones /foto/<id>?v=<versión>: descarga la
   foto de Firestore UNA sola vez, la guarda en el navegador y la sirve como una
   imagen normal. Así el navegador solo baja las fotos que se ven en pantalla.
   No toca ninguna otra petición de la web. */
const CACHE = 'lm-fotos-v1';
const FS = 'https://firestore.googleapis.com/v1/projects/adminpagweb/databases/(default)/documents/fotos/';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf('/foto/') !== 0) return;
  e.respondWith(servir(e.request, url));
});

async function servir(req, url) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const id = decodeURIComponent(url.pathname.slice('/foto/'.length));
    const r = await fetch(FS + encodeURIComponent(id));
    if (!r.ok) return new Response('', { status: 404 });
    const j = await r.json();
    const d = (j && j.fields && j.fields.d && j.fields.d.stringValue) || '';
    const m = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(d);
    if (!m) return new Response('', { status: 404 });
    let bytes;
    if (m[2]) {
      const bin = atob(m[3]);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } else {
      bytes = new TextEncoder().encode(decodeURIComponent(m[3]));
    }
    const res = new Response(bytes, { headers: { 'Content-Type': m[1], 'Cache-Control': 'max-age=31536000, immutable' } });
    await cache.put(req, res.clone());
    // Borra versiones anteriores de la misma foto
    cache.keys().then((ks) => ks.forEach((k) => {
      const u = new URL(k.url);
      if (u.pathname === url.pathname && u.search !== url.search) cache.delete(k);
    }));
    return res;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}
