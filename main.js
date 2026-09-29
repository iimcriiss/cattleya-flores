(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const hover = matchMedia('(hover:hover)').matches;
const wa = t => `https://wa.me/584247167293?text=${encodeURIComponent(t)}`;

// ── Productos: [archivo, nombre, categoría]. Para agregar uno, suma una línea aquí y su .webp en img/flores/
const P = [
['lampara-rampunzel','Lámpara de Rapunzel','Decoración'],['maceta-margarita','Maceta de Margarita','Macetas'],
['bouquet-de-lilys-y-tulipanes','Bouquet de Lilys y Tulipanes','Ramos'],['lilys-y-tulipanes','Lilys y Tulipanes','Ramos'],
['tulipan_rosa','Tulipán Rosa','Ramos'],['tulipan_amarillo','Tulipán Amarillo','Ramos'],
['tulipan_rojo','Tulipán Rojo','Ramos'],['tulipan_fucsia','Tulipán Fucsia','Ramos'],
['bouquet-de-girasoles','Bouquet de Girasoles','Ramos'],['rosa','Rosa','Ramos'],
['maceta-tulipanes-rojos','Maceta de Tulipanes Rojos','Macetas'],['maceta_tulipan_rosa','Maceta de Tulipán Rosa','Macetas'],['ramo_girasoles2','Ramo de Girasoles con Margaritas','Ramos'],['ramo_flores_rojas','Ramo de Flores Rojas','Ramos'],
['ramo-orquideas','Ramo Orquídeas','Ramos'],['rosas-girasol','Rosas y Girasol','Ramos'],
['bouquet-de-lilys','Bouquet de Lilys','Ramos'],['bouquet-de-lirios','Bouquet de Lirios','Ramos'],
['ramo-margarita','Ramo de Margaritas','Ramos'],['maceta-tulipan-fucsia','Maceta de Tulipán Fucsia','Macetas'],
['maceta-tulipan-rosaclaro','Maceta de Tulipanes Rosa Claro','Macetas'],['maceta-rosa-rosa-y-margarita','Maceta de Rosa Rosa y Margarita','Macetas'],['gerbera_amarilla','Gerbera Amarilla','Ramos'],['lirio_amarillo','Lirio Amarillo','Ramos'],
['maceta-girasol','Maceta de Girasol','Macetas'],['maceta-margaritas-azul','Maceta de Margaritas Azul','Macetas'],
['maceta-margaritas-roja','Maceta de Margaritas Roja','Macetas'],['maceta-calendula','Maceta de Caléndula','Macetas'],
['ramo-girasol-corzon','Ramo de Girasol Corazón','Ramos'],['maceta-tulipan-amarillo','Maceta de Tulipán Amarillo','Macetas'],
['maceta-lilys-rosa','Maceta de Lilys Rosa','Macetas'],['maceta-lilys-rosa-oscuros','Maceta de Lilys Rosa Oscuro','Macetas'],
['ramo-girasol-rosa','Ramo de Girasol y Rosas','Ramos'],['ramo-girasoles','Ramo de Girasoles','Ramos'],['ramo-tulipanes','Ramo de Tulipanes','Ramos'],['maceta_tulipanes-rojos','Maceta de Tulipanes Rojos','Macetas'],['gerbera-rosa','Gerbera Rosa','Ramos'],['lirio-borde-rojo','Lirio Borde Rojo','Ramos'],['lirio-borde-blanco','Lirio Borde Blanco','Ramos'],['lirio-rojo','Lirio Rojo','Ramos'],['maceta-tulipanes-multicolores','Maceta de Tulipanes Multicolores','Macetas']];
const F = ['bouquet-de-lirios','bouquet-de-lilys-y-tulipanes','bouquet-de-girasoles'].map(f => P.find(p => p[0] === f));

// ── Diálogo de producto (el mensaje de WhatsApp lleva el nombre)
const dlg = $('#dlg');
const abrir = (f, n) => {
  reset();
  const i = $('img', dlg); i.src = `img/flores/${f}.webp`; i.alt = n;
  $('h3', dlg).textContent = n;
  $('.wa', dlg).href = wa(`Hola! Me interesa ${n} de Cattleya Flores 🌸`);
  dlg.showModal();
};
dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.x')) dlg.close(); });
dlg.addEventListener('close', () => reset());

// ── Zoom en la foto del diálogo: toque/clic para acercar y alejar · arrastrar para mover (mouse y táctil funcionan igual)
const zm = $('.zm', dlg), zi = $('img', zm), ZOOM = 2.4;
let zs = 1, tx = 0, ty = 0, dr = null;
function pintar() { zi.style.transform = zs === 1 ? '' : `translate(${tx}px,${ty}px) scale(${zs})`; zm.classList.toggle('z', zs !== 1); }
function limitar() { const r = zm.getBoundingClientRect(); tx = Math.min(0, Math.max(r.width * (1 - zs), tx)); ty = Math.min(0, Math.max(r.height * (1 - zs), ty)); }
function acercar(x, y) { const r = zm.getBoundingClientRect(); zs = ZOOM; tx = (x - r.left) * (1 - zs); ty = (y - r.top) * (1 - zs); limitar(); pintar(); }
function reset() { zs = 1; tx = ty = 0; dr = null; zm.classList.remove('drag'); pintar(); }
zm.addEventListener('pointermove', e => {
  if (!dr) return;
  const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
  if (Math.hypot(e.clientX - dr.x0, e.clientY - dr.y0) > 8) dr.mov = true;
  if (zs !== 1 && dr.mov) { tx += dx; ty += dy; limitar(); pintar(); zm.classList.add('drag'); }
  dr.x = e.clientX; dr.y = e.clientY;
});
zm.addEventListener('pointerdown', e => { if (e.button) return; zm.setPointerCapture?.(e.pointerId); dr = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, mov: false }; });
zm.addEventListener('pointerup', e => {
  if (!dr) return;
  if (!dr.mov) zs === 1 ? acercar(e.clientX, e.clientY) : reset();   // toque = acercar / alejar
  dr = null; zm.classList.remove('drag');
});
zm.addEventListener('pointercancel', () => { dr = null; zm.classList.remove('drag'); });
zm.addEventListener('dragstart', e => e.preventDefault());

