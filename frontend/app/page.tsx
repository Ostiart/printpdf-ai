"use client";

import { useState } from "react";

const PROCESOS = [
  "Offset Estucado",
  "Offset Sin Estucar",
  "Periodico",
  "Gran Formato",
  "Sublimacion",
  "DTF",
  "Flexografia",
  "Serigrafia",
  "Rotograbado",
];

export default function Home() {
  const [archivo, setArchivo] = useState(null);
  const [proceso, setProceso] = useState("Offset Estucado");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const analizar = async () => {
    if (!archivo) {
      alert("Selecciona un PDF primero");
      return;
    }

    setCargando(true);
    setReporte(null);

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("proceso", proceso);

    try {
      const res = await fetch("http://127.0.0.1:8000/analizar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setReporte(data.reporte);
    } catch (error) {
      alert("Error al conectar con el servidor. Verifica que el backend este corriendo.");
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setArchivo(null);
    setReporte(null);
  };

  const colorEstado = (estado) => {
    if (estado === "aprobado") return "#16a34a";
    if (estado === "revisar") return "#ca8a04";
    if (estado === "corregir") return "#dc2626";
    return "#6b7280";
  };

  const textoEstado = (estado) => {
    if (estado === "aprobado") return "APROBADO";
    if (estado === "revisar") return "REVISAR";
    if (estado === "corregir") return "CORREGIR";
    return estado;
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>PrintPDF.ai</h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Sube tu archivo, te decimos si se imprimira correctamente.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          Proceso de impresion
        </label>
        <select
          value={proceso}
          onChange={(e) => setProceso(e.target.value)}
          style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}
        >
          {PROCESOS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          Archivo PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
          style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
      </div>

      <button
        onClick={analizar}
        disabled={cargando}
        style={{
          width: "100%",
          padding: 14,
          fontSize: 16,
          fontWeight: "bold",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {cargando ? "Analizando..." : "Analizar PDF"}
      </button>

      {reporte && (
        <div style={{ marginTop: 32, padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              backgroundColor: colorEstado(reporte.estado),
              color: "white",
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            {textoEstado(reporte.estado)}
          </div>

          <h2 style={{ fontSize: 18, marginBottom: 8 }}>{reporte.proceso}</h2>

          <table style={{ width: "100%", fontSize: 14, marginTop: 16 }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Tamano final</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {reporte.tamano_final?.ancho} x {reporte.tamano_final?.alto} mm
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Sangrado</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {reporte.sangrado_h}mm / {reporte.sangrado_v}mm
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Color</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>{reporte.color}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Perfil ICC</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>{reporte.perfil_icc}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>DPI minimo</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>{reporte.dpi_minimo}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Fuentes incrustadas</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {reporte.fuentes_incrustadas ? "Si" : "No"}
                </td>
              </tr>
            </tbody>
          </table>

          {reporte.advertencias && reporte.advertencias.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong style={{ color: "#ca8a04" }}>Advertencias:</strong>
              <ul>
                {reporte.advertencias.map((a, i) => (
                  <li key={i} style={{ fontSize: 14 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {reporte.problemas && reporte.problemas.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong style={{ color: "#dc2626" }}>Problemas:</strong>
              <ul>
                {reporte.problemas.map((p, i) => (
                  <li key={i} style={{ fontSize: 14 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {(reporte.estado === "revisar" || reporte.estado === "corregir") && (
            <button
              style={{
                width: "100%",
                padding: 12,
                marginTop: 20,
                fontSize: 15,
                fontWeight: "bold",
                backgroundColor: "#111827",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Solicitar correccion
            </button>
          )}

          <button
            onClick={limpiar}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 10,
              fontSize: 15,
              fontWeight: "bold",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Limpiar y subir otro archivo
          </button>
        </div>
      )}
    </div>
  );
}