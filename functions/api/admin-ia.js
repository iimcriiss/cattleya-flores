// Ayuda con IA para el panel privado: redacta descripciones, textos de Instagram y respuestas a clientes.
// Necesita los secretos ADMIN_KEY y GEMINI_API_KEY. Solo sugiere texto: no guarda nada.
const MODELO = 'gemini-flash-lite-latest'; // si Google lo cambia, pon aquí otro modelo Flash-Lite

const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});

// ── Clave de administradora (misma lógica que /api/admin) ──
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

// ── Instrucciones por tarea ──
const BASE = `Eres la asistente de redacción de Cattleya Flores Artesanales, un emprendimiento de Rubio, Táchira, que hace flores 100% a mano con limpiapipas. Escribes en español, con tono cálido, cercano y natural, como lo diría su dueña.
Reglas generales:
- Nunca inventes precios, medidas, tiempos de entrega, descuentos, materiales ni datos que no te den.
- Todo es 100% a mano y SOLO con limpiapipas: no hacen crochet ni otros materiales. Las flores no se marchitan ni necesitan agua.
- Los pedidos se hacen por WhatsApp. Se envía a todo el país y al exterior. Se aceptan diseños personalizados y se puede elegir el tamaño.
- Personajes o figuras (como Snoopy): depende del caso, no lo prometas.
- Responde SOLO con el texto pedido, sin explicaciones ni comillas alrededor. Sin asteriscos ni formato markdown.`;

const TAREAS = {
  descripcion: (d) => ({
    sistema: BASE + `\nTarea: escribe la descripción de una flor para el catálogo. 2 o 3 frases, máximo 330 caracteres. Habla de colores, forma y del detalle de estar hecha a mano. Sin emojis.`,
    pedido: `Nombre: ${d.nombre}\nCategoría: ${d.categoria}\n` + (d.tipo ? `Tipo de flor: ${d.tipo}\n` : '') + (d.notas ? `Detalles que sí puedes usar: ${d.notas}\n` : '') + `Escribe la descripción.`,
    max: 400
  }),
  instagram: (d) => ({
    sistema: BASE + `\nTarea: escribe un texto (caption) para Instagram. 2 o 3 frases con gancho al inicio, 2 o 3 emojis florales, una invitación a pedir por WhatsApp (sin inventar el número) y al final 6 a 8 hashtags en español relacionados (flores artesanales, limpiapipas, regalos, Venezuela, Colombia).`,
    pedido: `Producto: ${d.nombre}\n` + (d.descripcion ? `Descripción: ${d.descripcion}\n` : '') + (d.notas ? `Ocasión o idea: ${d.notas}\n` : '') + `Escribe el caption.`,
    max: 900, emojis: true
  }),
  respuesta: (d) => ({
    sistema: BASE + `\nTarea: redacta la respuesta de WhatsApp a un mensaje de un cliente. Corta (máximo 4 frases), amable y clara, y puede llevar un emoji.
Reglas para esta tarea:
- Solo confirma lo que está en los datos de arriba. Para cualquier otro pedido o pregunta, NO prometas ni digas "sí" o "no": agradece, haz una pregunta al cliente (tamaño, colores, fecha) y deja un marcador.
- Si falta un dato que solo la dueña sabe, escribe un marcador EN MAYÚSCULAS entre corchetes con lo que debe completar: [PRECIO], [TIEMPO] o [CONFIRMAR: ¿se puede hacer ...?]. La frase debe leerse bien aunque se quite el marcador.
- No uses el mismo marcador más de dos veces.`,
    pedido: `Mensaje del cliente:\n"${d.mensaje}"\n` + (d.notas ? `Lo que quiero decirle: ${d.notas}\n` : '') + `Escribe la respuesta.`,
    max: 700, emojis: true
  })
};

const txt = (v, n) => (typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim().slice(0, n) : '');
const limpiar = (s) => s.replace(/\*+/g, '').replace(/^\s*[-•·]\s+/gm, '').replace(/^#+\s*/gm, '').replace(/`/g, '').replace(/\n{3,}/g, '\n\n').trim();

export async function onRequestPost({ request, env }) {
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return json({ error: 'Origen no permitido' }, 403);
  const bloqueo = await guardia(request, env);
  if (bloqueo) return bloqueo;
  if (!env.GEMINI_API_KEY) return json({ error: 'Falta GEMINI_API_KEY en este entorno' }, 503);

  const raw = await request.text();
  if (raw.length > 6000) return json({ error: 'Texto demasiado largo' }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: 'Datos inválidos' }, 400); }
  if (!TAREAS[b.tarea]) return json({ error: 'Tarea inválida' }, 400);

  const d = {
    nombre: txt(b.nombre, 80), categoria: txt(b.categoria, 40), tipo: txt(b.tipo, 40),
    descripcion: txt(b.descripcion, 400), notas: txt(b.notas, 300), mensaje: txt(b.mensaje, 600)
  };
  if (b.tarea === 'respuesta' ? !d.mensaje : !d.nombre) return json({ error: b.tarea === 'respuesta' ? 'Falta el mensaje del cliente' : 'Falta el nombre' }, 400);

  const t = TAREAS[b.tarea](d);
  let r;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: t.sistema }] },
        contents: [{ role: 'user', parts: [{ text: t.pedido }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
      }),
      signal: AbortSignal.timeout(20000)
    });
  } catch { return json({ error: 'No se pudo conectar con la IA' }, 502); }

  if (!r.ok) return json({ error: r.status === 429 ? 'Se acabó el límite gratis por ahora. Intenta en unos minutos.' : 'La IA no respondió' }, r.status === 429 ? 429 : 502);
  const j = await r.json().catch(() => null);
  const out = limpiar(((j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map((p) => p.text || '').join(''));
  if (!out) return json({ error: 'La IA devolvió una respuesta vacía' }, 502);
  return json({ t: out.slice(0, t.max) });
}
