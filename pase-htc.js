/* ============================================================
   pase-htc.js  —  Pestaña "Pase HTC" (Honorable Tribunal de Cuentas)
   Generador de Resoluciones — PRIS · solo AUDÍFONOS

   Arma la nota de pase al H. Tribunal de Cuentas con los logos del PRIS,
   la firma digital de la C.P.N. Mariela Agustina Castillo y la leyenda del
   año al pie. La nota se ve editable en pantalla y se descarga en PDF con el
   mismo motor de las resoluciones (Apps Script "htmlAPdf").
   NO guarda nada: cada expediente genera su nota y listo.
   Se inyecta sola; en index.html basta:  <script src="/pase-htc.js"></script>
   ============================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var NUM = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

  function escH(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fechaLargaHoy() {
    var d = new Date();
    return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
  }
  function cantidadTexto(n) {
    var k = parseInt(n, 10);
    if (!(k > 0)) k = 1;
    var palabra = k <= 10 ? NUM[k] : String(k);
    return palabra + " (" + k + ") " + (k === 1 ? "audífono" : "audífonos");
  }
  function logo(n) {
    try { return n === 1 ? LOGO1_DATA : LOGO2_DATA; } catch (e) {
      try { return n === 1 ? LOGO1 : LOGO2; } catch (e2) { return ""; }
    }
  }

  var CSS = [
    ".htc-prev{border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;padding:26px 30px;margin-top:16px;font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;line-height:1.5}",
    ".htc-prev [contenteditable=true]:focus{outline:2px dashed #93c5fd;outline-offset:3px}",
    ".htc-aviso{font-size:12px;color:#475569;margin-top:10px}",
    ".htc-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}"
  ].join("\n");

  var PANEL_HTML =
    '<div class="stitle">Pase al Honorable Tribunal de Cuentas — Audífonos</div>' +
    '<div class="row">' +
      '<div class="field"><label>Nº Expediente <span>*</span></label>' +
        '<input type="text" id="h-nroExp" placeholder="2711/611/SS/2026" maxlength="22"></div>' +
      '<div class="field"><label>Fecha de la nota <span>*</span></label>' +
        '<input type="text" id="h-fecha" placeholder="27 de noviembre de 2026"></div>' +
    '</div>' +
    '<div class="field"><label>Paciente — Apellido y nombre <span>*</span></label>' +
      '<input type="text" id="h-paciente" placeholder="MEDINA PEDRO PABLO"></div>' +
    '<div class="row">' +
      '<div class="field"><label>DNI del paciente <span>*</span></label>' +
        '<input type="text" id="h-dni" placeholder="30.000.042" inputmode="numeric"></div>' +
      '<div class="field"><label>Cantidad de audífonos <span>*</span></label>' +
        '<input type="text" id="h-cantidad" placeholder="2" inputmode="numeric"></div>' +
    '</div>' +
    '<button class="btn-preview" id="h-ver">👁️ Ver nota de pase</button>' +
    '<div id="h-zona" style="display:none">' +
      '<div class="htc-aviso">✏️ Podés corregir cualquier texto directamente sobre la nota antes de descargarla. No se guarda: cada expediente genera la suya.</div>' +
      '<div class="htc-prev" id="h-prev"></div>' +
      '<div class="htc-btns">' +
        '<button class="btn-pdf" id="h-pdf">🖨️ Descargar PDF</button>' +
        '<button class="btn-back" style="margin-top:0" id="h-limpiar">🧹 Nueva nota</button>' +
      '</div>' +
      '<div class="msg" id="h-msg"></div>' +
    '</div>';

  function datos() {
    var v = function (id) { return ($(id) && $(id).value || "").trim(); };
    return {
      exp: v("h-nroExp"), fecha: v("h-fecha") || fechaLargaHoy(),
      pac: v("h-paciente").toUpperCase(), dni: v("h-dni"), cant: v("h-cantidad") || "1"
    };
  }

  /* Cuerpo de la nota (editable en pantalla). Mismo texto para la vista y el PDF. */
  function cuerpoNota(d) {
    var exp = escH(d.exp || "____/___/__/____"), pac = escH(d.pac || "__________"), dni = escH(d.dni || "__________");
    return '' +
      '<p style="text-align:right;margin:0 0 14pt 0;">San Miguel de Tucumán, ' + escH(d.fecha) + '</p>' +
      '<p style="margin:0;font-weight:bold;">AL HONORABLE TRIBUNAL DE CUENTAS</p>' +
      '<p style="margin:0;font-weight:bold;">DE LA PROVINCIA DE TUCUMÁN</p>' +
      '<p style="margin:0 0 12pt 0;font-weight:bold;text-decoration:underline;">S / D</p>' +
      '<table style="border:none;border-collapse:collapse;width:100%;margin:0 0 14pt 0;"><tr>' +
        '<td style="border:none;width:45%;padding:0;"></td>' +
        '<td style="border:none;padding:0;text-align:justify;line-height:1.35;"><b><u>Ref.:</u></b> Expediente N.º <b>' + exp + '</b> – Solicitud de audífonos para <b>' + pac + '</b></td>' +
      '</tr></table>' +
      '<p style="text-align:justify;text-indent:40mm;margin:0 0 10pt 0;">Me dirijo a Ud. a fin de elevar las presentes actuaciones para la intervención de competencia de ese Honorable Tribunal, relacionadas con la adquisición de ' + escH(cantidadTexto(d.cant)) + ' destinado' + (parseInt(d.cant, 10) > 1 ? "s" : "") + ' al paciente <b>' + pac + '</b>, DNI N.º <b>' + dni + '</b>, conforme a la indicación médica y los antecedentes obrantes en el expediente.</p>' +
      '<p style="text-align:justify;text-indent:40mm;margin:0 0 10pt 0;">La contratación se tramita bajo la modalidad de contratación directa, conforme a las Resoluciones N.º 388/SPS-05 y N.º 69/SPS-2026, con sus modificatorias, según lo dictaminado por Asesoría Letrada.</p>' +
      '<p style="text-align:justify;text-indent:40mm;margin:0 0 10pt 0;">En virtud de ello, se solicita la intervención que corresponda, a efectos de dar continuidad al trámite administrativo para la provisión de los audífonos requeridos.</p>' +
      '<p style="text-indent:40mm;margin:0 0 0 0;">Sin otro particular, saludo a Ud. atentamente.</p>';
  }

  var FIRMA = '' +
    '<table style="border:none;border-collapse:collapse;width:100%;margin-top:46pt;"><tr>' +
      '<td style="border:none;width:50%;padding:0;"></td>' +
      '<td style="border:none;padding:0;font-family:\'Times New Roman\',Times,serif;font-size:11pt;font-weight:bold;line-height:1.25;">' +
        '<p style="margin:0;">Firmado digitalmente:</p>' +
        '<p style="margin:0;">C.P.N. Mariela Agustina Castillo</p>' +
        '<p style="margin:0;">Gerente Administrativo</p>' +
        '<p style="margin:0;">Dirección Gral. Prog. Integrado de Salud</p>' +
        '<p style="margin:0;">SI.PRO.SA</p>' +
      '</td></tr></table>';

  var PIE = '<div style="border-top:2pt solid #5b9bd5;margin-top:22pt;padding-top:8pt;font-family:\'Times New Roman\',Times,serif;font-size:11pt;line-height:1.2;">“2026 Año de la Memoria por: Golpe de Estado Cívico Militar de 1976, Cierre Masivo de los Ingenios en 1966 y Cierre de los Talleres Ferroviarios de Tafí Viejo en 1980”</div>';

  function encabezado() {
    return '<table style="border:none;border-collapse:collapse;width:100%;margin-bottom:0;"><tr>' +
      '<td style="border:none;padding:0;width:50%;vertical-align:middle;"><img src="' + logo(1) + '" style="height:34pt;"></td>' +
      '<td style="border:none;padding:0;text-align:right;vertical-align:middle;"><img src="' + logo(2) + '" style="height:44pt;"></td>' +
      '</tr></table><div style="border-bottom:2pt solid #5b9bd5;margin:6pt 0 14pt 0;"></div>';
  }

  function verNota() {
    var d = datos(), faltan = [];
    if (!d.exp) faltan.push("Nº de expediente");
    if (!d.pac) faltan.push("paciente");
    if (!d.dni) faltan.push("DNI");
    var msg = $("h-msg");
    if (faltan.length) { msg.className = "msg er"; msg.textContent = "Completá: " + faltan.join(", ") + "."; $("h-zona").style.display = "block"; $("h-prev").style.display = "none"; return; }
    msg.className = "msg"; msg.textContent = "";
    $("h-prev").style.display = "block";
    $("h-prev").innerHTML = encabezado() + '<div id="h-editable" contenteditable="true">' + cuerpoNota(d) + '</div>' + FIRMA + PIE;
    $("h-zona").style.display = "block";
    $("h-prev").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function htmlPdf() {
    var ed = $("h-editable");
    var css = "@page{size:A4;margin:18mm 22mm 18mm 25mm;} body{font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;line-height:1.5;margin:0;} p{margin:0;}";
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body>' +
      encabezado() + (ed ? ed.innerHTML : cuerpoNota(datos())) + FIRMA + PIE + '</body></html>';
  }

  async function descargar() {
    var btn = $("h-pdf"), msg = $("h-msg"), d = datos();
    if (!$("h-editable")) { verNota(); if (!$("h-editable")) return; }
    btn.disabled = true; btn.textContent = "Generando PDF...";
    var titulo = "PASE HTC - " + (d.pac || "PACIENTE") + " - EXPTE " + (d.exp || "").replace(/\//g, "-");
    try {
      var html = htmlPdf();
      var pedir = async function () {
        var resp = await fetch(APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify({ clave: APPS_CLAVE, accion: "htmlAPdf", titulo: titulo, html: html }) });
        var j = typeof leerJson === "function" ? await leerJson(resp, "Apps Script (PDF)") : await resp.json();
        if (!j || !j.ok || !j.pdfBase64) throw new Error((j && j.error) || "respuesta vacía de Apps Script");
        return j;
      };
      var data = typeof conReintento === "function"
        ? await conReintento(pedir, 4, function (n, t) { btn.textContent = "Reintentando PDF (" + n + "/" + t + ")..."; })
        : await pedir();
      var bytes = atob(data.pdfBase64), arr = new Uint8Array(bytes.length);
      for (var i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));
      var a = document.createElement("a"); a.href = url; a.download = titulo + ".pdf"; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      msg.className = "msg ok"; msg.textContent = "✅ PDF descargado: " + titulo + ".pdf";
    } catch (ex) {
      msg.className = "msg er"; msg.textContent = "Error: " + (typeof mensajeFalla === "function" ? mensajeFalla(ex) : (ex && ex.message || ex));
    }
    btn.disabled = false; btn.textContent = "🖨️ Descargar PDF";
  }

  function limpiar() {
    ["h-nroExp", "h-paciente", "h-dni", "h-cantidad"].forEach(function (id) { if ($(id)) $(id).value = ""; });
    $("h-fecha").value = fechaLargaHoy();
    $("h-prev").innerHTML = ""; $("h-zona").style.display = "none";
    $("h-msg").className = "msg"; $("h-msg").textContent = "";
  }

  /* Al abrir la pestaña: si está vacía, trae Expte / paciente / cantidad del Cuadro Comparativo. */
  function precargar() {
    var map = [["h-nroExp", "c-nroExp"], ["h-paciente", "c-paciente"], ["h-cantidad", "c-cantidad"]];
    map.forEach(function (m) {
      var dst = $(m[0]), src = $(m[1]);
      if (dst && src && !dst.value.trim() && src.value.trim()) dst.value = src.value.trim();
    });
    if ($("h-paciente").value && !$("h-dni").value && typeof window.rellenarDni === "function") {
      try { window.rellenarDni("h", false); } catch (e) {}
    }
    if (!$("h-fecha").value) $("h-fecha").value = fechaLargaHoy();
  }

  function init() {
    var tabs = document.querySelector(".tabs"), cuerpo = document.querySelector(".body");
    if (!tabs || !cuerpo || $("panel-htc")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

    var tab = document.createElement("div");
    tab.className = "tab"; tab.dataset.tab = "htc"; tab.textContent = "⚖️ Pase HTC";
    tab.addEventListener("click", function () { window.cambiarTab("htc"); });
    var tabCuadro = document.querySelector('.tabs .tab[data-tab="comparativo"]');
    if (tabCuadro && tabCuadro.nextSibling) tabs.insertBefore(tab, tabCuadro.nextSibling); else tabs.appendChild(tab);

    var panel = document.createElement("div");
    panel.id = "panel-htc"; panel.className = "panel"; panel.innerHTML = PANEL_HTML;
    cuerpo.appendChild(panel);
    $("h-fecha").value = fechaLargaHoy();

    if (typeof window.expKeydown === "function") {
      $("h-nroExp").addEventListener("keydown", function (ev) { window.expKeydown(this, ev); });
    }
    $("h-paciente").addEventListener("change", function () {
      this.value = this.value.toUpperCase();
      if (typeof window.rellenarDni === "function") { try { window.rellenarDni("h", true); } catch (e) {} }
    });
    $("h-dni").addEventListener("change", function () { if (typeof window.fmtDni === "function") this.value = window.fmtDni(this.value); });
    $("h-ver").addEventListener("click", verNota);
    $("h-pdf").addEventListener("click", descargar);
    $("h-limpiar").addEventListener("click", limpiar);

    // Extiende cambiarTab (definido por comparativo.js) para mostrar/ocultar este panel.
    var previo = window.cambiarTab;
    window.cambiarTab = function (destino) {
      if (typeof previo === "function") previo(destino);
      var solapas = document.querySelectorAll(".tabs .tab");
      for (var i = 0; i < solapas.length; i++) solapas[i].classList.toggle("active", solapas[i].dataset.tab === destino);
      ["anteojos", "audio", "listado", "comparativo", "htc"].forEach(function (n) {
        var p = $("panel-" + n); if (p) p.classList.toggle("active", n === destino);
      });
      if (destino === "htc") precargar();
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
