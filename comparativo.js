/* ============================================================
   comparativo.js  —  Pestaña "Cuadro Comparativo" (audífonos)
   Generador de Resoluciones — PRIS

   Archivo autocontenido. Se inyecta solo.
   En index.html basta con UNA línea:

       <script src="/comparativo.js"></script>

   No modifica nada de Anteojos ni de Audífonos.
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var PROVEEDORES_SUGERIDOS = [
    "IAR Argentina",
    "GAES. S.A",
    "OPTICA GIORLENT (GRUPO VISTALLI S.R.L)"
  ];

  var MAX_PROV = 8;
  var MIN_PROV = 2;
  var contador = 0;   // ids únicos por fila

  /* ---------- 1. Estilos ---------- */
  var CSS = [
    ".cot-row{display:grid;grid-template-columns:1fr 130px 96px 34px;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #f0f4f8}",
    ".cot-row:last-child{border-bottom:none}",
    ".cot-row input[type=text]{padding:7px 10px;font-size:13px;width:100%;border:1.5px solid #d1d5db;border-radius:7px;color:#1a2b4a;outline:none}",
    ".cot-row input[type=text]:focus{border-color:#1a56a0;box-shadow:0 0 0 3px rgba(26,86,160,.1)}",
    ".cot-gan{display:flex;align-items:center;gap:5px;justify-content:center;cursor:pointer;font-size:11px;color:#16a34a;font-weight:600}",
    ".cot-gan input{width:15px;height:15px;accent-color:#16a34a;cursor:pointer}",
    ".cot-del{background:none;border:none;color:#cbd5e1;font-size:17px;cursor:pointer;padding:2px 4px;border-radius:5px;line-height:1}",
    ".cot-del:hover{color:#dc2626;background:#fef2f2}",
    ".cot-extra{grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;margin-top:2px}",
    ".cot-pdf{display:flex;align-items:center;gap:8px;font-size:11px;color:#64748b;flex-wrap:wrap}",
    ".cot-pdf input[type=file]{font-size:11px}",
    ".cot-sug{display:flex;flex-wrap:wrap;gap:6px}",
    ".cot-sug button{font-size:11px;padding:3px 8px;border:1px solid #bae6fd;background:#f0f9ff;color:#0369a1;border-radius:5px;cursor:pointer}",
    ".cot-sug button:hover{background:#e0f2fe}",
    ".btn-add{width:100%;padding:9px;background:#f1f5f9;color:#1a56a0;border:1.5px dashed #94a3b8;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;margin-top:10px}",
    ".btn-add:hover{background:#e2e8f0}",
    ".btn-add:disabled{color:#94a3b8;cursor:default;border-style:solid}",
    ".btn-xlsx{width:100%;padding:13px;background:#166534;color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;margin-top:12px}",
    ".btn-xlsx:hover{background:#14532d}",
    ".btn-xlsx:disabled{background:#94a3b8;cursor:default}"
  ].join("\n");

  /* ---------- 2. Panel base ---------- */
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
    '<div class="stitle" id="c-titulo-cot">Cotizaciones</div>' +
    '<div class="empresas-grid">' +
      '<div class="col-headers">' +
        '<div class="col-check-h">Firma / Precio (sin puntos)</div>' +
        '<div class="col-radio-h">★ Ganadora</div>' +
      '</div>' +
      '<div id="c-filas"></div>' +
    '</div>' +
    '<button class="btn-add" id="c-add">＋ Agregar proveedor</button>' +
    '<hr>' +
    '<div class="stitle">Constancia de convocatoria</div>' +
    '<div class="row">' +
      '<div class="field"><label>Proveedores convocados <span>*</span></label>' +
        '<input type="text" id="c-convocados" value="4"></div>' +
      '<div class="field"><label>Firmas que presentaron</label>' +
        '<input type="text" id="c-firmas" placeholder="IAR ARGENTINA/GAES S.A/OPTICA VISTALLI">' +
        '<div class="hint">Se completa solo — podés editarlo</div></div>' +
    '</div>' +
    '<button class="btn-xlsx" id="c-btn">📊 Generar Cuadro (Excel + PDF)</button>' +
    '<div class="msg" id="c-msg"></div>';

  /* ---------- 3. Filas de cotización ---------- */
  function agregarFila(nombre, ganadora) {
    var cont = $("c-filas");
    if (cont.children.length >= MAX_PROV) return;

    contador++;
    var k = contador;

    var fila = document.createElement("div");
    fila.className = "cot-row";
    fila.innerHTML = '' +
      '<input type="text" class="c-prov" id="c-prov' + k + '" value="' + (nombre || "") + '" placeholder="Nombre de la firma">' +
      '<input type="text" class="c-precio" id="c-precio' + k + '" placeholder="Precio $">' +
      '<label class="cot-gan"><input type="radio" name="c-gan" class="c-gan"' + (ganadora ? " checked" : "") + '> Ganadora</label>' +
      '<button type="button" class="cot-del" title="Quitar proveedor">✕</button>' +
      '<div class="cot-extra">' +
        '<div class="cot-pdf">📎 PDF opcional: ' +
          '<input type="file" accept="application/pdf" id="c-file' + k + '">' +
          '<span id="c-pdfinfo' + k + '"></span>' +
        '</div>' +
        '<div class="cot-sug" id="c-sug' + k + '"></div>' +
      '</div>';

    cont.appendChild(fila);

    fila.querySelector(".cot-del").addEventListener("click", function () {
      if (cont.children.length <= MIN_PROV) {
        avisar("Tienen que quedar al menos " + MIN_PROV + " proveedores.", true);
        return;
      }
      var eraGanadora = fila.querySelector(".c-gan").checked;
      cont.removeChild(fila);
      if (eraGanadora) {
        var primera = cont.querySelector(".c-gan");
        if (primera) primera.checked = true;
      }
      refrescar();
    });

    fila.querySelector(".c-prov").addEventListener("input", autoFirmas);
    conectarPdf(k);
    refrescar();
  }

  function refrescar() {
    var cont = $("c-filas");
    var n = cont.children.length;
    $("c-titulo-cot").textContent = "Cotizaciones — " + n + (n === 1 ? " firma" : " firmas");
    var add = $("c-add");
    add.disabled = (n >= MAX_PROV);
    add.textContent = (n >= MAX_PROV) ? "Máximo " + MAX_PROV + " proveedores" : "＋ Agregar proveedor";
    // los convocados nunca pueden ser menos que los que cotizaron
    var conv = parseInt($("c-convocados").value, 10) || 0;
    if (conv < n) $("c-convocados").value = n;
    autoFirmas();
  }

  function autoFirmas() {
    var campo = $("c-firmas");
    if (campo.getAttribute("data-tocado") === "1") return;
    var nombres = [].slice.call(document.querySelectorAll(".c-prov"))
      .map(function (i) { return i.value.trim(); })
      .filter(Boolean);
    campo.value = nombres.join("/").toUpperCase();
  }

  /* ---------- 4. Lectura opcional de PDF ---------- */
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
    var hallados = {};
    var re = /\$?\s*([0-9]{1,3}(?:[.\s][0-9]{3})+(?:,[0-9]{2})?|[0-9]{5,9})/g;
    var m;
    while ((m = re.exec(texto)) !== null) {
      var crudo = m[1].replace(/[.\s]/g, "").replace(/,[0-9]{2}$/, "");
      var n = parseInt(crudo, 10);
      if (n >= 10000 && n <= 99999999) hallados[n] = true;
    }
    return Object.keys(hallados).map(Number).sort(function (a, b) { return b - a; });
  }

  function conectarPdf(k) {
    var input = $("c-file" + k);
    if (!input) return;
    input.addEventListener("change", function () {
      var info = $("c-pdfinfo" + k);
      var sug = $("c-sug" + k);
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
              return pdf.getPage(num).then(function (pg) {
                return pg.getTextContent();
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
        if (!montos.length) {
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
          b.addEventListener("click", function () {
            var destino = $("c-precio" + k);
            if (destino) destino.value = n;
          });
          sug.appendChild(b);
        });
      }).catch(function () {
        info.textContent = " 📎 " + file.name + " — no pude leerlo, cargá el precio a mano";
      });
    });
  }

  /* ---------- 5. Generación ---------- */
  function soloNumeros(txt) {
    return parseInt(String(txt || "").replace(/[^0-9]/g, ""), 10) || 0;
  }

  function avisar(texto, esError) {
    var m = $("c-msg");
    m.className = "msg " + (esError ? "er" : "ok");
    m.textContent = texto;
  }

  function armarPayload() {
    var expte = $("c-nroExp").value.trim();
    var paciente = $("c-paciente").value.trim().toUpperCase();
    var fecha = $("c-fecha").value.trim();
    var cantidad = soloNumeros($("c-cantidad").value);

    var filas = [].slice.call($("c-filas").children);
    var cotizaciones = filas.map(function (f) {
      return {
        nombre: f.querySelector(".c-prov").value.trim(),
        precio: soloNumeros(f.querySelector(".c-precio").value)
      };
    });

    var idxGanadora = -1;
    filas.forEach(function (f, i) {
      if (f.querySelector(".c-gan").checked) idxGanadora = i;
    });

    if (!expte || !paciente || !fecha || !cantidad) {
      avisar("Completá expediente, paciente, fecha y cantidad.", true);
      return null;
    }
    if (cotizaciones.some(function (c) { return !c.nombre || !c.precio; })) {
      avisar("Completá nombre y precio de todas las firmas.", true);
      return null;
    }
    if (idxGanadora < 0) {
      avisar("Elegí la firma ganadora.", true);
      return null;
    }

    return {
      expte: expte,
      paciente: paciente,
      fecha_adj: fecha,
      cantidad: cantidad,
      cotizaciones: cotizaciones,
      idx_ganadora: idxGanadora,
      nro_convocados: soloNumeros($("c-convocados").value) || cotizaciones.length,
      firmas_presentaron: $("c-firmas").value.trim()
    };
  }

  function bajarUno(payload, formato, respaldo) {
    var cuerpo = JSON.parse(JSON.stringify(payload));
    cuerpo.formato = formato;
    return fetch("/api/comparativo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
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
      if (!nombre) nombre = respaldo;
      return resp.blob().then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        return nombre;
      });
    });
  }

  function generar() {
    var payload = armarPayload();
    if (!payload) return;

    var base = "CUADRO_COMPARATIVO_" + payload.paciente.replace(/[^A-Za-z0-9]+/g, "_");
    var btn = $("c-btn");
    btn.disabled = true;
    btn.textContent = "Generando Excel…";
    $("c-msg").className = "msg";
    $("c-msg").textContent = "";

    bajarUno(payload, "xlsx", base + ".xlsx").then(function () {
      btn.textContent = "Generando PDF…";
      // pausa corta: algunos navegadores ignoran dos descargas simultáneas
      return new Promise(function (r) { setTimeout(r, 800); });
    }).then(function () {
      return bajarUno(payload, "pdf", base + ".pdf");
    }).then(function () {
      avisar("✅ Listo: se descargaron el Excel y el PDF.", false);
    }).catch(function (ex) {
      avisar("Error: " + ex.message, true);
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "📊 Generar Cuadro (Excel + PDF)";
    });
  }

  /* ---------- 6. Inyección ---------- */
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

    // Si se edita a mano el campo de firmas, dejamos de autocompletarlo
    $("c-firmas").addEventListener("input", function () {
      this.setAttribute("data-tocado", "1");
    });

    $("c-add").addEventListener("click", function () { agregarFila("", false); });
    $("c-btn").addEventListener("click", generar);

    // Tres filas iniciales, la tercera marcada como ganadora
    PROVEEDORES_SUGERIDOS.forEach(function (nombre, i) {
      agregarFila(nombre, i === 2);
    });

    // cambiarTab ampliado a las tres pestañas
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
