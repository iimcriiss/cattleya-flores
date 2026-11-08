// Panel privado: subir, editar, ocultar y borrar flores del catálogo. Necesita el secreto ADMIN_KEY.
// Usa: RESENAS (KV, claves "flores" y "orden") y FOTOS (R2, carpeta flores/).
const MAX_FOTO = 2 * 1024 * 1024; // 2 MB por imagen (el panel ya las achica)
const MAX_FLORES = 300;
const COLORES = ['rojo', 'rosa', 'amarillo', 'azul', 'morado', 'blanco'];
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });

const enc = new TextEncoder();
const sha = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const hex = (u8) => [...u8].map((x) => x.toString(16).padStart(2, '0')).join('');
async function igual(a, b) {
  const [x, y] = await Promise.all([sha(a), sha(b)]);
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i];
  return r === 0;
}
const claveValida = (request, env) =>
  !!env.ADMIN_KEY && env.ADMIN_KEY.length >= 12 && igual(request.headers.get('Authorization') || '', 'Bearer ' + env.ADMIN_KEY);

// Mismo freno que el panel de reseñas: 10 intentos fallidos por conexión cada 15 minutos.
const MAX_FALLOS = 10;
async function guardia(request, env) {
  let clave = null, fallos = 0;
  try {
    clave = 'af:' + hex(await sha(request.headers.get('CF-Connecting-IP') || 'x')).slice(0, 24);
    fallos = parseInt((await env.RESENAS.get(clave)) || '0', 10);
  } catch { clave = null; }
  if (fallos >= MAX_FALLOS) return json({ error: 'Demasiados intentos. Espera unos minutos.' }, 429);
  if (await claveValida(request, env)) return null;
  if (clave) { try { await env.RESENAS.put(clave, String(fallos + 1), { expirationTtl: 900 }); } catch {} }
  return json({ error: 'No autorizado' }, 401);
}

const limpiar = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const soloTexto = (s, max) => limpiar(String(s ?? '').replace(/[^\p{L}\p{N} ]/gu, ' '), max); // letras, números y espacios

function tipoReal(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  return null;
}

const leer = async (env) => (await env.RESENAS.get('flores', 'json')) || [];
const guardar = (env, lista) => env.RESENAS.put('flores', JSON.stringify(lista));
// Las flores de siempre (las del catálogo original) se guardan aquí solo si cambian: "f" es el nombre de su archivo
const claveF = (v) => (/^[A-Za-z0-9_-]{1,80}$/.test(String(v || '')) ? String(v) : '');
const nombreFoto = (url) => (url && /^\/api\/foto\/(flor-[a-z0-9-]+\.(jpg|png|webp))$/.exec(url)?.[1]) || null;
async function borrarFotos(env, f) {
  for (const u of new Set([f.img, f.th])) { const n = nombreFoto(u); if (n) { try { await env.FOTOS.delete('flores/' + n); } catch {} } }
}
// Avisa a la página que la lista cambió (el caché de Cloudflare dura 1 minuto como máximo)
async function refrescar(request, context) {
  try { if (typeof caches !== 'undefined') context.waitUntil(caches.default.delete(new Request(new URL('/api/flores', request.url).toString()))); } catch {}
}
const mismoOrigen = (request) => { const o = request.headers.get('Origin'); return !o || o === new URL(request.url).origin; };

// GET → todas las flores (también las ocultas) y el orden guardado: { flores, orden }
export async function onRequestGet({ request, env }) {
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  let orden = [];
  try { const o = await env.RESENAS.get('orden', 'json'); if (Array.isArray(o)) orden = o; } catch {}
  return json({ flores: await leer(env), orden });
}

// PUT { orden: [clave, clave, ...] } → guarda el orden del catálogo (clave = id de la flor nueva, o "s-" + archivo en las de siempre)
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!mismoOrigen(request)) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  let b; try { b = await request.json(); } catch { return json({ error: 'Datos inválidos' }, 400); }
  if (!Array.isArray(b.orden) || b.orden.length > 700) return json({ error: 'Orden inválido' }, 400);
  const orden = [...new Set(b.orden.map(String))].filter((k) => /^[A-Za-z0-9_-]{1,100}$/.test(k));
  try { await env.RESENAS.put('orden', JSON.stringify(orden)); } catch { return json({ error: 'No se pudo guardar el orden. Intenta de nuevo.' }, 500); }
  await refrescar(request, context);
  return json({ ok: true });
}

