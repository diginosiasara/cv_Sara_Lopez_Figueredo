(function () {
  'use strict';
  var f = document.getElementById('ct-form'); if (!f) return;
  var st = document.getElementById('ct-status'), btn = f.querySelector('button[type="submit"]');
  var MAIL = 'Nosia_sl@hotmail.com';
  function msg(t, ok) { st.textContent = t; st.className = 'ct-status' + (ok === true ? ' ok' : ok === false ? ' err' : ''); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (f.elements['_honey'].value) return;
    btn.disabled = true; msg('Enviando mensaje…');
    fetch('https://formsubmit.co/ajax/nosia_sl@hotmail.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(f) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && String(res.j.success) === 'true') { f.reset(); msg('Mensaje enviado. Gracias, te responderé lo antes posible.', true); }
        else throw new Error('envio');
      })
      .catch(function () { msg('No se ha podido enviar el mensaje. Puedes escribirme directamente a ' + MAIL + '.', false); })
      .then(function () { btn.disabled = false; });
  });
})();
