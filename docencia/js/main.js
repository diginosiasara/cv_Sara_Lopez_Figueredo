/**
 * main.js — comportamiento de la landing (vanilla JS, sin dependencias).
 * Módulos: Fichas (filtro + búsqueda + ver más), Contacto (copiar / descargar),
 * Navegación (sección activa) y Volver arriba.
 * Mejora progresiva: sin JS todas las fichas permanecen visibles en el HTML.
 */
(function () {
  'use strict';

  var CFG = window.CV_CONFIG || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Minúsculas y sin tildes para búsquedas tolerantes ("informatica" == "Informática"). */
  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }
  function debounce(fn, ms) {
    var t;
    return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* ---------------------------------------------------------
     Fichas de asignatura
     --------------------------------------------------------- */
  function initFichas() {
    var list = $('#fichas-lista');
    if (!list) return;

    var items = $$('.ficha-item', list).map(function (li) {
      return { el: li, family: li.getAttribute('data-family') || '', text: normalize(li.textContent) };
    });
    var input = $('#fichas-buscar');
    var filterBtns = $$('.filter-btn');
    var moreBtn = $('#fichas-mas');
    var moreWrap = $('#fichas-mas-wrap');
    var emptyMsg = $('#fichas-vacio');
    var status = $('#fichas-estado');
    var LIMIT = CFG.fichasPorDefecto || 12;

    var state = { family: 'Todas', query: '', expanded: false };

    function render() {
      var q = normalize(state.query);
      var matches = items.filter(function (it) {
        var okFamily = state.family === 'Todas' || it.family === state.family;
        return okFamily && (!q || it.text.indexOf(q) !== -1);
      });
      var visible = state.expanded ? matches : matches.slice(0, LIMIT);
      var visibleSet = new Set(visible.map(function (m) { return m.el; }));

      items.forEach(function (it) { it.el.hidden = !visibleSet.has(it.el); });

      filterBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === state.family));
      });

      var canToggle = matches.length > LIMIT;
      moreWrap.hidden = !canToggle;
      if (canToggle) {
        moreBtn.setAttribute('aria-expanded', String(state.expanded));
        moreBtn.textContent = state.expanded
          ? 'Mostrar menos'
          : 'Ver las ' + (matches.length - LIMIT) + ' restantes • Mostrar todo (' + matches.length + ')';
      }
      emptyMsg.hidden = matches.length !== 0;
      status.textContent = matches.length === 0
        ? 'Sin resultados.'
        : 'Mostrando ' + visible.length + ' de ' + matches.length + ' • Total registro 28/01243: ' + items.length + ' acreditaciones';
    }

    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state.family = b.getAttribute('data-filter');
        state.expanded = false;
        render();
      });
    });
    input.addEventListener('input', debounce(function () {
      state.query = input.value;
      state.expanded = false;
      render();
    }, 120));
    // Evita enviar/recargar si algún navegador trata el buscador como formulario
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });

    moreBtn.addEventListener('click', function () {
      state.expanded = !state.expanded;
      render();
      if (!state.expanded) {
        var top = $('#fichas').getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });

    render();
  }

  /* ---------------------------------------------------------
     Contacto: copiar email y descargar CV en texto
     --------------------------------------------------------- */
  function initContacto() {
    var copyBtns = $$('[data-copy-email]');
    var dlBtn = $('#btn-descargar-cv');
    var outs = $$('.copy-status');
    var timer;

    function announce(msg) {
      outs.forEach(function (o) { o.textContent = msg; });
      clearTimeout(timer);
      timer = setTimeout(function () { outs.forEach(function (o) { o.textContent = ''; }); }, 3000);
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    copyBtns.forEach(function (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var email = CFG.email;
        var done = function (ok) { announce(ok ? 'Copiado: ' + email : 'No se pudo copiar. Email: ' + email); };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallbackCopy(email)); });
        } else {
          done(fallbackCopy(email));
        }
      });
    });

    if (dlBtn) {
      dlBtn.addEventListener('click', function () {
        var r = CFG.registro || {};
        var text = [
          'CV - Sara López Figueredo - Docente Acreditada Nº 28/01243',
          'Docencia Online | Formación Digital | Gestión del Conocimiento',
          'Madrid - ' + CFG.email,
          '',
          'PERFIL: Formadora online FPE, teleformación, IA aplicada, administración, marketing digital...',
          'ACREDITACIONES: 87 concedidas - Familias: ADG 29, IFC 26, IMS 15, ARG 13, COM 4',
          'REGISTRO ESTATAL FP: CSV ' + r.csv + ' - ' + r.fecha + ' - DNI ' + r.dni,
          'Fuente: Resoluciones Dirección General de Formación Comunidad de Madrid + Ministerio Educación FP + FUNDAE',
          '',
          'LinkedIn: ' + CFG.linkedin,
          'GitHub: ' + CFG.github
        ].join('\n');
        var url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = CFG.cvFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        announce('Descarga iniciada.');
      });
    }
  }

  /* ---------------------------------------------------------
     Navegación: marca la sección visible (aria-current) y botón "volver arriba"
     --------------------------------------------------------- */
  function initNavegacion() {
    var links = $$('.site-nav a');
    if (links.length && 'IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          var link = map[e.target.id];
          if (link) link.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }

    var toTop = $('#volver-arriba');
    if (toTop) {
      var ticking = false;
      var update = function () { toTop.hidden = window.pageYOffset < 700; ticking = false; };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }

    // Tras saltar a una sección por ancla, el foco sigue la navegación (teclado / lector de pantalla)
    window.addEventListener('hashchange', function () {
      var t = document.getElementById(location.hash.slice(1));
      if (t) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  }

  function init() { initFichas(); initContacto(); initNavegacion(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
