/* ============================================================
   comparativo.js  —  Pestaña "Cuadro Comparativo" (audífonos)
   Generador de Resoluciones — PRIS

   Archivo NUEVO y autocontenido. Se inyecta solo.
   En index.html basta con UNA línea, justo antes de </body>:

       <script src="/comparativo.js"></script>

   No modifica nada de Anteojos ni de Audífonos.
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 1. Estilos ---------- */
  var CSS = [
    ".cot-row{display:grid;grid-template-columns:1fr 130px 96px;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #f0f4f8}",
    ".cot-row:last-child{border-bottom:none}",
    ".cot-row input[type=text]{padding:7px 10px;font-size:13px;width:100%;border:1.5px solid #d1d5db;border-radius:7px;color:#1a2b4a;outline:none}",
    ".cot-row input[type=text]:focus{border-color:#1a56a0;box-shadow:0 0 0 3px rgba(26,86,160,.1)}",
    ".cot-gan{display:flex;align-items:center;gap:5px;justify-content:center;cursor:pointer;font-size:11px;color:#16a34a;font-weight:600}",
    ".cot-gan input{width:15px;height:15px;accent-color:#16a34a;cursor:pointer}",
    ".cot-extra{grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;margin-top:2px}",
    ".cot-pdf{display:flex;align-items:center;gap:8px;font-size:11px;color:#64748b;flex-wrap:wrap}",
    ".cot-pdf input[type=file]{font-size:11px}",
    ".cot-sug{display:flex;flex-wrap:wrap;gap:6px}",
    ".cot-sug button{font-size:11px;padding:3px 8px;border:1px solid #bae6fd;background:#f0f9ff;color:#0369a1;border-radius:5px;cursor:pointer}",
    ".cot-sug button:hover{background:#e0f2fe}",
    ".btn-xlsx{width:100%;padding:13px;background:#166534;color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;margin-top:12px}",
    ".btn-xlsx:hover{background:#14532d}",
    ".btn-xlsx:disabled{background:#94a3b8;cursor:default}"
  ].join("\n");

  /* ---------- 2. HTML del panel ---------- */
  function filaCotizacion(i, nombre, checked) {
    return '' +
      '<div class="cot-row">' +
        '<input type="text" id="c-prov' + i + '" value="' + nombre + '">' +
        '<input type="text" id="c-precio' + i + '" placeholder="Precio $">' +
        '<label class="cot-gan"><input type="radio" name="c-gan" value="' + (i - 1) + '"' + (checked ? ' checked' : '') + '> Ganadora</label>' +
        '<div class="cot-extra">' +
          '<div class="cot-pdf">📎 PDF opcional: ' +
            '<input type="file" accept="application/pdf" id="c-file' + i + '">' +
            '<span id="c-pdfinfo' + i + '"></span>' +
          '</div>' +
          '<div class="cot-sug" id="c-sug' + i + '"></div>' +
        '</div>' +
      '</div>';
  }

  var PANEL_HTML = '' +
    '<div class="stitle">Datos del expediente</div>' +
    '<div class="field"><label>Nº Expediente <span>*</span></label>' +
      '<input type="text" id="c-nroExp" placeholder="5658/410/J/2026" maxlength="20">' +
      '<div class="hint">Escribí el número — Tab agrega la barra /</div></div>' +
    '<div class="row">' +
      '<div class="field"><label>Paciente <span>*</span></label>' +
        '<input type="text" id="c-paciente" placeholder="JUAREZ CLARA ROSA">' +
        '<div class="hint">Apellido y nombre, en MAYÚSCULAS</div></div>' +
      '<div class="field"><label>Fecha de adjudicación <span>*</span></label>' +
        '<input type="text" id="c-fecha" placeholder="21/07/2026">' +
        '<div class="hint">dd/mm/aaaa</div></div>' +
    '</div>' +
    '<div class="field"><label>Cantidad de audífonos <span>*</span></label>' +
      '<input type="text" id="c-cantidad" placeholder="1"></div>' +
    '<hr>' +
    '<div class="stitle">Cotizaciones — 3 firmas</div>' +
    '<div class="empresas-grid">' +
      '<div class="col-headers">' +
        '<div class="col-check-h">Firma / Precio (sin puntos)</div>' +
        '<div class="col-radio-h">★ Ganadora</div>' +
      '</div>' +
      filaCotizacion(1, 'IAR Argentina', false) +
      filaCotizacion(2, 'GAES. S.A', false) +
      filaCotizacion(3, 'OPTICA GIORLENT (GRUPO VISTALLI S.R.L)', true) +
    '</div>' +
    '<hr>' +
    '<div class="stitle">Constancia de convocatoria</div>' +
    '<div class="row">' +
      '<div class="field"><label>Proveedores convocados <span>*</span></label>' +
        '<input type="text" id="c-convocados" value="4"></div>' +
      '<div class="field"><label>Firmas que presentaron</label>' +
        '<input type="text" id="c-firmas" value="IAR ARGENTINA/GAES S.A/OPTICA VISTALLI"></div>' +
    '</div>' +
    '<button class="btn-xlsx" id="c-btn">📊 Generar Cuadro (Excel)</button>' +
    '<div style="margin-top:12px;padding:12px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:13px;color:#0369a1;">' +
      '💡 <b>Para el PDF:</b> abrí el Excel descargado → <b>Archivo → Guardar como → PDF</b>' +
    '</div>' +
    '<div class="msg" id="c-msg"></div>';

  /* ---------- 3. Lectura opcional de PDF ---------- */
  var _pdfjsPromise = null;

  function cargarPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (_pdfjsPromise) return _pdfjsPromise;
    _pdfjsPromise = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = function () {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        } catch (_) {}
        res(window.pdfjsLib);
      };
      s.onerror = function () { rej(new Error("no disponible")); };
      document.head.appendChild(s);
    });
    return _pdfjsPromise;
  }

  function montosDelTexto(texto) {
    var encontrados = {};
    var re = /\$?\s*([0-9]{1,3}(?:[.\s][0-9]{3})+(?:,[0-9]{2})?|[0-9]{5,9})/g;
    var m;
    while ((m = re.exec(texto)) !== null) {
      var crudo = m[1].replace(/[.\s]/g, "").replace(/,[0-9]{2}$/, "");
      var n = parseInt(crudo, 10);
      if (n >= 10000 && n <= 99999999) encontrados[n] = true;
    }
    return Object.keys(encontrados).map(Number).sort(function (a, b) { return b - a; });
  }

  function conectarPdf(i) {
    var input = $("c-file" + i);
    if (!input) return;
    input.addEventListener("change", function () {
      var info = $("c-pdfinfo" + i);
      var sug = $("c-sug" + i);
      sug.innerHTML = "";
      var file = input.files && input.files[0];
      if (!file) { info.textContent = ""; return; }
      info.textContent = " 📎 " + file.name + " — leyendo…";

      cargarPdfJs().then(function (pdfjs) {
        return file.arrayBuffer().then(function (buf) {
          return pdfjs.getDocument({ data: buf }).promise;
        });
      }).then(function (pdf) {
        var paginas = Math.min(pdf.numPages, 5);
        var cadena = Promise.resolve("");
        for (var p = 1; p <= paginas; p++) {
          (function (num) {
            cadena = cadena.then(function (acum) {
              return pdf.getPage(num).then(function (page) {
                return page.getTextContent();
              }).then(function (c) {
                return acum + " " + c.items.map(function (it) { return it.str; }).join(" ");
              });
            });
          })(p);
        }
        return cadena;
      }).then(function (texto) {
        var montos = montosDelTexto(texto);
        info.textContent = " 📎 " + file.name;
        if (montos.length === 0) {
          info.textContent += " — no encontré montos, cargá el precio a mano";
          return;
        }
        var etiqueta = document.createElement("span");
        etiqueta.style.cssText = "font-size:11px;color:#64748b";
        etiqueta.textContent = "Posibles montos (clic para usar):";
        sug.appendChild(etiqueta);
        montos.slice(0, 6).forEach(function (n) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = "$ " + n.toLocaleString("es-AR");
          b.addEventListener("click", function () { $("c-precio" + i).value = n; });
          sug.appendChild(b);
        });
      }).catch(function () {
        info.textContent = " 📎 " + file.name + " — no pude leerlo, cargá el precio a mano";
      });
    });
  }

  /* ---------- 4. Generar el Excel ---------- */
  function soloNumeros(txt) {
    return parseInt(String(txt || "").replace(/[^0-9]/g, ""), 10) || 0;
  }

  function generarComparativo() {
    var msgEl = $("c-msg");
    msgEl.className = "msg";

    var expte = $("c-nroExp").value.trim();
    var paciente = $("c-paciente").value.trim().toUpperCase();
    var fecha = $("c-fecha").value.trim();
    var cantidad = soloNumeros($("c-cantidad").value);

    var cotizaciones = [1, 2, 3].map(function (i) {
      return {
        nombre: $("c-prov" + i).value.trim(),
        precio: soloNumeros($("c-precio" + i).value)
      };
    });

    var sel = document.querySelector('input[name="c-gan"]:checked');
    var idxGanadora = sel ? parseInt(sel.value, 10) : -1;
    var convocados = soloNumeros($("c-convocados").value) || cotizaciones.length;
    var firmas = $("c-firmas").value.trim();

    if (!expte || !paciente || !fecha || !cantidad) {
      msgEl.className = "msg er";
      msgEl.textContent = "Completá expediente, paciente, fecha y cantidad.";
      return;
    }
    var incompleta = cotizaciones.some(function (c) { return !c.nombre || !c.precio; });
    if (incompleta) {
      msgEl.className = "msg er";
      msgEl.textContent = "Completá nombre y precio de las 3 firmas.";
      return;
    }
    if (idxGanadora < 0) {
      msgEl.className = "msg er";
      msgEl.textContent = "Elegí la firma ganadora.";
      return;
    }

    var payload = {
      expte: expte,
      paciente: paciente,
      fecha_adj: fecha,
      cantidad: cantidad,
      cotizaciones: cotizaciones,
      idx_ganadora: idxGanadora,
      nro_convocados: convocados,
      firmas_presentaron: firmas
    };

    var btn = $("c-btn");
    btn.disabled = true;
    btn.textContent = "Generando…";

    fetch("/api/comparativo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.json().catch(function () {
          return { error: "Error " + resp.status };
        }).then(function (er) {
          throw new Error(er.error || ("Error " + resp.status));
        });
      }
      var nombre = "";
      var cd = resp.headers.get("Content-Disposition");
      if (cd) {
        var mm = cd.match(/filename="?([^"]+)"?/);
        if (mm) nombre = mm[1];
      }
      if (!nombre) {
        nombre = "CUADRO_COMPARATIVO_" + paciente.replace(/[^A-Za-z0-9]+/g, "_") + ".xlsx";
      }
      return resp.blob().then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        msgEl.className = "msg ok";
        msgEl.textContent = "✅ Excel descargado: " + nombre;
      });
    }).catch(function (ex) {
      msgEl.className = "msg er";
      msgEl.textContent = "Error: " + ex.message;
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "📊 Generar Cuadro (Excel)";
    });
  }

  /* ---------- 5. Inyección ---------- */
  function init() {
    var tabs = document.querySelector(".tabs");
    var cuerpo = document.querySelector(".body");
    if (!tabs || !cuerpo || $("panel-comparativo")) return;

    var estilo = document.createElement("style");
    estilo.textContent = CSS;
    document.head.appendChild(estilo);

    var tab = document.createElement("div");
    tab.className = "tab";
    tab.textContent = "📊 Cuadro Comparativo";
    tab.addEventListener("click", function () { window.cambiarTab("comparativo"); });
    tabs.appendChild(tab);

    var panel = document.createElement("div");
    panel.id = "panel-comparativo";
    panel.className = "panel";
    panel.innerHTML = PANEL_HTML;
    cuerpo.appendChild(panel);

    // Máscara del expediente, reusando la función original si existe
    if (typeof window.expKeydown === "function") {
      $("c-nroExp").addEventListener("keydown", function (ev) {
        window.expKeydown(this, ev);
      });
    }

    [1, 2, 3].forEach(conectarPdf);
    $("c-btn").addEventListener("click", generarComparativo);

    // Reemplazo de cambiarTab para que maneje las 3 pestañas
    var nombres = ["anteojos", "audio", "comparativo"];
    window.cambiarTab = function (destino) {
      var solapas = document.querySelectorAll(".tab");
      for (var i = 0; i < solapas.length; i++) {
        solapas[i].classList.toggle("active", nombres[i] === destino);
      }
      nombres.forEach(function (n) {
        var pnl = $("panel-" + n);
        if (pnl) pnl.classList.toggle("active", n === destino);
      });
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
