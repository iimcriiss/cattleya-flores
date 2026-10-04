// Panel privado: ver, aprobar y borrar reseñas. Necesita el secreto ADMIN_KEY.
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });

const enc = new TextEncoder();
const sha = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const hex = (u8) => [...u8].map((x) => x.toString(16).padStart(2, '0')).join('');

// Compara los hashes de ambos textos: tarda lo mismo sin importar cuántos caracteres acierte
// ni qué largo tenga la clave (así no se filtra información por tiempo).
async function igual(a, b) {
  const [x, y] = await Promise.all([sha(a), sha(b)]);
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i];
  return r === 0;
}
const claveValida = (request, env) =>
  !!env.ADMIN_KEY && env.ADMIN_KEY.length >= 12 && igual(request.headers.get('Authorization') || '', 'Bearer ' + env.ADMIN_KEY);

// Freno contra adivinar la clave: 10 intentos fallidos por conexión cada 15 minutos.
// Solo se escribe en KV cuando hay un fallo, así que el uso normal casi no gasta nada.
const MAX_FALLOS = 10;
async function guardia(request, env) {
  let clave = null, fallos = 0;
  try {
    clave = 'af:' + hex(await sha(request.headers.get('CF-Connecting-IP') || 'x')).slice(0, 24);
    fallos = parseInt((await env.RESENAS.get(clave)) || '0', 10);
  } catch { clave = null; } // si KV falla, no se bloquea a la dueña
  if (fallos >= MAX_FALLOS) return json({ error: 'Demasiados intentos. Espera unos minutos.' }, 429);
  if (await claveValida(request, env)) return null;
  if (clave) { try { await env.RESENAS.put(clave, String(fallos + 1), { expirationTtl: 900 }); } catch {} }
  return json({ error: 'No autorizado' }, 401);
}

export async function onRequestGet({ request, env }) {
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  const lista = await env.RESENAS.list({ prefix: 'rev:', limit: 200 });
  const todas = await Promise.all(lista.keys.map((k) => env.RESENAS.get(k.name, 'json')));
  return json(todas.filter(Boolean).sort((a, b) => b.ts - a.ts));
}

export async function onRequestPost({ request, env }) {
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  let b;
  try { b = await request.json(); } catch { return json({ error: 'Datos inválidos' }, 400); }
  const id = String(b.id || '');
  if (!/^[a-z0-9-]+$/.test(id)) return json({ error: 'Id inválido' }, 400);
  const r = await env.RESENAS.get('rev:' + id, 'json');
  if (!r) return json({ error: 'No existe' }, 404);

  if (b.accion === 'aprobar' || b.accion === 'ocultar') {
    r.ok = b.accion === 'aprobar';
    await env.RESENAS.put('rev:' + id, JSON.stringify(r));
    return json({ ok: true });
  }
  if (b.accion === 'borrar') {
    if (r.img) await env.FOTOS.delete('resenas/' + r.img.split('/').pop());
    await env.RESENAS.delete('rev:' + id);
    return json({ ok: true });
  }
  return json({ error: 'Acción inválida' }, 400);
}
