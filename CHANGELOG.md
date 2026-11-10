# Historial de cambios

## 2026-11-10 — Auditoría SEO/AEO
### Añadido
- Portada: descripción, canonical, robots, Open Graph, Twitter Cards, JSON-LD (`Person`, `WebSite`, `ProfilePage`), iconos y manifest en el `<head>`.
- Contenido de la portada renderizado dentro de `#root` (legible sin JavaScript).
- Imagen hero en WebP responsive (`hero-sara-lopez-640/1100/1600`) en lugar de base64 dentro del JS; fuentes autoalojadas (`assets/css/fuentes.css`).
- Imágenes sociales `assets/img/social/home.jpg` y `docencia.jpg`.
- `sitemap.xml`, `sitemap-images.xml`, `sitemap-index.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `humans.txt`, `.well-known/security.txt`, `404.html`, `.nojekyll`, `.gitignore`.
- Aviso de consentimiento y carga de Google Tag Manager solo tras aceptar (`assets/js/analytics-home.js`); enlaces a la política de privacidad en la portada.
- Verificación de Google Search Console (archivo y meta).
### Cambiado
- El bundle de la portada ya no reescribe `description`, `robots` ni `og:*` en tiempo de ejecución.
- `docencia/`: canonical, robots, Open Graph y Twitter Cards completos; descripciones acortadas.
- `dateModified` del `ProfilePage` en formato ISO 8601 con hora y zona horaria.
- `cv-fuente.html` pasa a `noindex`.