// ── Destacados: acordeón
const acc = $('.acc');
acc.innerHTML = F.map(([f, n], i) => `<button data-f="${f}" data-n="${n}" class="${i ? '' : 'on'}" aria-expanded="${!i}" aria-label="${n}"><img src="img/flores/${f}.webp" alt="" loading="lazy"><span>${n}</span></button>`).join('');
const activar = b => $$('button', acc).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-expanded', x === b); });
if (hover) acc.addEventListener('pointerover', e => { const b = e.target.closest('button'); b && activar(b); });
acc.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  matchMedia('(max-width:700px)').matches || b.classList.contains('on') ? abrir(b.dataset.f, b.dataset.n) : activar(b);
});

// ── Catálogo: tarjetas + filtros con animación FLIP
const grid = $('#grid');
grid.innerHTML = P.map(([f, n, c]) => `<button class="card" data-tilt data-c="${c}" data-f="${f}" data-n="${n}"><img src="img/flores/${f}.webp" alt="${n}" width="800" height="1067" loading="lazy"><b>${n}</b></button>`).join('');
grid.addEventListener('click', e => { const c = e.target.closest('.card'); c && abrir(c.dataset.f, c.dataset.n); });

// ── Filtros: categoría + tipo de flor + color + buscador (se combinan entre sí)
// Tipo de flor y colores de cada producto: 'Tipo1 Tipo2|color1 color2'. Un producto nuevo sin línea aquí sale igual, solo no aparece al filtrar por flor o color.
const M = {
'lampara-rampunzel':'|morado amarillo','maceta-iman1':'Margarita|blanco','bouquet-de-lilys-y-tulipanes':'Lirio Tulipán|rojo blanco','lilys-y-tulipanes':'Lirio Tulipán|amarillo blanco',
'tulipan_rosa':'Tulipán|rosa','tulipan_amarillo':'Tulipán|amarillo','tulipan_rojo':'Tulipán|rojo','tulipan_fucsia':'Tulipán|rosa','bouquet-de-girasoles':'Girasol|amarillo',
'rosa':'Rosa|rojo','maceta-iman2':'Tulipán|rojo','maceta_tulipan_rosa':'Tulipán|rosa','ramo_girasoles2':'Girasol Margarita|amarillo blanco','ramo_flores_rojas':'Rosa|rojo blanco',
'ramo-orquideas':'Orquídea|morado','rosas-girasol':'Tulipán Girasol|rojo amarillo','bouquet-de-lilys':'Lirio|rosa','bouquet-de-lirios':'Lirio|azul','ramo-margarita':'Margarita|blanco',
'maceta-tulipan':'Tulipán|rosa','maceta-tulipan2':'Tulipán|rosa','maceta-rosa':'Rosa Margarita|rosa blanco','gerbera_amarilla':'Gerbera|amarillo','lirio_amarillo':'Lirio|amarillo',
'maceta-girasol':'Girasol|amarillo','maceta-margarita-azul':'Margarita|azul','maceta-margarita-roja':'Margarita|rojo blanco','maceta-calendula':'Caléndula|amarillo',
'ramo-girasol-corzon':'Girasol|amarillo','maceta-tulipan-amarillo':'Tulipán|amarillo','maceta-lilys-rosa':'Lirio|morado rosa','maceta-lilys-rosa-oscuros':'Lirio|rosa',
'ramo-girasol-rosa':'Girasol Rosa|amarillo rojo','ramo-girasoles':'Girasol|amarillo','ramo-tulipanes':'Tulipán|rojo'};
const HEX = { rojo: '#D62839', rosa: '#EE5C8C', amarillo: '#F7B928', azul: '#2F6FE0', morado: '#8D6BD8', blanco: '#FFFFFF' };
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const uniq = a => [...new Set(a)];
const cards = $$('.card');
cards.forEach(c => { const [t = '', k = ''] = (M[c.dataset.f] || '|').split('|'); c.dataset.t = t; c.dataset.k = k; c.dataset.s = norm(`${c.dataset.n} ${t} ${k}`); });
const tiene = (c, g, v) => c.dataset[g].split(' ').includes(v);
const st = { c: 'Todo', t: '', k: '', q: '' };

