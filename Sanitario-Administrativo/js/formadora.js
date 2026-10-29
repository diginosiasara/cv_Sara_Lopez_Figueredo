(function () {
  'use strict';
  var s = document.getElementById('formadora'); if (!s) return;
  var nz = function (t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  var fams = [].slice.call(s.querySelectorAll('.fm-fam')), tabs = [].slice.call(s.querySelectorAll('.fm-tab'));
  var qi = s.querySelector('#fm-q'), cnt = s.querySelector('#fm-cnt'), tab = '*';
  function apply() {
    var q = nz(qi.value.trim()), tot = 0;
    fams.forEach(function (a) {
      var n = 0;
      a.querySelectorAll('.fm-row').forEach(function (r) { var m = !q || r.dataset.s.indexOf(q) > -1; r.hidden = !m; if (m) n++; });
      var show = (tab === '*' || a.dataset.k === tab) && (!q || n > 0);
      a.hidden = !show; if (show) tot += n;
      a.querySelector('details').open = !!q && n > 0;
    });
    cnt.textContent = q ? tot + (tot === 1 ? ' resultado' : ' resultados') : '';
  }
  qi.addEventListener('input', apply);
  tabs.forEach(function (b) { b.addEventListener('click', function () {
    tab = b.dataset.k;
    tabs.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    apply();
  }); });
})();
