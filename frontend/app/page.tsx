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

const COLORS = {
  primary: "#6D5CFF",
  secondary: "#4F7CFF",
  dark: "#0F172A",
  bg: "#FAFAFC",
  border: "#EAEAEA",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
};

const CHECKS = [
  { icon: "◎", t: "Resolucion de imagen", d: "DPI efectivo segun tamano real", color: COLORS.primary },
  { icon: "▣", t: "Sangrado y margenes", d: "Area de seguridad por proceso", color: COLORS.secondary },
  { icon: "◐", t: "Espacio de color", d: "Deteccion CMYK vs RGB", color: COLORS.success },
  { icon: "Aa", t: "Fuentes incrustadas", d: "Embebidas o faltantes", color: COLORS.primary },
  { icon: "▦", t: "Perfil ICC", d: "FOGRA39, GRACoL y mas", color: COLORS.secondary },
  { icon: "⬚", t: "Tamano de pagina", d: "TrimBox y BleedBox reales", color: COLORS.warning },
];

const PERFILES = [
  { t: "Diseñadores", d: "Valida antes de entregar." },
  { t: "Agencias", d: "Estandariza la calidad." },
  { t: "Imprentas", d: "Reduce reimpresiones." },
  { t: "Packaging", d: "Sin sorpresas en troquel." },
  { t: "Sublimacion", d: "Perfiles de gran formato." },
  { t: "Gran formato", d: "DPI correcto siempre." },
];