const chips = $('.chips');
const chip = (g, v, i) => `<button class="chip" data-g="${g}" data-v="${v}" aria-pressed="${g === 'c' && !i}">${v}</button>`;
chips.innerHTML = `<div class="row">${['Todo', ...uniq(P.map(p => p[2]))].map((v, i) => chip('c', v, i)).join('')}
  <label class="find"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" placeholder="Buscar flor…" aria-label="Buscar en el catálogo" autocomplete="off"></label></div>
  <div class="row sc"><span class="lbl">Flor</span>${uniq(cards.flatMap(c => c.dataset.t.split(' ').filter(Boolean))).map(v => chip('t', v)).join('')}</div>
  <div class="row"><span class="lbl">Color</span>${Object.keys(HEX).filter(k => cards.some(c => tiene(c, 'k', k))).map(k => `<button class="pal" data-g="k" data-v="${k}" style="--c:${HEX[k]}" aria-pressed="false" aria-label="${k}" title="${k}"></button>`).join('')}</div>`;
const buscar = $('input', chips);
const vacio = document.createElement('p'); vacio.className = 'vacio'; vacio.hidden = true;
vacio.innerHTML = 'No encontramos flores con esos filtros. <button type="button" class="chip">Limpiar filtros</button>'; grid.after(vacio);
const sync = () => $$('[data-g]', chips).forEach(x => x.setAttribute('aria-pressed', st[x.dataset.g] === x.dataset.v));

