/* Compartir, «me gusta» y reacciones +1 / −1 (una por persona y artículo). */
(function () {
  'use strict';
  var root = document.querySelector('[data-bi]');
  if (!root) return;
  var cfg = window.BLOG_INTERACCIONES || {};
  var DB = String(cfg.databaseURL || '').replace(/\/+$/, '');
  var slug = root.getAttribute('data-slug') || '';
  var slugOk = /^[a-z0-9-]{3,120}$/.test(slug);
  var remote = !!(DB && /^https:\/\//.test(DB) && slugOk);
  var canonical = (document.querySelector('link[rel="canonical"]') || {}).href || location.href.split('#')[0];
  var title = (document.querySelector('h1') || {}).textContent || document.title;
  title = title.replace(/\s+/g, ' ').trim();

  var $ = function (s) { return root.querySelector(s); };
  var likeBtn = $('[data-bi-like]');
  var voteBtns = root.querySelectorAll('[data-bi-vote]');
  var statusEl = $('.bi__status');
  var privEl = $('.bi__priv');

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  function uid() {
    var id = store.get('bi-uid');
    if (id && /^[a-z0-9]{16,32}$/.test(id)) return id;
    var a = new Uint8Array(10);
    (window.crypto || window.msCrypto).getRandomValues(a);
    id = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    store.set('bi-uid', id);
    return id;
  }
  function loadState() {
    try { var s = JSON.parse(store.get('bi:' + slug)); if (s && (s.l === 1 || s.l === 0) && [-1, 0, 1].indexOf(s.v) > -1) return s; } catch (e) { /* ignorar */ }
    return { l: 0, v: 0 };
  }
  var state = loadState();
  var data = null; // recuentos remotos: { uid: {l, v} }

  function say(msg) { if (statusEl) statusEl.textContent = msg || ''; }

  function counts() {
    var c = { l: 0, up: 0, down: 0 }, d = {}, k;
    if (data) for (k in data) if (Object.prototype.hasOwnProperty.call(data, k)) d[k] = data[k];
    if (remote && (state.l || state.v)) d[uid()] = state; else if (remote && store.get('bi-uid')) delete d[store.get('bi-uid')];
    Object.keys(d).forEach(function (u) {
      var x = d[u]; if (!x) return;
      if (x.l === 1) c.l++;
      if (x.v === 1) c.up++;
      if (x.v === -1) c.down++;
    });
    return c;
  }
  function setN(btn, n, show) {
    var el = btn.querySelector('.bi__n');
    if (!el) return;
    el.hidden = !show; if (show) el.textContent = String(n);
  }
  function render() {
    var show = remote && data !== null, c = show ? counts() : null;
    likeBtn.setAttribute('aria-pressed', state.l ? 'true' : 'false');
    likeBtn.querySelector('.bi__txt').textContent = state.l ? 'Te gusta' : 'Me gusta';
    setN(likeBtn, c && c.l, show);
    Array.prototype.forEach.call(voteBtns, function (b) {
      var v = parseInt(b.getAttribute('data-bi-vote'), 10);
      b.setAttribute('aria-pressed', state.v === v ? 'true' : 'false');
      setN(b, c && (v === 1 ? c.up : c.down), show);
    });
  }

  function req(method, body) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, 8000);
    return fetch(DB + '/r/' + slug + (method === 'GET' ? '' : '/' + uid()) + '.json', {
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body,
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error('http ' + r.status); return r.json(); },
            function (e) { if (t) clearTimeout(t); throw e; });
  }
  function persist() {
    store.set('bi:' + slug, JSON.stringify(state));
    if (!remote) return Promise.resolve();
    return (state.l === 0 && state.v === 0) ? req('DELETE') : req('PUT', JSON.stringify({ l: state.l, v: state.v }));
  }
  function change(next, okMsg) {
    var prev = state;
    state = next; render();
    var all = [likeBtn].concat(Array.prototype.slice.call(voteBtns));
    all.forEach(function (b) { b.disabled = true; });
    persist().then(function () { say(okMsg); }, function () {
      state = prev; store.set('bi:' + slug, JSON.stringify(prev)); render();
      say('No se ha podido guardar tu reacción. Inténtalo de nuevo en unos minutos.');
    }).then(function () { all.forEach(function (b) { b.disabled = false; }); });
  }

  likeBtn.addEventListener('click', function () {
    var on = state.l ? 0 : 1;
    change({ l: on, v: state.v }, on ? 'Gracias, te ha gustado este artículo.' : 'Has quitado tu «me gusta».');
  });
  Array.prototype.forEach.call(voteBtns, function (b) {
    b.addEventListener('click', function () {
      var v = parseInt(b.getAttribute('data-bi-vote'), 10), nv = state.v === v ? 0 : v;
      change({ l: state.l, v: nv }, nv === 1 ? 'Has valorado a favor (+1).' : nv === -1 ? 'Has valorado en contra (−1).' : 'Has retirado tu valoración.');
    });
  });

  // Copiar enlace y compartir nativo
  var copyBtn = $('[data-bi-copy]');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    function ok() { say('Enlace copiado al portapapeles.'); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = canonical; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : say('No se ha podido copiar. Copia la dirección desde la barra del navegador.'); } catch (e) { say('No se ha podido copiar el enlace.'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(canonical).then(ok, fallback); else fallback();
  });
  var nativeSlot = $('[data-bi-native]');
  if (nativeSlot && navigator.share) {
    nativeSlot.hidden = false;
    nativeSlot.querySelector('button').addEventListener('click', function () {
      navigator.share({ title: title, url: canonical }).catch(function () { /* cancelado */ });
    });
  }

  render();
  if (remote) {
    if (privEl) privEl.hidden = false;
    var load = function () {
      req('GET').then(function (d) { data = d && typeof d === 'object' ? d : {}; var id = store.get('bi-uid'); if (id && data[id]) { state = { l: data[id].l === 1 ? 1 : 0, v: [-1, 1].indexOf(data[id].v) > -1 ? data[id].v : 0 }; store.set('bi:' + slug, JSON.stringify(state)); } render(); }, function () { /* recuentos no disponibles */ });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); } }, { rootMargin: '200px' });
      io.observe(root);
    } else load();
  }
})();
