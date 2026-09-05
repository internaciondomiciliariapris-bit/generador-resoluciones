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
  var MIN_PROV = 1;
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
    ".btn-xlsx:disabled{background:#94a3b8;cursor:default}",
    ".cot-total{font-size:11px;color:#0f5132;min-height:14px}",
    ".cot-total b{color:#166534}",
    ".cot-total .neg{color:#b45309;font-weight:600}",
    ".cot-sug .neg-btn{border-color:#fecaca;background:#fef2f2;color:#b91c1c}",
    ".cot-sug .neg-btn:hover{background:#fee2e2}"
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
      '<input type="text" class="c-precio" id="c-precio' + k + '" placeholder="Precio unitario $">' +
      '<label class="cot-gan"><input type="radio" name="c-gan" class="c-gan"' + (ganadora ? " checked" : "") + '> Ganadora</label>' +
      '<button type="button" class="cot-del" title="Quitar proveedor">✕</button>' +
      '<div class="cot-extra">' +
        '<div class="cot-total" id="c-total' + k + '"></div>' +
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
    fila.querySelector(".c-precio").addEventListener("input", function () { calcTotal(k); });
    conectarPdf(k);
    refrescar();
  }

  /* ---------- Total en vivo (unitario × cantidad) ---------- */
  function calcTotal(k) {
    var campo = $("c-precio" + k);
    var out = $("c-total" + k);
    if (!campo || !out) return;
    var raw = String(campo.value || "").trim();
    if (raw.toUpperCase() === "NEGATIVA") {
      out.innerHTML = '<span class="neg">NEGATIVA — no cotiza</span>';
      return;
    }
    var unit = soloNumeros(raw);
    if (!unit) { out.textContent = ""; return; }
    var cant = soloNumeros($("c-cantidad").value) || 1;
    var total = unit * cant;
    out.innerHTML = "Unitario $" + unit.toLocaleString("es-AR") +
      " × " + cant + " = <b>$" + total.toLocaleString("es-AR") + "</b>";
  }

  function recomputarTotales() {
    [].slice.call(document.querySelectorAll(".c-precio")).forEach(function (inp) {
      calcTotal(inp.id.replace("c-precio", ""));
    });
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
    // Normalizamos y dejamos un espacio de guarda a los costados
    var t = " " + String(texto).replace(/\u00a0/g, " ") + " ";
    var re = /([0-9]{1,3}(?:[.\s][0-9]{3})+(?:,[0-9]{2})?|[0-9]{5,9}(?:,[0-9]{2})?)/g;
    // Palabras que indican que el número de al lado es un precio
    var kw = /(total|importe|precio|subtotal|valor|monto|unitario|unit\b|c\/u|p\/u|p\.?\s*unit)/i;

    var fuertes = {};   // números con contexto de plata ($, centavos o palabra clave)
    var debiles = {};   // el resto (solo se usan si no hay ninguno fuerte)
    var m;
    while ((m = re.exec(t)) !== null) {
      var crudo = m[1];
      var limpio = crudo.replace(/[.\s]/g, "").replace(/,[0-9]{2}$/, "");
      var n = parseInt(limpio, 10);
      if (isNaN(n) || n < 10000 || n > 99999999) continue;

      var ini = m.index;
      var antes = t.slice(Math.max(0, ini - 24), ini);   // 24 caracteres previos
      var tieneSigno = /\$\s*$/.test(antes);              // ...$ justo antes
      var tieneCentavos = /,[0-9]{2}$/.test(crudo);       // termina en ,00 / ,50
      var cercaPalabra = kw.test(antes);                  // "total", "precio", etc. cerca

      if (tieneSigno || tieneCentavos || cercaPalabra) fuertes[n] = true;
      else debiles[n] = true;
    }

    var listaFuertes = Object.keys(fuertes).map(Number);
    var listaDebiles = Object.keys(debiles).map(Number);
    // Si hay montos con contexto de precio, mostramos SOLO esos; si no, caemos al resto
    var base = listaFuertes.length ? listaFuertes : listaDebiles;
    return base.sort(function (a, b) { return b - a; });
  }

  // Detecta presupuestos que en realidad son una negativa a cotizar
  function esNegativa(texto) {
    return /no\s+cotiz|lamentamos\s+no|negativ|declina|desestima|no\s+presupuest|no\s+particip/i.test(String(texto));
  }

  // De los montos detectados, decide cuál es el unitario y cuál el total.
  // Regla robusta: si existe un monto u tal que u × cantidad también aparece,
  // ese u es el unitario; si no, el menor es unitario y el mayor es total.
  function elegirMontos(montos, cant) {
    if (!montos.length) return { unit: null, total: null };
    if (montos.length === 1) return { unit: montos[0], total: montos[0] * (cant || 1) };
    if (cant > 1) {
      for (var i = 0; i < montos.length; i++) {
        if (montos.indexOf(montos[i] * cant) >= 0) {
          return { unit: montos[i], total: montos[i] * cant };
        }
      }
    }
    var mn = Math.min.apply(null, montos);
    var mx = Math.max.apply(null, montos);
    return { unit: mn, total: mx };
  }

  /* ---------- OCR de respaldo (solo si el PDF no tiene texto) ---------- */
  var _tessPromise = null;
  function cargarTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (_tessPromise) return _tessPromise;
    _tessPromise = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
      s.onload = function () { window.Tesseract ? res(window.Tesseract) : rej(new Error("tesseract")); };
      s.onerror = function () { rej(new Error("OCR no disponible")); };
      document.head.appendChild(s);
    });
    return _tessPromise;
  }

  // Texto nativo del PDF (rápido; vacío si el PDF es una imagen escaneada)
  function textoNativo(pdf) {
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
  }

  // OCR de las páginas (se rasteriza cada página y se la pasa por Tesseract)
  function ocrPdf(pdf) {
    return cargarTesseract().then(function (Tess) {
      var paginas = Math.min(pdf.numPages, 3);
      var cadena = Promise.resolve("");
      for (var p = 1; p <= paginas; p++) {
        (function (num) {
          cadena = cadena.then(function (acum) {
            return pdf.getPage(num).then(function (pg) {
              var vp = pg.getViewport({ scale: 2 });
              var canvas = document.createElement("canvas");
              canvas.width = vp.width;
              canvas.height = vp.height;
              var ctx = canvas.getContext("2d");
              return pg.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                return Tess.recognize(canvas, "eng").then(function (r) {
                  return acum + " " + (r && r.data ? r.data.text : "");
                });
              });
            });
          });
        })(p);
      }
      return cadena;
    });
  }

  // Procesa el texto (venga del PDF nativo o del OCR): carga unitario, detecta negativa
  function procesarTexto(k, file, info, sug, texto, viaOcr) {
    var negativa = esNegativa(texto);
    var montos = montosDelTexto(texto);
    var marca = viaOcr ? " (OCR)" : "";
    info.textContent = " 📎 " + file.name + marca;

    var btnNeg = document.createElement("button");
    btnNeg.type = "button";
    btnNeg.className = "neg-btn";
    btnNeg.textContent = "Marcar NEGATIVA";
    btnNeg.addEventListener("click", function () {
      var d = $("c-precio" + k);
      if (d) { d.value = "NEGATIVA"; calcTotal(k); }
    });

    if (!montos.length) {
      if (negativa) {
        var dn = $("c-precio" + k);
        if (dn) { dn.value = "NEGATIVA"; calcTotal(k); }
        info.textContent += " — negativa detectada ✔ (se cargó como NEGATIVA)";
      } else {
        info.textContent += " — no encontré montos, cargá el precio a mano";
      }
      sug.appendChild(btnNeg);
      return;
    }

    // Hay montos → elegimos unitario y total según la cantidad actual
    var cant = soloNumeros($("c-cantidad").value) || 1;
    var elec = elegirMontos(montos, cant);
    var destino0 = $("c-precio" + k);
    if (destino0 && !destino0.value) { destino0.value = elec.unit; calcTotal(k); }

    var etiqueta = document.createElement("span");
    etiqueta.style.cssText = "font-size:11px;color:#64748b";
    etiqueta.textContent = "Detecté unitario $" + elec.unit.toLocaleString("es-AR") +
      (montos.length > 1 ? (" · total $" + elec.total.toLocaleString("es-AR")) : "") +
      " — si el unitario es otro, clic:";
    sug.appendChild(etiqueta);

    montos.slice(0, 6).forEach(function (n) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "$ " + n.toLocaleString("es-AR");
      b.addEventListener("click", function () {
        var destino = $("c-precio" + k);
        if (destino) { destino.value = n; calcTotal(k); }
      });
      sug.appendChild(b);
    });
    sug.appendChild(btnNeg);
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

      var pdfDoc = null;
      cargarPdfJs().then(function (pdfjs) {
        return file.arrayBuffer().then(function (buf) {
          return pdfjs.getDocument({ data: buf }).promise;
        });
      }).then(function (pdf) {
        pdfDoc = pdf;
        return textoNativo(pdf);
      }).then(function (texto) {
        // Si el texto nativo ya trae montos o es una negativa, lo usamos (rápido)
        if (montosDelTexto(texto).length || esNegativa(texto)) {
          procesarTexto(k, file, info, sug, texto, false);
          return;
        }
        // PDF sin texto útil (escaneado/imagen) → OCR de respaldo
        info.textContent = " 📎 " + file.name + " — sin texto, leyendo con OCR (puede tardar unos segundos)…";
        return ocrPdf(pdfDoc).then(function (textoOcr) {
          procesarTexto(k, file, info, sug, textoOcr, true);
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
      var raw = String(f.querySelector(".c-precio").value || "").trim();
      var neg = raw.toUpperCase() === "NEGATIVA";
      var unit = neg ? 0 : soloNumeros(raw);
      return {
        nombre: f.querySelector(".c-prov").value.trim(),
        negativa: neg,
        precio_unit: unit,
        precio: unit            // compatibilidad: el backend calcula total = unit × cantidad
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
    if (cotizaciones.some(function (c) { return !c.nombre; })) {
      avisar("Completá el nombre de todas las firmas.", true);
      return null;
    }
    if (cotizaciones.some(function (c) { return !c.negativa && !c.precio_unit; })) {
      avisar("Cargá el precio unitario (o marcá NEGATIVA) en todas las firmas.", true);
      return null;
    }
    if (idxGanadora < 0) {
      avisar("Elegí la firma ganadora.", true);
      return null;
    }
    if (cotizaciones[idxGanadora].negativa) {
      avisar("La firma ganadora no puede ser una NEGATIVA. Elegí otra.", true);
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
    tab.dataset.tab = "comparativo";
    tab.textContent = "📊 Cuadro Comparativo";
    tab.addEventListener("click", function () { window.cambiarTab("comparativo"); });
    tabs.appendChild(tab);

    // Pestaña "Listado" SIEMPRE al final (su panel viene en el index.html).
    if ($("panel-listado") && !document.querySelector('.tabs .tab[data-tab="listado"]')) {
      var tabLst = document.createElement("div");
      tabLst.className = "tab";
      tabLst.dataset.tab = "listado";
      tabLst.textContent = "📋 Listado";
      tabLst.addEventListener("click", function () { window.cambiarTab("listado"); });
      tabs.appendChild(tabLst);
    }

    var panel = document.createElement("div");
    panel.id = "panel-comparativo";
    panel.className = "panel";
    panel.innerHTML = PANEL_HTML;
    cuerpo.appendChild(panel);

    // Fecha de adjudicación predeterminada = hoy (hora LOCAL, formato dd/mm/aaaa), editable a mano
    (function () {
      var f = $("c-fecha");
      if (f && !f.value) {
        var d = new Date();
        var dd = String(d.getDate()).padStart(2, "0");
        var mm = String(d.getMonth() + 1).padStart(2, "0");
        f.value = dd + "/" + mm + "/" + d.getFullYear();
      }
    })();

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

    // Al cambiar la cantidad de audífonos, recalcular el total de cada fila
    $("c-cantidad").addEventListener("input", recomputarTotales);

    // Tres filas iniciales, la tercera marcada como ganadora
    PROVEEDORES_SUGERIDOS.forEach(function (nombre, i) {
      agregarFila(nombre, i === 2);
    });

    // Etiquetar las solapas que ya venían en el HTML (Anteojos, Audífonos, Listado…)
    // con su propio nombre, leyéndolo del onclick. Así no dependemos del orden.
    var solapasHtml = document.querySelectorAll(".tabs .tab");
    for (var s = 0; s < solapasHtml.length; s++) {
      if (solapasHtml[s].dataset.tab) continue;
      var oc = solapasHtml[s].getAttribute("onclick") || "";
      var mm = oc.match(/cambiarTab\(['"]([^'"]+)['"]\)/);
      if (mm) solapasHtml[s].dataset.tab = mm[1];
    }

    // cambiarTab robusto: opera por data-tab (no por posición) y contempla todas
    // las pestañas presentes, incluida "listado" si existe.
    window.cambiarTab = function (destino) {
      var solapas = document.querySelectorAll(".tabs .tab");
      for (var i = 0; i < solapas.length; i++) {
        solapas[i].classList.toggle("active", solapas[i].dataset.tab === destino);
      }
      ["anteojos", "audio", "listado", "comparativo"].forEach(function (n) {
        var pnl = $("panel-" + n);
        if (pnl) pnl.classList.toggle("active", n === destino);
      });
      // Si abrimos el Listado, refrescarlo (la función vive en index.html)
      if (destino === "listado" && typeof window.renderListado === "function") {
        window.renderListado();
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
