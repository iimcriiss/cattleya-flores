const $ = s => document.querySelector(s);
let KEY = sessionStorage.getItem('ck') || '';
const api = (m, body) => fetch('/api/admin', { method: m, headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });

async function cargar() {
  const r = await api('GET');
  if (!r.ok) { $('#msg').textContent = 'Clave incorrecta'; sessionStorage.removeItem('ck'); $('#login').hidden = false; $('#lista').replaceChildren(); return; }
  $('#msg').textContent = ''; $('#login').hidden = true;
  const datos = await r.json();
  const cont = $('#lista'); cont.replaceChildren();
  if (!datos.length) cont.textContent = 'Todavía no hay reseñas.';
  for (const x of datos) {
    const c = document.createElement('div'); c.className = 'card';
    if (x.img) { const i = document.createElement('img'); i.src = x.img; i.alt = ''; c.append(i); }
    const d = document.createElement('div');
    const tag = document.createElement('span'); tag.className = 'tag' + (x.ok ? ' pub' : ''); tag.textContent = x.ok ? 'Publicada' : 'Pendiente';
    const est = document.createElement('div'); est.textContent = '★'.repeat(x.s) + '☆'.repeat(5 - x.s);
    const t = document.createElement('p'); t.textContent = '“' + x.t + '”';
    const q = document.createElement('b'); q.textContent = x.n + (x.c ? ' · ' + x.c : '');
    const a = document.createElement('div'); a.className = 'acts';
    const mk = (txt, cls, accion, conf) => { const b = document.createElement('button'); b.textContent = txt; if (cls) b.className = cls;
      b.onclick = async () => { if (conf && !confirm(conf)) return; b.disabled = true; await api('POST', { id: x.id, accion }); cargar(); }; return b; };
    a.append(x.ok ? mk('Ocultar', '', 'ocultar') : mk('Aprobar', 'ok', 'aprobar'), mk('Borrar', 'del', 'borrar', '¿Borrar esta reseña y su foto? No se puede deshacer.'));
    d.append(tag, est, t, q, a); c.append(d); cont.append(c);
  }
}
$('#login').onsubmit = e => { e.preventDefault(); KEY = $('#key').value.trim(); sessionStorage.setItem('ck', KEY); cargar(); };
if (KEY) cargar();
