import fitz
import pikepdf
import json
import os

with open(os.path.join(os.path.dirname(__file__), "perfiles.json"), "r", encoding="utf-8") as f:
    PERFILES = json.load(f)["perfiles"]

def analizar_pdf(ruta, perfil_nombre="Offset Estucado"):
    perfil = PERFILES.get(perfil_nombre)
    if not perfil:
        return {"error": "Perfil no encontrado"}

    doc = fitz.open(ruta)
    pagina = doc[0]

    ancho = round(pagina.rect.width * 0.352778, 2)
    alto = round(pagina.rect.height * 0.352778, 2)
    paginas = doc.page_count

    fuentes = doc.get_page_fonts(0)
    fuentes_incrustadas = all(f[3] for f in fuentes)

    with pikepdf.open(ruta) as pdf:
        try:
            output_intent = pdf.Root.get("/OutputIntents")
            if output_intent:
                nombre_icc = str(output_intent[0].get("/OutputConditionIdentifier", "Desconocido"))
            else:
                nombre_icc = "Sin perfil ICC"
        except:
            nombre_icc = "Sin perfil ICC"

        try:
            pagina_pdf = pdf.pages[0]
            media = pagina_pdf.get("/MediaBox", None)
            trim = pagina_pdf.get("/TrimBox", None)
            bleed = pagina_pdf.get("/BleedBox", None)

            def box_to_mm(box):
                if box is None:
                    return None
                pts = [float(x) for x in box]
                return {
                    "ancho": round((pts[2] - pts[0]) * 0.352778, 2),
                    "alto": round((pts[3] - pts[1]) * 0.352778, 2)
                }

            trim_mm = box_to_mm(trim)
            bleed_mm = box_to_mm(bleed)
            media_mm = box_to_mm(media)

            if trim_mm and bleed_mm:
                sangrado_h = round((bleed_mm["ancho"] - trim_mm["ancho"]) / 2, 2)
                sangrado_v = round((bleed_mm["alto"] - trim_mm["alto"]) / 2, 2)
            elif trim_mm and media_mm:
                sangrado_h = round((media_mm["ancho"] - trim_mm["ancho"]) / 2, 2)
                sangrado_v = round((media_mm["alto"] - trim_mm["alto"]) / 2, 2)
            else:
                sangrado_h = 0
                sangrado_v = 0

            tiene_trimbox = trim_mm is not None
            tiene_bleedbox = bleed_mm is not None

        except:
            sangrado_h = 0
            sangrado_v = 0
            tiene_trimbox = False
            tiene_bleedbox = False
            trim_mm = None
            bleed_mm = None

    imagenes = pagina.get_images(full=True)
    resoluciones = []
    colores_rgb = 0
    colores_cmyk = 0
    perfiles_imagenes = []

    for img in imagenes:
        xref = img[0]
        imagen_info = doc.extract_image(xref)
        cs = imagen_info.get("colorspace", 0)
        if cs == 3:
            colores_rgb += 1
        elif cs == 4:
            colores_cmyk += 1
        perfil_img = imagen_info.get("cs-name", "Sin perfil")
        if perfil_img not in perfiles_imagenes:
            perfiles_imagenes.append(perfil_img)
        ancho_px = imagen_info.get("width", 0)
        for item in pagina.get_image_rects(xref):
            ancho_pts = item.width
            if ancho_pts > 0:
                dpi = round((ancho_px / ancho_pts) * 72, 0)
                resoluciones.append(dpi)

    dpi_minimo = min(resoluciones) if resoluciones else 0

    problemas = []
    advertencias = []

    if dpi_minimo > 0 and dpi_minimo < perfil["dpi_minimo"]:
        problemas.append("Resolucion muy baja: " + str(dpi_minimo) + " DPI (minimo " + str(perfil["dpi_minimo"]) + " DPI)")
    elif dpi_minimo > 0 and dpi_minimo < perfil["dpi_ideal"]:
        advertencias.append("Resolucion aceptable: " + str(dpi_minimo) + " DPI (ideal " + str(perfil["dpi_ideal"]) + " DPI)")

    if colores_rgb > 0 and perfil["rgb_es_error"]:
        problemas.append(str(colores_rgb) + " imagen(es) en RGB - requiere CMYK")

    if not fuentes_incrustadas:
        problemas.append("Fuentes NO incrustadas")

    if nombre_icc == "Sin perfil ICC":
        advertencias.append("Documento sin perfil ICC")

    if len(perfiles_imagenes) > 1:
        advertencias.append("Mezcla de perfiles ICC en imagenes")

    sangrado_minimo = perfil["sangrado_minimo_mm"]
    if sangrado_h == 0 and sangrado_v == 0:
        problemas.append("Sin sangrado detectado")
    elif sangrado_h < sangrado_minimo or sangrado_v < sangrado_minimo:
        advertencias.append("Sangrado insuficiente: " + str(sangrado_h) + "mm / " + str(sangrado_v) + "mm (minimo " + str(sangrado_minimo) + "mm)")

    if not tiene_trimbox:
        advertencias.append("Sin TrimBox - marcas de corte no detectadas")

    if problemas:
        estado = "corregir"
    elif advertencias:
        estado = "revisar"
    else:
        estado = "aprobado"

    return {
        "proceso": perfil["proceso"],
        "paginas": paginas,
        "tamano_final": trim_mm if trim_mm else {"ancho": ancho, "alto": alto},
        "tamano_sangrado": bleed_mm,
        "sangrado_h": sangrado_h,
        "sangrado_v": sangrado_v,
        "tiene_trimbox": tiene_trimbox,
        "tiene_bleedbox": tiene_bleedbox,
        "perfil_icc": nombre_icc,
        "color": "CMYK" if colores_rgb == 0 else "RGB/CMYK",
        "rgb_detectado": colores_rgb > 0,
        "dpi_minimo": dpi_minimo,
        "fuentes_incrustadas": fuentes_incrustadas,
        "advertencias": advertencias,
        "problemas": problemas,
        "estado": estado
    }