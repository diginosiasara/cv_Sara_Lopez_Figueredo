# cv_Sara_Lopez_Figueredo

## Blog "Apuntes de trinchera"

- `blog/`: índice con buscador y filtros, 67 artículos (`blog/<slug>/index.html`), páginas por tema (`blog/tema/…`) y `blog/feed.xml` (RSS).
- `assets/`: recursos del blog (`css/`, `js/`, `fonts/`, `img/blog/`, `img/social/blog/`, `img/icons/`). Las rutas son relativas, así que `blog/` y `assets/` deben quedar juntos en la raíz del proyecto.
- Raíz: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` y `site.webmanifest` (los usa el blog).
- URL en GitHub Pages: `https://diginosiasara.github.io/cv_Sara_Lopez_Figueredo/blog/`
- Los menús del blog enlazan con las secciones del `index.html` raíz (`#sobre-mi`, `#experiencia`, `#mi-historia`, `#contactar`) y la sección «Blog» de la home enlaza con `blog/`.
- Las URLs absolutas (canonical, Open Graph, JSON-LD, RSS) apuntan a la dirección de GitHub Pages indicada arriba.

## Lector de voz accesible

- `assets/js/lector.js` + `assets/css/lector.css`: lector de texto a voz (Web Speech API del navegador; sin servicios externos ni cookies). Está activo en la home y en todo el blog.
- Botón flotante «Escuchar» (abajo a la derecha) y enlace «Abrir lector de voz» justo después de «Saltar al contenido principal» para quien navega con teclado.
- Controles: Reproducir/Pausar/Continuar, Anterior, Siguiente, Detener, velocidad (0,75×–2×) y selección de voz. Recuerda velocidad y voz (localStorage).
- Lee el contenido de `<main>` bloque a bloque (títulos, párrafos, listas, citas, tablas y texto alternativo de las imágenes) y resalta lo que lee. Omite menús, migas de pan, botones, formularios y bloques de código.
- Si hay texto seleccionado al pulsar «Reproducir», empieza desde ahí. `Esc` detiene y cierra.
- Accesibilidad: foco visible, objetivos táctiles ≥ 44 px, mensajes de estado (`role="status"`), respeta `prefers-reduced-motion`, modo oscuro del blog y contraste forzado. Auditado con axe-core (WCAG 2.2 AA) sin violaciones.
- Para activarlo en otra página basta con incluir el CSS y el JS (con `defer`).
