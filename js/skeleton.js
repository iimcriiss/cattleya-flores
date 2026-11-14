// Marca con .ok cada foto del catálogo cuando termina de cargar, para quitarle el skeleton (el brillo de carga).
(function () {
  var SEL = '#grid .card img, .acc img';
  function listo(i) { i.classList.add('ok'); }
  function ver(i) {
    if (i.complete && i.naturalWidth) return listo(i);
    i.addEventListener('load', function () { listo(i); }, { once: true });
    i.addEventListener('error', function () { listo(i); }, { once: true });
  }
  function buscar(raiz) { raiz.querySelectorAll(SEL).forEach(ver); }
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