function filtrar() {
  const antes = new Map(cards.map(c => [c, c.getBoundingClientRect()])), q = norm(st.q).split(/\s+/).filter(Boolean);
  cards.forEach(c => c.hidden = !((st.c === 'Todo' || c.dataset.c === st.c) && (!st.t || tiene(c, 't', st.t)) && (!st.k || tiene(c, 'k', st.k)) && q.every(w => c.dataset.s.includes(w))));
  vacio.hidden = cards.some(c => !c.hidden);
  if (calm) return;
  cards.filter(c => !c.hidden).forEach((c, i) => {
    const a = antes.get(c), z = c.getBoundingClientRect();
    c.animate(a.width
      ? [{ translate: `${a.left - z.left}px ${a.top - z.top}px` }, { translate: '0 0' }]  // se mueve a su nuevo lugar
      : [{ opacity: 0, scale: .85 }, { opacity: 1, scale: 1 }],                            // aparece
      { duration: 450, delay: a.width ? 0 : Math.min(i, 12) * 25, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
  });
}
chips.addEventListener('click', e => {
  const b = e.target.closest('[data-g]'); if (!b) return;
  const g = b.dataset.g, v = b.dataset.v;
  st[g] = g === 'c' ? v : (st[g] === v ? '' : v);   // flor y color: segundo clic los quita
  sync(); filtrar();
});
buscar.addEventListener('input', () => { st.q = buscar.value; filtrar(); });
vacio.addEventListener('click', e => { if (e.target.closest('.chip')) { Object.assign(st, { c: 'Todo', t: '', k: '', q: '' }); buscar.value = ''; sync(); filtrar(); } });

// ── Tilt 3D con brillo (solo con mouse)
if (hover && !calm) {
  let raf;
  document.addEventListener('pointermove', e => {
    const t = e.target.closest?.('[data-tilt]'); if (!t) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.setProperty('--ry', (x - .5) * 10 + 'deg'); t.style.setProperty('--rx', (.5 - y) * 10 + 'deg');
      t.style.setProperty('--gx', x * 100 + '%'); t.style.setProperty('--gy', y * 100 + '%');
    });
  });
  document.addEventListener('pointerout', e => {
    const t = e.target.closest?.('[data-tilt]');
    if (t && !t.contains(e.relatedTarget)) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); }
  });
}

// ── Sobre nosotros: las palabras se encienden al hacer scroll
const story = $('#story');
story.innerHTML = story.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
const words = $$('span', story);
const encender = () => {
  const r = story.getBoundingClientRect(), vh = innerHeight;
  const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .25)));
  const n = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('lit', i < n));
};
if (calm) words.forEach(w => w.classList.add('lit')); else { addEventListener('scroll', encender, { passive: true }); encender(); }

// ── Marquesinas: se repite el contenido y el CSS lo desplaza -50%
$$('[data-mq]').forEach(m => {
  const t = m.firstElementChild;
  m.style.setProperty('--d', m.dataset.mq);
  t.innerHTML = t.innerHTML.repeat(8);
});

// ── Navegación
const nav = $('.nav'), burger = $('.burger');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 20), { passive: true });
burger.onclick = () => burger.setAttribute('aria-expanded', nav.classList.toggle('open'));
$$('.nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));
$('#y').textContent = new Date().getFullYear();

// ── Flores de limpiapipas (se usan al hacer clic, en el fondo y en el jardín del footer)
const COL = ['#EE5C8C', '#F7B928', '#2E9E4F', '#8D6BD8', '#FF7A45'];
function flor(g, c, R, felpa) {
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate(i * 1.2566); g.beginPath(); g.ellipse(R * .55, 0, R * .55, R * .3, 0, 0, 6.283);
    g.strokeStyle = c; g.lineWidth = felpa ? 6 : Math.max(2.5, R * .17); g.setLineDash([]); g.stroke();
    if (felpa) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.5; g.setLineDash([2, 4]); g.stroke(); }
    g.restore();
  }
  g.fillStyle = c === '#F7B928' ? '#EE5C8C' : '#F7B928'; g.beginPath(); g.arc(0, 0, R * .2, 0, 6.283); g.fill();
}
const fit = cv => { const d = Math.min(devicePixelRatio || 1, 2), g = cv.getContext('2d'); cv.width = innerWidth * d; cv.height = innerHeight * d; g.setTransform(d, 0, 0, d, 0, 0); return g; };

