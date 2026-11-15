/* Asistente DigiNOSIA: busca en el contenido de esta web (páginas, blog y catálogo de formación).
   No usa IA generativa, no envía las preguntas a ningún servidor y no guarda la conversación. */
(function () {
  'use strict';
  if (window.__diginosiaAsistente) return; window.__diginosiaAsistente = true;
  var me = document.currentScript, RAIZ = me ? new URL('../../', me.src).href : '';
  var idx = null, cargando = null;

  /* ---------- Búsqueda ---------- */
  var STOP = 'a al algo algun alguna algunos como con cual cuales cuando de del desde donde el ella ellas ello ellos en entre era es esta estan este esto estos fue ha han hay la las le les lo los me mi mis mas muy no nos nuestra nuestro o os para pero por que quien quienes se ser si sin sobre su sus te tiene tienen todo todos tu tus un una unas uno unos y ya yo dime quiero puedo puedes hablame cuentame sara'.split(' ');
  var stopSet = {}; STOP.forEach(function (w) { stopSet[w] = 1; });
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function stem(w) {
    if (w.length > 5) w = w.replace(/(amientos|imientos|amiento|imiento|aciones|ciones|acion|cion|idades|idad|mente|ables|able|ando|iendo|adas|ados|ada|ado|idas|idos|ida|ido)$/, '');
    if (w.length > 4) w = w.replace(/(es|s)$/, '');
    return w;
  }
  var GENERICAS = null;
  function tokens(t) { return norm(t).split(/[^a-z0-9ñ+#.]+/).map(function (x) { return x.replace(/^[.]+|[.]+$/g, ''); }).filter(function (w) { return w && (w.length > 1) && !stopSet[w]; }).map(stem); }

  GENERICAS = tokens('curso cursos formacion formaciones certificado certificados hora horas titulo titulos mastery');
  function preparar(I) {
    var df = {}, N = I.chunks.length;
    I.chunks.forEach(function (c) {
      var p = I.paginas[c[0]];
      c.tk = tokens(c[1]); c.tt = tokens(c[2] + ' ' + p.t); c.set = {};
      c.tk.forEach(function (w) { c.set[w] = (c.set[w] || 0) + 1; });
      Object.keys(c.set).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
      c.tt.forEach(function (w) { if (!c.set[w]) df[w] = (df[w] || 0) + 1; });
    });
    I.cursos.forEach(function (k) { k.tk = tokens(k.slice(0, 5).join(' ')); k.s = norm(k.slice(0, 5).join(' ')); });
    I.df = df; I.N = N; return I;
  }
  function idf(I, w) { return Math.log(1 + (I.N + 1) / ((I.df[w] || 0) + 0.5)); }

  function buscar(I, q) {
    var qt = tokens(q); if (!qt.length) return { paginas: [], cursos: [], qt: qt };
    var qn = norm(q).replace(/[^a-z0-9ñ+#. ]/g, ' ').replace(/\s+/g, ' ').trim();
    var puntos = [];
    I.chunks.forEach(function (c) {
      var s = 0, hit = 0;
      qt.forEach(function (w) {
        var tf = c.set[w] || 0, ti = c.tt.indexOf(w) > -1, wi = idf(I, w);
        if (tf) { s += wi * (1 + Math.log(tf)); hit++; }
        if (ti) { s += wi * 1.6; if (!tf) hit++; }
      });
      if (!hit) return;
      s *= 0.6 + 0.4 * (hit / qt.length);
      if (qt.length > 1 && norm(c[1]).indexOf(qn) > -1) s *= 1.5;
      puntos.push({ c: c, s: s });
    });
    puntos.sort(function (a, b) { return b.s - a.s; });
    var vistas = {}, pags = [];
    puntos.forEach(function (x) { var pi = x.c[0]; if (vistas[pi] || pags.length >= 4) return; vistas[pi] = 1; pags.push(x); });
    var cur = [], qc = qt.filter(function (w) { return GENERICAS.indexOf(w) < 0; }); // «curso», «formación»… no aparecen en los nombres
    if (qc.length) I.cursos.forEach(function (k) {
      var ok = qc.every(function (w) { return k.s.indexOf(w) > -1 || k.tk.indexOf(w) > -1; });
      if (ok) cur.push(k);
    });
    return { paginas: pags, cursos: cur, qt: qt, mejor: puntos.length ? puntos[0].s : 0 };
  }

  /* ---------- Interfaz ---------- */
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.textContent = h; return e; }
  function resaltar(texto, qt) {
    var frag = document.createDocumentFragment(), partes = texto.split(/(\s+)/);
    partes.forEach(function (p) {
      var t = tokens(p)[0];
      if (t && qt.indexOf(t) > -1) { var m = el('mark', '', p); frag.appendChild(m); } else frag.appendChild(document.createTextNode(p));
    });
    return frag;
  }
  function recorte(texto, qt) {
    var max = 220; if (texto.length <= max) return texto;
    var n = norm(texto), pos = -1; qt.some(function (w) { var i = n.indexOf(w); if (i > -1) { pos = i; return true; } });
    var ini = Math.max(0, (pos < 0 ? 0 : pos) - 60), s = texto.slice(ini, ini + max);
    return (ini > 0 ? '… ' : '') + s.replace(/\s+\S*$/, '') + ' …';
  }

  function construir() {
    var root = el('div'); root.id = 'asist-root';
    var fab = el('button', 'as-fab'); fab.type = 'button'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'asist-panel');
    fab.setAttribute('aria-label', 'Abrir el asistente de DigiNOSIA'); fab.title = 'Asistente de DigiNOSIA';
    var img = el('img'); img.src = RAIZ + 'assets/asistente/avatar.webp'; img.alt = ''; img.width = 58; img.height = 58; fab.appendChild(img);
    var panel = el('div', 'as-panel'); panel.id = 'asist-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'as-t');
    var head = el('div', 'as-head'), him = el('img'); him.src = img.src; him.alt = ''; him.width = 42; him.height = 42;
    var ht = el('div'); var tt = el('h2', 'as-title', 'Asistente DigiNOSIA'); tt.id = 'as-t'; ht.appendChild(tt); ht.appendChild(el('p', 'as-sub', 'Busca en esta web · no usa IA generativa'));
    var x = el('button', 'as-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Cerrar el asistente');
    head.appendChild(him); head.appendChild(ht); head.appendChild(x);
    var log = el('div', 'as-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite'); log.setAttribute('aria-relevant', 'additions');
    var chips = el('div', 'as-chips');
    var form = el('form', 'as-form'); form.setAttribute('role', 'search');
    var lab = el('label', '', 'Escribe tu pregunta'); lab.htmlFor = 'as-q'; lab.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
    var inp = el('input'); inp.id = 'as-q'; inp.type = 'search'; inp.placeholder = 'Pregunta sobre la web…'; inp.autocomplete = 'off'; inp.maxLength = 200;
    var send = el('button', 'as-send', 'Buscar'); send.type = 'submit';
    form.appendChild(lab); form.appendChild(inp); form.appendChild(send);
    var nota = el('p', 'as-note', 'Tus preguntas se quedan en tu navegador: no se envían ni se guardan.');
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form); panel.appendChild(nota);
    root.appendChild(fab); root.appendChild(panel); document.body.appendChild(root);

    function msg(clase) { var m = el('div', 'as-msg ' + (clase || '')); log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
    function texto(m, t) { var p = el('p', '', t); m.appendChild(p); return p; }
    function ayuda() { m = msg(); texto(m, 'Hola, soy el asistente de DigiNOSIA. Puedo buscar en las páginas de Sara, en su blog y en su catálogo de formación. Prueba con una pregunta o elige una:'); }
    var m;
    var SUG = ['¿Qué experiencia tiene Sara?', 'Cursos de Power BI', 'Artículos sobre teleasistencia', '¿Qué es Rutas del Alma?', '¿Cómo puedo contactar?'];
    SUG.forEach(function (s) { var b = el('button', 'as-chip', s); b.type = 'button'; b.addEventListener('click', function () { preguntar(s); }); chips.appendChild(b); });

    function cargar() {
      if (idx) return Promise.resolve(idx);
      if (cargando) return cargando;
      cargando = new Promise(function (ok, ko) {
        if (window.ASISTENTE_INDICE) return ok(preparar(window.ASISTENTE_INDICE));
        var s = document.createElement('script'); s.src = RAIZ + 'assets/asistente/indice.js';
        s.onload = function () { window.ASISTENTE_INDICE ? ok(preparar(window.ASISTENTE_INDICE)) : ko(); }; s.onerror = ko; document.head.appendChild(s);
      }).then(function (I) { idx = I; return I; }, function (e) { cargando = null; throw e; });
      return cargando;
    }

    function tarjeta(url, titulo, tag, fragmento, qt) {
      var a = el('a', 'as-res'); a.href = url;
      a.addEventListener('click', function () { // si el destino está en la página actual, se cierra el panel para ver el resultado
        var norm1 = function (u) { return u.split('#')[0].replace(/index\.html$/, ''); };
        if (norm1(a.href) === norm1(location.href)) setTimeout(function () { abrir(false); }, 0);
      });
      var b = el('b', '', titulo); if (tag) b.appendChild(el('span', 'as-tag', tag));
      a.appendChild(b); var t = el('span', 't'); t.appendChild(qt ? resaltar(fragmento, qt) : document.createTextNode(fragmento)); a.appendChild(t); return a;
    }

    function responder(q) {
      var n = norm(q);
      if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|ey)\b/.test(n) && n.length < 25) { var g = msg(); texto(g, '¡Hola! ¿Qué te gustaría saber sobre Sara, su formación, sus proyectos o su blog?'); return; }
      if (/\b(contact|escrib|correo|email|mail|hablemos)/.test(n)) {
        var c = msg(); texto(c, 'Puedes escribir a Sara desde la sección «Hablemos» de la portada.'); c.appendChild(tarjeta(RAIZ + 'index.html#contactar', 'Hablemos · formulario de contacto', 'Portada', 'Elige el motivo (trabajo, ver CVs, colaboración) y envía tu mensaje.', null)); return;
      }
      return cargar().then(function (I) {
        var r = buscar(I, q), m = msg();
        var curs = r.cursos.length >= 1;
        if (!r.paginas.length && !r.cursos.length) { texto(m, 'No he encontrado nada sobre eso en la web. Prueba con otras palabras (por ejemplo «CIE-10», «teleasistencia», «docencia», «Power BI»).'); return; }
        if (curs && r.cursos.length) {
          texto(m, 'He encontrado ' + r.cursos.length + (r.cursos.length === 1 ? ' curso' : ' cursos') + ' en el catálogo de formación' + (r.cursos.length > 5 ? ' (te muestro 5):' : ':'));
          r.cursos.slice(0, 5).forEach(function (k) { m.appendChild(tarjeta(RAIZ + 'index.html#catalogo', k[0], k[3] || '', k[1] + ' · ' + k[2] + ' · ' + k[4], null)); });
          m.appendChild(tarjeta(RAIZ + 'index.html#catalogo', 'Abrir el catálogo completo', '', 'Todos los cursos agrupados por temática, con buscador y filtro por año.', null));
          if (!r.paginas.length) return; texto(m, 'Y esto es lo más relacionado en las páginas:');
        } else texto(m, 'Esto es lo que he encontrado en la web:');
        r.paginas.slice(0, 3).forEach(function (x) {
          var p = I.paginas[x.c[0]], url = RAIZ + p.u + (x.c[3] && p.k !== 'Blog' ? '#' + x.c[3] : '');
          m.appendChild(tarjeta(url, p.t, p.k, recorte(x.c[1], r.qt), r.qt));
        });
      }).catch(function () { var m2 = msg(); texto(m2, 'No he podido cargar el índice de búsqueda. Recarga la página e inténtalo de nuevo.'); });
    }
    function preguntar(q) {
      q = q.trim(); if (!q) return;
      var u = msg('u'); u.textContent = q; chips.hidden = true; inp.value = '';
      Promise.resolve(responder(q)).then(function () { log.scrollTop = log.scrollHeight; });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); preguntar(inp.value); });
    function abrir(o) {
      panel.hidden = !o; fab.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) { if (!log.childNodes.length) ayuda(); cargar().catch(function () {}); inp.focus(); } else fab.focus();
    }
    fab.addEventListener('click', function () { abrir(panel.hidden); });
    x.addEventListener('click', function () { abrir(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden && panel.contains(document.activeElement)) { e.stopPropagation(); abrir(false); } });
    window.__asistente = { buscar: function (q) { return cargar().then(function (I) { return buscar(I, q); }); } };
  }
  if (document.body) construir(); else document.addEventListener('DOMContentLoaded', construir);
})();
