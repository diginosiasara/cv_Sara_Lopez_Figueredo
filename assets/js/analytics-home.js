/* Google Tag Manager con Consent Mode v2: no se contacta con Google hasta que la persona acepta.
   Comparte la clave de consentimiento con el CV sanitario (mismo origen), así la decisión es única. */
(function () {
  'use strict';
  var GTM = 'GTM-TKJF6CM8', KEY = 'cv-analytics-consent';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: saved === 'granted' ? 'granted' : 'denied', wait_for_update: 500 });
  var loaded = false, banner = null;
  function loadGtm() {
    if (loaded) return; loaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM;
    document.head.appendChild(s);
  }
  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ }
    gtag('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
    if (v === 'granted') loadGtm();
    if (banner) { banner.remove(); banner = null; }
  }
  function show(focus) {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'cc'; banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Preferencias de analítica');
    var p = document.createElement('p');
    p.textContent = 'Esta web usa Google Analytics (a través de Google Tag Manager) para medir las visitas de forma agregada. Solo se activa si lo aceptas y puedes cambiar tu decisión cuando quieras. ';
    var a = document.createElement('a'); a.href = 'Sanitario-Administrativo/index.html#ct-priv'; a.textContent = 'Más información'; p.appendChild(a);
    var box = document.createElement('div'); box.className = 'cc-b';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ok'; ok.textContent = 'Aceptar analítica';
    var no = document.createElement('button'); no.type = 'button'; no.textContent = 'Rechazar';
    ok.addEventListener('click', function () { choose('granted'); }); no.addEventListener('click', function () { choose('denied'); });
    box.appendChild(ok); box.appendChild(no); banner.appendChild(p); banner.appendChild(box); document.body.appendChild(banner);
    if (focus) ok.focus();
  }
  if (saved === 'granted') loadGtm();
  function init() { if (saved !== 'granted' && saved !== 'denied') show(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-consent-open]'); if (b) show(true);
  });
})();