// ── Clic en cualquier parte de la página: planta una flor (queda anclada a la página al hacer scroll)
if (!calm) {
  const cv = $('#pipe'); let g = fit(cv), flores = [], corriendo = false; const VIDA = 5200;
  addEventListener('resize', () => g = fit(cv));
  document.addEventListener('pointerdown', e => {
    if (e.button || e.target.closest('a,button,dialog,input')) return;
    flores.push({ x: e.clientX, y: e.clientY + scrollY, t: performance.now(), c: COL[Math.random() * COL.length | 0], R: 26 + Math.random() * 16, r: Math.random() * 6.283 });
    if (flores.length > 40) flores.shift();
    if (!corriendo) { corriendo = true; requestAnimationFrame(frame); }
  });
  function frame(now) {
    g.clearRect(0, 0, innerWidth, innerHeight);
    flores = flores.filter(f => now - f.t < VIDA);
    flores.forEach(f => {
      const age = now - f.t, k = Math.min(1, age / 600) - 1, s = 1 + 2.70158 * k ** 3 + 1.70158 * k ** 2; // crece con rebote
      g.globalAlpha = Math.min(1, (VIDA - age) / 900);
      g.save(); g.translate(f.x, f.y - scrollY); g.rotate(f.r + age * .0003); g.scale(s, s); flor(g, f.c, f.R, true); g.restore();
    });
    if (flores.length) requestAnimationFrame(frame); else { corriendo = false; g.clearRect(0, 0, innerWidth, innerHeight); }
  }
}

// ── Fondo interactivo: florecitas que flotan, se mueven con el scroll y se apartan del mouse
{
  const cv = $('#bg'); let g = fit(cv), mx = -999, my = -999;
  const M = 60, mk = () => Array.from({ length: Math.min(28, Math.max(10, Math.round(innerWidth * innerHeight / 55000))) }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight, R: 14 + Math.random() * 22, d: .3 + Math.random() * .7,
    r: Math.random() * 6.283, s: (Math.random() - .5) * .004, vx: (Math.random() - .5) * .14, vy: -.04 - Math.random() * .12,
    c: COL[Math.random() * COL.length | 0], ox: 0, oy: 0 }));
  let fl = mk();
  addEventListener('resize', () => { g = fit(cv); fl = mk(); });
  addEventListener('pointermove', e => { if (e.pointerType !== 'touch') { mx = e.clientX; my = e.clientY; } });
  document.documentElement.addEventListener('mouseleave', () => mx = my = -999);
  const draw = mover => {
    const W = innerWidth, H = innerHeight, span = H + M * 2;
    g.clearRect(0, 0, W, H);
    fl.forEach(f => {
      if (mover) { f.x += f.vx; f.y += f.vy; f.r += f.s; if (f.x < -M) f.x = W + M; if (f.x > W + M) f.x = -M; }
      const x = f.x, y = (((f.y - scrollY * f.d * .15) % span) + span) % span - M;
      const dx = x - mx, dy = y - my, dist = Math.hypot(dx, dy);
      if (mover && dist < 150 && dist > 0) { const k = (1 - dist / 150) * 1.6; f.ox += dx / dist * k; f.oy += dy / dist * k; f.r += k * .01; }
      f.ox *= .94; f.oy *= .94;
      g.globalAlpha = .22 + .2 * f.d;
      g.save(); g.translate(x + f.ox, y + f.oy); g.rotate(f.r); flor(g, f.c, f.R, false); g.restore();
    });
  };
  if (calm) { draw(false); addEventListener('scroll', () => draw(false), { passive: true }); }
  else (function loop() { draw(true); requestAnimationFrame(loop); })();
}

// ── Banner de flores: las tarjetas se posicionan sobre el estante (desktop y móvil)
{
  const box = $('#flores-container'), cards = $$('.card-flores');
  const poner = () => {
    const W = box.offsetWidth, H = box.offsetHeight;
    if (innerWidth < 768) {
      const tops = [0.26, 0.48, 0.70], cw = W * 0.50;
      cards.forEach((c, i) => { c.style.width = cw + 'px'; c.style.left = (W - cw) / 2 + 'px'; c.style.top = H * tops[i] + 'px'; c.style.transform = 'translateY(-50%)'; });
    } else {
      const lefts = [0.17, 0.50, 0.83], cw = W * 0.28;
      cards.forEach((c, i) => { c.style.width = cw + 'px'; c.style.left = W * lefts[i] - cw / 2 + 'px'; c.style.top = H * 0.50 + 'px'; c.style.transform = 'translateY(-50%)'; });
    }
  };
  new ResizeObserver(poner).observe(box); poner();
}

