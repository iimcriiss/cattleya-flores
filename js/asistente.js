// Asistente de chat de Cattleya v6 (botón flotante). Llama a /api/asistente.
(() => {
'use strict';
const WA = 'https://wa.me/584247167293?text=' + encodeURIComponent('Hola! Vengo de la página de Cattleya y quiero hacer una consulta 🌸');
const MAX = 8, FALLO = 'Ahora mismo no puedo responder. Escríbenos por WhatsApp y te ayudamos.';
const PREG = ['¿Hacen envíos?', '¿Cómo pago?', 'Busco un regalo', 'Diseños personalizados'];

const st = document.createElement('style');
st.textContent = `
#cta{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:50;font-family:inherit}
#cta *{box-sizing:border-box}
#cta button,#cta input{font-family:inherit}
#cta .fab{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;background:linear-gradient(135deg,#E8638F,#C2406D);color:#fff;padding:13px 20px;font-size:15px;font-weight:700;line-height:1;cursor:pointer;box-shadow:0 10px 26px -8px rgba(194,64,109,.65);transition:transform .15s}
#cta .fab:hover{transform:translateY(-2px)}
#cta .fab:focus-visible,#cta button:focus-visible,#cta input:focus-visible{outline:3px solid #3b2a2a;outline-offset:2px}
#cta .pn{position:absolute;right:0;bottom:62px;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 110px));display:flex;flex-direction:column;background:#fffaf8;border:1px solid rgba(90,40,25,.12);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(90,40,25,.5);animation:ctaIn .22s ease-out}
#cta .pn[hidden]{display:none}
@keyframes ctaIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
#cta .hd{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#E8638F,#C2406D);color:#fff;padding:14px 14px 14px 16px}
#cta .av{width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;flex:none}
#cta .av img{width:30px;height:30px;object-fit:contain;display:block}
#cta .ht{flex:1;min-width:0}
#cta .ht b{display:block;font-size:15px;line-height:1.2}
#cta .ht span{font-size:12px;opacity:.92}
#cta .x{border:0;background:rgba(255,255,255,.18);color:#fff;width:32px;height:32px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer;flex:none}
#cta .x:hover{background:rgba(255,255,255,.3)}
#cta .ms{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
#cta .m{max-width:84%;padding:9px 13px;border-radius:16px;font-size:14px;line-height:1.5;color:#3b2a2a;white-space:pre-wrap;overflow-wrap:anywhere}
#cta .b{align-self:flex-start;background:#fff;border:1px solid rgba(90,40,25,.1);border-bottom-left-radius:5px;box-shadow:0 2px 6px -3px rgba(90,40,25,.25)}
#cta .u{align-self:flex-end;background:linear-gradient(135deg,#E8638F,#C2406D);color:#fff;border-bottom-right-radius:5px}
#cta .fl{font:inherit;font-weight:700;color:#C2406D;background:none;border:0;padding:0;margin:0;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(232,99,143,.5);text-decoration-thickness:1.5px;text-underline-offset:3px;animation:ctaLuz 2.4s ease-in-out infinite}
#cta .fl:hover{color:#A8345E;text-decoration-color:#C2406D}
@keyframes ctaLuz{0%,100%{text-shadow:0 0 0 rgba(232,99,143,0)}50%{text-shadow:0 0 8px rgba(232,99,143,.9),0 0 16px rgba(232,99,143,.45)}}
#cta .tip{align-self:flex-start;font-size:12px;color:#7a6565;margin:-2px 4px 0}
#cta .dots{display:inline-flex;gap:4px;padding:4px 2px}
#cta .dots i{width:7px;height:7px;border-radius:50%;background:#C2406D;opacity:.35;animation:ctaDot 1s infinite}
#cta .dots i:nth-child(2){animation-delay:.15s}
#cta .dots i:nth-child(3){animation-delay:.3s}
@keyframes ctaDot{0%,80%,100%{opacity:.3;transform:none}40%{opacity:1;transform:translateY(-3px)}}
#cta .wa{align-self:flex-start;display:inline-flex;align-items:center;gap:7px;background:#128C7E;color:#fff;text-decoration:none;border-radius:999px;padding:9px 15px;font-size:13px;font-weight:700}
#cta .wa:hover{background:#0f7a6e}
#cta .ch{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 12px}
#cta .ch button{font-size:13px;padding:7px 12px;border-radius:999px;border:1px solid #E8A9BF;background:#fff;color:#A8345E;cursor:pointer;font-weight:600}
#cta .ch button:hover{background:#fdeef3}
#cta form{display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid rgba(90,40,25,.1)}
#cta input{flex:1;min-width:0;font-size:16px;padding:10px 14px;border:1px solid rgba(90,40,25,.2);border-radius:999px;color:#3b2a2a;background:#fffaf8}
#cta form button{border:0;border-radius:999px;background:linear-gradient(135deg,#E8638F,#C2406D);color:#fff;font-size:14px;font-weight:700;padding:0 18px;cursor:pointer}
#cta form button:disabled{opacity:.55;cursor:default}
#cta .nt{background:#fff;color:#7a6565;font-size:11px;text-align:center;padding:0 12px 9px}
@media (prefers-reduced-motion:reduce){#cta *{animation:none!important;transition:none!important}}
`;
document.head.appendChild(st);

const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
const root = el('div'); root.id = 'cta';
const fab = el('button', 'fab'); fab.type = 'button'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'cta-pn');
fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 1 1 21 12z"/></svg>';
fab.appendChild(document.createTextNode('Pregúntanos'));
const pn = el('div', 'pn'); pn.id = 'cta-pn'; pn.hidden = true; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-label', 'Asistente de Cattleya');
const hd = el('div', 'hd'); const av = el('div', 'av'); av.setAttribute('aria-hidden', 'true'); const avi = el('img'); avi.src = '/img/flor-chat.webp'; avi.alt = ''; avi.width = 30; avi.height = 30; av.appendChild(avi);
const ht = el('div', 'ht'); ht.append(el('b', '', 'Asistente de Cattleya'), el('span', '', 'Envíos, pagos y regalos'));
const xb = el('button', 'x', '×'); xb.type = 'button'; xb.setAttribute('aria-label', 'Cerrar chat'); hd.append(av, ht, xb);
const ms = el('div', 'ms'); ms.setAttribute('aria-live', 'polite');
const ch = el('div', 'ch');
const f = el('form'); const inp = el('input'); inp.type = 'text'; inp.maxLength = 200; inp.placeholder = 'Escribe tu pregunta'; inp.setAttribute('aria-label', 'Tu pregunta'); inp.autocomplete = 'off';
const sb = el('button', '', 'Enviar'); sb.type = 'submit'; f.append(inp, sb);
const nt = el('div', 'nt', 'Asistente con IA: puede equivocarse. Para pedidos y precios, WhatsApp.');
pn.append(hd, ms, ch, f, nt); root.append(fab, pn); document.body.appendChild(root);
['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(ev => root.addEventListener(ev, e => e.stopPropagation()));

const hist = []; let busy = false, enviados = 0, cat = null, saludo = false, nombres = [], tipDado = false;
try { enviados = +sessionStorage.getItem('cta-n') || 0; } catch (_) {}

const limpiar = (t) => String(t).replace(/\*+/g, '').replace(/^\s*[-•·]\s+/gm, '').replace(/`/g, '').trim();
const bajar = () => { ms.scrollTop = ms.scrollHeight; };
const add = (c, t) => { const m = el('div', 'm ' + c, t); ms.appendChild(m); bajar(); return m; };
const wa = () => {
  ms.querySelectorAll('.wa').forEach(n => n.remove());
  const a = el('a', 'wa'); a.href = WA; a.target = '_blank'; a.rel = 'noopener';
  a.innerHTML = '<svg width="16" height="16" fill="currentColor" aria-hidden="true"><use href="#wa"/></svg>';
  a.appendChild(document.createTextNode('Pedir por WhatsApp')); ms.appendChild(a); bajar();
};

async function catalogo() {
  if (cat) return cat;
  const base = ((window.CATALOGO && window.CATALOGO.P) || []).map(p => ({ f: p[0], n: p[1], c: p[2] }));
  let extra = [];
  try { const r = await fetch('/api/flores', { signal: AbortSignal.timeout(3000) }); if (r.ok) extra = await r.json(); } catch (_) {}
  const mapa = new Map(base.map(x => [x.f, x])), nuevas = [];
  for (const x of Array.isArray(extra) ? extra : []) {
    if (!x) continue;
    if (x.f) { if (!mapa.has(x.f)) continue; if (!x.ok) mapa.delete(x.f); else if (x.n) mapa.set(x.f, { f: x.f, n: x.n, c: x.c || mapa.get(x.f).c }); }
    else if (x.ok && x.n) nuevas.push({ n: x.n, c: x.c });
  }
  const todas = [...nuevas, ...mapa.values()];
  nombres = [...new Set(todas.map(x => String(x.n).slice(0, 50)))];
  cat = [...new Set(todas.map(x => String(x.n).slice(0, 50) + ' (' + String(x.c || '').slice(0, 20) + ')'))];
  return cat;
}

// Nombres de flores dentro de la respuesta: se resaltan y al tocarlos abren esa flor del catálogo.
const plano = (t) => t.toLowerCase().replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u');
const letra = (c) => !!c && /[\p{L}\p{N}]/u.test(c);
function buscar(texto) {
  const p = plano(texto), hits = [];
  for (const n of [...nombres].sort((a, b) => b.length - a.length)) {
    const q = plano(n.trim()); if (q.length < 3) continue;
    const unaPal = !/\s/.test(q);
    for (let i = p.indexOf(q); i !== -1; i = p.indexOf(q, i + q.length)) {
      const fin = i + q.length;
      if (letra(p[i - 1]) || letra(p[fin])) continue;
      if (hits.some(h => i < h.fin && fin > h.i)) continue;
      if (unaPal && texto[i] === texto[i].toLowerCase()) continue; // "rosa" como color no cuenta
      hits.push({ i, fin, n });
    }
  }
  return hits.sort((a, b) => a.i - b.i);
}
function verFlor(n) {
  if (matchMedia('(max-width:700px)').matches) { pn.hidden = true; fab.setAttribute('aria-expanded', 'false'); }
  const q = plano(n.trim());
  const c = [...document.querySelectorAll('#grid .card')].find(x => plano((x.dataset.n || '').trim()) === q);
  if (c) c.click(); else { const s = document.getElementById('catalogo'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }
}
function pintar(nodo, texto) {
  nodo.textContent = ''; nodo.removeAttribute('aria-label');
  const hits = buscar(texto); let pos = 0;
  for (const h of hits) {
    if (h.i > pos) nodo.appendChild(document.createTextNode(texto.slice(pos, h.i)));
    const b = el('button', 'fl', texto.slice(h.i, h.fin)); b.type = 'button'; b.title = 'Ver esta flor'; b.onclick = () => verFlor(h.n);
    nodo.appendChild(b); pos = h.fin;
  }
  if (pos < texto.length) nodo.appendChild(document.createTextNode(texto.slice(pos)));
  return hits.length;
}

async function enviar(texto) {
  const t = texto.trim(); if (!t || busy) return;
  ch.hidden = true; add('u', t);
  if (enviados >= MAX) { add('b', 'Llegaste al límite de mensajes de esta visita. Escríbenos por WhatsApp y te ayudamos.'); wa(); return; }
  busy = true; sb.disabled = true; inp.value = '';
  enviados++; try { sessionStorage.setItem('cta-n', enviados); } catch (_) {}
  hist.push({ r: 'u', t });
  const esp = add('b'); esp.setAttribute('aria-label', 'Escribiendo'); esp.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
  try {
    const r = await fetch('/api/asistente', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mensajes: hist.slice(-6), catalogo: await catalogo() }),
      signal: AbortSignal.timeout(20000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.t) throw 0;
    const lim = limpiar(j.t); const nh = pintar(esp, lim); hist.push({ r: 'a', t: lim });
    if (nh && !tipDado) { tipDado = true; add('tip', 'Toca el nombre resaltado para ver la flor.'); }
  } catch (_) { esp.textContent = FALLO; hist.pop(); }
  wa(); busy = false; sb.disabled = false; inp.focus();
}

function abrir() {
  pn.hidden = false; fab.setAttribute('aria-expanded', 'true');
  if (!saludo) {
    saludo = true; add('b', '¡Hola! Soy el asistente de Cattleya 🌸 Te ayudo con envíos, pagos y diseños, o a elegir un regalo.');
    PREG.forEach(p => { const b = el('button', '', p); b.type = 'button'; b.onclick = () => enviar(p); ch.appendChild(b); });
  }
  inp.focus(); catalogo();
}
function cerrar() { pn.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); }
fab.onclick = () => pn.hidden ? abrir() : cerrar();
xb.onclick = cerrar;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pn.hidden) cerrar(); });
f.onsubmit = e => { e.preventDefault(); enviar(inp.value); };
})();
