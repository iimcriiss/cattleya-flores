const $ = s => document.querySelector(s);
let KEY = sessionStorage.getItem('ck') || '';
const auth = () => ({ Authorization: 'Bearer ' + KEY });
const api = (m, body) => fetch('/api/admin', { method: m, headers: { ...auth(), 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
const apiF = (m, body) => fetch('/api/admin/flores', { method: m, headers: body instanceof FormData ? auth() : { ...auth(), 'Content-Type': 'application/json' }, body: body instanceof FormData ? body : body && JSON.stringify(body) });
const h = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };

function salir() { sessionStorage.removeItem('ck'); KEY = ''; location.reload(); }

// ───────── Reseñas
async function cargar() {
  const r = await api('GET');
  if (!r.ok) { $('#msg').textContent = 'Clave incorrecta'; sessionStorage.removeItem('ck'); $('#login').hidden = false; $('#app').hidden = true; $('#lista').replaceChildren(); return; }
  $('#msg').textContent = ''; $('#login').hidden = true; $('#app').hidden = false;
  cargarFlores();
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

// ───────── Pestañas
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
  $('#t-res').hidden = b.dataset.tab !== 'res'; $('#t-flo').hidden = b.dataset.tab !== 'flo';
});
$('#salir').onclick = salir;

// ───────── Flores (las de siempre + las que subas)
const COLORES = { rojo: '#D62839', rosa: '#EE5C8C', amarillo: '#F7B928', azul: '#2F6FE0', morado: '#8D6BD8', blanco: '#FFFFFF' };
const CATS = ['Ramos', 'Macetas', 'Decoración'];
const PAGINA = 20;
let FL = [], editItem = null, fotoNueva = null, estado = 'todas', mostrar = PAGINA;
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const clave = f => f.est ? 's-' + f.f : f.id;

$('#fk').replaceChildren(...Object.entries(COLORES).map(([k, hex]) =>
  h('label', {}, h('input', { type: 'checkbox', value: k }), h('i', { style: `background:${hex}` }), k[0].toUpperCase() + k.slice(1))));

function msgF(t, bien) { const m = $('#fmsg'); m.textContent = t || ''; m.classList.toggle('bien', !!bien); }

// Las flores nuevas (las que subes) y las de siempre (catálogo original + los cambios que les hayas hecho)
function todas() {
  const ov = new Map(FL.filter(x => x.f).map(x => [x.f, x]));
  const cat = (window.CATALOGO && CATALOGO.P) || [], M = (window.CATALOGO && CATALOGO.M) || {};
  const est = cat.map(([f, n, c]) => {
    const o = ov.get(f), [t = '', k = ''] = (M[f] || '|').split('|');
    const base = { id: o && o.id, f, est: true, n, d: '', c, t, k, ok: true, img: `img/flores/${f}.webp`, th: `img/flores/t/${f}.webp`, cambiada: !!o };
    if (!o) return base;
    if (o.n) Object.assign(base, { n: o.n, d: o.d || '', c: o.c, t: o.t || '', k: o.k || '' });
    base.ok = !!o.ok;
    if (o.img) Object.assign(base, { img: o.img, th: o.th || o.img });
    return base;
  });
  return [...FL.filter(x => !x.f), ...est];
}

// Achica la foto en el navegador (así se sube rápido y la página carga liviana). Devuelve un Blob WebP.
async function reducir(file, maxW, maxH, q) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const esc = Math.min(1, maxW / bmp.width, maxH / bmp.height);
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(bmp.width * esc)); cv.height = Math.max(1, Math.round(bmp.height * esc));
  cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
  bmp.close?.();
  return new Promise((ok, no) => cv.toBlob(b => b ? ok(b) : no(new Error('No se pudo procesar la foto')), 'image/webp', q));
}

async function cargarFlores() {
  const r = await apiF('GET');
  if (r.status === 401) return salir();
  if (!r.ok) { $('#flores').replaceChildren(h('p', { className: 'vacia', textContent: 'No se pudieron cargar las flores.' })); return; }
  FL = await r.json();
  pintarFlores();
}

const categorias = () => [...new Set([...CATS, ...todas().map(f => f.c)])];

