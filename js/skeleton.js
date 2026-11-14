// Quita el skeleton (la flor que late) cuando la foto termina de cargar: en el catálogo y en la ventana de cada flor.
(function () {
  var SEL = '#grid .card img, .acc img';
  function listo(i) { i.classList.add('ok'); }
  function ver(i) {
    if (i.complete && i.naturalWidth) return listo(i);
    i.addEventListener('load', function () { listo(i); }, { once: true });
    i.addEventListener('error', function () { listo(i); }, { once: true });
  }
  function buscar(raiz) { raiz.querySelectorAll(SEL).forEach(ver); }
  var z = document.querySelector('#dlg .zm img');
  if (z) {
    var fig = z.parentElement;
    var quitar = function () { fig.classList.remove('cargando'); };
    var revisar = function () {
      if (!z.getAttribute('src') || (z.complete && z.naturalWidth)) quitar(); else fig.classList.add('cargando');
    };
    z.addEventListener('load', quitar);
    z.addEventListener('error', quitar);
    new MutationObserver(revisar).observe(z, { attributes: true, attributeFilter: ['src'] });
  }
  buscar(document);
  // El catálogo se arma con JavaScript, así que también se vigilan las fotos que aparecen después.
  new MutationObserver(function (cambios) {
    cambios.forEach(function (c) {
      c.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(SEL)) ver(n); else buscar(n);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
