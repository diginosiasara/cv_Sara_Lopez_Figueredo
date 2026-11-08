/* Google Analytics 4 con Consent Mode v2: por defecto todo denegado hasta que la persona acepta. */
(function () {
  'use strict';
  var ID = 'G-10T6SVEZJX', KEY = 'cv-analytics-consent';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: saved === 'granted' ? 'granted' : 'denied', wait_for_update: 500 });
  gtag('js', new Date());
  gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });

  var banner = null;
  function announce(t) { var s = document.getElementById('estado'); if (s) { s.textContent = t; setTimeout(function () { s.textContent = ''; }, 3000); } }
  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ }
    gtag('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
    if (banner) { banner.remove(); banner = null; }
    announce(v === 'granted' ? 'Analítica aceptada' : 'Analítica rechazada');
  }
  function show(focus) {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'cc'; banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Preferencias de analítica');
    var p = document.createElement('p');
    p.textContent = 'Esta web usa Google Analytics para medir las visitas de forma agregada. Solo se activa si lo aceptas y puedes cambiar tu decisión cuando quieras. ';
    var a = document.createElement('a'); a.href = (document.getElementById('ct-priv') ? '' : 'index.html') + '#ct-priv'; a.textContent = 'Más información'; p.appendChild(a);
    var box = document.createElement('div'); box.className = 'cc-b';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ok'; ok.textContent = 'Aceptar analítica';
    var no = document.createElement('button'); no.type = 'button'; no.textContent = 'Rechazar';
    ok.addEventListener('click', function () { choose('granted'); }); no.addEventListener('click', function () { choose('denied'); });
    box.appendChild(ok); box.appendChild(no); banner.appendChild(p); banner.appendChild(box); document.body.appendChild(banner);
    if (focus) ok.focus();
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (saved !== 'granted' && saved !== 'denied') show(false);
    [].forEach.call(document.querySelectorAll('[data-consent-open]'), function (b) { b.addEventListener('click', function () { show(true); }); });
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', ev = null, par = {};
    if (/^mailto:/i.test(h)) ev = 'contact_email_click';
    else if (/linkedin\.com/i.test(h)) ev = 'linkedin_click';
    else if (/\.(pdf|docx)(\?|$)/i.test(h)) { ev = 'cv_download'; par.file_name = h.split('/').pop(); }
    else if (/codisalud|simulacoodificacion/i.test(h)) { ev = 'project_click'; par.project = 'CodiSalud'; }
    if (ev) gtag('event', ev, par);
  });
  document.addEventListener('cv:contact-sent', function () { gtag('event', 'contact_form_sent'); });
})();
