from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import uuid
from analizador import analizar_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

resultados = {}

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