/* =====================================================================
   ACTUALIZADOR DE VERSIÓN — para todas las web apps del PRIS (Vercel)
   ---------------------------------------------------------------------
   Problema que resuelve: la gente deja la pestaña abierta de un día para
   el otro y sigue usando la versión vieja hasta que aprieta F5.

   Cómo se usa (una sola vez por app):
     1. Subí este archivo a la carpeta src/ de la app (junto a main.jsx).
     2. En src/main.jsx agregá ARRIBA DE TODO esta línea:
            import "./actualizador.js";
   No hace falta tocar App.jsx. (En el Gestor de Expedientes NO lo agregues:
   ya lo tiene incorporado adentro del App.jsx.)

   Qué hace:
   - Cada 5 minutos, y cada vez que se vuelve a la pestaña, lee la página
     publicada en el servidor SIN caché y compara sus archivos .js con los
     que tiene cargados la pestaña. Si cambiaron, hay versión nueva.
   - Si la PC estuvo sin uso 20+ min o la pestaña oculta 10+ min
     (el caso "al otro día a la mañana") → recarga sola.
   - Si la persona está trabajando → muestra una barra abajo con
     "Actualizar ahora" (no le corta lo que está haciendo).
   - No toca la base de datos ni los datos: solo lee la página.
   ===================================================================== */
(function () {
  if (typeof window === "undefined" || window.__actualizadorPRIS) return;
  window.__actualizadorPRIS = true;

  // Archivos .js propios (del mismo sitio) que cargó esta pestaña
  function scriptsDe(urls) {
    var res = [];
    for (var i = 0; i < urls.length; i++) {
      try {
        var u = new URL(urls[i], window.location.href);
        if (u.origin === window.location.origin && /\.js$/i.test(u.pathname)) res.push(u.pathname);
      } catch (e) { /* url rara: se ignora */ }
    }
    return res;
  }
  var cargados = scriptsDe(Array.prototype.map.call(document.querySelectorAll("script[src]"), function (s) { return s.src; }));
  if (!cargados.length) return;

  var ultimaActividad = Date.now();
  var ocultoDesde = null;
  var barraMostrada = false;

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
    txt.textContent = "🔄 Hay una versión nueva de esta aplicación.";
    var btn = document.createElement("button");
    btn.textContent = "Actualizar ahora";
    btn.setAttribute("style", "background:#fff;color:#0e7490;border:none;border-radius:8px;padding:8px 16px;font-weight:800;cursor:pointer;font-size:14px");
    btn.onclick = function () { window.location.reload(); };
    barra.appendChild(txt);
    barra.appendChild(btn);
    document.body.appendChild(barra);
  }

  function chequear(forzarRecarga) {
    fetch(window.location.origin + "/?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var srcs = [];
        var re = /<script[^>]*\ssrc=["']([^"']+)["']/gi;
        var m;
        while ((m = re.exec(html)) !== null) srcs.push(m[1]);
        var publicados = scriptsDe(srcs);
        if (!publicados.length) return;
        var cambio = publicados.some(function (p) { return cargados.indexOf(p) === -1; });
        if (!cambio) return;
        var inactivo = Date.now() - ultimaActividad > 20 * 60 * 1000;
        if (forzarRecarga || inactivo) window.location.reload();
        else mostrarBarra();
      })
      .catch(function () { /* sin conexión: se vuelve a probar en el próximo chequeo */ });
  }

  function alVolver() {
    if (document.hidden) { ocultoDesde = Date.now(); return; }
    var largo = ocultoDesde && Date.now() - ocultoDesde > 10 * 60 * 1000;
    ocultoDesde = null;
    chequear(!!largo);
  }

  ["mousedown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
    window.addEventListener(ev, function () { ultimaActividad = Date.now(); }, { passive: true });
  });
  document.addEventListener("visibilitychange", alVolver);
  window.addEventListener("focus", alVolver);
  setInterval(function () { chequear(false); }, 5 * 60 * 1000);
})();
