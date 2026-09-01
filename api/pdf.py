import base64, io, json, tempfile, os
from http.server import BaseHTTPRequestHandler

LOGO1_B64 = "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"
LOGO2_B64 = "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"

def fmt_n(raw):
    n = int(str(raw).replace(".","").replace(",","").strip())
    return n, "{:,}".format(n).replace(",",".")

def generar_pdf(data):
    from fpdf import FPDF

    tipo        = data.get("tipo","anteojos")
    fecha       = data.get("fecha","")
    nro_res     = data.get("nroRes","")
    nro_exp     = data.get("nroExp","")
    paciente    = data.get("paciente","")
    imp_letras  = data.get("importeLetras","")

    if tipo == "anteojos":
        insumo    = data.get("insumo","")
        cantidad  = str(data.get("cantidad","1")).strip() or "1"
        try: _q = int(str(cantidad).replace(".","").strip() or "1")
        except: _q = 1
        _u = data.get("precioUnit")
        n_u, fmt_u = fmt_n(_u if _u not in (None,"") else data.get("precio","0"))
        _t = data.get("precioTotal")
        if _t not in (None,""):
            n_t, fmt_t = fmt_n(_t)
        else:
            n_t = n_u * _q; fmt_t = "{:,}".format(n_t).replace(",",".")
        pu        = "$ " + fmt_u
        pt        = "$ " + fmt_t + ",00"
        importe   = "$ " + fmt_t + ", 00"
        firma     = "Grupo Vistalli S.R.L (Optica Giorlent)"
        firmas_prev = ""
    else:
        firmas_prev  = data.get("firmasPrev","")
        firma_gan    = data.get("firmaGanadora","")
        cantidad     = data.get("cantidad","1")
        n_u, fmt_u   = fmt_n(data.get("precioUnit","0"))
        n_t, fmt_t   = fmt_n(data.get("precioTotal","0"))
        pu           = "$ " + fmt_u + ",00"
        pt           = "$ " + fmt_t + ",00"
        importe      = pt
        firma        = firma_gan
        insumo       = "AUDIFONOS"

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(25, 20, 25)
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    # --- LOGOS ---
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f1:
        f1.write(base64.b64decode(LOGO1_B64)); logo1_path=f1.name
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f2:
        f2.write(base64.b64decode(LOGO2_B64)); logo2_path=f2.name

    pdf.image(logo1_path, x=25, y=15, h=18)
    pdf.image(logo2_path, x=130, y=13, h=20)
    os.unlink(logo1_path); os.unlink(logo2_path)

    # Linea azul bajo logos
    pdf.set_draw_color(74, 144, 196)
    pdf.set_line_width(0.5)
    pdf.line(25, 36, 185, 36)
    pdf.ln(28)

    # --- FECHA ---
    pdf.set_font("Helvetica", "", 11)
    pdf.set_x(25)
    pdf.cell(0, 6, f"San Miguel de Tucuman, {fecha}.", align="R")
    pdf.ln(10)

    # --- TITULO ---
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 7, f"Resolucion Interna: No {nro_res}/DGPRIS.", align="C")
    pdf.ln(7)
    pdf.cell(0, 7, "PROGRAMA INTEGRADO DE SALUD", align="C")
    pdf.ln(10)

    # --- VISTO ---
    pdf.set_font("Helvetica", "BU", 11)
    pdf.cell(0, 6, "VISTO:")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_x(45)
    if tipo == "anteojos":
        txt = f"El Expte. No {nro_exp}, por el que se solicita la compra de {insumo} para el paciente; {paciente} y"
    else:
        txt = f"El Expte. No {nro_exp}, por el que se solicita la compra de AUDIFONOS para el paciente; {paciente} y"
    pdf.multi_cell(140, 6, txt, align="J")
    pdf.ln(4)

    # --- CONSIDERANDO ---
    pdf.set_font("Helvetica", "BU", 11)
    pdf.cell(0, 6, "CONSIDERANDO:")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 11)

    def parrafo(txt, indent=45):
        pdf.set_x(indent)
        pdf.multi_cell(185-indent, 6, txt, align="J")
        pdf.ln(3)

    parrafo("Que se encuentra agregada la documentacion correspondiente, la misma esta cumplimentada y debidamente conformada.")

    if tipo == "anteojos":
        parrafo("Que se adjunta presupuesto de la Firma Comercial Grupo Vistalli S.R.L (Optica Giorlent). -")
    else:
        parrafo(f"Que se adjunta presupuestos de la Firmas Comerciales; {firmas_prev} {firma_gan.upper()}.-")
        parrafo(f"Que la propuesta de {firma_gan} resulto la mas conveniente para el Estado.")

    parrafo("Que se adjunta Dictamen Juridico con opinion favorable.")
    parrafo("Que se aprueba todo lo actuado por encuadrarse a las disposiciones legales vigentes, que rigen sobre materia de contrataciones, conforme a lo normado en la Res. No 388/SPS-05.")
    pdf.ln(3)

    # --- POR ELLO ---
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, "POR ELLO:", align="C"); pdf.ln(6)
    pdf.cell(0, 6, "LA GERENCIA ADMINISTRATIVA DEL PROGRAMA INTEGRADO DE SALUD", align="C"); pdf.ln(6)
    pdf.cell(0, 6, "RESUELVE:", align="C"); pdf.ln(8)

    # --- ARTICULOS ---
    def articulo(num, txt):
        pdf.set_font("Helvetica","BU",11)
        label = f"ARTICULO {num}:"
        pdf.cell(pdf.get_string_width(label)+2, 6, label)
        pdf.set_font("Helvetica","",11)
        remaining = 160 - pdf.get_string_width(label)
        # Multi line with label
        full = label + " " + txt
        pdf.set_x(25)
        pdf.set_font("Helvetica","",11)
        # Print label bold then rest normal using multi_cell trick
        pdf.set_x(25)
        pdf.multi_cell(160, 6, full, align="J")
        pdf.ln(3)

    if tipo == "anteojos":
        art1 = f"Aprobar la compra de Anteojos, a favor de la firma Grupo Vistalli S.R.L (Optica Giorlent) que se detalla a continuacion:"
    else:
        art1 = f"Aprobar la compra de Audifonos, a favor de la firma {firma} que se detalla a continuacion:"

    # Art 1 header
    pdf.set_font("Helvetica","BU",11)
    pdf.cell(27, 6, "ARTICULO 1o:")
    pdf.set_font("Helvetica","",11)
    pdf.multi_cell(133, 6, art1, align="J")
    pdf.ln(2)

    # Tabla
    pdf.set_fill_color(74, 144, 196)
    pdf.set_text_color(255,255,255)
    pdf.set_font("Helvetica","B",9)
    cols = [55,45,20,25,25]
    hdrs = ["FIRMA","INSUMO","CANT.","P. UNIT.","P. TOTAL"]
    for i,h in enumerate(hdrs):
        pdf.cell(cols[i],7,h,border=1,align="C",fill=True)
    pdf.ln()
    pdf.set_text_color(0,0,0)
    pdf.set_font("Helvetica","",9)
    if tipo == "anteojos":
        row = [firma,"Par Anteojo baja grad.",cantidad,pu,pt]
    else:
        row = [firma,"Audifonos",cantidad,pu,pt]
    for i,cell in enumerate(row):
        pdf.cell(cols[i],6,cell,border=1,align="C")
    pdf.ln()
    pdf.set_font("Helvetica","B",9)
    pdf.cell(sum(cols[:4]),6,"TOTAL",border=1,align="C",fill=False)
    pdf.cell(cols[4],6,pt,border=1,align="C")
    pdf.ln(6)

    art2 = f"Autorizar la compra al proveedor {firma}, por el importe de {importe} {imp_letras}, y posterior emision de la orden de pago respectiva."
    pdf.set_font("Helvetica","BU",11)
    pdf.cell(27,6,"ARTICULO 2o:")
    pdf.set_font("Helvetica","",11)
    pdf.multi_cell(133,6,art2,align="J")
    pdf.ln(2)

    subp = "299" if tipo=="anteojos" else "297"
    art3 = f"Imputar la erogacion por un importe total de {importe} {imp_letras}, y posterior emision de la orden de pago respectiva, a la Jurisdiccion 67, Unidad de Organizacion 965-Recursos disponibles con los que cuenta el servicio-Finalidad/Funcion 314, Programa 19, Act./Ob. 01 - Partida 200 - Subpartida {subp} - con Financiamiento del Recurso 10 Tesoro General de la Provincia, con cargo al Presupuesto 2026.-"
    pdf.set_font("Helvetica","BU",11)
    pdf.cell(27,6,"ARTICULO 3o:")
    pdf.set_font("Helvetica","",11)
    pdf.multi_cell(133,6,art3,align="J")
    pdf.ln(2)

    pdf.set_font("Helvetica","BU",11)
    pdf.cell(27,6,"ARTICULO 4o:")
    pdf.set_font("Helvetica","",11)
    pdf.cell(133,6,"Pase a control de Ley del Honorable Tribunal de Cuentas.")
    pdf.ln(7)

    pdf.set_font("Helvetica","BU",11)
    pdf.cell(27,6,"ARTICULO 5o:")
    pdf.set_font("Helvetica","",11)
    pdf.cell(133,6,"Comunicar y archivar. -")
    pdf.ln(16)

    # Firma
    pdf.set_font("Helvetica","",10)
    pdf.cell(0,5,"Firmado digitalmente:",align="C"); pdf.ln(5)
    pdf.set_font("Helvetica","B",10)
    pdf.cell(0,5,"C.P.N Mariela Agustina Castillo",align="C"); pdf.ln(5)
    pdf.set_font("Helvetica","",10)
    pdf.cell(0,5,"Gerente Administrativo",align="C"); pdf.ln(5)
    pdf.cell(0,5,"Direccion Gral. Prog. Integrado de Salud SI.PRO.SA",align="C")

    return pdf.output()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length",0))
        body = self.rfile.read(length)
        data = json.loads(body)
        try:
            pdf_bytes = generar_pdf(data)
            apellido = data.get("paciente","").split(",")[0].strip().replace(" ","_")
            nombre = f"Resolucion_{data.get('nroRes','0')}_{apellido}.pdf"
            self.send_response(200)
            self.send_header("Content-Type","application/pdf")
            self.send_header("Content-Disposition",f'attachment; filename="{nombre}"')
            self.send_header("Content-Length",str(len(pdf_bytes)))
            self.end_headers()
            self.wfile.write(pdf_bytes)
        except Exception as ex:
            self.send_response(500)
            self.send_header("Content-Type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error":str(ex)}).encode())
