// Panel privado: ver, aprobar y borrar reseñas. Necesita el secreto ADMIN_KEY.
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

function igual(a, b) { // comparación que no filtra información por tiempo
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const autorizado = (request, env) =>
  !!env.ADMIN_KEY && env.ADMIN_KEY.length >= 12 && igual(request.headers.get('Authorization') || '', 'Bearer ' + env.ADMIN_KEY);

export async function onRequestGet({ request, env }) {
  if (!autorizado(request, env)) return json({ error: 'No autorizado' }, 401);
  const lista = await env.RESENAS.list({ prefix: 'rev:', limit: 200 });
  const todas = await Promise.all(lista.keys.map((k) => env.RESENAS.get(k.name, 'json')));
  return json(todas.filter(Boolean).sort((a, b) => b.ts - a.ts));
}

export async function onRequestPost({ request, env }) {
  if (!autorizado(request, env)) return json({ error: 'No autorizado' }, 401);
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
