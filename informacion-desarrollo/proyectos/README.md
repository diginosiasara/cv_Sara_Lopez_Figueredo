# DigiNOSIA · Portfolio

Web estática (HTML, CSS y JavaScript sin dependencias ni compilación). Páginas por ancla: `#inicio`, `#proyectos`, `#especialidades`, `#metodologia`, `#sobre`, `#perfil`, `#contacto` y una ficha por proyecto (`#hisdatawiki`, `#codisalud`…).

## Estructura
- `index.html`: marcado, metadatos SEO y datos estructurados (JSON-LD). Cabecera en dos filas.
- `assets/css/styles.css`: tokens, componentes, animaciones, libro de la propuesta de valor y accesibilidad.
- `assets/js/app.js`: datos de proyectos y perfil, `ST`/`ST2` (por proyecto), `AR` (por tipo), `CL` (perfil de cliente), capítulos del libro (`CH`, `bkSp`, `chl`, `bkSum`), capturas incrustadas, reacciones, redes y lector por bloques.
- `docs/referencias-diseno/`: capturas de referencia.

## Libro de la propuesta de valor (ficha de proyecto)
Encuadernado con tapa, lomo, cinta, pestañas laterales por bloque (en pantallas anchas) o pestañas superiores, barra de progreso y animación de pasar página. 17 espacios: portada, índice, prólogo, 12 capítulos en 5 bloques y anexos. Cada capítulo abre con su número, objetivo y consejo, y cierra con un resumen «En este proyecto» calculado con los datos del proyecto.

## Publicar
Sube la carpeta a GitHub Pages o a cualquier alojamiento estático. Antes, añade `canonical` con tu dominio y un `sitemap.xml`.

## Pendiente de confirmar
- Estados reales, enlaces de demostración y validación con usuarios reales.
- Ampliar la ficha de ClinexCode tras auditar su código.
- Contacto: el formulario abre el programa de correo (`nosia_sl@hotmail.com`); no hay backend.
