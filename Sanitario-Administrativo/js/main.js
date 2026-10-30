(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in-view'); });
  } else {
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); o.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { o.observe(e); });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
      history.pushState(null, '', a.getAttribute('href'));
    });
  });
  var links = [].slice.call(document.querySelectorAll('header nav a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) {
          if (l.getAttribute('href') === '#' + e.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (l) { var t = document.getElementById(l.getAttribute('href').slice(1)); if (t) so.observe(t); });
  }
  var pmode = 'resumen';
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { pmode = b.getAttribute('data-print') || 'resumen'; window.print(); }); });
  window.addEventListener('beforeprint', function () {
    var d = document.getElementById('pr-date'); if (d) d.textContent = 'Impreso el ' + new Date().toLocaleDateString('es-ES');
    document.documentElement.classList.add('print-' + pmode);
    if (pmode === 'completo') document.querySelectorAll('details').forEach(function (x) { x.setAttribute('data-was', x.open ? '1' : '0'); x.open = true; });
  });
  window.addEventListener('afterprint', function () {
    document.documentElement.classList.remove('print-resumen', 'print-completo');
    document.querySelectorAll('details[data-was]').forEach(function (x) { x.open = x.getAttribute('data-was') === '1'; x.removeAttribute('data-was'); });
    pmode = 'resumen';
  });
  var st = document.getElementById('estado');
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = 'Nosia_sl@hotmail.com';
      var done = function () { st.textContent = 'Correo copiado al portapapeles'; setTimeout(function () { st.textContent = ''; }, 3000); };
      if (navigator.clipboard) navigator.clipboard.writeText(m).then(done);
      else { var i = document.createElement('input'); i.value = m; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); done(); }
    });
  });
})();
