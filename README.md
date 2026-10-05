# Cattleya Flores Artesanales

Sitio estático en Cloudflare Pages con reseñas (con foto) y un panel de administración.

## Estructura
- `index.html`, `privacidad.html`, `admin.html` — las páginas
- `css/style.css` — estilos · `js/main.js` (página) y `js/admin-panel.js` (panel)
- `img/` — imágenes
- `functions/api/` — `resenas.js`, `admin.js`, `foto/[name].js`
- `_headers` — cabeceras de seguridad y caché · `_redirects` — oculta este README

## Configuración en Cloudflare (Pages → Settings)
- Binding **RESENAS**: donde se guardan las reseñas.
- Binding **FOTOS** (R2): `cattleya-fotos`.
- Secreto **ADMIN_KEY**: clave del panel (larga y aleatoria).
