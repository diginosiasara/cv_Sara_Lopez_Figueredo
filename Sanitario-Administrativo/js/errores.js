(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var st = $('err-status'), C = 327;
  function say(t) { if (st) st.textContent = t; }
  var p = $('err-path'); if (p) p.textContent = ((location.pathname || '/') + (location.search || '')).slice(0, 160);
  var tm = $('err-time'); if (tm) tm.textContent = new Date().toLocaleString('es-ES');
  var r = $('err-reload'); if (r) r.addEventListener('click', function () { location.reload(); });
  var c = $('err-copy'), u = $('err-url');
  if (c && u) c.addEventListener('click', function () {
    var t = u.textContent.trim();
    var done = function () { say('Dirección copiada al portapapeles'); };
    var fb = function () { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) { /* sin portapapeles */ } a.remove(); done(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fb); else fb();
  });
  /* Cuenta atrás: no se anuncia cada segundo; solo al terminar o al cancelar */
  function run(box, secs, done) {
    var left = secs, num = box.querySelector('.err-num'), fg = box.querySelector('.fg'), msg = $(box.getAttribute('data-msg')), t;
    function paint() { num.textContent = left; if (fg) fg.style.strokeDashoffset = String(C * (1 - left / secs)); if (msg) msg.textContent = left; }
    paint();
    t = setInterval(function () { left--; paint(); if (left <= 0) { clearInterval(t); done(); } }, 1000);
    return { stop: function () { clearInterval(t); }, left: function () { return left; } };
  }
  var rt = $('err-retry'), auto = document.querySelector('.err-count[data-auto]');
  if (rt && auto) {
    var job = run(auto, parseInt(auto.getAttribute('data-seconds'), 10) || 30, function () { rt.setAttribute('aria-disabled', 'false'); say('Ya puedes reintentar.'); });
    rt.addEventListener('click', function () {
      if (rt.getAttribute('aria-disabled') === 'true') { say('Aún faltan ' + job.left() + ' segundos.'); return; }
      location.reload();
    });
  }
  var go = $('err-start'), box = $('err-redirect'), cancel = $('err-cancel');
  if (go && box) {
    var rj = null;
    go.addEventListener('click', function () {
      box.hidden = false; cancel.hidden = false; go.hidden = true;
      rj = run(box.querySelector('.err-count'), 10, function () { location.href = 'index.html'; });
      say('Redirección automática en 10 segundos. Pulsa Cancelar para quedarte en esta página.');
      cancel.focus();
    });
    cancel.addEventListener('click', function () {
      if (rj) rj.stop(); box.hidden = true; cancel.hidden = true; go.hidden = false; say('Redirección cancelada.'); go.focus();
    });
  }
})();
