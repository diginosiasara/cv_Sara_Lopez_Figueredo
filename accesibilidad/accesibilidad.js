/* DigiNOSIA Accesible: tamaño de texto, contraste, fuente legible, espaciado, guía de lectura, enlaces y movimiento.
   Las preferencias se guardan en este navegador (localStorage) y no se envían a ningún sitio. */
(function () {
  'use strict';
  if (window.__diginosiaA11y) return; window.__diginosiaA11y = true;
  var KEY = 'diginosia-a11y', ZOOMS = [100, 115, 130, 150, 175];
  var doc = document.documentElement;
  var defaults = { z: 100, hc: 0, font: 0, spacing: 0, links: 0, motion: 0, guide: 0 };
  var store = {
    get: function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } },
    del: function () { try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ } }
  };
  var mq = function (q) { return window.matchMedia && matchMedia(q).matches; };

  function load() {
    var s = Object.assign({}, defaults), raw = store.get(), saved = null;
    try { saved = JSON.parse(raw); } catch (e) { saved = null; }
    if (saved && typeof saved === 'object') {
      Object.keys(defaults).forEach(function (k) { if (typeof saved[k] === 'number') s[k] = saved[k]; });
      if (ZOOMS.indexOf(s.z) < 0) s.z = 100;
    } else {
      // primera visita: respetar preferencias del sistema (sin guardarlas)
      if (mq('(prefers-reduced-motion: reduce)')) s.motion = 1;
      if (mq('(prefers-contrast: more)')) s.hc = 1;
    }
    return s;
  }
  var state = load();
  function save() { store.set(JSON.stringify(state)); }

  var guideEl = null;
  function apply() {
    doc.classList.toggle('a11y-hc', !!state.hc);
    doc.classList.toggle('a11y-font', !!state.font);
    doc.classList.toggle('a11y-spacing', !!state.spacing);
    doc.classList.toggle('a11y-links', !!state.links);
    doc.classList.toggle('a11y-rm', !!state.motion);
    doc.classList.toggle('a11y-guide-on', !!state.guide);
    var z = state.z / 100, pz = Math.min(z, 1.3); // el panel crece como máximo hasta el 130 % para no desbordar la pantalla
    if (state.z === 100) doc.style.removeProperty('zoom'); else doc.style.zoom = String(z);
    doc.style.setProperty('--a11y-pz', String(pz)); doc.style.setProperty('--a11y-rz', String(pz / z));
  }
  apply();

  function build() {
    var root = document.createElement('div'); root.id = 'a11y-root';
    var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'a11y-fab';
    fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'a11y-panel');
    fab.setAttribute('aria-label', 'Opciones de accesibilidad'); fab.title = 'Opciones de accesibilidad';
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4.5" r="2"/><path d="M4 8.5l8 1.5 8-1.5"/><path d="M12 10v4.5"/><path d="M8.5 21l3.5-6.5 3.5 6.5"/></svg>';
    var panel = document.createElement('div'); panel.id = 'a11y-panel'; panel.className = 'a11y-panel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'a11y-t');
    var hasReader = !!document.querySelector('.lector, [data-lector]');
    panel.innerHTML =
      '<div class="a11y-head"><h2 class="a11y-title" id="a11y-t">Accesibilidad</h2><button type="button" class="a11y-x" data-a11y="close" aria-label="Cerrar el panel de accesibilidad">×</button></div>' +
      '<p class="a11y-sub">Adapta la lectura a lo que te resulte más cómodo. Los cambios se aplican al momento.</p>' +
      '<div class="a11y-row"><span id="a11y-lz">Tamaño del texto</span><span class="a11y-size" role="group" aria-labelledby="a11y-lz"><button type="button" class="a11y-btn" data-a11y="z-" aria-label="Reducir tamaño del texto">A−</button><output data-a11y="zv" aria-live="polite"></output><button type="button" class="a11y-btn" data-a11y="z+" aria-label="Aumentar tamaño del texto">A+</button></span></div>' +
      sw('hc', 'Alto contraste', 'Negro, blanco y amarillo') +
      sw('font', 'Fuente legible', 'Atkinson Hyperlegible, pensada para dislexia y baja visión') +
      sw('spacing', 'Espaciado de texto', 'Más interlineado y separación entre letras y palabras') +
      sw('guide', 'Guía de lectura', 'Franja que sigue al ratón o al foco del teclado') +
      sw('links', 'Resaltar enlaces', 'Subrayado grueso y negrita') +
      sw('motion', 'Reducir movimiento', 'Sin animaciones ni transiciones') +
      '<div class="a11y-foot"><button type="button" class="a11y-btn" data-a11y="reset">Restablecer todo</button><button type="button" class="a11y-btn" data-a11y="close">Cerrar</button></div>' +
      '<p class="a11y-status" role="status" aria-live="polite" data-a11y="status"></p>' +
      '<p class="a11y-note">Tus preferencias se guardan solo en este navegador.' + (hasReader ? ' Para escuchar la página, usa el botón «Escuchar».' : '') + '</p>';
    function sw(k, label, help) { return '<div class="a11y-row"><span id="a11y-l-' + k + '">' + label + '<small>' + help + '</small></span><button type="button" class="a11y-sw" role="switch" data-a11y-sw="' + k + '" aria-labelledby="a11y-l-' + k + '" aria-checked="false">No</button></div>'; }
    root.appendChild(fab); root.appendChild(panel); document.body.appendChild(root);
    guideEl = document.createElement('div'); guideEl.className = 'a11y-guide'; guideEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(guideEl);

    var status = panel.querySelector('[data-a11y="status"]'), zv = panel.querySelector('[data-a11y="zv"]');
    function say(t) { status.textContent = t; }
    function sync() {
      zv.textContent = state.z + ' %';
      [].forEach.call(panel.querySelectorAll('[data-a11y-sw]'), function (b) {
        var on = !!state[b.getAttribute('data-a11y-sw')]; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.textContent = on ? 'Sí' : 'No';
      });
    }
    function open(o) {
      panel.hidden = !o; fab.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) { sync(); var f = panel.querySelector('button'); if (f) f.focus(); } else fab.focus();
    }
    fab.addEventListener('click', function () { open(panel.hidden); });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a11y'), k = b.getAttribute('data-a11y-sw');
      if (a === 'close') return open(false);
      if (a === 'z+' || a === 'z-') {
        var i = ZOOMS.indexOf(state.z) + (a === 'z+' ? 1 : -1); i = Math.max(0, Math.min(ZOOMS.length - 1, i));
        state.z = ZOOMS[i]; say('Tamaño del texto al ' + state.z + ' %');
      } else if (a === 'reset') {
        state = Object.assign({}, defaults); store.del(); apply(); sync(); return say('Preferencias restablecidas.');
      } else if (k) {
        state[k] = state[k] ? 0 : 1; say(b.parentNode.querySelector('span').firstChild.textContent + (state[k] ? ': activado' : ': desactivado'));
      } else return;
      apply(); save(); sync();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); open(false); }
    });
    // guía de lectura
    function moveGuide(y) { guideEl.style.top = Math.max(0, y - guideEl.offsetHeight / 2) + 'px'; }
    document.addEventListener('mousemove', function (e) { if (state.guide) moveGuide(e.clientY); }, { passive: true });
    document.addEventListener('focusin', function (e) {
      if (!state.guide || root.contains(e.target)) return;
      var r = e.target.getBoundingClientRect(); moveGuide(r.top + r.height / 2);
    });
    sync();
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
