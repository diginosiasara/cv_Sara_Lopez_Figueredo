/* Catálogo de formación desplegable en la portada: se abre bajo el botón, sin cambiar de página. */
(function () {
  'use strict';
  var DATA = 'assets/catalogo/catalogo-datos.js';
  var loaded = false, loading = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slot = function () { return document.getElementById('catalogo-formacion'); };
  var btn = function () { return document.getElementById('btn-catalogo'); };
  var norm = function (t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };

  function init(box) {
    var qi = box.querySelector('#cf-q'), ys = box.querySelector('#cf-year'), rs = box.querySelector('#cf-reset');
    var cnt = box.querySelector('#cf-cnt'), tg = box.querySelector('#cf-toggle');
    var grps = [].slice.call(box.querySelectorAll('.cf__grp'));
    function apply() {
      var q = norm(qi.value.trim()), y = ys.value, f = !!q || !!y, tot = 0;
      grps.forEach(function (g) {
        var n = 0;
        [].forEach.call(g.querySelectorAll('li'), function (li) {
          var cy = li.querySelector('.cf__cy').textContent.trim();
          var m = (!q || li.dataset.s.indexOf(q) > -1) && (!y || (y === 'sd' ? cy === '' : cy === y));
          li.hidden = !m; if (m) n++;
        });
        g.hidden = f && n === 0;
        if (f) g.open = n > 0;
        tot += n;
      });
      cnt.textContent = f ? (tot ? tot + (tot === 1 ? ' curso' : ' cursos') : 'Sin resultados') : '';
      rs.hidden = !f;
      syncToggle();
    }
    function visible() { return grps.filter(function (g) { return !g.hidden; }); }
    function syncToggle() {
      var v = visible(), all = v.length > 0 && v.every(function (g) { return g.open; });
      tg.setAttribute('aria-pressed', all ? 'true' : 'false');
      tg.textContent = all ? 'Cerrar todos los grupos' : 'Abrir todos los grupos';
    }
    qi.addEventListener('input', apply); ys.addEventListener('change', apply);
    rs.addEventListener('click', function () { qi.value = ''; ys.value = ''; apply(); qi.focus(); });
    tg.addEventListener('click', function () {
      var open = tg.getAttribute('aria-pressed') !== 'true';
      visible().forEach(function (g) { g.open = open; }); syncToggle();
    });
    grps.forEach(function (g) { g.addEventListener('toggle', syncToggle); });
    box.querySelector('[data-cf-close]').addEventListener('click', function () { setOpen(false, true); });
    syncToggle();
  }

  function load(s) {
    if (loaded || loading) return Promise.resolve();
    loading = true; s.setAttribute('aria-busy', 'true');
    s.innerHTML = '<p class="cf-loading" role="status">Cargando el catálogo de formación…</p>';
    return new Promise(function (resolve, reject) {
      if (window.CATALOGO_FORMACION_HTML) return resolve(window.CATALOGO_FORMACION_HTML);
      var sc = document.createElement('script'); sc.src = DATA;
      sc.onload = function () { window.CATALOGO_FORMACION_HTML ? resolve(window.CATALOGO_FORMACION_HTML) : reject(new Error('sin datos')); };
      sc.onerror = function () { reject(new Error('no se pudo cargar ' + DATA)); };
      document.head.appendChild(sc);
    }).then(function (t) { s.innerHTML = t; loaded = true; init(s); })
      .catch(function () {
        s.innerHTML = '<p class="cf-loading">No se ha podido cargar el catálogo. <a href="Sanitario-Administrativo/index.html#dashboard-tematico">Ábrelo en su página</a>.</p>';
      })
      .then(function () { loading = false; s.removeAttribute('aria-busy'); });
  }

  function setOpen(open, back) {
    var s = slot(), b = btn(); if (!s || !b) return;
    if (open) {
      s.hidden = false; b.setAttribute('aria-expanded', 'true');
      load(s).then(function () {
        s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        var h = s.querySelector('#cf-t'); if (h) h.focus({ preventScroll: true });
      });
    } else {
      s.hidden = true; b.setAttribute('aria-expanded', 'false');
      if (back) { b.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); b.focus({ preventScroll: true }); }
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#btn-catalogo');
    if (!b || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var s = slot(); if (!s) return;
    e.preventDefault(); setOpen(s.hidden);
  });

  // Enlace directo: /#catalogo
  function fromHash() {
    if (location.hash !== '#catalogo') return;
    var n = 0, t = setInterval(function () { n++; if (slot() && btn()) { clearInterval(t); setOpen(true); } else if (n > 40) clearInterval(t); }, 100);
  }
  fromHash(); window.addEventListener('hashchange', fromHash);
})();
