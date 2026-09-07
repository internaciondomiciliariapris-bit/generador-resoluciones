"""
api/leer_presupuesto.py  -  Vercel Python Serverless Function

Lee un presupuesto/cotizacion (PDF) con Gemini y devuelve JSON estructurado
con el precio unitario y el total. Se usa como lector principal del cuadro
comparativo; entiende que numero es unitario y cual es total, cosa que la
lectura por regex/OCR no resuelve de forma confiable.

Variable de entorno (Vercel > Settings > Environment Variables):
    GEMINI_API_KEY = <key de https://aistudio.google.com/apikey>   (gratis, sin tarjeta)

Solo usa libreria estandar: NO agrega dependencias a requirements.txt.

POST JSON:
{
  "pdf_base64": "<PDF en base64, sin prefijo data:>",
  "mime_type": "application/pdf",
  "cantidad": 2
}

Respuesta:
{ "ok": true, "datos": {
    "proveedor": ..., "cantidad": ..., "unitario": ..., "total": ...,
    "moneda": ..., "negativa": ..., "confianza": ...
} }
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error

MODELO = "gemini-2.5-flash"  # gratis en AI Studio, sin tarjeta
URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % MODELO

PROMPT = (
    "Sos un lector de presupuestos/cotizaciones de proveedores en pesos argentinos. "
    "Lee el documento adjunto y devolve SOLO los datos economicos. Reglas: "
    "1) 'unitario' = precio de UNA sola unidad del item (por audifono / por unidad). "
    "2) 'total' = importe total del presupuesto (el importe final del documento, "
    "por ejemplo 'TOTAL PESOS ARGENTINOS'), con IVA incluido si figura. "
    "3) Si hay un precio por linea expresado por unidad, ese es el 'unitario'; "
    "el 'total' es el importe final del documento. "
    "4) Ignora DNI, CUIT, fechas, plazos de entrega, porcentajes de IVA y cualquier "
    "numero que no sea un precio. "
    "5) Numeros en formato argentino (el punto es separador de miles). Devolve los "
    "importes como enteros, sin puntos ni simbolos. "
    "6) 'negativa' = true si el documento dice que NO cotiza / declina / no presupuesta; "
    "en ese caso unitario y total pueden ir null. "
    "Si algun dato no aparece, devolvelo como null."
)

SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "proveedor": {"type": "STRING"},
        "cantidad": {"type": "INTEGER"},
        "unitario": {"type": "INTEGER"},
        "total": {"type": "INTEGER"},
        "moneda": {"type": "STRING"},
        "negativa": {"type": "BOOLEAN"},
        "confianza": {"type": "NUMBER"},
    },
}


def leer_con_gemini(pdf_base64, mime_type, cantidad, key):
    prompt = PROMPT
    if cantidad:
        try:
            prompt += " La cantidad esperada de unidades es %s." % int(cantidad)
        except (ValueError, TypeError):
            pass

    payload = {
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": mime_type or "application/pdf", "data": pdf_base64}},
                {"text": prompt},
            ]
        }],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
            "responseSchema": SCHEMA,
        },
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
    data = json.loads(raw)
    cand = (data.get("candidates") or [{}])[0]
    parts = (cand.get("content") or {}).get("parts") or [{}]
    texto = parts[0].get("text") or "{}"
    return json.loads(texto)


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, obj):
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            largo = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(largo).decode("utf-8"))
            pdf_base64 = data.get("pdf_base64")
            if not pdf_base64:
                return self._json(400, {"ok": False, "error": "Falta pdf_base64"})

            key = os.environ.get("GEMINI_API_KEY")
            if not key:
                return self._json(500, {"ok": False, "error": "Falta GEMINI_API_KEY en Vercel"})

            datos = leer_con_gemini(
                pdf_base64,
                data.get("mime_type", "application/pdf"),
                data.get("cantidad"),
                key,
            )
            return self._json(200, {"ok": True, "datos": datos, "modelo": MODELO})
        except urllib.error.HTTPError as ex:
            try:
                detalle = ex.read().decode("utf-8", "ignore")
            except Exception:
                detalle = str(ex)
            return self._json(502, {"ok": False, "error": "Gemini HTTP %s" % ex.code, "detalle": detalle})
        except Exception as ex:
            return self._json(500, {"ok": False, "error": str(ex)})
