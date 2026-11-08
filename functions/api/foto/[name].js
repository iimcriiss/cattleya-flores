// GET /api/foto/<nombre> → entrega una foto guardada en R2 (reseñas: <id>.jpg · flores: flor-<id>.webp)
export async function onRequestGet({ params, env }) {
  const name = String(params.name || '');
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(name)) return new Response('No encontrada', { status: 404 });
  const carpeta = name.startsWith('flor-') ? 'flores/' : 'resenas/';
  const obj = await env.FOTOS.get(carpeta + name);
  if (!obj) return new Response('No encontrada', { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('cache-control', 'public, max-age=86400');
  h.set('x-content-type-options', 'nosniff');
  h.set('content-security-policy', "default-src 'none'");
  h.set('cross-origin-resource-policy', 'same-origin');
  return new Response(obj.body, { headers: h });
}