// POST (multipart) → crear o editar. Campos: id? o f? (flor de siempre), n, d, c, t, k (colores separados por coma), ok ('1'), foto?, th?
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!mismoOrigen(request)) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  try {
    let f;
    try { f = await request.formData(); } catch { return json({ error: 'Formulario inválido' }, 400); }

    const n = limpiar(f.get('n'), 60);
    const d = limpiar(f.get('d'), 400);
    const c = soloTexto(f.get('c'), 30) || 'Ramos';
    const t = soloTexto(f.get('t'), 40);
    const k = String(f.get('k') || '').toLowerCase().split(/[,\s]+/).filter((x) => COLORES.includes(x)).filter((x, i, a) => a.indexOf(x) === i).join(' ');
    const ok = f.get('ok') === '1';
    if (!n) return json({ error: 'Falta el nombre de la flor' }, 400);

    const fk = claveF(f.get('f'));
    const id = fk ? 's-' + fk : String(f.get('id') || '');
    const lista = await leer(env);
    const prev = id ? lista.find((x) => x.id === id) : null;
    if (id && !prev && !fk) return json({ error: 'Esa flor ya no existe' }, 404);
    if (!prev && lista.length >= MAX_FLORES) return json({ error: 'Llegaste al máximo de flores subidas (' + MAX_FLORES + ')' }, 400);

    const nuevoId = prev ? prev.id : fk ? id : Date.now().toString(36) + '-' + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    let { img = '', th = '' } = prev || {};

    const subir = async (archivo, sufijo, tag) => {
      if (!archivo || typeof archivo !== 'object' || !(archivo.size > 0)) return null;
      if (archivo.size > MAX_FOTO) throw new Error('La foto pesa demasiado (máximo 2 MB)');
      const buf = await archivo.arrayBuffer();
      const ext = tipoReal(new Uint8Array(buf.slice(0, 12)));
      if (!ext) throw new Error('La foto debe ser JPG, PNG o WebP');
      const nombre = 'flor-' + nuevoId + '-' + tag + sufijo + '.' + ext;
      await env.FOTOS.put('flores/' + nombre, buf, { httpMetadata: { contentType: MIME[ext] } });
      return '/api/foto/' + nombre;
    };

    const tag = crypto.randomUUID().replace(/-/g, '').slice(0, 6); // nombre nuevo en cada subida: nunca se ve la foto vieja en caché
    let nuevaImg = null, nuevaTh = null;
    try {
      nuevaImg = await subir(f.get('foto'), '', tag);
      nuevaTh = await subir(f.get('th'), '-t', tag);
    } catch (e) { return json({ error: e.message }, 400); }

    if (nuevaImg) { await borrarFotos(env, { img, th }); img = nuevaImg; th = nuevaTh || nuevaImg; }
    if (!img && !fk) return json({ error: 'Falta la foto de la flor' }, 400);

    const flor = { id: nuevoId, ...(fk ? { f: fk } : {}), n, d, c, t, k, ok, img, th, ts: prev ? prev.ts : Date.now() };
    const nueva = prev ? lista.map((x) => (x.id === nuevoId ? flor : x)) : [flor, ...lista];
    await guardar(env, nueva);
    await refrescar(request, context);
    return json({ ok: true, flor });
  } catch {
    return json({ error: 'No se pudo guardar. Intenta de nuevo en un momento.' }, 500);
  }
}

// PATCH {id | f, ok} → mostrar u ocultar en el catálogo (f = flor de siempre)
export async function onRequestPatch(context) {
  const { request, env } = context;
  if (!mismoOrigen(request)) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  let b; try { b = await request.json(); } catch { return json({ error: 'Datos inválidos' }, 400); }
  const lista = await leer(env);
  const fk = claveF(b.f);
  const id = fk ? 's-' + fk : b.id;
  let f = lista.find((x) => x.id === id);
  if (!f && fk) {
    if (lista.length >= MAX_FLORES) return json({ error: 'Demasiados cambios guardados' }, 400);
    f = { id, f: fk, n: '', d: '', c: '', t: '', k: '', ok: !!b.ok, img: '', th: '', ts: Date.now() };
    lista.push(f);
  }
  if (!f) return json({ error: 'No existe' }, 404);
  f.ok = !!b.ok;
  await guardar(env, lista);
  await refrescar(request, context);
  return json({ ok: true });
}

// DELETE {id | f} → borra la flor y sus fotos (en una flor de siempre: quita los cambios y vuelve a como estaba)
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!mismoOrigen(request)) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  let b; try { b = await request.json(); } catch { return json({ error: 'Datos inválidos' }, 400); }
  const lista = await leer(env);
  const id = claveF(b.f) ? 's-' + claveF(b.f) : b.id;
  const f = lista.find((x) => x.id === id);
  if (!f) return json({ ok: true }); // ya estaba como en el original
  await borrarFotos(env, f);
  await guardar(env, lista.filter((x) => x.id !== id));
  await refrescar(request, context);
  return json({ ok: true });
}
