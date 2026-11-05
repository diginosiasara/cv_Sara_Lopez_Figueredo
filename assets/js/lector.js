/*
 * Lector de voz accesible (texto a voz) · Diginosia / Sara López-Figueredo
 * - Usa la Web Speech API del navegador (sin servicios externos, sin cookies).
 * - Lee el contenido principal bloque a bloque y resalta lo que se está leyendo.
 * - Controlable 100 % con teclado; mensajes de estado para lectores de pantalla.
 * - Si el navegador no soporta síntesis de voz, no muestra nada.
 */
(function () {
  'use strict';

  if (window.__lectorVoz) return;
  window.__lectorVoz = true;

  var synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') return;

  /* ---------- Configuración ---------- */
  var SEL_TEXTO = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,tr';
  var SEL_BLOQUES = SEL_TEXTO + ',img[alt]';
  var SEL_EXCLUIR =
    'nav,.breadcrumb,.chip-list,form,button,select,[aria-hidden="true"],[hidden],pre,' +
    '.btn-row,.lector,.lector-salto,.skip-link,.visually-hidden,.sr-only,noscript,script,style';
  var MAX_TROZO = 220;
  var CLAVE = 'lector:v1';
  var VELOCIDADES = [
    ['0.75', 'Lenta (0,75×)'],
    ['1', 'Normal (1×)'],
    ['1.25', 'Rápida (1,25×)'],
    ['1.5', 'Muy rápida (1,5×)'],
    ['2', 'Máxima (2×)']
  ];

  /* ---------- Estado ---------- */
  var estado = 'idle'; // idle | playing | paused
  var bloques = [];
  var bi = 0; // índice de bloque
  var ci = 0; // índice de trozo dentro del bloque
  var gen = 0; // invalida callbacks antiguos al cancelar
  var actual = null; // referencia viva (evita recolección de basura en Chrome)
  var marcado = null;
  var voces = [];
  var voz = null;
  var vel = 1;
  var prefs = leerPrefs();
  if (prefs.vel) vel = parseFloat(prefs.vel) || 1;

  var reduceMovimiento =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilidades ---------- */
  function leerPrefs() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || {};
    } catch (e) {
      return {};
    }
  }
  function guardarPrefs() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(prefs));
    } catch (e) {
      /* almacenamiento no disponible: se ignora */
    }
  }
  function idiomaPagina() {
    var l = document.documentElement.lang || 'es';
    return l.length === 2 ? (l === 'es' ? 'es-ES' : l) : l;
  }

  /* ---------- Construcción de la interfaz ---------- */
  var ICONOS = {
    altavoz:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    play:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15l12-7.5-12-7.5z"/></svg>',
    pausa:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14"/></svg>',
    stop:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>',
    ant:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5v14"/><path d="M19 5v14L9 12l10-7z"/></svg>',
    sig:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 5v14"/><path d="M5 5v14l10-7L5 5z"/></svg>',
    cerrar:
      '<svg class="lector__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
  };

  var raiz = document.createElement('div');
  raiz.className = 'lector';
  raiz.innerHTML =
    '<section class="lector__panel" id="lector-panel" role="region" aria-label="Lector de voz" hidden>' +
    '  <div class="lector__cabecera">' +
    '    <h2 class="lector__titulo" id="lector-titulo">Lector de voz</h2>' +
    '    <button type="button" class="lector__btn lector__btn--cerrar" data-acc="cerrar">' +
         ICONOS.cerrar + '<span>Cerrar</span></button>' +
    '  </div>' +
    '  <div class="lector__controles" role="group" aria-labelledby="lector-titulo">' +
    '    <button type="button" class="lector__btn" data-acc="ant">' + ICONOS.ant + '<span>Anterior</span></button>' +
    '    <button type="button" class="lector__btn lector__btn--principal" data-acc="play">' +
         '<span class="lector__ico-play">' + ICONOS.play + '</span>' +
         '<span class="lector__ico-pausa" hidden>' + ICONOS.pausa + '</span>' +
         '<span class="lector__txt-play">Reproducir</span></button>' +
    '    <button type="button" class="lector__btn" data-acc="sig">' + ICONOS.sig + '<span>Siguiente</span></button>' +
    '    <button type="button" class="lector__btn" data-acc="stop">' + ICONOS.stop + '<span>Detener</span></button>' +
    '  </div>' +
    '  <div class="lector__ajustes">' +
    '    <label class="lector__campo" for="lector-vel"><span>Velocidad</span>' +
    '      <select id="lector-vel" class="lector__select"></select></label>' +
    '    <label class="lector__campo" for="lector-voz"><span>Voz</span>' +
    '      <select id="lector-voz" class="lector__select"></select></label>' +
    '  </div>' +
    '  <div class="lector__info">' +
    '    <p class="lector__progreso" id="lector-progreso" aria-hidden="true"></p>' +
    '    <p class="lector__estado" id="lector-estado" role="status" aria-live="polite"></p>' +
    '  </div>' +
    '  <p class="lector__ayuda">Selecciona un texto para empezar desde ahí. <kbd>Esc</kbd> detiene y cierra.</p>' +
    '</section>' +
    '<button type="button" class="lector__toggle" id="lector-toggle" aria-expanded="false" aria-controls="lector-panel">' +
      ICONOS.altavoz + '<span>Escuchar</span></button>';
  document.body.appendChild(raiz);

  var panel = raiz.querySelector('#lector-panel');
  var toggle = raiz.querySelector('#lector-toggle');
  var btnPlay = raiz.querySelector('[data-acc="play"]');
  var icoPlay = raiz.querySelector('.lector__ico-play');
  var icoPausa = raiz.querySelector('.lector__ico-pausa');
  var txtPlay = raiz.querySelector('.lector__txt-play');
  var selVel = raiz.querySelector('#lector-vel');
  var selVoz = raiz.querySelector('#lector-voz');
  var elEstado = raiz.querySelector('#lector-estado');
  var elProgreso = raiz.querySelector('#lector-progreso');

  /* Velocidades */
  VELOCIDADES.forEach(function (v) {
    var o = document.createElement('option');
    o.value = v[0];
    o.textContent = v[1];
    if (parseFloat(v[0]) === vel) o.selected = true;
    selVel.appendChild(o);
  });

  /* ---------- Voces ---------- */
  function cargarVoces() {
    var todas = synth.getVoices() || [];
    var lang = idiomaPagina().slice(0, 2).toLowerCase();
    var propias = todas.filter(function (v) {
      return (v.lang || '').toLowerCase().indexOf(lang) === 0;
    });
    voces = propias.length ? propias : todas;
    // Orden: es-ES primero, luego el resto
    voces.sort(function (a, b) {
      var pa = /^es[-_]ES/i.test(a.lang) ? 0 : 1;
      var pb = /^es[-_]ES/i.test(b.lang) ? 0 : 1;
      return pa - pb || a.name.localeCompare(b.name);
    });
    selVoz.innerHTML = '';
    if (!voces.length) {
      var o0 = document.createElement('option');
      o0.value = '';
      o0.textContent = 'Voz predeterminada del dispositivo';
      selVoz.appendChild(o0);
      voz = null;
      return;
    }
    var elegida = null;
    voces.forEach(function (v, i) {
      var o = document.createElement('option');
      o.value = String(i);
      o.textContent = v.name + ' (' + v.lang + ')';
      selVoz.appendChild(o);
      if (prefs.voz && v.voiceURI === prefs.voz) elegida = i;
    });
    if (elegida === null) elegida = 0;
    selVoz.value = String(elegida);
    voz = voces[elegida];
    if (propias.length === 0) {
      mensaje('No hay voces en español en este dispositivo; se usará la voz disponible.');
    }
  }
  cargarVoces();
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', cargarVoces);
  } else {
    synth.onvoiceschanged = cargarVoces;
  }

  /* ---------- Extracción de texto ---------- */
  function visible(el) {
    if (!el.getClientRects().length) return false;
    var cs = window.getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }

  function limpiar(el) {
    var c = el.cloneNode(true);
    var ruido = c.querySelectorAll(
      'svg,script,style,button,.visually-hidden,.sr-only,[aria-hidden="true"]'
    );
    for (var i = 0; i < ruido.length; i++) ruido[i].parentNode.removeChild(ruido[i]);
    var brs = c.querySelectorAll('br');
    for (var b = 0; b < brs.length; b++) brs[b].parentNode.replaceChild(document.createTextNode(' '), brs[b]);
    var enlinea = c.querySelectorAll('span,time,a,strong,em,b,i,small,div');
    for (var e = 0; e < enlinea.length; e++) {
      var sig = enlinea[e].nextSibling;
      if (sig && sig.nodeType === 1) enlinea[e].parentNode.insertBefore(document.createTextNode(' '), sig);
    }
    var t;
    if (el.tagName === 'TR') {
      var celdas = c.querySelectorAll('th,td');
      var partes = [];
      for (var j = 0; j < celdas.length; j++) partes.push(celdas[j].textContent.trim());
      t = partes.join(', ');
    } else {
      t = c.textContent;
    }
    return t
      .replace(/\s*[·•|]\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function trocear(texto) {
    var partes = texto.split(/([.!?…]+["”)»]?)\s+/);
    var frases = [];
    for (var i = 0; i < partes.length; i += 2) {
      var f = (partes[i] || '') + (partes[i + 1] || '');
      if (f.trim()) frases.push(f.trim());
    }
    var trozos = [];
    var acum = '';
    function volcar() {
      if (acum) trozos.push(acum);
      acum = '';
    }
    frases.forEach(function (f) {
      if (f.length > MAX_TROZO) {
        volcar();
        // Frase larga: cortar por comas / puntos y coma / dos puntos y, si hace falta, por palabras
        var sub = f.replace(/([,;:])\s+/g, '$1\u0001').split('\u0001');
        sub.forEach(function (s) {
          while (s.length > MAX_TROZO) {
            var corte = s.lastIndexOf(' ', MAX_TROZO);
            if (corte < 40) corte = MAX_TROZO;
            if ((acum + ' ' + s.slice(0, corte)).length > MAX_TROZO) volcar();
            acum = (acum ? acum + ' ' : '') + s.slice(0, corte);
            volcar();
            s = s.slice(corte).trim();
          }
          if ((acum + ' ' + s).length > MAX_TROZO) volcar();
          acum = (acum ? acum + ' ' : '') + s;
        });
        volcar();
      } else if ((acum + ' ' + f).length > MAX_TROZO) {
        volcar();
        acum = f;
      } else {
        acum = (acum ? acum + ' ' : '') + f;
      }
    });
    volcar();
    return trozos.length ? trozos : [texto];
  }

  function recoger() {
    var base = document.querySelector('main') || document.getElementById('root') || document.body;
    var els = base.querySelectorAll(SEL_BLOQUES);
    var lista = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest(SEL_EXCLUIR)) continue;
      var texto;
      if (el.tagName === 'IMG') {
        var alt = (el.getAttribute('alt') || '').trim();
        if (alt.length < 8) continue;
        texto = /^(imagen|foto|fotografía|ilustración|cómic|infografía|retrato)/i.test(alt) ? alt : 'Imagen: ' + alt;
      } else {
        if (el.querySelector(SEL_TEXTO)) continue; // solo bloques "hoja"
        texto = limpiar(el);
      }
      if (texto.length < 2 || !/[\p{L}\p{N}]/u.test(texto)) continue;
      if (!visible(el)) continue;
      lista.push({ el: el, trozos: trocear(texto) });
    }
    return lista;
  }

  /* ---------- Resaltado ---------- */
  function marcar(el) {
    if (marcado === el) return;
    desmarcar();
    marcado = el;
    el.classList.add('lector-activo');
    var r = el.getBoundingClientRect();
    var h = window.innerHeight;
    var tope = h * 0.9;
    if (!panel.hidden) {
      tope = window.innerWidth < 640 ? panel.getBoundingClientRect().top - 12 : h * 0.8;
    }
    if (r.top < 100 || r.bottom > tope) {
      el.scrollIntoView({ block: 'start', behavior: reduceMovimiento ? 'auto' : 'smooth' });
    }
  }
  function desmarcar() {
    if (marcado) marcado.classList.remove('lector-activo');
    marcado = null;
  }

  /* ---------- Mensajes e interfaz ---------- */
  var tMensaje = null;
  function mensaje(t) {
    clearTimeout(tMensaje);
    elEstado.textContent = '';
    tMensaje = setTimeout(function () {
      elEstado.textContent = t;
    }, 60);
  }
  function actualizarProgreso() {
    if (estado === 'idle' || !bloques.length) {
      elProgreso.textContent = '';
      return;
    }
    elProgreso.textContent = 'Bloque ' + Math.min(bi + 1, bloques.length) + ' de ' + bloques.length;
  }
  function pintarBoton() {
    var sonando = estado === 'playing';
    icoPlay.hidden = sonando;
    icoPausa.hidden = !sonando;
    txtPlay.textContent = sonando ? 'Pausar' : estado === 'paused' ? 'Continuar' : 'Reproducir';
    raiz.setAttribute('data-estado', estado);
  }

  /* ---------- Reproducción ---------- */
  function hablar() {
    if (estado !== 'playing') return;
    var b = bloques[bi];
    if (!b) {
      fin();
      return;
    }
    marcar(b.el);
    actualizarProgreso();
    var u = new window.SpeechSynthesisUtterance(b.trozos[ci]);
    u.lang = (voz && voz.lang) || idiomaPagina();
    if (voz) {
      try {
        u.voice = voz;
      } catch (e) {
        /* voz no válida: se usa la predeterminada */
      }
    }
    u.rate = vel;
    var mi = ++gen;
    u.onend = function () {
      if (mi !== gen) return;
      ci++;
      if (ci >= b.trozos.length) {
        bi++;
        ci = 0;
      }
      hablar();
    };
    u.onerror = function (e) {
      if (mi !== gen) return;
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
      detener();
      mensaje('No se ha podido reproducir la voz en este dispositivo.');
    };
    actual = u;
    synth.speak(u);
  }

  function reiniciarTrozo() {
    gen++;
    synth.cancel();
    setTimeout(hablar, 60);
  }

  function empezar() {
    bloques = recoger();
    if (!bloques.length) {
      mensaje('No hay texto que leer en esta página.');
      return;
    }
    bi = 0;
    ci = 0;
    var sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed && sel.anchorNode) {
      var idx = -1;
      for (var i = 0; i < bloques.length; i++) {
        if (bloques[i].el.contains(sel.anchorNode)) {
          idx = i;
          break;
        }
      }
      if (idx < 0) {
        // la selección está en un contenedor: primer bloque posterior a ella
        for (var k = 0; k < bloques.length; k++) {
          if (sel.anchorNode.compareDocumentPosition(bloques[k].el) & 4) {
            idx = k;
            break;
          }
        }
      }
      if (idx >= 0) bi = idx;
    }
    estado = 'playing';
    pintarBoton();
    mensaje('Reproduciendo.');
    reiniciarTrozo();
  }

  function pausar() {
    estado = 'paused';
    gen++;
    synth.cancel();
    pintarBoton();
    mensaje('En pausa.');
  }

  function continuar() {
    estado = 'playing';
    pintarBoton();
    mensaje('Reproduciendo.');
    reiniciarTrozo();
  }

  function detener() {
    estado = 'idle';
    gen++;
    synth.cancel();
    desmarcar();
    bi = 0;
    ci = 0;
    pintarBoton();
    actualizarProgreso();
    mensaje('Detenido.');
  }

  function fin() {
    estado = 'idle';
    gen++;
    desmarcar();
    bi = 0;
    ci = 0;
    pintarBoton();
    actualizarProgreso();
    mensaje('Fin del texto.');
  }

  function saltar(delta) {
    if (estado === 'idle' || !bloques.length) {
      bloques = recoger();
      if (!bloques.length) {
        mensaje('No hay texto que leer en esta página.');
        return;
      }
      bi = 0;
    } else {
      bi = Math.max(0, Math.min(bloques.length - 1, bi + delta));
    }
    ci = 0;
    estado = 'playing';
    pintarBoton();
    reiniciarTrozo();
  }

  /* ---------- Abrir / cerrar ---------- */
  function abrir() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    raiz.classList.add('lector--abierto');
    btnPlay.focus();
  }
  function cerrar() {
    if (estado !== 'idle') detener();
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    raiz.classList.remove('lector--abierto');
    toggle.focus();
  }

  /* ---------- Eventos ---------- */
  toggle.addEventListener('click', function () {
    if (panel.hidden) abrir();
    else cerrar();
  });

  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acc]');
    if (!b) return;
    switch (b.getAttribute('data-acc')) {
      case 'play':
        if (estado === 'idle') empezar();
        else if (estado === 'playing') pausar();
        else continuar();
        break;
      case 'stop':
        detener();
        break;
      case 'ant':
        saltar(-1);
        break;
      case 'sig':
        saltar(1);
        break;
      case 'cerrar':
        cerrar();
        break;
    }
  });

  selVel.addEventListener('change', function () {
    vel = parseFloat(selVel.value) || 1;
    prefs.vel = String(vel);
    guardarPrefs();
    if (estado === 'playing') reiniciarTrozo();
  });
  selVoz.addEventListener('change', function () {
    voz = voces[parseInt(selVoz.value, 10)] || null;
    prefs.voz = voz ? voz.voiceURI : '';
    guardarPrefs();
    if (estado === 'playing') reiniciarTrozo();
  });

  raiz.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) {
      e.preventDefault();
      cerrar();
    }
  });

  window.addEventListener('pagehide', function () {
    synth.cancel();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && estado === 'playing') pausar();
  });

  /* ---------- Enlace de salto: "Abrir lector de voz" (primer tabulador útil) ---------- */
  var salto = document.createElement('a');
  salto.className = 'lector-salto';
  salto.href = '#lector-panel';
  salto.textContent = 'Abrir lector de voz';
  salto.addEventListener('click', function (e) {
    e.preventDefault();
    abrir();
  });

  function colocarSalto(intentos) {
    var skip = document.querySelector('.skip-link');
    if (skip && skip.parentNode) {
      skip.parentNode.insertBefore(salto, skip.nextSibling);
    } else if (intentos > 0) {
      setTimeout(function () {
        colocarSalto(intentos - 1);
      }, 150);
    } else {
      document.body.insertBefore(salto, document.body.firstChild);
    }
  }
  colocarSalto(30);

  pintarBoton();
})();
