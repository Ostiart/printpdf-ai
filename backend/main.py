from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import uuid
import requests
from analizador import analizar_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

resultados = {}

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
EMAIL_DESTINO = os.environ.get("EMAIL_DESTINO", "ostiart@gmail.com")

@app.get("/")
def inicio():
    return {"mensaje": "PrintPDF.ai API funcionando"}

@app.post("/analizar")
async def analizar(
    archivo: UploadFile = File(...),
    proceso: str = Form(...)
):
    contenido = await archivo.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(contenido)
        ruta_tmp = tmp.name

    try:
        reporte = analizar_pdf(ruta_tmp, proceso)
        id_reporte = str(uuid.uuid4())
        resultados[id_reporte] = reporte
        return {"id": id_reporte, "reporte": reporte}
    finally:
        os.unlink(ruta_tmp)

@app.get("/reporte/{id}")
def obtener_reporte(id: str):
    if id in resultados:
        return resultados[id]
    return {"error": "Reporte no encontrado"}

@app.post("/solicitar-correccion")
async def solicitar_correccion(
    nombre: str = Form(...),
    email: str = Form(...),
    detalle: str = Form(""),
    archivo_nombre: str = Form(""),
    proceso: str = Form("")
):
    if not RESEND_API_KEY:
        return {"ok": False, "error": "RESEND_API_KEY no configurada en el servidor"}

    cuerpo_html = f"""
    <h2>Nueva solicitud de correccion - PrintPDF.ai</h2>
    <p><strong>Nombre:</strong> {nombre}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Proceso de impresion:</strong> {proceso or 'No especificado'}</p>
    <p><strong>Archivo analizado:</strong> {archivo_nombre or 'No especificado'}</p>
    <p><strong>Detalle del cliente:</strong></p>
    <p>{detalle or 'Sin detalles adicionales'}</p>
    <hr>
    <p style="color:#888;font-size:12px">Enviado automaticamente desde printpdf.ai</p>
    """

    try:
        respuesta = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "PrintPDF.ai <onboarding@resend.dev>",
                "to": [EMAIL_DESTINO],
                "reply_to": email,
                "subject": f"Solicitud de correccion - {nombre}",
                "html": cuerpo_html,
            },
            timeout=15,
        )
        if respuesta.status_code in (200, 201):
            return {"ok": True}
        else:
            return {"ok": False, "error": respuesta.text}
    except Exception as e:
        return {"ok": False, "error": str(e)}
