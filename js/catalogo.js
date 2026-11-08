// Catálogo original de Cattleya: lo usan la página (main.js) y el panel (/admin).
// Cada producto de P: [archivo, nombre, categoría] · M: 'Tipo1 Tipo2|color1 color2' por archivo.
// Para cambiar una flor de siempre usa el panel; este archivo solo hace falta si agregas una foto nueva a img/flores/ a mano.
window.CATALOGO = {
P: [
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
['ramo-girasol-rosa','Ramo de Girasol y Rosas','Ramos'],['ramo-girasoles','Ramo de Girasoles','Ramos'],['ramo-tulipanes','Ramo de Tulipanes','Ramos'],['maceta_tulipanes-rojos','Maceta de Tulipanes Rojos','Macetas'],['gerbera-rosa','Gerbera Rosa','Ramos'],['lirio-borde-rojo','Lirio Borde Rojo','Ramos'],['lirio-borde-blanco','Lirio Borde Blanco','Ramos'],['lirio-rojo','Lirio Rojo','Ramos'],['maceta-tulipanes-multicolores','Maceta de Tulipanes Multicolores','Macetas']],
M: {
'lampara-rampunzel':'|morado amarillo','bouquet-de-lilys-y-tulipanes':'Lirio Tulipán|rojo blanco','lilys-y-tulipanes':'Lirio Tulipán|amarillo blanco',
'tulipan_rosa':'Tulipán|rosa','tulipan_amarillo':'Tulipán|amarillo','tulipan_rojo':'Tulipán|rojo','tulipan_fucsia':'Tulipán|rosa','bouquet-de-girasoles':'Girasol|amarillo',
'rosa':'Rosa|rojo','maceta_tulipan_rosa':'Tulipán|rosa','ramo_girasoles2':'Girasol Margarita|amarillo blanco','ramo_flores_rojas':'Rosa|rojo blanco',
'ramo-orquideas':'Orquídea|morado','rosas-girasol':'Tulipán Girasol|rojo amarillo','bouquet-de-lilys':'Lirio|rosa','bouquet-de-lirios':'Lirio|azul','ramo-margarita':'Margarita|blanco',
'gerbera_amarilla':'Gerbera|amarillo','lirio_amarillo':'Lirio|amarillo',
'maceta-girasol':'Girasol|amarillo','maceta-calendula':'Caléndula|amarillo',
'ramo-girasol-corzon':'Girasol|amarillo','maceta-tulipan-amarillo':'Tulipán|amarillo','maceta-lilys-rosa':'Lirio|morado rosa','maceta-lilys-rosa-oscuros':'Lirio|rosa',
'ramo-girasol-rosa':'Girasol Rosa|amarillo rojo','ramo-girasoles':'Girasol|amarillo','ramo-tulipanes':'Tulipán|rojo',
// Macetas nuevas (y las que faltaban) — el nombre debe ser igual al del archivo en img/flores/
'maceta-margarita':'Margarita|blanco','maceta-margaritas-azul':'Margarita|azul','maceta-margaritas-roja':'Margarita|rojo blanco','maceta-rosa-rosa-y-margarita':'Rosa Margarita|rosa blanco',
'maceta-tulipan-fucsia':'Tulipán|rosa','maceta-tulipan-rosaclaro':'Tulipán|rosa','maceta-tulipanes-multicolores':'Tulipán|amarillo rosa azul morado','maceta-tulipanes-rojos':'Tulipán|rojo','maceta_tulipanes-rojos':'Tulipán|rojo',
'gerbera-rosa':'Gerbera|rosa','lirio-rojo':'Lirio|rojo','lirio-borde-rojo':'Lirio|blanco rojo','lirio-borde-blanco':'Lirio|rojo blanco'}
};
