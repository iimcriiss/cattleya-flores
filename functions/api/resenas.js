// Recibe reseñas (POST) y entrega las aprobadas (GET).
// Usa: RESENAS (KV) y FOTOS (R2).
const MAX_FOTO = 3 * 1024 * 1024; // 3 MB
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

const limpiar = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// Revisa los primeros bytes del archivo para confirmar que de verdad es una imagen
function tipoReal(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  return null;
}

// GET /api/resenas → solo las reseñas aprobadas
export async function onRequestGet({ env }) {
  const lista = await env.RESENAS.list({ prefix: 'rev:', limit: 200 });
  const todas = await Promise.all(lista.keys.map((k) => env.RESENAS.get(k.name, 'json')));
  const ok = todas
    .filter((r) => r && r.ok)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 30)
    .map((r) => ({ n: r.n, c: r.c || undefined, s: r.s, t: r.t, img: r.img || undefined }));
  return json(ok, 200, { 'cache-control': 'public, max-age=60' });
}

// POST /api/resenas → guarda una reseña nueva como PENDIENTE
export async function onRequestPost({ request, env }) {
  let f;
  try { f = await request.formData(); } catch { return json({ error: 'Formulario inválido' }, 400); }

  if (f.get('web')) return json({ ok: true }); // campo trampa para bots: se ignora en silencio

  const n = limpiar(f.get('n'), 40);
  const c = limpiar(f.get('c'), 40);
  const t = limpiar(f.get('t'), 400);
  const s = Math.min(5, Math.max(1, parseInt(f.get('s'), 10) || 5));
  if (!n || !t) return json({ error: 'Falta tu nombre o tu reseña' }, 400);

  // Máximo 3 reseñas por hora desde la misma conexión
  const ip = request.headers.get('CF-Connecting-IP') || 'x';
  const rk = 'rl:' + ip;
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

  await env.RESENAS.put('rev:' + id, JSON.stringify({ id, n, c, s, t, img, ok: false, ts: Date.now() }));
  await env.RESENAS.put(rk, String(usados + 1), { expirationTtl: 3600 });
  return json({ ok: true });
}