// ── Footer: un jardín de limpiapipas que crece al llegar y se inclina hacia el mouse
{
  const gar = $('#garden'); let grown = false, tallos = [];
  const plantar = () => {
    const W = gar.clientWidth, H = gar.clientHeight, n = Math.max(6, Math.round(W / 85)), rnd = Math.random; let s = '';
    if (!W) return;
    for (let i = 0; i < n; i++) {
      const x = (i + .5) * W / n + (rnd() - .5) * 30, h = H * (.5 + rnd() * .42), b = (rnd() - .5) * 44, c = COL[i % 5], R = 15 + rnd() * 10, d = (i * .09).toFixed(2) + 's';
      const ex = x + b * .6, ey = H - h, p = `M${x} ${H} C${x} ${H - h * .4} ${x + b} ${H - h * .7} ${ex} ${ey}`, ly = H - h * .38, dir = i % 2 ? 1 : -1;
      let pet = ''; for (let k = 0; k < 5; k++) pet += `<ellipse cx="${R * .55}" rx="${R * .55}" ry="${R * .3}" transform="rotate(${k * 72})" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><ellipse cx="${R * .55}" rx="${R * .55}" ry="${R * .3}" transform="rotate(${k * 72})" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-dasharray="2 4"/>`;
      s += `<g class="st" data-x="${x}" style="transform-origin:${x}px ${H}px"><g class="sw" style="--d:${d};animation-delay:${(-rnd() * 4).toFixed(1)}s;transform-origin:${x}px ${H}px">
        <path class="stem a" pathLength="1" d="${p}"/><path class="stem b" pathLength="1" d="${p}"/>
        <path class="leaf" d="M${x} ${ly} q${22 * dir} -4 ${30 * dir} -24 q${-24 * dir} 2 ${-30 * dir} 24z" style="transform-origin:${x}px ${ly}px;transform-box:view-box"/>
        <g transform="translate(${ex} ${ey})"><g class="pop">${pet}<circle r="${R * .2}" fill="${c === '#F7B928' ? '#EE5C8C' : '#F7B928'}"/></g></g></g></g>`;
    }
    gar.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${s}</svg>`;
    gar.classList.toggle('grow', grown); tallos = $$('.st', gar);
  };
  plantar();
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(plantar, 200); });
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { grown = true; gar.classList.add('grow'); o.disconnect(); } }, { threshold: .3 }).observe(gar);
  if (hover && !calm) {
    gar.addEventListener('pointermove', e => {
      const r = gar.getBoundingClientRect();
      tallos.forEach(t => { const a = e.clientX - r.left - t.dataset.x; t.style.transform = `rotate(${a / (1 + (a / 110) ** 2) / 7}deg)`; });
    });
    gar.addEventListener('pointerleave', () => tallos.forEach(t => t.style.transform = ''));
  }
}
// ── Reseñas: tarjetas que giran. Para agregar una real, suma una línea a REVIEWS (foto opcional en img/resenas/)
// Formato: { n: 'Nombre', c: 'Ciudad', s: 5, t: 'Texto de la reseña', img: 'img/resenas/foto.webp' }
const REVIEWS = [];
// Ejemplos SOLO para ver el diseño: se muestran abriendo la página con ?demo al final del link (nunca en la página normal)
const DEMO = [
  { n: 'María (ejemplo)', c: 'Cúcuta', s: 5, t: 'Llegó hermosa y idéntica a la foto. Mi mamá no lo podía creer que fuera de limpiapipas.', img: 'img/flores/bouquet-de-lirios.webp' },
  { n: 'Andrea (ejemplo)', c: 'Bogotá', s: 5, t: 'Pedí un arreglo personalizado y quedó mejor de lo que imaginé. Súper atenta en todo el proceso.', img: 'img/flores/ramo-girasol-corzon.webp' },
  { n: 'Camila (ejemplo)', s: 4, t: 'Un detalle perfecto para regalar. Lo mejor es que no se marchita, ¡ya lo tengo en mi escritorio!' }
];
{
  const list = location.search.includes('demo') ? DEMO : REVIEWS, stack = $('.rv-stack'), dots = $('.rv-dots');
  const items = list.length ? list : [{ n: 'Cattleya', s: 5, t: 'Aquí van a brillar las reseñas de quienes ya tienen su flor para siempre. ¡Sé la primera en dejar la tuya!' }];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  stack.innerHTML = items.map((r, i) => `<article class="rv-card" style="--a:${COL[i % 5]}">${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy">` : ''}<div><span class="rv-stars" aria-label="${r.s} de 5 estrellas">${'★'.repeat(r.s)}${'☆'.repeat(5 - r.s)}</span><p>“${esc(r.t)}”</p><b class="rv-who">${esc(r.n)}${r.c ? ` <small>· ${esc(r.c)}</small>` : ''}</b><button type="button" class="rv-view" data-i="${i}">Ver reseña</button></div></article>`).join('');
  const cs = $$('.rv-card', stack), N = items.length; let cur = 0, busy = false, hold = false;
  dots.innerHTML = N > 1 ? items.map((_, i) => `<button aria-label="Reseña ${i + 1}"></button>`).join('') : '';
  const place = () => { cs.forEach((c, i) => c.style.setProperty('--p', (i - cur + N) % N)); $$('button', dots).forEach((d, i) => d.setAttribute('aria-current', i === cur)); };
  const next = () => {
    if (N < 2 || busy) return; busy = true; const top = cs[cur]; top.classList.add('out');
    setTimeout(() => { top.style.transition = 'none'; top.classList.remove('out'); cur = (cur + 1) % N; place();
      requestAnimationFrame(() => requestAnimationFrame(() => { top.style.transition = ''; busy = false; })); }, 450);
  };
  place();
  dots.addEventListener('click', e => { const i = $$('button', dots).indexOf(e.target.closest('button')); if (i >= 0) { cur = i; place(); } });
  const rv = $('.rv'); ['pointerenter', 'focusin'].forEach(t => rv.addEventListener(t, () => hold = true)); ['pointerleave', 'focusout'].forEach(t => rv.addEventListener(t, () => hold = false));
  if (!calm && N > 1) setInterval(() => { if (!hold && !document.hidden) next(); }, 5500);

  // ── El botón "Ver reseña" abre esa tarjeta en grande; el resto de la tarjeta sigue pasando a la siguiente
  const rvv = $('#rvview'), rvvFig = $('figure', rvv), rvvImg = $('img', rvv), rvvStars = $('.rv-stars', rvv), rvvText = $('.rvv-text', rvv), rvvWho = $('.rv-who', rvv);
  stack.addEventListener('click', e => {
    const btn = e.target.closest('.rv-view');
    if (btn) {
      const r = items[+btn.dataset.i];
      rvvFig.hidden = !r.img; if (r.img) rvvImg.src = r.img;
      rvvStars.textContent = '★'.repeat(r.s) + '☆'.repeat(5 - r.s); rvvStars.setAttribute('aria-label', `${r.s} de 5 estrellas`);
      rvvText.textContent = `“${r.t}”`; rvvWho.textContent = r.c ? `${r.n} · ${r.c}` : r.n;
      rvv.showModal();
      return;
    }
    if (e.target.closest('.rv-card')) next();
  });
  rvv.addEventListener('click', e => { if (e.target === rvv || e.target.closest('.x')) rvv.close(); });
}

// ── Formulario de reseña: se envía por WhatsApp (sin servidor), así la clienta puede adjuntar su foto en el chat
{
  const d = $('#rvdlg'), f = $('form', d), sb = $$('.stars button', d); let rate = 5;
  const pintar = () => sb.forEach((b, i) => { b.classList.toggle('on', i < rate); b.setAttribute('aria-checked', i + 1 === rate); });
  $('.stars', d).addEventListener('click', e => { const b = e.target.closest('button'); if (b) { rate = sb.indexOf(b) + 1; pintar(); } });
  $('.rv-add').addEventListener('click', () => { pintar(); d.showModal(); });
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('.x')) d.close(); });
  f.addEventListener('submit', e => {
    e.preventDefault(); const v = new FormData(f), ciudad = v.get('c').trim();
    window.open(wa(`Hola! Quiero dejar mi reseña de Cattleya Flores 🌸\n${'⭐'.repeat(rate)}\nNombre: ${v.get('n').trim()}${ciudad ? `\nCiudad: ${ciudad}` : ''}\nReseña: ${v.get('t').trim()}\n(Te envío una foto de mi flor en este chat 📷)`), '_blank', 'noopener');
    f.reset(); rate = 5; d.close();
  });
}
})();
