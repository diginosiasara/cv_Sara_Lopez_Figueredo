(function () {
  'use strict';
  var st = document.getElementById('estado');
  function textOf(el) {
    var lis = el.querySelectorAll('li');
    var t = lis.length ? [].map.call(lis, function (l) { return l.textContent.trim(); }).join(', ') : el.innerText.trim();
    return el.getAttribute('data-title') ? el.getAttribute('data-title') + ': ' + t : t;
  }
  function copy(text, done) {
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
    function fallback() { var a = document.createElement('textarea'); a.value = text; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); done(); }
  }
  [].forEach.call(document.querySelectorAll('[data-copy-target]'), function (b) {
    b.addEventListener('click', function () {
      var text = [].map.call(document.querySelectorAll(b.getAttribute('data-copy-target')), textOf).join('\n\n');
      var label = b.textContent;
      copy(text, function () {
        b.textContent = 'Copiado';
        if (st) { st.textContent = 'Copiado al portapapeles'; setTimeout(function () { st.textContent = ''; }, 2500); }
        setTimeout(function () { b.textContent = label; }, 1800);
      });
    });
  });
})();
