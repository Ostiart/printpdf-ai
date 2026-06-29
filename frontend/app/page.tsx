"use client";

import { useState, useEffect } from "react";

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

const PANEL_CHECKS = [
  { label: "Sangrado", ok: true },
  { label: "Resolución", ok: true },
  { label: "Fuentes", ok: true },
  { label: "Perfil ICC", ok: false },
  { label: "TAC", ok: false },
  { label: "PDF/X", ok: true },
];

export default function Home() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [proceso, setProceso] = useState("Offset Estucado");
  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mostrarFormCorreccion, setMostrarFormCorreccion] = useState(false);
  const [formEnviado, setFormEnviado] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", detalle: "" });
  const [panelFase, setPanelFase] = useState(0);

  // Animación del panel de inspección: 0=spinner, 1-6=checklist, 7=score, 8=botón → loop
  useEffect(() => {
    const delays = [1800, 500, 500, 500, 500, 500, 500, 700, 3000];
    let timeoutId: ReturnType<typeof setTimeout>;
    let fase = 0;
    const avanzar = () => {
      fase = (fase + 1) % 9;
      setPanelFase(fase);
      timeoutId = setTimeout(avanzar, delays[fase]);
    };
    timeoutId = setTimeout(avanzar, delays[0]);
    return () => clearTimeout(timeoutId);
  }, []);

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

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoForm(true);
    setErrorForm("");

    const formBody = new FormData();
    formBody.append("nombre", formData.nombre);
    formBody.append("email", formData.email);
    formBody.append("detalle", formData.detalle);
    formBody.append("archivo_nombre", archivo?.name || "");
    formBody.append("proceso", proceso);

    try {
      const res = await fetch(`${API_URL}/solicitar-correccion`, {
        method: "POST",
        body: formBody,
      });
      const data = await res.json();
      if (data.ok) {
        setFormEnviado(true);
      } else {
        setErrorForm("No se pudo enviar. Intenta de nuevo o escribenos a ostiart@gmail.com");
      }
    } catch (error) {
      setErrorForm("Error de conexion. Intenta de nuevo o escribenos a ostiart@gmail.com");
    } finally {
      setEnviandoForm(false);
    }
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
        fontFamily: "var(--font-plus-jakarta-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* HERO — navy, centrado estilo WeTransfer */}
      <div style={{ position: "relative", overflow: "hidden", background: "#0D0B1E", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Glows ambientales */}
        <div aria-hidden="true" style={{ position: "absolute", top: -160, left: -160, width: 560, height: 560, borderRadius: "50%", background: "#00E5FF", opacity: 0.06, filter: "blur(120px)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -160, right: -160, width: 620, height: 620, borderRadius: "50%", background: "#FF2D78", opacity: 0.06, filter: "blur(130px)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, borderRadius: "50%", background: "#6D5CFF", opacity: 0.04, filter: "blur(100px)", pointerEvents: "none" }} />

        {/* Elementos de preprensa sutiles en SVG */}
        <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <pattern id="finegrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>
          {/* Grid técnico fino */}
          <rect width="1440" height="900" fill="url(#finegrid)" />
          {/* Marcas de registro esquinas */}
          {[
            { cx: 60,   cy: 60   },
            { cx: 1380, cy: 60   },
            { cx: 60,   cy: 840  },
            { cx: 1380, cy: 840  },
          ].map((m, i) => (
            <g key={i} opacity="0.12" stroke="#00E5FF" strokeWidth="1" fill="none">
              <circle cx={m.cx} cy={m.cy} r="12" />
              <line x1={m.cx - 18} y1={m.cy} x2={m.cx + 18} y2={m.cy} />
              <line x1={m.cx} y1={m.cy - 18} x2={m.cx} y2={m.cy + 18} />
            </g>
          ))}
          {/* Partículas flotantes */}
          {[
            { x: 90,   y: 140,  r: 1.1, c: "#00E5FF", dur: "9s",   dy: -16 },
            { x: 260,  y: 280,  r: 0.8, c: "#fff",    dur: "12s",  dy: 14  },
            { x: 1180, y: 160,  r: 1,   c: "#FF2D78", dur: "10s",  dy: -18 },
            { x: 1340, y: 400,  r: 1.3, c: "#00E5FF", dur: "13s",  dy: 20  },
            { x: 140,  y: 680,  r: 0.9, c: "#FF2D78", dur: "8s",   dy: -14 },
            { x: 1260, y: 720,  r: 1,   c: "#fff",    dur: "11s",  dy: 16  },
            { x: 700,  y: 60,   r: 0.8, c: "#00E5FF", dur: "7.5s", dy: -12 },
            { x: 420,  y: 820,  r: 1.2, c: "#FF2D78", dur: "14s",  dy: 18  },
            { x: 980,  y: 800,  r: 0.7, c: "#fff",    dur: "10.5s",dy: -16 },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} opacity="0.45">
              <animateTransform attributeName="transform" type="translate" values={`0 0;0 ${p.dy};0 0`} dur={p.dur} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0.75;0.45" dur={p.dur} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* NAVBAR transparente */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", position: "relative", zIndex: 1, background: "transparent", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #00E5FF, #FF2D78)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>P</div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "rgba(255,255,255,0.9)" }}>PrintPDF.ai</span>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
              <a href="#analiza" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 500 }}>Como funciona</a>
              <a href="#correccion-profesional" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 500 }}>Correccion profesional</a>
              <a href="#casos" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 500 }}>Casos de uso</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Iniciar sesion</span>
            <a href="#uploader" style={{ padding: "9px 18px", fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg, #00E5FF, #FF2D78)", color: "#fff", borderRadius: 9, textDecoration: "none" }}>
              Probar gratis
            </a>
          </div>
        </nav>

        {/* CONTENIDO CENTRADO */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px 64px", position: "relative", zIndex: 1, textAlign: "center" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: "#00E5FF", display: "inline-block" }} />
            PREPRENSA AUTOMATIZADA
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 64,
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: "#fff",
            marginBottom: 32,
            maxWidth: 760,
          }}>
            <span style={{ display: "block" }}>Analiza tu PDF.</span>
            <span style={{
              display: "block",
              background: "linear-gradient(90deg, #00E5FF 0%, #7C3AED 50%, #FF2D78 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Antes de imprimir.
            </span>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 56,
            maxWidth: 460,
          }}>
            Detectamos errores de preprensa antes de que lleguen a la imprenta.
          </p>

          {/* UPLOADER grande — estilo WeTransfer */}
          <div
            id="uploader"
            style={{ width: "100%", maxWidth: 640, marginBottom: 16 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              style={{
                border: `2px dashed ${arrastrando ? "#00E5FF" : "rgba(255,255,255,0.15)"}`,
                borderRadius: 20,
                padding: "56px 32px",
                cursor: "pointer",
                background: arrastrando ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.03)",
                transition: "border-color 0.2s, background 0.2s",
                marginBottom: 12,
              }}
            >
              {/* Icono upload */}
              <div style={{ width: 64, height: 64, margin: "0 auto 20px", borderRadius: 18, background: "linear-gradient(135deg, #00E5FF, #FF2D78)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", boxShadow: "0 12px 32px rgba(0,229,255,0.25)" }}>↑</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>
                {archivo ? archivo.name : "Arrastra tu PDF aquí"}
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.38)" }}>
                {archivo ? "Listo para analizar" : "o haz clic para seleccionar · Max 2 GB"}
              </div>
              <input id="file-input" type="file" accept=".pdf" onChange={(e) => setArchivo(e.target.files?.[0] || null)} style={{ display: "none" }} />
            </div>

            {/* Proceso acordeón */}
            <button onClick={() => setMostrarOpciones((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 4px", background: "transparent", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: mostrarOpciones ? 10 : 16 }}>
              <span>Ajustar proceso de impresion (opcional)</span>
              <span style={{ transform: mostrarOpciones ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>⌄</span>
            </button>
            {mostrarOpciones && (
              <select value={proceso} onChange={(e) => setProceso(e.target.value)} style={{ width: "100%", padding: "11px 14px", fontSize: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", marginBottom: 14, outline: "none" }}>
                {PROCESOS.map((p) => (<option key={p} value={p} style={{ background: "#1a1830", color: "#fff" }}>{p}</option>))}
              </select>
            )}

            <button onClick={() => analizar(null)} disabled={cargando} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: cargando ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00E5FF, #FF2D78)", color: cargando ? "rgba(255,255,255,0.35)" : "#fff", border: "none", borderRadius: 13, cursor: cargando ? "default" : "pointer", boxShadow: cargando ? "none" : "0 8px 28px rgba(0,229,255,0.22)" }}>
              {cargando ? "Analizando..." : "Analizar PDF →"}
            </button>

            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 12 }}>
              🔒 Tus archivos son privados y se eliminan tras el análisis
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 56, flexWrap: "wrap" }}>
            {[{ icon: "⚡", t: "Rapido" }, { icon: "🎯", t: "Preciso" }, { icon: "⚙", t: "Automatico" }, { icon: "🛡", t: "Confiable" }].map((b) => (
              <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                <span style={{ fontSize: 13 }}>{b.icon}</span>{b.t}
              </div>
            ))}
          </div>

          {/* TARJETA DE INSPECCIÓN ANIMADA */}
          <div style={{ width: "100%", maxWidth: 520 }}>
            {/* Label */}
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)", marginBottom: 12, textAlign: "left" }}>
              EJEMPLO DE ANÁLISIS EN TIEMPO REAL
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,229,255,0.18)", borderRadius: 18, padding: 22, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 0 48px rgba(0,229,255,0.05)", textAlign: "left" }}>

              {/* Header archivo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Afiche_Verano.pdf</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>4.2 MB · 1 página · Offset Estucado</div>
                </div>
                {panelFase === 0
                  ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#00E5FF", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  : <div style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.12)", border: "1px solid #22C55E", fontSize: 10, fontWeight: 700, color: "#22C55E" }}>LISTO</div>
                }
              </div>

              {/* Estado analizando — solo fase 0 */}
              {panelFase === 0 && (
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 12, fontStyle: "italic" }}>Analizando archivo...</div>
              )}

              {/* Checklist animado */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                {PANEL_CHECKS.map((item, i) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9, opacity: panelFase > i ? 1 : 0, transform: panelFase > i ? "translateX(0)" : "translateX(-8px)", transition: "opacity 0.25s ease, transform 0.25s ease" }}>
                    <span style={{ width: 17, height: 17, borderRadius: "50%", background: item.ok ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)", border: `1px solid ${item.ok ? "#22C55E" : "#F59E0B"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, flexShrink: 0, color: item.ok ? "#22C55E" : "#F59E0B", fontWeight: 800 }}>
                      {item.ok ? "✓" : "⚠"}
                    </span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.ok ? "#22C55E" : "#F59E0B" }}>{item.ok ? "OK" : "Advertencia"}</span>
                  </div>
                ))}
              </div>

              {/* Score */}
              <div style={{ opacity: panelFase >= 7 ? 1 : 0, transition: "opacity 0.4s ease", padding: "13px 15px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>PRINT READY SCORE</span>
                  <span style={{ fontSize: 21, fontWeight: 800, background: "linear-gradient(90deg, #00E5FF, #FF2D78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    82<span style={{ fontSize: 12 }}>/100</span>
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: panelFase >= 7 ? "82%" : "0%", background: "linear-gradient(90deg, #00E5FF, #FF2D78)", borderRadius: 99, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </div>

              {/* Botón */}
              <button style={{ width: "100%", padding: "10px 16px", fontSize: 13.5, fontWeight: 700, background: "linear-gradient(135deg, #00E5FF, #FF2D78)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", opacity: panelFase >= 8 ? 1 : 0, transition: "opacity 0.3s ease", boxShadow: "0 5px 18px rgba(0,229,255,0.18)" }}>
                Optimizar PDF →
              </button>
            </div>
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
                    Solicitud enviada
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b" }}>
                    Te respondemos a tu email en menos de 24 horas con una
                    cotizacion.
                  </p>
                  <button
                    onClick={() => {
                      setFormEnviado(false);
                      setFormData({ nombre: "", email: "", detalle: "" });
                    }}
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
                  {errorForm && (
                    <div style={{ fontSize: 12.5, color: COLORS.error, marginBottom: 12 }}>
                      {errorForm}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={enviandoForm}
                    style={{
                      width: "100%",
                      padding: 13,
                      fontSize: 14,
                      fontWeight: 600,
                      background: enviandoForm ? "#cbd5e1" : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      cursor: enviandoForm ? "default" : "pointer",
                    }}
                  >
                    {enviandoForm ? "Enviando..." : "Enviar solicitud →"}
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
          background: "#fff",
          borderTop: `1px solid ${COLORS.border}`,
          padding: "56px 28px 32px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* Top row: logo + columnas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
          >
            {/* Logo + descripcion */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  P
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  PrintPDF.ai
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, maxWidth: 240, margin: 0 }}>
                Tu departamento de preprensa en la nube. Detectamos errores antes de imprimir.
              </p>
              {/* Redes sociales */}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {/* LinkedIn */}
                <span
                  title="LinkedIn"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "default",
                    color: "#64748b",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </span>
                {/* Twitter / X */}
                <span
                  title="Twitter"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "default",
                    color: "#64748b",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </span>
                {/* Instagram */}
                <span
                  title="Instagram"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "default",
                    color: "#64748b",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Navegacion */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.dark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                Producto
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  { label: "Como funciona", href: "#analiza" },
                  { label: "Correccion profesional", href: "#correccion-profesional" },
                  { label: "Casos de uso", href: "#casos" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 13.5, color: "#64748b", textDecoration: "none", fontWeight: 400 }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.dark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                Legal
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  { label: "Terminos de uso", href: "#" },
                  { label: "Privacidad", href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 13.5, color: "#64748b", textDecoration: "none", fontWeight: 400 }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contacto / CTA */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.dark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                Empezar
              </div>
              <a
                href="#uploader"
                style={{
                  display: "inline-block",
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: "#fff",
                  borderRadius: 9,
                  textDecoration: "none",
                }}
              >
                Analizar PDF gratis →
              </a>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, lineHeight: 1.5 }}>
                Sin registro.<br />Sin tarjeta de credito.
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              © 2025 PrintPDF.ai — Todos los derechos reservados.
            </span>
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>
              Hecho para imprentas, disenadores y agencias.
            </span>
          </div>
        </div>
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
