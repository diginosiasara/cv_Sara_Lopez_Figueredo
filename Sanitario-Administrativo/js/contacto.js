(function () {
  'use strict';
  var f = document.getElementById('ct-form'); if (!f) return;
  var st = document.getElementById('ct-status'), btn = f.querySelector('button[type="submit"]');
  var MAIL = 'Nosia_sl@hotmail.com', busy = false;
  function msg(t, ok) { st.textContent = t; st.className = 'ct-status' + (ok === true ? ' ok' : ok === false ? ' err' : ''); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy || f.elements['_honey'].value) return;
    busy = true; btn.disabled = true; msg('Enviando mensaje…');
    var ctl = ('AbortController' in window) ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch('https://formsubmit.co/ajax/nosia_sl@hotmail.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(f), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && String(res.j.success) === 'true') { f.reset(); msg('Mensaje enviado. Gracias, te responderé lo antes posible.', true); document.dispatchEvent(new CustomEvent('cv:contact-sent')); }
        else throw new Error('envio');
      })
      .catch(function () { msg('No se ha podido enviar el mensaje. Puedes escribirme directamente a ' + MAIL + '.', false); })
      .then(function () { clearTimeout(to); busy = false; btn.disabled = false; });
  });
})();
