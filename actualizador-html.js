/* =====================================================================
   ACTUALIZADOR DE VERSIÓN (páginas HTML sin React) — PRIS
   ---------------------------------------------------------------------
   Va en la RAÍZ del repo, al lado de index.html. El index.html ya lo
   carga con:  <script src="/actualizador-html.js"></script>

   - Al abrir, toma una "foto" del index.html y de los .js propios.
   - Cada 5 minutos, y al volver a la pestaña, los vuelve a leer SIN caché.
     Si algo cambió, hay versión nueva:
       · PC sin uso 20+ min o pestaña oculta 10+ min → recarga sola;
       · si la persona está trabajando → barra abajo "Actualizar ahora".
   - No toca datos ni la base: solo lee la página publicada.
   ===================================================================== */
(function () {
  if (typeof window === "undefined" || window.__actualizadorHtmlPRIS) return;
  window.__actualizadorHtmlPRIS = true;

  var CADA_MS = 5 * 60 * 1000;
  var INACTIVO_MS = 20 * 60 * 1000;
  var OCULTO_MS = 10 * 60 * 1000;

  function hash(t) {
    var h = 5381;
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
    return h + ":" + t.length;
  }

  // Archivos a vigilar: la página + los .js del mismo sitio (menos este archivo)
  var urls = [window.location.origin + window.location.pathname];
  Array.prototype.forEach.call(document.querySelectorAll("script[src]"), function (s) {
    try {
      var u = new URL(s.src, window.location.href);
      if (u.origin === window.location.origin && /\.js$/i.test(u.pathname) && !/actualizador-html\.js$/i.test(u.pathname)) {
        urls.push(u.origin + u.pathname);
      }
    } catch (e) { /* url rara: se ignora */ }
  });

  function leerTodo() {
    return Promise.all(urls.map(function (u) {
      return fetch(u + (u.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now(), { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
        .then(hash);
    })).then(function (hs) { return hs.join("|"); });
  }

  var foto = null;
  var ultimaActividad = Date.now();
  var ocultoDesde = null;
  var barraMostrada = false;
  var hayNueva = false;

  function mostrarBarra() {
    if (barraMostrada) return;
    barraMostrada = true;
    var barra = document.createElement("div");
    barra.setAttribute("style",
      "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#0e7490;color:#fff;" +
      "padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;" +
      "font-family:Arial,Helvetica,sans-serif;font-size:15px;box-shadow:0 -6px 20px rgba(0,0,0,.25)");
    var txt = document.createElement("span");
    txt.style.fontWeight = "700";
    txt.textContent = "\ud83d\udd04 Hay una versi\u00f3n nueva de esta aplicaci\u00f3n.";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Actualizar ahora";
    btn.setAttribute("style", "background:#fff;color:#0e7490;border:none;border-radius:8px;padding:8px 16px;font-weight:700;font-size:14px;cursor:pointer");
    btn.onclick = function () { window.location.reload(); };
    var luego = document.createElement("button");
    luego.type = "button";
    luego.textContent = "M\u00e1s tarde";
    luego.setAttribute("style", "background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6);border-radius:8px;padding:7px 12px;font-size:13px;cursor:pointer");
    luego.onclick = function () { barra.remove(); barraMostrada = false; };
    barra.appendChild(txt); barra.appendChild(btn); barra.appendChild(luego);
    document.body.appendChild(barra);
  }

  function decidir() {
    if (!hayNueva) return;
    var inactivo = Date.now() - ultimaActividad >= INACTIVO_MS;
    var estuvoOculto = ocultoDesde !== null && Date.now() - ocultoDesde >= OCULTO_MS;
    if (inactivo || estuvoOculto) { window.location.reload(); return; }
    mostrarBarra();
  }

  function revisar() {
    leerTodo().then(function (actual) {
      if (foto === null) { foto = actual; return; }
      if (actual !== foto) { hayNueva = true; decidir(); }
    }).catch(function () { /* sin red o deploy en curso: se reintenta en la próxima vuelta */ });
  }

  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, function () { ultimaActividad = Date.now(); }, { passive: true });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { ocultoDesde = Date.now(); return; }
    var oculto = ocultoDesde;
    revisarAlVolver(oculto);
  });
  function revisarAlVolver(oculto) {
    leerTodo().then(function (actual) {
      if (foto === null) { foto = actual; return; }
      if (actual !== foto) {
        hayNueva = true;
        if (oculto !== null && Date.now() - oculto >= OCULTO_MS) { window.location.reload(); return; }
        mostrarBarra();
      }
    }).catch(function () {}).then(function () { ocultoDesde = null; });
  }

  revisar();
  setInterval(revisar, CADA_MS);
})();
