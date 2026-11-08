// GET /api/flores → flores subidas desde el panel que están visibles en el catálogo.
// Usa: RESENAS (KV, claves "flores" y "orden").
const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', 'cache-control': 'no-store', ...extra },
  });

export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const clave = new Request(new URL('/api/flores', request.url).toString());
  try { const hit = cache && (await cache.match(clave)); if (hit) return hit; } catch {}
  try {
    const todas = (await env.RESENAS.get('flores', 'json')) || [];
    const ok = todas
      .filter((f) => f && (f.ok || f.f)) // las de siempre se envían también ocultas, para que la página las esconda
      .map((f) => ({ id: f.id, ...(f.f ? { f: f.f } : {}), ok: !!f.ok, n: f.n, d: f.d || '', c: f.c, t: f.t || '', k: f.k || '', img: f.img, th: f.th || f.img, ...(!f.f && f.ts ? { ts: f.ts } : {}) }));
    // Orden elegido en el panel: va como último elemento de la lista ({ orden: [...] }); la página lo usa para ordenar el catálogo
    try { const orden = await env.RESENAS.get('orden', 'json'); if (Array.isArray(orden) && orden.length) ok.push({ orden }); } catch {}
    const res = json(ok, 200, { 'cache-control': 'public, max-age=30, s-maxage=60' });
    try { if (cache) context.waitUntil(cache.put(clave, res.clone()).catch(() => {})); } catch {}
    return res;
  } catch {
    return json([], 200); // si KV falla, el catálogo sigue con las flores de siempre
  }
}
