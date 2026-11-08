(function () {
  'use strict';
  var qi = document.getElementById('fc-q'); if (!qi) return;
  var cnt = document.getElementById('fc-cnt'), ys = document.getElementById('fc-year'), rs = document.getElementById('fc-reset');
  var nz = function (t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  var grps = [].slice.call(document.querySelectorAll('.fc-grp'));
  function apply() {
    var q = nz(qi.value.trim()), y = ys.value, f = !!q || !!y, tot = 0;
    grps.forEach(function (g) {
      var n = 0;
      g.querySelectorAll('li').forEach(function (li) {
        var cy = li.querySelector('.fc-cy').textContent.trim();
        var m = (!q || li.dataset.s.indexOf(q) > -1) && (!y || (y === 'sd' ? cy === '' : cy === y));
        li.hidden = !m; if (m) n++;
      });
      g.hidden = f && n === 0; g.open = f && n > 0; tot += n;
    });
    cnt.textContent = f ? (tot ? tot + (tot === 1 ? ' curso' : ' cursos') : 'Sin resultados') : '';
    rs.hidden = !f;
  }
  qi.addEventListener('input', apply); ys.addEventListener('change', apply);
  rs.addEventListener('click', function () { qi.value = ''; ys.value = ''; apply(); qi.focus(); });
  apply();
})();
