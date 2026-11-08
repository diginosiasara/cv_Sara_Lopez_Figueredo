# CV Landing · Sara López-Figueredo

Proyecto estático (sin build). Abrir `index.html` o servir la carpeta con cualquier servidor web.

## Estructura
- `index.html`: estructura y contenido (HTML semántico, sin CSS ni JS en línea).
- `css/`: `styles.css` base · `formadora.css` · `formacion.css` · `experiencia.css` · `proyectos.css` · `contacto.css` · `palabras.css` · `consent.css` (aviso de analítica) · `errores.css` (páginas de error) · `a11y.css` (accesibilidad, contraste, impresión) · `print.css` · `inline.css`.
- `js/`: `boot.js` · `analytics.js` (Google Analytics 4 con consentimiento) · `main.js` · `formadora.js` · `formacion.js` · `contacto.js` · `errores.js`.
- `assets/img/`: `hero.jpg`, `perfil.jpg` (JPEG progresivo) y `og-image.jpg` (1200×630 para compartir).
- `documents/`: CV ejecutivo de 2 páginas en PDF y Word, y su fuente `cv-fuente.html`.
- Páginas de aviso con el mismo tema (sin `index` en buscadores): `300`, `301`, `400`, `401`, `403`, `404`, `429`, `502`, `503` y `504` (`.html`). Son informativas: no contienen datos de servidor inventados. `429` y `503` tienen cuenta atrás para reintentar; `301` ofrece una redirección automática **opcional** (con botón para cancelar).
- SEO: `robots.txt`, `sitemap.xml`, favicon (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`) y `google0eb2bd5a41d5e035.html` (verificación de Search Console).

## Despliegue en GitHub Pages (importante)
- Esta carpeta debe publicarse en `…/cv_Sara_Lopez_Figueredo/Sanitario-Administrativo/`.
- `404.html` solo la sirve GitHub Pages si está en la **raíz del repositorio**: cópiala allí (ya lleva `<base>` para cargar los estilos desde cualquier ruta).
- Los buscadores solo leen `robots.txt` en la raíz del dominio (`diginosiasara.github.io/robots.txt`): copia ese archivo al repositorio `diginosiasara.github.io`. El `sitemap.xml` se declara dentro.
- GitHub Pages no permite redirecciones 301 propias ni cabeceras HTTP. Las páginas `3xx`, `4xx` y `5xx` son informativas; solo `404.html` la sirve GitHub Pages por sí solo. La canonicalización «www / sin www» solo se configura con un dominio propio (Settings → Pages → Custom domain).

## Lector de voz (páginas de aviso)
- Cada página de aviso incluye «Escuchar esta página»: usa la voz del navegador (Web Speech API), sin servicios externos. Permite escuchar, pausar, detener y elegir la velocidad; resalta el bloque que se está leyendo. Solo se activa al pulsar el botón y se oculta si el navegador no tiene síntesis de voz.

## Analítica
- Google Analytics 4 (`G-10T6SVEZJX`) con Consent Mode v2: todo denegado hasta que la persona acepta. Eventos: clic en correo, LinkedIn, descarga del CV, CodiSalud y envío del formulario.
- Las personas pueden cambiar su elección en «Preferencias de analítica» (pie de página).

Datos: resoluciones del Registro de Formadores (solo concedidas), Excel de cursos, vida laboral, hojas de servicios, contratos y certificados.
