// Recibe reseñas (POST) y entrega las aprobadas (GET).
// Usa: RESENAS (KV) y FOTOS (R2).
const MAX_FOTO = 3 * 1024 * 1024; // 3 MB
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra },
  });

const limpiar = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// La IP no se guarda en claro: solo un hash corto, suficiente para limitar envíos por conexión.
async function hashIp(ip) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(d)].slice(0, 12).map((x) => x.toString(16).padStart(2, '0')).join('');
}

function tipoReal(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  return null;
}

// GET /api/resenas → solo las reseñas aprobadas
export async function onRequestGet(context) {
  const { request, env } = context;
  // Guarda la lista 2 minutos en el caché de Cloudflare para gastar casi nada de KV
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const clave = new Request(new URL('/api/resenas', request.url).toString());
  try { const hit = cache && (await cache.match(clave)); if (hit) return hit; } catch {}
  try {
    const lista = await env.RESENAS.list({ prefix: 'rev:', limit: 200 });
    const todas = await Promise.all(lista.keys.map((k) => env.RESENAS.get(k.name, 'json')));
    const ok = todas
      .filter((r) => r && r.ok)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 30)
      .map((r) => ({ n: r.n, c: r.c || undefined, s: r.s, t: r.t, img: r.img || undefined }));
    const res = json(ok, 200, { 'cache-control': 'public, max-age=60, s-maxage=120' });
    try { if (cache) context.waitUntil(cache.put(clave, res.clone()).catch(() => {})); } catch {}
    return res;
  } catch {
    return json([], 200); // si KV falla o se agotó el límite del día, la página sigue funcionando sin reseñas
  }
}

export async function onRequestPost({ request, env }) {
  try { return await guardar(request, env); }
  catch { return json({ error: 'No se pudo guardar tu reseña. Intenta de nuevo en un momento.' }, 500); }
}

async function guardar(request, env) {
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return json({ error: 'Origen no permitido' }, 403);

  if (parseInt(request.headers.get('Content-Length') || '0', 10) > MAX_FOTO + 64 * 1024) return json({ error: 'La foto pesa demasiado (máximo 3 MB)' }, 413);

  let f;
  try { f = await request.formData(); } catch { return json({ error: 'Formulario inválido' }, 400); }

  if (f.get('web')) return json({ ok: true });

  if (f.get('acepto') !== '1') return json({ error: 'Debes aceptar la política de datos para enviar tu reseña' }, 400);
  const n = limpiar(f.get('n'), 40);
  const c = limpiar(f.get('c'), 40);
  const t = limpiar(f.get('t'), 400);
  const s = Math.min(5, Math.max(1, parseInt(f.get('s'), 10) || 5));
  if (!n || !t) return json({ error: 'Falta tu nombre o tu reseña' }, 400);

  const rk = 'rl:' + (await hashIp(request.headers.get('CF-Connecting-IP') || 'x'));
  const usados = parseInt((await env.RESENAS.get(rk)) || '0', 10);
  if (usados >= 3) return json({ error: 'Ya enviaste varias reseñas. Intenta de nuevo más tarde.' }, 429);

  const id = Date.now().toString(36) + '-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);

  let img = '';
  const foto = f.get('foto');
  if (foto && typeof foto === 'object' && foto.size > 0) {
    if (foto.size > MAX_FOTO) return json({ error: 'La foto pesa demasiado (máximo 3 MB)' }, 413);
    const buf = await foto.arrayBuffer();
    const ext = tipoReal(new Uint8Array(buf.slice(0, 12)));
    if (!ext) return json({ error: 'La foto debe ser JPG, PNG o WebP' }, 415);
    await env.FOTOS.put('resenas/' + id + '.' + ext, buf, { httpMetadata: { contentType: MIME[ext] } });
    img = '/api/foto/' + id + '.' + ext;
  }

  await env.RESENAS.put('rev:' + id, JSON.stringify({ id, n, c, s, t, img, ok: false, ts: Date.now(), acepto: new Date().toISOString() }));
  await env.RESENAS.put(rk, String(usados + 1), { expirationTtl: 3600 });
  return json({ ok: true });
}