function pintarFlores() {
  const todo = todas();
  $('#nflo').textContent = todo.length || '';
  $('#ncnt').textContent = todo.length ? todo.length + ' flores' : '';
  const cats = categorias();
  $('#cats').replaceChildren(...cats.map(c => h('option', { value: c })));
  const sel = $('#fcat'), actual = sel.value;
  sel.replaceChildren(h('option', { value: '', textContent: 'Todas las categorías' }), ...cats.map(c => h('option', { value: c, textContent: c })));
  sel.value = cats.includes(actual) ? actual : '';

  const q = norm($('#buscar').value).split(/\s+/).filter(Boolean);
  const lista = todo.filter(f =>
    (estado === 'todas' || (estado === 'vis' ? f.ok : !f.ok)) &&
    (!sel.value || f.c === sel.value) &&
    q.every(w => norm(`${f.n} ${f.c} ${f.t || ''}`).includes(w)));

  const cont = $('#flores'); cont.replaceChildren();
  if (!lista.length) cont.append(h('p', { className: 'vacia', textContent: todo.length ? 'No hay flores con ese filtro.' : 'Todavía no hay flores. Toca «+ Nueva flor» para empezar.' }));
  const sele = editItem && clave(editItem);
  for (const f of lista.slice(0, mostrar)) {
    const tg = h('input', { type: 'checkbox', checked: !!f.ok, title: f.ok ? 'Visible: toca para ocultar' : 'Oculta: toca para mostrar' });
    tg.setAttribute('aria-label', 'Visible en el catálogo: ' + f.n);
    tg.onchange = async () => {
      tg.disabled = true;
      const r = await apiF('PATCH', f.est ? { f: f.f, ok: tg.checked } : { id: f.id, ok: tg.checked });
      if (!r.ok) alert('No se pudo cambiar. Intenta de nuevo.');
      await cargarFlores();
    };
    const ed = h('button', { type: 'button', className: 'sm', textContent: 'Editar' }); ed.onclick = () => editar(f);
    cont.append(h('div', { className: 'fila' + (f.ok ? '' : ' off') + (clave(f) === sele ? ' sel' : '') },
      h('img', { src: f.th || f.img, alt: '', loading: 'lazy' }),
      h('div', { className: 'info' }, h('b', { textContent: f.n }), h('small', { textContent: f.c + (f.t ? ' · ' + f.t : '') + (f.ok ? '' : ' · Oculta') })),
      h('div', { className: 'acts' }, h('label', { className: 'tg' }, tg, h('i')), ed)));
  }
  const mas = $('#mas');
  mas.hidden = lista.length <= PAGINA;
  $('#mastxt').textContent = 'Mostrando ' + Math.min(mostrar, lista.length) + ' de ' + lista.length;
  $('#masbtn').hidden = mostrar >= lista.length;
}

function vista(src) { const v = $('#vista'); v.style.backgroundImage = src ? `url("${src}")` : ''; v.classList.toggle('on', !!src); v.textContent = src ? '' : 'Sin foto'; }

function nota(f) {
  const n = $('#fnota');
  n.hidden = !f;
  if (f) n.textContent = f.est ? 'Esta flor viene de la página original. Puedes cambiarle los datos u ocultarla con el interruptor de la lista.' + (f.cambiada ? ' «Restaurar original» la deja como estaba.' : '') : '';
  if (f && !f.est) n.hidden = true;
}

function limpiarForm() {
  editItem = null; fotoNueva = null;
  $('#ff').reset(); $('#fc').value = 'Ramos'; $('#fok').checked = true;
  vista('');
  $('#ftitulo').textContent = 'Nueva flor'; $('#fsave').textContent = 'Guardar flor';
  $('#fcancel').hidden = true; $('#fdel').hidden = true; nota(null); msgF('');
  pintarFlores();
}

