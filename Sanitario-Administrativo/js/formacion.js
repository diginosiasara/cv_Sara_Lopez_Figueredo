(function () {
  'use strict';
  var qi = document.getElementById('fc-q'); if (!qi) return;
  var cnt = document.getElementById('fc-cnt');
  var nz = function (t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  var grps = [].slice.call(document.querySelectorAll('.fc-grp'));
  qi.addEventListener('input', function () {
    var q = nz(qi.value.trim()), tot = 0;
    grps.forEach(function (g) {
      var n = 0;
      g.querySelectorAll('li').forEach(function (li) { var m = !q || li.dataset.s.indexOf(q) > -1; li.hidden = !m; if (m) n++; });
      g.hidden = !!q && n === 0; g.open = !!q && n > 0; tot += n;
    });
    cnt.textContent = q ? tot + (tot === 1 ? ' curso' : ' cursos') : '';
  });
})();
