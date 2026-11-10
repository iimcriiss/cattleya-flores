// Asistente de chat de Cattleya (botón flotante). Llama a /api/asistente.
(() => {
'use strict';
const WA = 'https://wa.me/584247167293?text=' + encodeURIComponent('Hola! Vengo de la página de Cattleya y quiero hacer una consulta 🌸');
const MAX = 8, FALLO = 'Ahora mismo no puedo responder. Escríbenos por WhatsApp y te ayudamos.';
const PREG = ['¿Hacen envíos?', '¿Cómo pago?', 'Busco un regalo', '¿Hacen diseños personalizados?'];

const st = document.createElement('style');
st.textContent = `
#cta{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:50;font-family:inherit}
#cta *{box-sizing:border-box}
#cta .fab{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;background:#D4537E;color:#fff;padding:12px 18px;font:700 15px/1 inherit;cursor:pointer;box-shadow:0 8px 24px -8px rgba(90,40,25,.5)}
#cta .fab:focus-visible,#cta button:focus-visible,#cta input:focus-visible{outline:3px solid #3b2a2a;outline-offset:2px}
#cta .pn{position:absolute;right:0;bottom:56px;width:min(380px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 110px));display:flex;flex-direction:column;background:#fff;border:1px solid rgba(90,40,25,.15);border-radius:20px;overflow:hidden;box-shadow:0 24px 50px -20px rgba(90,40,25,.45)}
#cta .pn[hidden]{display:none}
#cta .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#D4537E;color:#fff;padding:12px 14px}
#cta .hd b{display:block;font-size:15px}
#cta .hd span{font-size:12px;opacity:.9}
#cta .x{border:0;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px}
#cta .ms{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:140px}
#cta .m{max-width:86%;padding:8px 12px;border-radius:14px;font-size:14px;line-height:1.5;color:#3b2a2a;white-space:pre-wrap;overflow-wrap:anywhere}
#cta .b{align-self:flex-start;background:#f6eeee;border-top-left-radius:4px}
#cta .u{align-self:flex-end;background:#D4537E;color:#fff;border-top-right-radius:4px}
#cta .wa{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;background:#128C7E;color:#fff;text-decoration:none;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700}
#cta .ch{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}
#cta .ch button{font:inherit;font-size:13px;padding:6px 10px;border-radius:16px;border:1px solid rgba(90,40,25,.25);background:#fff;color:#3b2a2a;cursor:pointer}
#cta form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(90,40,25,.12)}
#cta input{flex:1;min-width:0;font:inherit;font-size:16px;padding:8px 10px;border:1px solid rgba(90,40,25,.25);border-radius:10px;color:#3b2a2a;background:#fff}
#cta form button{border:0;border-radius:10px;background:#D4537E;color:#fff;font:700 14px/1 inherit;padding:0 14px;cursor:pointer}
#cta form button:disabled{opacity:.6;cursor:default}
`;
document.head.appendChild(st);

const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
const root = el('div'); root.id = 'cta';
const fab = el('button', 'fab'); fab.type = 'button'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'cta-pn');
fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 1 1 21 12z"/></svg>';
fab.appendChild(document.createTextNode('Pregúntanos'));
const pn = el('div', 'pn'); pn.id = 'cta-pn'; pn.hidden = true; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-label', 'Asistente de Cattleya');
const hd = el('div', 'hd'); const ht = el('div'); ht.append(el('b', '', 'Asistente de Cattleya'), el('span', '', 'Dudas sobre envíos, pagos y regalos'));
const xb = el('button', 'x', '×'); xb.type = 'button'; xb.setAttribute('aria-label', 'Cerrar chat'); hd.append(ht, xb);
const ms = el('div', 'ms'); ms.setAttribute('aria-live', 'polite');
const ch = el('div', 'ch');
const f = el('form'); const inp = el('input'); inp.type = 'text'; inp.maxLength = 200; inp.placeholder = 'Escribe tu pregunta'; inp.setAttribute('aria-label', 'Tu pregunta'); inp.autocomplete = 'off';
const sb = el('button', '', 'Enviar'); sb.type = 'submit'; f.append(inp, sb);
pn.append(hd, ms, ch, f); root.append(fab, pn); document.body.appendChild(root);
['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(ev => root.addEventListener(ev, e => e.stopPropagation()));

const hist = []; let busy = false, enviados = 0, cat = null, saludo = false;
try { enviados = +sessionStorage.getItem('cta-n') || 0; } catch (_) {}

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
  cat = [...new Set([...nuevas, ...mapa.values()].map(x => String(x.n).slice(0, 50) + ' (' + String(x.c || '').slice(0, 20) + ')'))];
  return cat;
}

async function enviar(texto) {
  const t = texto.trim(); if (!t || busy) return;
  ch.hidden = true; add('u', t);
  if (enviados >= MAX) { add('b', 'Llegaste al límite de mensajes de esta visita. Escríbenos por WhatsApp y te ayudamos.'); wa(); return; }
  busy = true; sb.disabled = true; inp.value = '';
  enviados++; try { sessionStorage.setItem('cta-n', enviados); } catch (_) {}
  hist.push({ r: 'u', t });
  const esp = add('b', 'Escribiendo…');
  try {
    const r = await fetch('/api/asistente', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mensajes: hist.slice(-6), catalogo: await catalogo() }),
      signal: AbortSignal.timeout(20000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.t) throw 0;
    esp.textContent = j.t; hist.push({ r: 'a', t: j.t });
  } catch (_) { esp.textContent = FALLO; hist.pop(); }
  wa(); busy = false; sb.disabled = false; inp.focus();
}

function abrir() {
  pn.hidden = false; fab.setAttribute('aria-expanded', 'true');
  if (!saludo) {
    saludo = true; add('b', 'Hola, soy el asistente de Cattleya. Puedo resolver dudas sobre envíos, pagos y pedidos, o ayudarte a elegir un regalo.');
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
