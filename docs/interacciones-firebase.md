# Recuentos compartidos de «me gusta» y reacciones (+1 / −1)

Las páginas del blog ya incluyen los botones. **Sin configurar nada**, cada persona ve y guarda su propia reacción en su navegador, pero **no se muestran recuentos** (GitHub Pages es estático y no puede guardar votos de varias personas).

Para que los números se compartan entre visitantes hace falta una base de datos. Esta versión usa **Firebase Realtime Database** (plan gratuito Spark, sin tarjeta) mediante su API REST: no se carga ninguna librería de terceros.

## Pasos
1. En https://console.firebase.google.com crea un proyecto (puedes desactivar Google Analytics).
2. **Build → Realtime Database → Crear base de datos**. Elige una región de la UE (p. ej. `europe-west1`) y empieza en *modo bloqueado*.
3. Pestaña **Reglas**: pega el contenido de `docs/firebase.rules.json` y publica.
4. Copia la URL de la base de datos (algo como `https://TU-PROYECTO-default-rtdb.europe-west1.firebasedatabase.app`) en `assets/js/blog-config.js`:
   ```js
   window.BLOG_INTERACCIONES = { databaseURL: 'https://TU-PROYECTO-default-rtdb.europe-west1.firebasedatabase.app' };
   ```
5. Publica. Los recuentos aparecerán junto a cada botón.

## Cómo funciona
- Cada navegador crea un identificador aleatorio (`bi-uid`, en `localStorage`) **solo cuando reacciona por primera vez**. No contiene datos personales.
- Se guarda en `r/<slug-del-artículo>/<identificador>` un objeto `{ l: 0|1, v: -1|0|1 }`: `l` = me gusta, `v` = +1 / −1. Una persona (navegador) solo puede tener una entrada por artículo; volver a pulsar la quita.
- Los recuentos se leen cuando la sección de reacciones entra en pantalla.

## Límites que conviene conocer
- Sin inicio de sesión no se puede impedir que alguien borre su `localStorage` y vote otra vez, o que cree identificadores nuevos. Es una valoración orientativa, no una votación segura.
- Las reglas impiden escribir fuera de `r/…`, valores inválidos y claves arbitrarias, pero no limitan la frecuencia. Si ves abuso, pon una cuota en la consola o añade Firebase App Check.
- Al leer los recuentos el navegador contacta con Firebase (Google), que ve la IP de la persona. Menciónalo en tu política de privacidad.