export default function Home() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [proceso, setProceso] = useState("Offset Estucado");
  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mostrarFormCorreccion, setMostrarFormCorreccion] = useState(false);
  const [formEnviado, setFormEnviado] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", detalle: "" });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const analizar = async (file: File | null) => {
    const f = file || archivo;
    if (!f) {
      alert("Selecciona un PDF primero");
      return;
    }
    setCargando(true);
    setReporte(null);
    const formData = new FormData();
    formData.append("archivo", f);
    formData.append("proceso", proceso);
    try {
      const res = await fetch(`${API_URL}/analizar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setReporte(data.reporte);
    } catch (error) {
      alert("Error al conectar con el servidor. Intenta de nuevo en unos segundos.");
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setArchivo(null);
    setReporte(null);
  };

  const enviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    const asunto = encodeURIComponent(`Solicitud de correccion - ${formData.nombre || "Sin nombre"}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${formData.nombre}\nEmail: ${formData.email}\nArchivo analizado: ${archivo?.name || "No especificado"}\nProceso: ${proceso}\n\nDetalle:\n${formData.detalle}`
    );
    window.location.href = `mailto:ostiart@gmail.com?subject=${asunto}&body=${cuerpo}`;
    setFormEnviado(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") setArchivo(file);
  };

  const colorEstado = (estado: string) => {
    if (estado === "aprobado") return COLORS.success;
    if (estado === "revisar") return COLORS.warning;
    if (estado === "corregir") return COLORS.error;
    return "#6b7280";
  };

  const textoEstado = (estado: string) => {
    if (estado === "aprobado") return "APROBADO";
    if (estado === "revisar") return "REQUIERE REVISION";
    if (estado === "corregir") return "CORREGIR";
    return estado;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.dark,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* HERO + NAV con elementos decorativos */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Gradiente mesh vibrante cian-magenta, solo en el hero */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 20%, #22D3EE 0%, transparent 45%), " +
              "radial-gradient(circle at 85% 15%, #818CF8 0%, transparent 50%), " +
              "radial-gradient(circle at 75% 85%, #EC4899 0%, transparent 50%), " +
              "radial-gradient(circle at 25% 90%, #6D5CFF 0%, transparent 45%), " +
              "linear-gradient(135deg, #38BDF8, #6D5CFF 45%, #EC4899 100%)",
            opacity: 0.92,
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(60px)",
            zIndex: 0,
          }}
        />
        {/* Glows animados extra, dan movimiento sutil al mesh */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -180,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#67E8F9",
            opacity: 0.35,
            filter: "blur(110px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -220,
            right: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "#F472B6",
            opacity: 0.3,
            filter: "blur(120px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "30%",
            right: -100,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#A78BFA",
            opacity: 0.25,
            filter: "blur(100px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {/* Ilustracion tecnica: roseta CMYK + marcas de preprensa, opacidad baja sobre el mesh */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMaxYMax slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.5, mixBlendMode: "overlay" }}
        >
          <defs>
            <pattern id="microGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={COLORS.dark} strokeWidth="0.5" />
            </pattern>
            <pattern id="halftoneScatter" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
              <circle cx="13" cy="13" r="2.2" fill={COLORS.primary} opacity="0.5" />
            </pattern>
          </defs>

          {/* Grid tecnico muy sutil, solo lado derecho */}
          <rect x="900" width="1020" height="1080" fill="url(#microGrid)" opacity="0.05" />

          {/* Roseta CMYK: anillos concentricos en esquina inferior derecha */}
          <g transform="translate(1620,1000)" opacity="0.9">
            {[...Array(10)].map((_, i) => {
              const colors = ["#4F7CFF", "#EF4444", "#F59E0B", "#0F172A"];
              const r = 90 + i * 38;
              return (
                <circle
                  key={i}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke={colors[i % 4]}
                  strokeWidth="1.4"
                  opacity={0.1 - i * 0.005}
                />
              );
            })}
            {/* Puntos de semitono dentro de la roseta, angulos CMYK reales */}
            <g transform="rotate(15)" opacity="0.12">
              <circle cx="160" cy="0" r="5" fill="#4F7CFF" />
              <circle cx="240" cy="60" r="6" fill="#4F7CFF" />
              <circle cx="100" cy="-140" r="4" fill="#4F7CFF" />
            </g>
            <g transform="rotate(75)" opacity="0.1">
              <circle cx="200" cy="-30" r="5" fill="#EF4444" />
              <circle cx="120" cy="120" r="4" fill="#EF4444" />
            </g>
            <g transform="rotate(0)" opacity="0.1">
              <circle cx="-180" cy="80" r="5" fill="#F59E0B" />
              <circle cx="-100" cy="-160" r="4" fill="#F59E0B" />
            </g>
            <g transform="rotate(45)" opacity="0.08">
              <circle cx="-220" cy="-60" r="4" fill="#0F172A" />
            </g>
          </g>

          {/* Marcas de registro dispersas */}
          <g opacity="0.14" stroke={COLORS.dark} strokeWidth="1" fill="none">
            <circle cx="1180" cy="160" r="16" />
            <line x1="1180" y1="132" x2="1180" y2="188" />
            <line x1="1152" y1="160" x2="1208" y2="160" />
          </g>
          <g opacity="0.12" stroke={COLORS.primary} strokeWidth="1" fill="none">
            <circle cx="1480" cy="640" r="13" />
            <line x1="1480" y1="617" x2="1480" y2="663" />
            <line x1="1457" y1="640" x2="1503" y2="640" />
          </g>

          {/* Cruces de alineacion */}
          <g opacity="0.1" stroke={COLORS.dark} strokeWidth="1">
            <line x1="1340" y1="80" x2="1340" y2="110" />
            <line x1="1325" y1="95" x2="1355" y2="95" />
          </g>
          <g opacity="0.1" stroke={COLORS.secondary} strokeWidth="1">
            <line x1="1020" y1="900" x2="1020" y2="930" />
            <line x1="1005" y1="915" x2="1035" y2="915" />
          </g>

          {/* Lineas tecnicas finas */}
          <g opacity="0.08" stroke={COLORS.dark} strokeWidth="0.75">
            <line x1="950" y1="0" x2="950" y2="1080" />
            <path d="M 950 540 C 1200 480, 1400 700, 1700 600" fill="none" />
          </g>

          {/* Puntos de semitono dispersos extra */}
          <rect x="1300" y="200" width="300" height="300" fill="url(#halftoneScatter)" opacity="0.06" />

          {/* Particulas flotantes animadas */}
          <g>
            {[
              { x: 120, y: 140, r: 3, c: COLORS.primary, dur: "9s", dy: -26 },
              { x: 340, y: 320, r: 2.4, c: COLORS.secondary, dur: "11s", dy: 22 },
              { x: 560, y: 90, r: 2, c: COLORS.warning, dur: "8s", dy: -18 },
              { x: 760, y: 420, r: 3.2, c: COLORS.primary, dur: "13s", dy: 28 },
              { x: 220, y: 560, r: 2.2, c: COLORS.error, dur: "10s", dy: -20 },
              { x: 880, y: 180, r: 2.6, c: COLORS.secondary, dur: "12s", dy: 24 },
              { x: 1050, y: 520, r: 2, c: COLORS.success, dur: "9.5s", dy: -22 },
              { x: 1300, y: 760, r: 3, c: COLORS.primary, dur: "14s", dy: 30 },
              { x: 1550, y: 300, r: 2.4, c: COLORS.warning, dur: "10.5s", dy: -24 },
              { x: 1750, y: 850, r: 2.8, c: COLORS.error, dur: "11.5s", dy: 26 },
              { x: 480, y: 700, r: 2, c: COLORS.success, dur: "8.5s", dy: -16 },
              { x: 1150, y: 920, r: 2.6, c: COLORS.secondary, dur: "12.5s", dy: 20 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} opacity="0.16">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0 0; 0 ${p.dy}; 0 0`}
                  dur={p.dur}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.16;0.3;0.16"
                  dur={p.dur}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </svg>


        {/* NAVBAR flotante */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 28px",
            maxWidth: 1240,
            margin: "16px auto 0",
            position: "relative",
            zIndex: 1,
            background: "#ffffff",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#fff",
                }}
              >
                P
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.dark }}>PrintPDF.ai</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 14, color: "#475569" }}>
              <a href="#analiza" style={navLinkStyle}>Como funciona</a>
              <a href="#correccion-profesional" style={navLinkStyle}>Correccion profesional</a>
              <a href="#casos" style={navLinkStyle}>Casos de uso</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.dark, fontWeight: 500, padding: "8px 14px" }}>Iniciar sesion</span>
            <a
              href="#uploader"
              style={{
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: "#fff",
                borderRadius: 9,
                textDecoration: "none",
              }}
            >
              Probar gratis
            </a>
          </div>
        </nav>

        {/* HERO content - CTA unificado, uploader como elemento central */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "64px 28px 56px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(8px)",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "#fff",
              marginBottom: 22,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#fff" }} />
            TU DEPARTAMENTO DE PREPRENSA EN LA NUBE
          </div>
          <h1
            style={{
              fontSize: 44,
              lineHeight: 1.12,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 16,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 24px rgba(0,0,0,0.15)",
            }}
          >
            Tu departamento de preprensa{" "}
            <span style={{ color: "#FEF3C7" }}>
              en la nube
            </span>
          </h1>
          <p style={{ fontSize: 16.5, color: "rgba(255,255,255,0.88)", marginBottom: 36, maxWidth: 420, lineHeight: 1.55, margin: "0 auto 36px" }}>
            Sube tu PDF. Detectamos errores antes de imprimir.
          </p>

          {/* UPLOADER - unico punto de entrada */}
          <div
            id="uploader"
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 26,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
              textAlign: "left",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              style={{
                border: `1.5px dashed ${arrastrando ? COLORS.primary : "#d4d4d8"}`,
                borderRadius: 14,
                padding: "40px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: arrastrando ? "#f5f3ff" : "#fafafc",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  margin: "0 auto 12px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                ↑
              </div>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.dark, marginBottom: 4 }}>
                {archivo ? archivo.name : "Arrastra tu PDF aqui"}
              </div>
              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
                {archivo ? "Listo para analizar" : "o haz clic para seleccionar · Max 2GB"}
              </div>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
            </div>

            {/* Acordeon opcional de proceso de impresion */}
            <button
              onClick={() => setMostrarOpciones((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 2px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#64748b",
                marginBottom: mostrarOpciones ? 10 : 14,
              }}
            >
              <span>Ajustar proceso de impresion (opcional)</span>
              <span style={{ transform: mostrarOpciones ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                ⌄
              </span>
            </button>
            {mostrarOpciones && (
              <select
                value={proceso}
                onChange={(e) => setProceso(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  fontSize: 14,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: "#fafafc",
                  color: COLORS.dark,
                  marginBottom: 14,
                  outline: "none",
                }}
              >
                {PROCESOS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => analizar(null)}
              disabled={cargando}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 14.5,
                fontWeight: 600,
                background: cargando ? "#cbd5e1" : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: "#fff",
                border: "none",
                borderRadius: 11,
                cursor: cargando ? "default" : "pointer",
                boxShadow: cargando ? "none" : "0 8px 24px rgba(109,92,255,0.25)",
              }}
            >
              {cargando ? "Analizando..." : "Analizar PDF →"}
            </button>
            <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>
              🔒 Tus archivos estan seguros y confidenciales
            </div>
          </div>

          {/* Trust badges con iconos */}
          <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 34, flexWrap: "wrap" }}>
            {[
              { icon: "⚡", t: "Rapido" },
              { icon: "🎯", t: "Preciso" },
              { icon: "⚙", t: "Automatico" },
              { icon: "🛡", t: "Confiable" },
            ].map((b) => (
              <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                {b.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FRANJA DE PRUEBA SOCIAL */}
      <div style={{ background: "#F1F0FB", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "22px 28px",
            display: "flex",
            justifyContent: "center",
            gap: 56,
            flexWrap: "wrap",
          }}
        >
          {[
            { v: "12,400+", l: "PDFs analizados" },
            { v: "8+", l: "verificaciones" },
            { v: "4.8/5", l: "satisfaccion de imprentas" },
          ].map((m) => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>{m.v}</div>
              <div style={{ fontSize: 12.5, color: "#64748b" }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RESULTADO REAL */}
      {reporte && (
        <section style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 18,
              padding: 26,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: 999,
                background: colorEstado(reporte.estado),
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {textoEstado(reporte.estado)}
            </div>
            <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 700, color: COLORS.dark }}>{reporte.proceso}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 24px", fontSize: 14 }}>
              <Fila label="Tamano final" value={`${reporte.tamano_final?.ancho} x ${reporte.tamano_final?.alto} mm`} />
              <Fila label="Sangrado" value={`${reporte.sangrado_h}mm / ${reporte.sangrado_v}mm`} />
              <Fila label="Color" value={reporte.color} />
              <Fila label="Perfil ICC" value={reporte.perfil_icc} />
              <Fila label="DPI minimo" value={reporte.dpi_minimo} />
              <Fila label="Fuentes incrustadas" value={reporte.fuentes_incrustadas ? "Si" : "No"} />
            </div>
            {reporte.advertencias?.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <strong style={{ color: COLORS.warning, fontSize: 13 }}>⚠ ADVERTENCIAS</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  {reporte.advertencias.map((a: string, i: number) => (
                    <li key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {reporte.problemas?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong style={{ color: COLORS.error, fontSize: 13 }}>✕ PROBLEMAS</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  {reporte.problemas.map((p: string, i: number) => (
                    <li key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {(reporte.estado === "revisar" || reporte.estado === "corregir") && (
                <a
                  href="#correccion-profesional"
                  onClick={() => setMostrarFormCorreccion(true)}
                  style={{
                    flex: 1,
                    padding: 13,
                    fontSize: 14,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "center",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  Solicitar correccion
                </a>
              )}
              <button
                onClick={limpiar}
                style={{
                  flex: 1,
                  padding: 13,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#fff",
                  color: "#475569",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Limpiar y subir otro
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VERIFICACIONES */}
      <section id="analiza" style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 28px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>
          Verificaciones automaticas de preprensa
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.dark, marginBottom: 30 }}>
          Que analizamos en cada archivo
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {CHECKS.map((c) => (
            <div
              key={c.t}
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "20px 16px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  marginBottom: 12,
                  borderRadius: 10,
                  background: `${c.color}14`,
                  color: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {c.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.dark, marginBottom: 3 }}>{c.t}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CORRECCION PROFESIONAL - servicio pago, sin precios fijos */}
      <section id="correccion-profesional" style={{ background: "#F8F7FF", padding: "70px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>
                Servicio profesional
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: COLORS.dark, marginBottom: 14, lineHeight: 1.2 }}>
                ¿Tu imprenta rechazo tu archivo?
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
                El analisis gratis te dice que esta mal. Nuestro equipo lo
                corrige con 20+ años de experiencia en preprensa real, para
                que llegue listo a produccion.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", marginBottom: 28 }}>
                {[
                  "TAC (cobertura de tinta)",
                  "Negro enriquecido",
                  "Trapping",
                  "Pantones y separaciones",
                  "Sobreimpresion",
                  "Spot UV / Foil",
                  "Troqueles",
                  "PDF/X validado",
                ].map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#334155" }}>
                    <span style={{ color: COLORS.primary, fontWeight: 700 }}>✓</span>
                    {s}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
                Cotizamos cada archivo segun su complejidad. Sin planes
                genericos, sin sorpresas.
              </div>
            </div>

            {/* Formulario de contacto */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 18,
                padding: 26,
              }}
            >
              {formEnviado ? (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.dark, marginBottom: 6 }}>
                    Se abrio tu cliente de correo
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b" }}>
                    Si no se abrio automaticamente, escribenos a{" "}
                    <strong>ostiart@gmail.com</strong> directamente.
                  </p>
                  <button
                    onClick={() => setFormEnviado(false)}
                    style={{
                      marginTop: 14,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      background: "transparent",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 9,
                      cursor: "pointer",
                      color: COLORS.dark,
                    }}
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <form onSubmit={enviarSolicitud}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.dark, marginBottom: 4 }}>
                    Solicitar correccion
                  </div>
                  <p style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 18 }}>
                    Te respondemos con una cotizacion en menos de 24 horas.
                  </p>
                  <input
                    required
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Tu email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                  <textarea
                    placeholder="Cuentanos que necesitas corregir (opcional)"
                    value={formData.detalle}
                    onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  />
                  {archivo && (
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                      📎 Archivo analizado: <strong>{archivo.name}</strong>
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: 13,
                      fontSize: 14,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    Enviar solicitud →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section id="casos" style={{ maxWidth: 1240, margin: "0 auto", padding: "10px 28px 70px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>
          Diseñado para profesionales
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.dark, marginBottom: 30 }}>
          Para quien exige calidad
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {PERFILES.map((p) => (
            <div
              key={p.t}
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "16px 14px",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.dark, marginBottom: 4 }}>{p.t}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{p.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px 80px" }}>
        <div
          style={{
            background: COLORS.dark,
            borderRadius: 24,
            padding: "56px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 30% 30%, ${COLORS.primary}33, transparent 60%)`,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
              Analiza tu primer PDF gratis
            </h2>
            <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 26 }}>Sin tarjeta de credito.</p>
            <a
              href="#uploader"
              style={{
                display: "inline-block",
                padding: "15px 34px",
                fontSize: 15,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: "#fff",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Sube tu PDF gratis →
            </a>
          </div>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: 12,
          color: "#94a3b8",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        PrintPDF.ai — Sube tu archivo, te decimos si se imprimira correctamente.
      </footer>
    </div>
  );
}

function Fila({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#0F172A" }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontSize: 13.5,
  borderRadius: 10,
  border: "1px solid #EAEAEA",
  background: "#fafafc",
  color: "#0F172A",
  marginBottom: 12,
  outline: "none",
  boxSizing: "border-box",
};

const navLinkStyle: React.CSSProperties = {
  color: "#475569",
  textDecoration: "none",
  fontWeight: 500,
};
