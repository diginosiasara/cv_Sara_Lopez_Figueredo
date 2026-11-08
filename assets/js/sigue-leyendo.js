/* «Sigue leyendo»: aparición escalonada al hacer scroll. Sin JS o con "reducir movimiento" todo se ve igual, sin animar. */
(function () {
  var sec = document.querySelector('.rel');
  if (!sec) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var items = Array.prototype.slice.call(sec.querySelectorAll('[data-reveal]'));
  if (!items.length) return;
  items.forEach(function (el) { el.style.setProperty('--i', el.getAttribute('data-reveal') || 0); });
  document.documentElement.classList.add('rel-anim');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
  // Red de seguridad: si algo falla, nunca se queda contenido oculto.
  setTimeout(function () { items.forEach(function (el) { el.classList.add('is-in'); }); }, 6000);
})();
