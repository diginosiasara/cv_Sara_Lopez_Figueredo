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

/* ---- Lector de voz (Web Speech API del navegador) ---- */
(function () {
  'use strict';
  var syn = window.speechSynthesis, box = document.getElementById('err-reader');
  if (!syn || !box || typeof SpeechSynthesisUtterance === 'undefined') return;
  box.hidden = false;
  var play = document.getElementById('rd-play'), stop = document.getElementById('rd-stop'), speed = document.getElementById('rd-speed'), say = document.getElementById('rd-status');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var blocks = [], idx = 0, state = 'idle', token = 0, voice = null, shown = null;
  function pick() { var v = syn.getVoices() || []; voice = v.filter(function (x) { return /^es[-_]ES/i.test(x.lang); })[0] || v.filter(function (x) { return /^es/i.test(x.lang); })[0] || null; }
  pick(); if (syn.onvoiceschanged !== undefined) syn.onvoiceschanged = pick;
  function announce(t) { if (say) say.textContent = t; }
  function clean(s) { return s.replace(/\s*\n+\s*/g, '. ').replace(/\s+/g, ' ').replace(/\s*·\s*/g, '. ').replace(/\.?\s*Ir\s*→\.?/g, '.').replace(/([?!])\./g, '$1').replace(/\.\s*\./g, '.').trim(); }
  function collect() {
    var out = [], sel = ['.err-eyebrow', 'h1', '.err-lead', '.err-tips li', '.err-sub', '.err-todo li', '.err-flow li', '.err-opts li', '.err-wait:not([hidden]) p'].map(function (s) { return '.err-main ' + s; }).join(',');
    [].forEach.call(document.querySelectorAll(sel), function (el) {
      var t = clean(el.classList.contains('err-eyebrow') ? el.textContent : (el.innerText || '')); if (t) out.push({ el: el, text: t });
    });
    var acts = [].map.call(document.querySelectorAll('.err-actions .err-btn:not([hidden])'), function (b) { return clean(b.innerText); }).filter(Boolean);
    if (acts.length) out.push({ el: document.querySelector('.err-actions'), text: 'Acciones disponibles: ' + acts.join(', ') + '.' });
    return out;
  }
  function mark(el) { if (shown) shown.classList.remove('err-reading'); shown = el; if (el) { el.classList.add('err-reading'); try { el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { /* sin scroll */ } } }
  function ui() {
    play.setAttribute('data-state', state === 'playing' ? 'playing' : state === 'paused' ? 'paused' : 'idle');
    play.textContent = state === 'playing' ? 'Pausar' : state === 'paused' ? 'Continuar' : 'Escuchar';
    stop.setAttribute('aria-disabled', state === 'idle' ? 'true' : 'false');
  }
  function speak() {
    if (idx >= blocks.length) { finish('Lectura terminada.'); return; }
    var my = ++token, b = blocks[idx], u = new SpeechSynthesisUtterance(b.text);
    u.lang = 'es-ES'; if (voice) u.voice = voice; u.rate = parseFloat(speed.value) || 1;
    u.onstart = function () { if (my === token) mark(b.el); };
    u.onend = function () { if (my === token && state === 'playing') { idx++; speak(); } };
    u.onerror = function () { /* cancelaciones propias: se controlan con el estado */ };
    syn.speak(u);
  }
  function finish(msg) { token++; syn.cancel(); state = 'idle'; idx = 0; mark(null); ui(); announce(msg); }
  play.addEventListener('click', function () {
    if (state === 'idle') { blocks = collect(); if (!blocks.length) return; idx = 0; state = 'playing'; ui(); announce('Lectura iniciada.'); syn.cancel(); speak(); }
    else if (state === 'playing') { token++; syn.cancel(); state = 'paused'; ui(); announce('Lectura en pausa.'); }
    else { state = 'playing'; ui(); announce('Lectura reanudada.'); speak(); }
  });
  stop.addEventListener('click', function () { if (state !== 'idle') finish('Lectura detenida.'); });
  speed.addEventListener('change', function () { if (state === 'playing') { token++; syn.cancel(); speak(); } });
  window.addEventListener('pagehide', function () { token++; syn.cancel(); });
})();