function editar(f) {
  editItem = f; fotoNueva = null;
  $('#fn').value = f.n; $('#fd').value = f.d || ''; $('#fc').value = f.c; $('#ft').value = f.t || '';
  const ks = (f.k || '').split(' ');
  document.querySelectorAll('#fk input').forEach(i => i.checked = ks.includes(i.value));
  $('#fok').checked = !!f.ok; $('#foto').value = ''; vista(f.th || f.img);
  $('#ftitulo').textContent = 'Editar flor'; $('#fsave').textContent = 'Guardar cambios';
  $('#fcancel').hidden = false;
  const borrable = !f.est || f.cambiada;                       // las de siempre solo se "restauran" si ya tienen cambios
  $('#fdel').hidden = !borrable; $('#fdel').textContent = f.est ? 'Restaurar original' : 'Eliminar flor';
  nota(f); msgF('');
  pintarFlores();
  $('#ff').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const refiltrar = () => { mostrar = PAGINA; pintarFlores(); };
$('#nueva').onclick = () => { limpiarForm(); $('#ff').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#fn').focus({ preventScroll: true }); };
$('#fcancel').onclick = limpiarForm;
$('#buscar').oninput = refiltrar;
$('#fcat').onchange = refiltrar;
$('#masbtn').onclick = () => { mostrar += PAGINA; pintarFlores(); };
$('#estados').onclick = e => {
  const b = e.target.closest('[data-e]'); if (!b) return;
  estado = b.dataset.e;
  document.querySelectorAll('#estados button').forEach(x => x.setAttribute('aria-pressed', x === b));
  refiltrar();
};

$('#foto').onchange = async e => {
  const file = e.target.files[0]; fotoNueva = null;
  if (!file) { vista(editItem ? (editItem.th || editItem.img) : ''); return; }
  msgF('Preparando la foto…', true);
  try {
    const [grande, mini] = await Promise.all([reducir(file, 900, 1200, .82), reducir(file, 420, 560, .8)]);
    fotoNueva = { grande, mini };
    vista(URL.createObjectURL(mini));
    msgF('');
  } catch { e.target.value = ''; vista(editItem ? (editItem.th || editItem.img) : ''); msgF('No pude leer esa foto. Prueba con una JPG o PNG.'); }
};

$('#fdel').onclick = async () => {
  const f = editItem; if (!f) return;
  const ok = f.est
    ? confirm('¿Restaurar «' + f.n + '» a como estaba en la página original? Se pierden los cambios que le hiciste.')
    : confirm('¿Eliminar «' + f.n + '» y su foto? Desaparece de la tienda y no se puede deshacer.');
  if (!ok) return;
  $('#fdel').disabled = true;
  const r = await apiF('DELETE', f.est ? { f: f.f } : { id: f.id });
  $('#fdel').disabled = false;
  if (!r.ok) return msgF('No se pudo completar. Intenta de nuevo.');
  await cargarFlores(); limpiarForm(); msgF(f.est ? 'Flor restaurada.' : 'Flor eliminada.', true);
};

$('#ff').onsubmit = async e => {
  e.preventDefault();
  if (!editItem && !fotoNueva) return msgF('Falta la foto de la flor.');
  const fd = new FormData();
  if (editItem) editItem.est ? fd.set('f', editItem.f) : fd.set('id', editItem.id);
  fd.set('n', $('#fn').value.trim()); fd.set('d', $('#fd').value.trim()); fd.set('c', $('#fc').value.trim()); fd.set('t', $('#ft').value.trim());
  fd.set('k', [...document.querySelectorAll('#fk input:checked')].map(i => i.value).join(','));
  fd.set('ok', $('#fok').checked ? '1' : '0');
  if (fotoNueva) { fd.set('foto', fotoNueva.grande, 'flor.webp'); fd.set('th', fotoNueva.mini, 'flor-t.webp'); }
  const b = $('#fsave'), txt = b.textContent; b.disabled = true; b.textContent = 'Guardando…'; msgF('');
  try {
    const r = await apiF('POST', fd);
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) return salir();
    if (!r.ok) return msgF(j.error || 'No se pudo guardar. Intenta de nuevo.');
    await cargarFlores(); limpiarForm();
    msgF(j.flor && !j.flor.ok ? 'Guardada, pero está oculta en el catálogo.' : 'Listo: ya aparece en el catálogo.', true);
  } catch { msgF('Sin conexión. Intenta de nuevo.'); }
  finally { b.disabled = false; if (b.textContent === 'Guardando…') b.textContent = txt; }
};

$('#login').onsubmit = e => { e.preventDefault(); KEY = $('#key').value.trim(); sessionStorage.setItem('ck', KEY); cargar(); };
if (KEY) cargar();
