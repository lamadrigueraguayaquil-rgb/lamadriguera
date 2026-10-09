/* Aviso de La Madriguera para las páginas fijas (eventos, cafetería, catálogo…).
   Muestra el mismo aviso que se escribe en el panel: Configuración → Aviso en la web.
   Solo pide esos 4 campos; si algo falla, la página sigue igual, sin aviso. */
(function () {
  if (!window.fetch || !document.querySelector) return;
  var U = 'https://firestore.googleapis.com/v1/projects/adminpagweb/databases/(default)/documents/config/general' +
    '?key=AIzaSyCoPVaS_2Oej-zVLduWRDSY_-GMQ--Joy0' +
    '&mask.fieldPaths=avisoTexto&mask.fieldPaths=avisoDesde&mask.fieldPaths=avisoHasta&mask.fieldPaths=avisoTipo';
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function pintar(d) {
    var f = (d && d.fields) || {};
    function g(k) { return ((f[k] && f[k].stringValue) || '').replace(/^\s+|\s+$/g, ''); }
    var texto = g('avisoTexto'), desde = g('avisoDesde'), hasta = g('avisoHasta');
    var cierre = g('avisoTipo') !== 'novedad';
    var t = new Date(), hoy = t.getFullYear() + '-' + dos(t.getMonth() + 1) + '-' + dos(t.getDate());
    if (!texto || (desde && hoy < desde) || (hasta && hoy > hasta)) return;
    if (document.getElementById('lm-aviso')) return;
    var bar = document.createElement('div');
    bar.id = 'lm-aviso';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Aviso de La Madriguera');
    bar.style.cssText = 'background:' + (cierre ? '#8E2439' : '#D4B560') + ';color:' + (cierre ? '#FFF7EC' : '#34251A') +
      ';font-family:Outfit,system-ui,sans-serif;position:relative;z-index:60;';
    var w = document.createElement('div');
    w.style.cssText = 'max-width:1180px;margin:0 auto;padding:10px 48px 10px 16px;display:flex;align-items:center;justify-content:center;gap:10px 12px;flex-wrap:wrap;text-align:center;box-sizing:border-box;';
    var pill = document.createElement('span');
    pill.textContent = cierre ? 'Aviso' : 'Novedad';
    pill.style.cssText = 'display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;background:' + (cierre ? 'rgba(255,247,236,0.18)' : 'rgba(52,37,26,0.12)') + ';';
    var p = document.createElement('p');
    p.textContent = texto;
    p.style.cssText = 'margin:0;font-size:14.5px;line-height:1.45;font-weight:600;max-width:60em;color:inherit;';
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Cerrar aviso');
    x.textContent = '×';
    x.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:inherit;font-size:22px;line-height:1;padding:6px 10px;cursor:pointer;opacity:.85;';
    x.onclick = function () { bar.parentNode && bar.parentNode.removeChild(bar); };
    w.appendChild(pill); w.appendChild(p); bar.appendChild(w); bar.appendChild(x);
    document.body.insertBefore(bar, document.body.firstChild);
  }
  function ir() {
    fetch(U).then(function (r) { return r.ok ? r.json() : null; }).then(pintar)['catch'](function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ir); else ir();
})();
