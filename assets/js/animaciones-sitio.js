/* Alternativa para navegadores sin CSS scroll-driven animations: aparición al entrar en pantalla.
   Donde hay soporte nativo este script no hace nada. */
(function () {
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var SEL = 'main#contenido > section:not(#inicio) > *, .blog-archive .post-card';
  var done = false;
  function init() {
    var els = document.querySelectorAll(SEL);
    if (!els.length || done) return;
    done = true;
    document.documentElement.classList.add('rv-js');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add('is-in'); }); }, 8000);
  }
  // El contenido de la home se pinta con JS: reintentar un momento.
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  [300, 900, 2000].forEach(function (t) { setTimeout(init, t); });
})();
