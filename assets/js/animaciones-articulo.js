/* Alternativa para navegadores sin CSS scroll-driven animations: aparición al entrar en pantalla y barra de progreso.
   Donde hay soporte nativo (Chrome, Edge, Safari reciente) este script no hace nada. */
(function () {
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var sel = '.prose > h2, .prose > h3, .prose > p, .prose > ul, .prose > ol, .prose > blockquote, .prose > .prose__figure, .prose > .table-wrap,' +
    '.prose > .vz:not(.vz-cards):not(.vz-stats):not(.vz-duo):not(.vz-flow):not(.vz-chips):not(.vz-refs),' +
    '.vz-card, .vz-stat, .vz-panel, .vz-flow > li, .vz-chips > li, .vz-refs > li, .vz-vs__row';
  var els = document.querySelectorAll(sel);
  if (!els.length) return;
  document.documentElement.classList.add('rv-js');
  document.body.classList.add('rv-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el, i) {
    el.classList.add('rv');
    var k = el.parentElement && /vz-(cards|stats|duo|flow|chips|refs)/.test(el.parentElement.className) ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.transitionDelay = Math.min(k, 5) * 90 + 'ms';
    io.observe(el);
  });
  setTimeout(function () { els.forEach(function (el) { el.classList.add('is-in'); }); }, 8000);
  var ticking = false;
  function prog() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    document.body.style.setProperty('--sp', max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(prog); } }, { passive: true });
  prog();
})();
