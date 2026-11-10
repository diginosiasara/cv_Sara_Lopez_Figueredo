# cv_Sara_Lopez_Figueredo

## Blog "Apuntes de trinchera"

- `assets/css/articulo-visual.css`: componentes visuales (`.vz-*`: cifras, tarjetas, pasos, comparativas, bloques de color) para artículos ilustrados; se enlaza solo en esas entradas.
- `assets/css/sigue-leyendo.css` + `assets/js/sigue-leyendo.js`: diseño y animación de la sección «Sigue leyendo» (aparición escalonada, carrusel en móvil; respeta «reducir movimiento»).
- `assets/css/animaciones-articulo.css` + `assets/js/animaciones-articulo.js`: animaciones de lectura ligadas al scroll (CSS `animation-timeline`), con carácter por tema (sage/terra/blue), barra de progreso y alternativa JS para navegadores sin soporte; respetan «reducir movimiento».
- `assets/css/animaciones-sitio.css` + `assets/js/animaciones-sitio.js`: animaciones al hacer scroll en la home, el índice del blog y las páginas de tema (movimiento por tema sage/terra/blue).
- `Sanitario-Administrativo/css/animaciones.css` + `js/animaciones.js`: animaciones del CV y del catálogo de formación (KPIs, barras que se rellenan, filas).
- `rutas-del-alma/`: página del proyecto literario *Rutas del Alma: Ecos y Sombras* (estilos en `assets/css/rutas-del-alma.css`, que también da estilo a su sección en la home).
- `Sanitario-Administrativo/`: CV y catálogo de formación (datos del Excel de baremo).
- `blog/`: índice con buscador y filtros, 74 artículos (`blog/<slug>/index.html`), páginas por tema (`blog/tema/…`) y `blog/feed.xml` (RSS).
- `assets/`: recursos del blog (`css/`, `js/`, `fonts/`, `img/blog/`, `img/social/blog/`, `img/icons/`). Las rutas son relativas, así que `blog/` y `assets/` deben quedar juntos en la raíz del proyecto.
- Raíz: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` y `site.webmanifest` (los usa el blog).
- URL en GitHub Pages: `https://diginosiasara.github.io/cv_Sara_Lopez_Figueredo/blog/`
- Los menús del blog enlazan con las secciones del `index.html` raíz (`#sobre-mi`, `#experiencia`, `#mi-historia`, `#contactar`) y la sección «Blog» de la home enlaza con `blog/`.
- Las URLs absolutas (canonical, Open Graph, JSON-LD, RSS) apuntan a la dirección de GitHub Pages indicada arriba.

## Lector de voz accesible

- `assets/js/lector.js` + `assets/css/lector.css`: lector de texto a voz (Web Speech API del navegador; sin servicios externos ni cookies). Activo en la home y en todo el blog.
- Cerrado: botón «Escuchar» (solo icono en móvil). Abierto: mini-reproductor en una sola barra con Anterior, Reproducir/Pausar/Continuar, Siguiente, Detener, velocidad (pulsa para cambiarla), ajustes (voz y velocidad) y cerrar. Una fina barra de progreso indica por dónde va.
- Teclado: la barra es un `toolbar` (una sola parada de tabulador; flechas, Inicio y Fin para moverse). Enlace «Abrir lector de voz» justo tras «Saltar al contenido principal». `Esc` cierra primero los ajustes y después el lector (y detiene la lectura).
- Lee el contenido de `<main>` bloque a bloque (títulos, párrafos, listas, citas, tablas y texto alternativo de imágenes) y resalta lo que lee. Omite menús, migas, botones, formularios y código. Si hay texto seleccionado al pulsar «Reproducir», empieza desde ahí.
- Accesibilidad: foco visible, objetivos táctiles de 42–44 px, mensajes de estado para lectores de pantalla (`role="status"`), `prefers-reduced-motion`, modo oscuro y contraste forzado. Auditado con axe-core (WCAG 2.2 AA) sin violaciones.
- Para usarlo en otra página basta con incluir el CSS y el JS (con `defer`).

## SEO / AEO (auditoría de noviembre 2026)

- `index.html` (home): `<head>` completo (description, canonical, robots, Open Graph, Twitter Cards, iconos, JSON-LD `Person` + `WebSite` + `ProfilePage` con `@id` `…/#person` que reutilizan los artículos). El contenido de la home se guarda ya renderizado dentro de `#root` (lo sustituye React al arrancar), así que se lee sin JavaScript. **Si cambias textos de la home en el bundle, hay que regenerar ese contenido.**
- La foto de cabecera ya no va en base64 dentro del JS: `assets/img/hero-sara-lopez.webp` (precargada, con `width`/`height`). Las fuentes son locales (`assets/css/fuentes.css`) en vez del `@import` de Google Fonts.
- Imágenes sociales nuevas: `assets/img/social/home.jpg` y `assets/img/social/docencia.jpg` (1200×630).
- `sitemap.xml` (89 URL canónicas + PDF del CV), `robots.txt` y `llms.txt` en la raíz. Ojo: los rastreadores solo leen `robots.txt` en la raíz del host (`diginosiasara.github.io/robots.txt`), no en una subcarpeta de proyecto; el sitemap hay que enviarlo en Search Console / Bing Webmaster Tools.
- `docencia/`: añadidos canonical, robots, `og:url`, `og:image` y Twitter Cards. `Sanitario-Administrativo/documents/cv-fuente.html` pasa a `noindex`.

### Analítica y verificación (portada)
- `google0eb2bd5a41d5e035.html` y la meta `google-site-verification` están en la raíz/portada para Search Console.
- Google Tag Manager (`GTM-TKJF6CM8`) se carga desde `assets/js/analytics-home.js` **solo tras aceptar** en el aviso (Consent Mode v2 por defecto denegado). Comparte la clave `cv-analytics-consent` con el CV sanitario. El pie de la home tiene el botón «Preferencias de analítica».
- El bundle de React ya no reescribe `description`, `robots` ni `og:*` en tiempo de ejecución: mandan las etiquetas del `<head>`.

### Noviembre 2026 (2.ª revisión)
- La portada enlaza a la política de privacidad (pie y nota del formulario → `Sanitario-Administrativo/index.html#ct-priv`) y el texto de privacidad menciona Google Tag Manager.
- Imagen hero responsive: `hero-sara-lopez-640.webp`, `-1100.webp` y `hero-sara-lopez.webp` (1600), con `srcset` y preload adaptativo.
- Para que `robots.txt`, `sitemap.xml` y `llms.txt` se encuentren en la raíz del host hace falta un repositorio `diginosiasara.github.io` (ver paquete aparte).
