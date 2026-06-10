"use client";
import { useState } from "react";

type View = "landing" | "login" | "register" | "dashboard" | "generator" | "editor" | "webgenerator" | "webeditor" | "creativos";

type Variante = {
  id: number;
  tag: string;
  headline: string;
  subheadline: string;
  beneficios: string[];
  cta: string;
  emoji_hero: string;
};

type WebContent = {
  badge: string;
  headline_top: string;
  headline_main: string;
  subheadline: string;
  pain_title: string;
  pains: string[];
  gains_title: string;
  gains: string[];
  modulos_titulo: string;
  modulos: { num: number; emoji: string; titulo: string; items: string[] }[];
  bonos: { titulo: string; emoji: string }[];
  testimonios: { nombre: string; estrellas: string; texto: string }[];
  faqs: { q: string; a: string }[];
  cta_text: string;
  garantia: string;
  precio_tachado: string;
  footer_text: string;
};

type Capitulo = {
  numero: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  puntos_clave: string[];
  tip: string;
  imagen_keyword: string;
};

type Ebook = {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  color_principal: string;
  color_secundario: string;
  capitulos: Capitulo[];
};

type User = {
  name: string;
  email: string;
  plan: "free" | "pro";
};

const mockEbooks = [
  { id: 1, titulo: "Recetas Sin Gluten", paginas: 20, fecha: "10 Jun 2025" },
  { id: 2, titulo: "Marketing Digital 2025", paginas: 15, fecha: "8 Jun 2025" },
  { id: 3, titulo: "Meditación para Principiantes", paginas: 10, fecha: "5 Jun 2025" },
];

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [dashTab, setDashTab] = useState("ebooks");

  // Generator state
  const [tema, setTema] = useState("");
  const [paginas, setPaginas] = useState(20);
  const [estilo, setEstilo] = useState("minimalista");
  const [generating, setGenerating] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [editingCap, setEditingCap] = useState<number | null>(null);

  // Web generator state
  const [webPrecio, setWebPrecio] = useState("27");
  const [webGenerating, setWebGenerating] = useState(false);
  const [webHtml, setWebHtml] = useState<string | null>(null);
  const [webPreview, setWebPreview] = useState(false);
  const [webTema, setWebTema] = useState("");
  const [webDesc, setWebDesc] = useState("");
  const [webMode, setWebMode] = useState<"fromEbook" | "manual">("fromEbook");
  const [webContent, setWebContent] = useState<WebContent | null>(null);

  // Creativos state
  const [crTema, setCrTema] = useState("");
  const [crDesc, setCrDesc] = useState("");
  const [crPrecio, setCrPrecio] = useState("27");
  const [crFormato, setCrFormato] = useState("Post Instagram 1:1");
  const [crEstilo, setCrEstilo] = useState("dark");
  const [crColor, setCrColor] = useState("#7030EF");
  const [crGenerating, setCrGenerating] = useState(false);
  const [crVariantes, setCrVariantes] = useState<Variante[]>([]);
  const [crSeleccionada, setCrSeleccionada] = useState<Variante | null>(null);
  const [crImagenIA, setCrImagenIA] = useState<string | null>(null);
  const [crImagenGenerating, setCrImagenGenerating] = useState(false);
  const [crImagenesGen, setCrImagenesGen] = useState<Record<number, string>>({});
  const [crImagenesGenerating, setCrImagenesGenerating] = useState(false);
  const [webColor, setWebColor] = useState("#7030EF");
  const [webEditorTab, setWebEditorTab] = useState("general");

  function mockLogin(name: string, email: string) {
    setUser({ name, email, plan: "free" });
    setView("dashboard");
  }

  async function generar() {
    if (!tema.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema, paginas, estilo }),
    });
    const json = await res.json();
    setGenerating(false);
    if (json.ok) { setEbook(json.data); setView("editor"); }
    else alert("Error generando. Intentá de nuevo.");
  }

  async function descargar() {
    if (!ebook) return;
    setDownloading(true);
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ebook),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${ebook.titulo}.pdf`; a.click();
    } else alert("Error generando PDF");
    setDownloading(false);
  }

  async function generarWeb() {
    setWebGenerating(true);
    setWebHtml(null);
    const payload = ebook && webMode === "fromEbook"
      ? { ...ebook, precio: webPrecio }
      : {
          titulo: webTema,
          subtitulo: webDesc,
          descripcion: webDesc,
          capitulos: [],
          color_principal: "#7030EF",
          precio: webPrecio,
        };
    const res = await fetch("/api/webgen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setWebGenerating(false);
    if (json.ok) {
      setWebHtml(json.html);
      setWebContent(json.content);
      setWebColor(ebook?.color_principal || "#7030EF");
      setWebPreview(false);
      setView("webeditor");
    }
    else alert("Error generando la web. Intentá de nuevo.");
  }

  async function generarImagenIA() {
    if (!crSeleccionada) return;
    setCrImagenGenerating(true);
    setCrImagenIA(null);
    const prompt = buildAdPrompt(crSeleccionada, crFormato, crEstilo, crTema, crDesc, crPrecio);
    const res = await fetch("/api/creatives/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    setCrImagenGenerating(false);
    if (json.ok) {
      const url = `data:${json.mimeType};base64,${json.imageBase64}`;
      setCrImagenIA(url);
      if (crSeleccionada) setCrImagenesGen(prev => ({ ...prev, [crSeleccionada.id]: url }));
    } else alert("Error generando imagen: " + json.error);
  }

  function buildAdPrompt(v: Variante, formato: string, estilo: string, tema: string, desc: string, precio: string) {
    const styleKeywords = estilo === "dark"
      ? "dark moody dramatic lighting, deep shadows, cinematic"
      : estilo === "gradient"
      ? "vibrant colorful gradient, neon glow, energetic"
      : estilo === "minimal"
      ? "clean minimalist white background, elegant, professional studio"
      : "bold high contrast, striking colors, aggressive advertising";

    // Detectar tema visual del producto
    const topicVisual = desc || tema;

    return `Professional social media advertisement, marketing banner design. Topic: ${topicVisual}. Style: ${styleKeywords}. High quality product photo or lifestyle scene related to ${tema}. Bold text overlay: "${v.headline}". Subtext: "${v.subheadline}". CTA button: "${v.cta}". Price tag: $${precio}. Commercial advertising photo, high resolution, sharp focus, professional lighting, real advertisement quality. photorealistic, marketing campaign, social media ad.`;
  }

  async function generarCreativos() {
    if (!crTema.trim()) return;
    setCrGenerating(true);
    setCrVariantes([]);
    setCrImagenesGen({});
    setCrImagenIA(null);
    const res = await fetch("/api/creatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: crTema, descripcion: crDesc, precio: crPrecio, formato: crFormato, estilo: crEstilo }),
    });
    const json = await res.json();
    setCrGenerating(false);
    if (!json.ok) { alert("Error generando creativos. Intentá de nuevo."); return; }
    const variantes: Variante[] = json.variantes;
    setCrVariantes(variantes);
    setCrSeleccionada(variantes[0]);
    // Buscar foto de fondo una sola vez (todas las variantes usan la misma foto base)
    setCrImagenesGenerating(true);
    setCrImagenesGen({});
    try {
      const r = await fetch("/api/creatives/image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: crTema, width: 1080, height: 1080 })
      });
      const d = await r.json();
      if (d.ok) {
        const url = `data:${d.mimeType};base64,${d.imageBase64}`;
        // Misma foto para todas las variantes — el diseño CSS cambia el look de cada una
        const imgs: Record<number, string> = {};
        variantes.forEach(v => { imgs[v.id] = url; });
        setCrImagenesGen(imgs);
      } else {
        console.error("Error foto:", d.error);
      }
    } catch (e) { console.error("Exception foto:", e); }
    setCrImagenesGenerating(false);
  }

  async function rebuildWeb(newContent: WebContent) {
    setWebContent(newContent);
    const res = await fetch("/api/webgen/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newContent,
        titulo: ebook?.titulo || webTema,
        precio: webPrecio,
        color: webColor,
      }),
    });
    const json = await res.json();
    if (json.ok) setWebHtml(json.html);
  }

  function descargarWeb() {
    if (!webHtml) return;
    const blob = new Blob([webHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ebook?.titulo || "landing"}.html`;
    a.click();
  }

  function updateCap(idx: number, field: keyof Capitulo, value: string | string[]) {
    if (!ebook) return;
    const caps = [...ebook.capitulos];
    caps[idx] = { ...caps[idx], [field]: value };
    setEbook({ ...ebook, capitulos: caps });
  }

  const S = {
    bg: "#090820" as const,
    card: "rgba(255,255,255,0.04)" as const,
    border: "rgba(112,48,239,0.3)" as const,
    borderFaint: "rgba(112,48,239,0.2)" as const,
    purple: "#7030EF" as const,
    magenta: "#DB1FFF" as const,
    grad: "linear-gradient(135deg,#7030EF,#DB1FFF)" as const,
    gradText: { background: "linear-gradient(90deg,#7030EF,#DB1FFF)", WebkitBackgroundClip: "text" as const, WebkitTextFillColor: "transparent" as const },
    muted: "#a78bfa" as const,
    faint: "#7a6aaa" as const,
  };

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.07)", border: `1px solid ${S.border}`, borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" as const };

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (view === "landing") return (
    <main style={{ background: S.bg, color: "white", fontFamily: "sans-serif" }}>
      <nav style={{ borderBottom: `1px solid ${S.border}`, backdropFilter: "blur(10px)", background: "rgba(9,8,32,0.9)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>EbookAI</span>
          </div>
          <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#c4b5fd" }}>
            <a href="#features" style={{ color: "#c4b5fd", textDecoration: "none" }}>Funciones</a>
            <a href="#como" style={{ color: "#c4b5fd", textDecoration: "none" }}>Cómo funciona</a>
            <a href="#precios" style={{ color: "#c4b5fd", textDecoration: "none" }}>Precios</a>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("login")} style={{ padding: "10px 20px", borderRadius: 10, background: "transparent", border: `1px solid ${S.border}`, color: "#c4b5fd", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Iniciar sesión</button>
            <button onClick={() => setView("register")} style={{ padding: "10px 22px", borderRadius: 10, background: S.grad, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none" }}>Empezar gratis →</button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(112,48,239,0.15)", border: `1px solid rgba(112,48,239,0.4)`, borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "#c4b5fd", marginBottom: 28 }}>
          ✨ Inteligencia Artificial para crear ebooks profesionales
        </div>
        <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
          Crea ebooks que{" "}
          <span style={S.gradText}>se venden solos</span>
          {" "}en segundos
        </h1>
        <p style={{ fontSize: 20, color: S.muted, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Escribí el tema, la IA genera el contenido completo con imágenes, diseño premium y listo para vender en minutos.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setView("register")} style={{ background: S.grad, color: "white", padding: "16px 36px", borderRadius: 12, fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer" }}>✨ Crear mi ebook gratis</button>
          <a href="#como" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(112,48,239,0.4)`, color: "white", padding: "16px 36px", borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: "none" }}>▶ Cómo funciona</a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
          {[{ num: "10,000+", label: "Ebooks generados" }, { num: "2 min", label: "Tiempo promedio" }, { num: "200+", label: "Temas disponibles" }, { num: "98%", label: "Satisfacción" }].map(s => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, ...S.gradText }}>{s.num}</div>
              <div style={{ fontSize: 13, color: S.faint, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(112,48,239,0.2),rgba(219,31,255,0.1))", border: `1px solid ${S.border}`, borderRadius: 24, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>PDF profesional generado en segundos</div>
          <div style={{ color: S.muted, fontSize: 15, marginBottom: 28 }}>Contenido real con IA, imágenes y diseño premium</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["✅ Contenido con IA", "✅ Imágenes automáticas", "✅ PDF listo para vender", "✅ Editable al instante"].map(f => (
              <span key={f} style={{ background: "rgba(112,48,239,0.2)", border: `1px solid rgba(112,48,239,0.4)`, borderRadius: 100, padding: "6px 14px", fontSize: 13, color: "#c4b5fd" }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Todo lo que necesitás para <span style={S.gradText}>vender más</span></h2>
          <p style={{ color: S.muted, fontSize: 18 }}>Una plataforma completa para crear y comercializar productos digitales</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { icon: "🤖", title: "IA Generativa", desc: "Llama 3.3 genera contenido de alta calidad, estructurado y listo para vender en cualquier nicho." },
            { icon: "🎨", title: "Diseño Premium", desc: "PDFs con diseño profesional, imágenes automáticas y paleta de colores personalizable." },
            { icon: "✏️", title: "Editor completo", desc: "Editá título, contenido, colores y capítulos antes de descargar tu ebook final." },
            { icon: "⚡", title: "Listo en 2 minutos", desc: "Desde la idea hasta el PDF descargado en menos de 2 minutos. Sin conocimientos técnicos." },
            { icon: "📊", title: "Dashboard personal", desc: "Guardá, organizá y descargá todos tus ebooks desde un panel centralizado." },
            { icon: "🚀", title: "Creativos publicitarios", desc: "Genera posts, stories y banners listos para lanzar campañas y vender tu ebook." },
          ].map(f => (
            <div key={f.title} style={{ background: S.card, border: `1px solid ${S.borderFaint}`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: S.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Cómo funciona</h2>
          <p style={{ color: S.muted, fontSize: 18 }}>3 pasos y tu ebook está listo para vender</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { paso: "01", icon: "💬", title: "Escribí tu tema", desc: "Ingresá el tema, elegí páginas y estilo visual." },
            { paso: "02", icon: "🤖", title: "La IA lo genera", desc: "Contenido completo, estructurado, con imágenes y diseño profesional." },
            { paso: "03", icon: "💰", title: "Editá y vendé", desc: "Personalizá todo, descargá el PDF y empezá a venderlo." },
          ].map(s => (
            <div key={s.paso} style={{ background: S.card, border: `1px solid ${S.borderFaint}`, borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 72, fontWeight: 900, position: "absolute", top: -10, right: 16, opacity: 0.06, color: S.purple }}>{s.paso}</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.magenta, letterSpacing: 2, marginBottom: 8 }}>PASO {s.paso}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: S.muted, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="precios" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Planes simples y transparentes</h2>
          <p style={{ color: S.muted, fontSize: 18 }}>Empezá gratis, escalá cuando quieras</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {[
            { nombre: "Free", precio: "$0", period: "para siempre", bg: S.card, borde: S.borderFaint, features: ["3 ebooks por mes", "Hasta 10 páginas", "Diseño estándar", "Descarga en PDF"], cta: "Empezar gratis", highlight: false },
            { nombre: "Pro", precio: "$19", period: "por mes", bg: "linear-gradient(135deg,rgba(112,48,239,0.2),rgba(219,31,255,0.15))", borde: S.purple, features: ["Ebooks ilimitados", "Hasta 50 páginas", "Diseño premium", "Imágenes automáticas", "Creativos publicitarios", "Dashboard completo"], cta: "Empezar Pro", highlight: true },
            { nombre: "Agency", precio: "$49", period: "por mes", bg: S.card, borde: S.borderFaint, features: ["Todo lo de Pro", "5 usuarios", "API access", "Soporte prioritario", "White label"], cta: "Contactar", highlight: false },
          ].map(p => (
            <div key={p.nombre} style={{ background: p.bg, border: `1px solid ${p.borde}`, borderRadius: 24, padding: 36, position: "relative" }}>
              {p.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: S.grad, borderRadius: 100, padding: "4px 16px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>MÁS POPULAR</div>}
              <div style={{ fontSize: 14, fontWeight: 700, color: S.magenta, marginBottom: 8 }}>{p.nombre}</div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 4 }}>{p.precio}</div>
              <div style={{ fontSize: 13, color: S.faint, marginBottom: 28 }}>{p.period}</div>
              <div style={{ borderTop: `1px solid ${S.borderFaint}`, paddingTop: 24, marginBottom: 28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 14, color: "#c4b5fd" }}>
                    <span style={{ color: S.magenta }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => setView("register")} style={{ width: "100%", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", background: p.highlight ? S.grad : "rgba(112,48,239,0.2)", color: "white", border: p.highlight ? "none" : `1px solid rgba(112,48,239,0.4)` }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 800, margin: "0 auto 100px", padding: "0 24px", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(112,48,239,0.25),rgba(219,31,255,0.15))", border: `1px solid rgba(112,48,239,0.4)`, borderRadius: 28, padding: "60px 40px" }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>¿Listo para crear tu primer ebook?</h2>
          <p style={{ color: S.muted, fontSize: 18, marginBottom: 36 }}>Únite a miles de creadores que ya generan ingresos con sus productos digitales.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 480, margin: "0 auto", flexWrap: "wrap" }}>
            <input type="email" placeholder="Tu email..." value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 220, background: "rgba(255,255,255,0.08)", border: `1px solid rgba(112,48,239,0.4)`, borderRadius: 12, padding: "14px 18px", color: "white", fontSize: 15, outline: "none" }} />
            <button onClick={() => setView("register")} style={{ background: S.grad, color: "white", padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Empezar gratis →</button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${S.borderFaint}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>EbookAI</span>
        </div>
        <p style={{ color: S.faint, fontSize: 13 }}>© 2025 EbookAI. Todos los derechos reservados.</p>
      </footer>
    </main>
  );

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (view === "login") return (
    <main style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button onClick={() => setView("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 22 }}>EbookAI</span>
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 8px" }}>Bienvenido de vuelta</h1>
          <p style={{ color: S.muted, fontSize: 15 }}>Iniciá sesión para acceder a tus ebooks</p>
        </div>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: 36 }}>
          <button onClick={() => mockLogin("Usuario", loginEmail || "user@gmail.com")}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", borderRadius: 14, background: "white", color: "#1a1a2e", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: S.borderFaint }} /><span style={{ color: S.faint, fontSize: 13 }}>o</span><div style={{ flex: 1, height: 1, background: S.borderFaint }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="tu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Contraseña</label>
            <input type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={() => mockLogin("Usuario", loginEmail || "user@email.com")}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: S.grad, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}>
            Iniciar sesión
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, color: S.faint, fontSize: 14 }}>
          ¿No tenés cuenta?{" "}
          <button onClick={() => setView("register")} style={{ background: "none", border: "none", color: S.magenta, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Registrarse gratis</button>
        </p>
      </div>
    </main>
  );

  // ─── REGISTER ────────────────────────────────────────────────────────────────
  if (view === "register") return (
    <main style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button onClick={() => setView("landing")} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 22 }}>EbookAI</span>
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 8px" }}>Crear cuenta gratis</h1>
          <p style={{ color: S.muted, fontSize: 15 }}>Empezá a generar ebooks en segundos</p>
        </div>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: 36 }}>
          <button onClick={() => mockLogin(regName || "Usuario", regEmail || "user@gmail.com")}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", borderRadius: 14, background: "white", color: "#1a1a2e", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Registrarse con Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: S.borderFaint }} /><span style={{ color: S.faint, fontSize: 13 }}>o con email</span><div style={{ flex: 1, height: 1, background: S.borderFaint }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="tu@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" value={regPass} onChange={e => setRegPass(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={() => mockLogin(regName || "Usuario", regEmail || "user@email.com")}
            style={{ width: "100%", padding: "14px", borderRadius: 14, background: S.grad, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 16 }}>
            Crear cuenta gratis
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: S.faint }}>Al registrarte aceptás los Términos de uso y la Política de privacidad</p>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, color: S.faint, fontSize: 14 }}>
          ¿Ya tenés cuenta?{" "}
          <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: S.magenta, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Iniciar sesión</button>
        </p>
      </div>
    </main>
  );

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────
  if (view === "dashboard") return (
    <main style={{ minHeight: "100vh", background: S.bg, color: "white", fontFamily: "sans-serif", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: `1px solid ${S.borderFaint}`, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
        <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "white", marginBottom: 24, padding: "0 8px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 17 }}>EbookAI</span>
        </button>
        {[
          { id: "ebooks", icon: "📚", label: "Mis Ebooks" },
          { id: "crear", icon: "✨", label: "Crear Ebook" },
          { id: "web", icon: "🌐", label: "Crear Web" },
          { id: "creativos", icon: "🎨", label: "Creativos" },
          { id: "config", icon: "⚙️", label: "Configuración" },
        ].map(item => (
          <button key={item.id} onClick={() => { if (item.id === "crear") setView("generator"); else if (item.id === "web") setView("webgenerator"); else if (item.id === "creativos") { if(ebook){ setCrTema(ebook.titulo); setCrDesc(ebook.descripcion); setCrColor(ebook.color_principal); } setView("creativos"); } else setDashTab(item.id); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, textAlign: "left", background: dashTab === item.id ? "rgba(112,48,239,0.25)" : "transparent", color: dashTab === item.id ? "white" : S.muted, borderLeft: `2px solid ${dashTab === item.id ? S.purple : "transparent"}` }}>
            {item.icon} {item.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", borderTop: `1px solid ${S.borderFaint}`, paddingTop: 16 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: S.faint }}>Plan Free</div>
            </div>
          </div>
          <button onClick={() => { setUser(null); setView("landing"); }}
            style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {dashTab === "ebooks" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Mis Ebooks</h1>
              <p style={{ color: S.muted, fontSize: 14 }}>Todos tus ebooks generados</p>
            </div>
            <button onClick={() => setView("generator")} style={{ padding: "12px 24px", borderRadius: 12, background: S.grad, color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>✨ Nuevo ebook</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
            {[{ label: "Ebooks creados", value: "3", icon: "📚" }, { label: "Páginas generadas", value: "45", icon: "📄" }, { label: "Plan actual", value: "Free", icon: "⭐" }].map(s => (
              <div key={s.label} style={{ background: S.card, border: `1px solid ${S.borderFaint}`, borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: S.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mockEbooks.map(eb => (
              <div key={eb.id} style={{ background: S.card, border: `1px solid ${S.borderFaint}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{eb.titulo}</div>
                    <div style={{ fontSize: 12, color: S.faint }}>{eb.paginas} páginas • {eb.fecha}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(112,48,239,0.2)", border: `1px solid rgba(112,48,239,0.4)`, color: "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                  <button style={{ padding: "8px 16px", borderRadius: 10, background: S.grad, border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⬇ PDF</button>
                </div>
              </div>
            ))}
          </div>
        </>}

        {dashTab === "creativos" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎨</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Creativos Publicitarios</h2>
            <p style={{ color: S.muted, fontSize: 16, marginBottom: 24 }}>Genera posts, stories y banners para Instagram y Facebook</p>
            <span style={{ background: "rgba(219,31,255,0.15)", border: "1px solid rgba(219,31,255,0.4)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: S.magenta }}>Próximamente</span>
          </div>
        )}

        {dashTab === "config" && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Configuración</h1>
            <div style={{ background: S.card, border: `1px solid ${S.borderFaint}`, borderRadius: 16, padding: 24, maxWidth: 500 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tu perfil</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: S.muted }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ background: "rgba(112,48,239,0.1)", border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.magenta, marginBottom: 4 }}>Plan Free</div>
                <div style={{ fontSize: 13, color: S.muted }}>3 ebooks por mes • Hasta 10 páginas</div>
                <button style={{ marginTop: 12, padding: "8px 18px", borderRadius: 10, background: S.grad, color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>Actualizar a Pro →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  // ─── GENERATOR ───────────────────────────────────────────────────────────────
  if (view === "generator") return (
    <main style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${S.bg} 0%, #1a0a3a 50%, ${S.bg} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <button onClick={() => setView(user ? "dashboard" : "landing")} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 14, fontWeight: 600 }}>← Volver</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📚</div>
            <span style={{ fontWeight: 800, color: "white", fontSize: 16 }}>EbookAI</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "white", marginBottom: 8 }}>Generador de <span style={S.gradText}>Ebooks IA</span></h1>
          <p style={{ color: S.muted, fontSize: 15 }}>Crea tu ebook profesional en segundos</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${S.border}`, borderRadius: 24, padding: 28, backdropFilter: "blur(10px)" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>Tema del ebook</label>
            <input style={{ ...inputStyle, fontSize: 15 }} placeholder="Ej: Recetas sin gluten, Marketing digital..."
              value={tema} onChange={e => setTema(e.target.value)} onKeyDown={e => e.key === "Enter" && generar()} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>Cantidad de páginas</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[10, 15, 20, 30].map(n => (
                <button key={n} onClick={() => setPaginas(n)}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: paginas === n ? S.grad : "rgba(255,255,255,0.05)", color: paginas === n ? "white" : "#c4b5fd", outline: paginas !== n ? `1px solid ${S.border}` : "none" }}>
                  {n} pág.
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>Estilo visual</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ id: "minimalista", label: "Minimalista", emoji: "⬜" }, { id: "colorido", label: "Colorido", emoji: "🎨" }, { id: "profesional", label: "Profesional", emoji: "💼" }, { id: "creativo", label: "Creativo", emoji: "✨" }].map(e => (
                <button key={e.id} onClick={() => setEstilo(e.id)}
                  style={{ padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: estilo === e.id ? S.grad : "rgba(255,255,255,0.05)", color: estilo === e.id ? "white" : "#c4b5fd", outline: estilo !== e.id ? `1px solid ${S.border}` : "none" }}>
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generar} disabled={generating || !tema.trim()}
            style={{ width: "100%", padding: "16px", borderRadius: 14, background: S.grad, color: "white", fontWeight: 800, fontSize: 17, border: "none", cursor: generating ? "wait" : "pointer", opacity: !tema.trim() ? 0.5 : 1 }}>
            {generating ? "⏳ Generando tu ebook..." : "✨ Generar Ebook"}
          </button>
        </div>
      </div>
    </main>
  );

  // ─── EDITOR ──────────────────────────────────────────────────────────────────
  if (view === "editor" && ebook) return (
    <main style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${S.bg} 0%, #1a0a3a 100%)`, fontFamily: "sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(9,8,32,0.9)", borderBottom: `1px solid ${S.border}`, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, color: "white", fontSize: 15 }}>{ebook.titulo}</div>
            <div style={{ fontSize: 12, color: S.muted }}>{ebook.capitulos.length} capítulos • Editá antes de descargar</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setView("generator")} style={{ padding: "8px 18px", fontSize: 13, borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, cursor: "pointer", fontWeight: 600 }}>← Nuevo</button>
            {user && <button onClick={() => setView("dashboard")} style={{ padding: "8px 18px", fontSize: 13, borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, cursor: "pointer", fontWeight: 600 }}>Dashboard</button>}
            <button onClick={descargar} disabled={downloading}
              style={{ padding: "8px 20px", fontSize: 13, borderRadius: 10, border: "none", background: S.grad, color: "white", cursor: "pointer", fontWeight: 700, opacity: downloading ? 0.6 : 1 }}>
              {downloading ? "Generando..." : "⬇️ Descargar PDF"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 40px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, letterSpacing: 2, marginBottom: 16 }}>INFORMACIÓN GENERAL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ label: "Título", key: "titulo" }, { label: "Subtítulo", key: "subtitulo" }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input style={{ ...inputStyle, padding: "10px 14px", fontSize: 14 }} value={(ebook as unknown as Record<string, string>)[f.key]} onChange={e => setEbook({ ...ebook, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Descripción</label>
              <textarea style={{ ...inputStyle, padding: "10px 14px", fontSize: 14, resize: "none" }} rows={2} value={ebook.descripcion} onChange={e => setEbook({ ...ebook, descripcion: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Color principal</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={ebook.color_principal} onChange={e => setEbook({ ...ebook, color_principal: e.target.value })} style={{ width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: S.muted }}>{ebook.color_principal}</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Color secundario</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="color" value={ebook.color_secundario} onChange={e => setEbook({ ...ebook, color_secundario: e.target.value })} style={{ width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: S.muted }}>{ebook.color_secundario}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, letterSpacing: 2, marginBottom: 12 }}>CAPÍTULOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ebook.capitulos.map((cap, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }} onClick={() => setEditingCap(editingCap === idx ? null : idx)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>{cap.numero}</span>
                  <span style={{ fontWeight: 600, color: "white", fontSize: 15 }}>{cap.titulo}</span>
                </div>
                <span style={{ color: S.muted, fontSize: 12 }}>{editingCap === idx ? "▲ cerrar" : "▼ editar"}</span>
              </div>
              {editingCap === idx && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${S.borderFaint}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[{ label: "Título", field: "titulo" as keyof Capitulo, rows: 1 }, { label: "Descripción", field: "descripcion" as keyof Capitulo, rows: 1 }, { label: "Contenido", field: "contenido" as keyof Capitulo, rows: 5 }, { label: "Consejo", field: "tip" as keyof Capitulo, rows: 1 }].map(f => (
                    <div key={String(f.field)}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>{f.label}</label>
                      {f.rows === 1
                        ? <input style={{ ...inputStyle, padding: "10px 14px", fontSize: 14 }} value={cap[f.field] as string} onChange={e => updateCap(idx, f.field, e.target.value)} />
                        : <textarea style={{ ...inputStyle, padding: "10px 14px", fontSize: 14, resize: "none" }} rows={f.rows} value={cap[f.field] as string} onChange={e => updateCap(idx, f.field, e.target.value)} />
                      }
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Puntos clave (uno por línea)</label>
                    <textarea style={{ ...inputStyle, padding: "10px 14px", fontSize: 14, resize: "none" }} rows={3} value={cap.puntos_clave.join("\n")} onChange={e => updateCap(idx, "puntos_clave", e.target.value.split("\n"))} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={descargar} disabled={downloading}
          style={{ width: "100%", marginTop: 24, padding: "16px", borderRadius: 14, background: S.grad, color: "white", fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer", opacity: downloading ? 0.6 : 1 }}>
          {downloading ? "⏳ Generando PDF..." : "⬇️ Descargar PDF Completo"}
        </button>
      </div>
    </main>
  );

  // ─── WEB EDITOR ─────────────────────────────────────────────────────────────
  if (view === "webeditor" && webContent && webHtml) {
    const tabs = [
      { id: "general", label: "✏️ General" },
      { id: "dolor", label: "💬 Dolor/Solución" },
      { id: "modulos", label: "📚 Módulos" },
      { id: "testimonios", label: "⭐ Testimonios" },
      { id: "faqs", label: "🤔 FAQs" },
    ];
    return (
      <main style={{ minHeight: "100vh", background: S.bg, color: "white", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${S.borderFaint}`, background: "rgba(9,8,32,0.98)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setView("webgenerator")} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 14, fontWeight: 600 }}>← Volver</button>
            <div style={{ width: 1, height: 18, background: S.borderFaint }} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>🌐 Editor de Landing Page</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setWebPreview(!webPreview)}
              style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${S.border}`, background: webPreview ? "rgba(112,48,239,0.2)" : "transparent", color: "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {webPreview ? "📝 Editor" : "👁 Preview"}
            </button>
            <button onClick={() => { if(webHtml) { navigator.clipboard.writeText(webHtml); alert("✅ Código copiado al portapapeles"); } }}
              style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              📋 Copiar código
            </button>
            <button onClick={descargarWeb}
              style={{ padding: "8px 18px", borderRadius: 10, background: S.grad, border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ⬇️ Descargar
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Panel editor */}
          {!webPreview && (
            <div style={{ width: 360, borderRight: `1px solid ${S.borderFaint}`, overflowY: "auto", flexShrink: 0, background: "rgba(0,0,0,0.2)" }}>
              {/* Tabs */}
              <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${S.borderFaint}`, padding: "8px 12px", gap: 6 }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setWebEditorTab(t.id)}
                    style={{ padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, background: webEditorTab === t.id ? S.grad : "rgba(255,255,255,0.06)", color: "white" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 16 }}>
                {webEditorTab === "general" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Badge (credibilidad)", key: "badge" },
                      { label: "Titular superior", key: "headline_top" },
                      { label: "Título principal", key: "headline_main" },
                      { label: "Subtítulo", key: "subheadline" },
                      { label: "Texto del botón CTA", key: "cta_text" },
                      { label: "Garantía", key: "garantia" },
                      { label: "Precio tachado", key: "precio_tachado" },
                      { label: "Footer", key: "footer_text" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>{f.label}</label>
                        <textarea
                          style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, resize: "none" }}
                          rows={f.key === "subheadline" || f.key === "garantia" ? 3 : 2}
                          value={(webContent as unknown as Record<string, string>)[f.key]}
                          onChange={e => {
                            const updated = { ...webContent, [f.key]: e.target.value };
                            setWebContent(updated as WebContent);
                          }}
                          onBlur={() => rebuildWeb(webContent)}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Color de marca</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={webColor} onChange={e => setWebColor(e.target.value)} onBlur={() => rebuildWeb(webContent)} style={{ width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer" }} />
                        <span style={{ fontSize: 13, color: S.muted }}>{webColor}</span>
                      </div>
                    </div>
                  </div>
                )}

                {webEditorTab === "dolor" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Título sección dolor</label>
                      <input style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} value={webContent.pain_title}
                        onChange={e => setWebContent({ ...webContent, pain_title: e.target.value })}
                        onBlur={() => rebuildWeb(webContent)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Puntos de dolor (uno por línea)</label>
                      <textarea style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, resize: "none" }} rows={6}
                        value={webContent.pains.join("\n")}
                        onChange={e => setWebContent({ ...webContent, pains: e.target.value.split("\n") })}
                        onBlur={() => rebuildWeb(webContent)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Título sección solución</label>
                      <input style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} value={webContent.gains_title}
                        onChange={e => setWebContent({ ...webContent, gains_title: e.target.value })}
                        onBlur={() => rebuildWeb(webContent)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", display: "block", marginBottom: 4 }}>Puntos de solución (uno por línea)</label>
                      <textarea style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, resize: "none" }} rows={5}
                        value={webContent.gains.join("\n")}
                        onChange={e => setWebContent({ ...webContent, gains: e.target.value.split("\n") })}
                        onBlur={() => rebuildWeb(webContent)} />
                    </div>
                  </div>
                )}

                {webEditorTab === "modulos" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {webContent.modulos.map((mod, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 12, padding: 12 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 13, width: 50 }} value={mod.emoji}
                            onChange={e => { const m = [...webContent.modulos]; m[i] = { ...m[i], emoji: e.target.value }; setWebContent({ ...webContent, modulos: m }); }}
                            onBlur={() => rebuildWeb(webContent)} />
                          <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 13, flex: 1 }} value={mod.titulo}
                            onChange={e => { const m = [...webContent.modulos]; m[i] = { ...m[i], titulo: e.target.value }; setWebContent({ ...webContent, modulos: m }); }}
                            onBlur={() => rebuildWeb(webContent)} />
                        </div>
                        <textarea style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, resize: "none" }} rows={3}
                          value={mod.items.join("\n")}
                          onChange={e => { const m = [...webContent.modulos]; m[i] = { ...m[i], items: e.target.value.split("\n") }; setWebContent({ ...webContent, modulos: m }); }}
                          onBlur={() => rebuildWeb(webContent)} />
                      </div>
                    ))}
                  </div>
                )}

                {webEditorTab === "testimonios" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {webContent.testimonios.map((t, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 12, padding: 12 }}>
                        <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 13, marginBottom: 6 }} placeholder="Nombre" value={t.nombre}
                          onChange={e => { const arr = [...webContent.testimonios]; arr[i] = { ...arr[i], nombre: e.target.value }; setWebContent({ ...webContent, testimonios: arr }); }}
                          onBlur={() => rebuildWeb(webContent)} />
                        <textarea style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, resize: "none" }} rows={2} placeholder="Testimonio"
                          value={t.texto}
                          onChange={e => { const arr = [...webContent.testimonios]; arr[i] = { ...arr[i], texto: e.target.value }; setWebContent({ ...webContent, testimonios: arr }); }}
                          onBlur={() => rebuildWeb(webContent)} />
                      </div>
                    ))}
                  </div>
                )}

                {webEditorTab === "faqs" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {webContent.faqs.map((f, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 12, padding: 12 }}>
                        <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 13, marginBottom: 6 }} placeholder="Pregunta" value={f.q}
                          onChange={e => { const arr = [...webContent.faqs]; arr[i] = { ...arr[i], q: e.target.value }; setWebContent({ ...webContent, faqs: arr }); }}
                          onBlur={() => rebuildWeb(webContent)} />
                        <textarea style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, resize: "none" }} rows={2} placeholder="Respuesta"
                          value={f.a}
                          onChange={e => { const arr = [...webContent.faqs]; arr[i] = { ...arr[i], a: e.target.value }; setWebContent({ ...webContent, faqs: arr }); }}
                          onBlur={() => rebuildWeb(webContent)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <iframe srcDoc={webHtml} style={{ width: "100%", height: "100%", border: "none" }} title="Preview" />
          </div>
        </div>
      </main>
    );
  }

  // ─── CREATIVOS ───────────────────────────────────────────────────────────────
  if (view === "creativos") {
    const formatos = [
      { id: "Post Instagram 1:1", label: "Instagram Post", size: "1080×1080", w: 320, h: 320, icon: "📸" },
      { id: "Story Instagram 9:16", label: "Story / Reel", size: "1080×1920", w: 180, h: 320, icon: "📱" },
      { id: "Facebook Ad", label: "Facebook Ad", size: "1200×628", w: 320, h: 168, icon: "📣" },
      { id: "Banner Web", label: "Banner Web", size: "1200×300", w: 320, h: 80, icon: "🖼️" },
    ];
    const estilos = [
      { id: "dark", label: "Dark", emoji: "🌑" },
      { id: "gradient", label: "Gradiente", emoji: "🌈" },
      { id: "minimal", label: "Minimal", emoji: "⬜" },
      { id: "bold", label: "Bold", emoji: "💥" },
    ];
    const fmt = formatos.find(f => f.id === crFormato) || formatos[0];

    function getCanvasStyle(v: Variante, w: number, h: number, bgPhoto: string | null) {
      const isStory = h > w;
      const isBanner = w / h > 3;
      const scale = w / 320;

      const palettes: Record<string, { bg: string; overlay: string; tag: string; tagTxt: string; headline: string; sub: string; cta: string; ctaTxt: string; price: string; check: string }> = {
        dark:     { bg: "#0d0d1a", overlay: "linear-gradient(180deg,rgba(9,8,32,0.25) 0%,rgba(9,8,32,0.80) 55%,rgba(9,8,32,0.97) 100%)", tag: crColor, tagTxt: "#fff", headline: "#ffffff", sub: "rgba(255,255,255,0.88)", cta: crColor, ctaTxt: "#fff", price: "rgba(255,255,255,0.55)", check: "#FFD700" },
        gradient: { bg: crColor, overlay: `linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.65) 55%,rgba(0,0,0,0.92) 100%)`, tag: "#FFD700", tagTxt: "#000", headline: "#FFD700", sub: "#ffffff", cta: "#FFD700", ctaTxt: "#000", price: "rgba(255,255,255,0.6)", check: "#FFD700" },
        minimal:  { bg: "#f0f0f0", overlay: "linear-gradient(180deg,rgba(240,240,240,0.1) 0%,rgba(240,240,240,0.75) 50%,rgba(240,240,240,0.97) 100%)", tag: crColor, tagTxt: "#fff", headline: "#111111", sub: "#333333", cta: crColor, ctaTxt: "#fff", price: "#666666", check: crColor },
        bold:     { bg: "#111", overlay: "linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.72) 55%,rgba(0,0,0,0.95) 100%)", tag: "#FF3B30", tagTxt: "#fff", headline: "#ffffff", sub: "rgba(255,255,255,0.92)", cta: "#FF3B30", ctaTxt: "#fff", price: "rgba(255,255,255,0.5)", check: "#4CD964" },
      };
      const p = palettes[crEstilo] || palettes.dark;

      const bgStyle: React.CSSProperties = bgPhoto
        ? { backgroundImage: `url(${bgPhoto})`, backgroundSize: "cover", backgroundPosition: "center top" }
        : { background: p.bg };

      const fs = (base: number) => Math.round(base * scale);

      // ── BANNER ──────────────────────────────────────────────────────────────
      if (isBanner) {
        const bgs: React.CSSProperties = crImagenIA
          ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.4) 100%), url(${crImagenIA})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: `linear-gradient(90deg,${p.bg} 50%,${crColor}33)` };
        return (
          <div style={{ width: w, height: h, ...bgs, borderRadius: 8, display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0, position: "relative", fontFamily: "'Arial Black',Arial,sans-serif" }}>
            {/* Left stripe accent */}
            <div style={{ width: 5, height: "100%", background: p.cta, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: `0 ${fs(14)}px`, display: "flex", alignItems: "center", gap: fs(10) }}>
              <div style={{ fontSize: fs(28) }}>{v.emoji_hero}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: fs(9), fontWeight: 900, color: p.tag, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{v.tag}</div>
                <div style={{ fontSize: fs(11), fontWeight: 900, color: p.headline, lineHeight: 1.1, textTransform: "uppercase" }}>{v.headline}</div>
                <div style={{ fontSize: fs(9), color: p.sub, marginTop: 2, lineHeight: 1.2 }}>{v.subheadline}</div>
              </div>
            </div>
            {/* CTA block */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: p.cta, height: "100%", padding: `0 ${fs(14)}px`, flexShrink: 0, minWidth: fs(80) }}>
              <div style={{ fontSize: fs(9), fontWeight: 900, color: p.ctaTxt, textAlign: "center", textTransform: "uppercase", lineHeight: 1.2 }}>{v.cta}</div>
              <div style={{ fontSize: fs(9), color: crEstilo === "minimal" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.7)", marginTop: 2 }}>${crPrecio}</div>
            </div>
          </div>
        );
      }

      // ── POST / STORY ─────────────────────────────────────────────────────────
      const pad = fs(isStory ? 20 : 16);
      return (
        <div style={{ width: w, height: h, ...bgStyle, borderRadius: 10, overflow: "hidden", flexShrink: 0, position: "relative", fontFamily: "'Arial Black',Arial,sans-serif" }}>
          {/* Gradient overlay bottom-up */}
          <div style={{ position: "absolute", inset: 0, background: crImagenIA ? p.overlay : `linear-gradient(180deg,${p.bg}55 0%,${p.bg}cc 50%,${p.bg} 100%)` }} />

          {/* TAG badge top-left */}
          <div style={{ position: "absolute", top: fs(12), left: fs(12), background: p.tag, color: p.tagTxt, fontSize: fs(8), fontWeight: 900, padding: `${fs(3)}px ${fs(10)}px`, borderRadius: 3, letterSpacing: 1.5, textTransform: "uppercase", zIndex: 2 }}>{v.tag}</div>

          {/* Emoji top-right */}
          <div style={{ position: "absolute", top: fs(8), right: fs(12), fontSize: fs(isStory ? 30 : 26), zIndex: 2 }}>{v.emoji_hero}</div>

          {/* Bottom content block */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `${fs(14)}px ${pad}px ${fs(14)}px`, zIndex: 2 }}>
            {/* Headline — grande, impactante */}
            <div style={{ fontSize: fs(isStory ? 20 : 17), fontWeight: 900, color: p.headline, lineHeight: 1.1, textTransform: "uppercase", marginBottom: fs(6), textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
              {v.headline}
            </div>
            {/* Subheadline */}
            <div style={{ fontSize: fs(isStory ? 11 : 9.5), color: p.sub, lineHeight: 1.35, marginBottom: fs(10), textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {v.subheadline}
            </div>
            {/* Beneficios checklist */}
            <div style={{ marginBottom: fs(12) }}>
              {v.beneficios.slice(0, isStory ? 3 : 2).map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: fs(5), fontSize: fs(isStory ? 10 : 8.5), color: p.headline, marginBottom: fs(4), textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                  <span style={{ color: p.check, fontSize: fs(10), fontWeight: 900, flexShrink: 0 }}>✔</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            {/* CTA button */}
            <div style={{ background: p.cta, color: p.ctaTxt, padding: `${fs(isStory ? 11 : 9)}px ${fs(18)}px`, borderRadius: 5, fontSize: fs(isStory ? 12 : 10), fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, textAlign: "center", boxShadow: `0 4px 16px ${p.cta}88`, marginBottom: fs(6) }}>
              {v.cta}
            </div>
            {/* Price */}
            <div style={{ textAlign: "center", fontSize: fs(9), color: p.price, fontWeight: 700 }}>
              Solo USD ${crPrecio}
            </div>
          </div>
        </div>
      );
    }

    return (
      <main style={{ minHeight: "100vh", background: S.bg, color: "white", fontFamily: "sans-serif" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${S.borderFaint}`, background: "rgba(9,8,32,0.98)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setView(user ? "dashboard" : "landing")} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 14, fontWeight: 600 }}>← Volver</button>
            <div style={{ width: 1, height: 18, background: S.borderFaint }} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>🎨 Generador de Creativos</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>EbookAI</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 57px)" }}>
          {/* Panel izquierdo — configuración */}
          <div style={{ width: 300, borderRight: `1px solid ${S.borderFaint}`, padding: 20, overflowY: "auto", flexShrink: 0, background: "rgba(0,0,0,0.2)" }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 6 }}>Producto</label>
              <input placeholder="Nombre del producto" value={crTema} onChange={e => setCrTema(e.target.value)}
                style={{ ...inputStyle, padding: "10px 14px", fontSize: 13, marginBottom: 8 }} />
              <textarea placeholder="Descripción breve..." value={crDesc} onChange={e => setCrDesc(e.target.value)}
                style={{ ...inputStyle, padding: "10px 14px", fontSize: 13, resize: "none" }} rows={2} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 6 }}>Precio (USD)</label>
              <input type="number" value={crPrecio} onChange={e => setCrPrecio(e.target.value)}
                style={{ ...inputStyle, padding: "10px 14px", fontSize: 13 }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 8 }}>Formato</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {formatos.map(f => (
                  <button key={f.id} onClick={() => setCrFormato(f.id)}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, textAlign: "left", background: crFormato === f.id ? "rgba(112,48,239,0.3)" : "rgba(255,255,255,0.05)", color: crFormato === f.id ? "white" : S.muted, borderLeft: `3px solid ${crFormato === f.id ? crColor : "transparent"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{f.icon} {f.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>{f.size}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 8 }}>Estilo</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {estilos.map(e => (
                  <button key={e.id} onClick={() => setCrEstilo(e.id)}
                    style={{ padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: crEstilo === e.id ? S.grad : "rgba(255,255,255,0.05)", color: "white" }}>
                    {e.emoji} {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 6 }}>Color de marca</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={crColor} onChange={e => setCrColor(e.target.value)}
                  style={{ width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  {["#7030EF", "#DB1FFF", "#EF4444", "#F59E0B", "#10B981", "#3B82F6"].map(c => (
                    <div key={c} onClick={() => setCrColor(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer", border: crColor === c ? "2px solid white" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={generarCreativos} disabled={crGenerating || !crTema.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: S.grad, color: "white", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", opacity: (!crTema.trim() || crGenerating) ? 0.5 : 1 }}>
              {crGenerating ? "⏳ Generando..." : "🎨 Generar Creativos"}
            </button>
          </div>

          {/* Panel derecho — preview */}
          <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
            {!crVariantes.length && !crGenerating && (
              <div style={{ textAlign: "center", paddingTop: 80 }}>
                <div style={{ fontSize: 72, marginBottom: 20 }}>🎨</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Generador de Creativos</h2>
                <p style={{ color: S.muted, fontSize: 16, marginBottom: 8 }}>Configurá el producto y el formato a la izquierda</p>
                <p style={{ color: S.faint, fontSize: 14 }}>La IA genera 3 variantes listas para descargar</p>
              </div>
            )}

            {crGenerating && (
              <div style={{ textAlign: "center", paddingTop: 80 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Generando copy con IA...</h2>
                <p style={{ color: S.muted }}>Groq está escribiendo los textos del ad</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: S.grad }} />)}
                </div>
              </div>
            )}

            {crVariantes.length > 0 && crSeleccionada && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                      {crImagenesGenerating ? `🎨 Generando imágenes... (${Object.keys(crImagenesGen).length}/${crVariantes.length})` : `✅ ${crVariantes.length} ads generados con Gemini`}
                    </h2>
                    <p style={{ color: S.muted, fontSize: 13 }}>
                      {crImagenesGenerating ? "Gemini está creando cada ad, aparecen de a uno..." : "Seleccioná uno para regenerar o descargar"}
                    </p>
                  </div>
                  <button onClick={generarCreativos}
                    style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    🔄 Regenerar todo
                  </button>
                </div>

                {/* Variantes: foto real de fondo + diseño CSS encima */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
                  {crVariantes.map(v => {
                    const bgPhoto = crImagenesGen[v.id];
                    const isSelected = crSeleccionada.id === v.id;
                    return (
                      <div key={v.id} onClick={() => setCrSeleccionada(v)}
                        style={{ cursor: "pointer", transition: "all 0.2s", outline: isSelected ? `3px solid ${crColor}` : "none", borderRadius: 14, opacity: isSelected ? 1 : 0.7, transform: isSelected ? "scale(1.03)" : "scale(1)" }}>
                        {/* El div con id es lo que html2canvas exporta */}
                        <div id={`creative-preview-${v.id}`} style={{ borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                          {!bgPhoto && crImagenesGenerating
                            ? <div style={{ width: fmt.w, height: fmt.h, background: "rgba(255,255,255,0.04)", border: `1px dashed ${S.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                <div style={{ fontSize: 28 }}>📷</div>
                                <span style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600 }}>Buscando foto...</span>
                              </div>
                            : getCanvasStyle(v, fmt.w, fmt.h, bgPhoto || null)
                          }
                        </div>
                        <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: S.muted }}>Variante {v.id}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel acciones de la seleccionada */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 20, padding: 24, maxWidth: 700 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>📥 Variante {crSeleccionada.id} seleccionada</h3>
                  <p style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>"{crSeleccionada.headline}"</p>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {/* Descargar imagen Gemini directamente */}
                    {crImagenesGen[crSeleccionada.id] && (
                      <a href={crImagenesGen[crSeleccionada.id]} download={`ad-variante-${crSeleccionada.id}-${crTema.replace(/\s+/g,"-").toLowerCase()}.png`}
                        style={{ padding: "12px 24px", borderRadius: 12, background: S.grad, color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                        ⬇️ Descargar PNG
                      </a>
                    )}
                    {/* Regenerar solo esta variante */}
                    <button onClick={generarImagenIA} disabled={crImagenGenerating}
                      style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#4285F4,#DB1FFF)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: crImagenGenerating ? 0.6 : 1 }}>
                      {crImagenGenerating ? "⏳ Generando..." : "🔄 Regenerar esta imagen"}
                    </button>
                  </div>

                  {crImagenIA && crImagenesGen[crSeleccionada.id] !== crImagenIA && (
                    <div style={{ marginTop: 16, padding: 12, background: "rgba(66,133,244,0.1)", borderRadius: 10, border: "1px solid rgba(66,133,244,0.3)" }}>
                      <p style={{ fontSize: 12, color: "#93c5fd", marginBottom: 8 }}>Nueva imagen generada:</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <img src={crImagenIA} alt="nueva" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <button onClick={() => { setCrImagenesGen(prev => ({ ...prev, [crSeleccionada.id]: crImagenIA! })); setCrImagenIA(null); }}
                            style={{ padding: "8px 16px", borderRadius: 8, background: "#4285F4", color: "white", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
                            ✅ Usar esta
                          </button>
                          <button onClick={() => setCrImagenIA(null)}
                            style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: S.muted, fontWeight: 600, fontSize: 12, border: `1px solid ${S.border}`, cursor: "pointer" }}>
                            ✕ Descartar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ─── WEB GENERATOR ──────────────────────────────────────────────────────────
  if (view === "webgenerator") return (
    <main style={{ minHeight: "100vh", background: S.bg, color: "white", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${S.borderFaint}`, background: "rgba(9,8,32,0.95)", backdropFilter: "blur(10px)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setView(user ? "dashboard" : "landing")} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: 14, fontWeight: 600 }}>← Volver</button>
          <div style={{ width: 1, height: 20, background: S.borderFaint }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌐</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Generador de Web</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>EbookAI</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Intro */}
        {!webHtml && !webGenerating && (
          <>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌐</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
                Generá la web de venta de tu <span style={S.gradText}>ebook</span>
              </h1>
              <p style={{ color: S.muted, fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
                La IA crea una landing page completa con copywriting, diseño profesional y botón de compra lista para publicar
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 24, padding: 32, maxWidth: 580, margin: "0 auto" }}>

              {/* Tabs: desde ebook o manual */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
                {[
                  { id: "fromEbook", label: ebook ? `📚 ${ebook.titulo.slice(0,22)}...` : "📚 Desde ebook", disabled: !ebook },
                  { id: "manual", label: "✍️ Ingresar datos" },
                ].map(t => (
                  <button key={t.id} onClick={() => !t.disabled && setWebMode(t.id as "fromEbook" | "manual")}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: t.disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, background: webMode === t.id ? S.grad : "transparent", color: t.disabled ? S.faint : webMode === t.id ? "white" : "#c4b5fd", opacity: t.disabled ? 0.5 : 1 }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Desde ebook activo */}
              {webMode === "fromEbook" && ebook && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: 14, background: "rgba(112,48,239,0.1)", borderRadius: 14, border: `1px solid ${S.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{ebook.titulo}</div>
                    <div style={{ fontSize: 12, color: S.muted }}>{ebook.capitulos.length} capítulos</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, background: "rgba(112,48,239,0.2)", border: `1px solid ${S.border}`, borderRadius: 100, padding: "4px 10px", color: "#c4b5fd" }}>Activo ✓</span>
                </div>
              )}

              {/* Formulario manual */}
              {webMode === "manual" && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Nombre del producto</label>
                    <input placeholder="Ej: Recetas Sin Gluten Pro" value={webTema} onChange={e => setWebTema(e.target.value)} style={{ ...inputStyle, padding: "12px 16px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 6 }}>Descripción breve</label>
                    <textarea placeholder="Ej: 50 recetas sin gluten para celíacos, fáciles y deliciosas..." value={webDesc} onChange={e => setWebDesc(e.target.value)}
                      style={{ ...inputStyle, padding: "12px 16px", resize: "none" }} rows={3} />
                  </div>
                </div>
              )}

              {/* Precio */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>Precio de venta (USD)</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["9", "17", "27", "37", "47", "97"].map(p => (
                    <button key={p} onClick={() => setWebPrecio(p)}
                      style={{ flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: webPrecio === p ? S.grad : "rgba(255,255,255,0.06)", color: webPrecio === p ? "white" : "#c4b5fd", outline: webPrecio !== p ? `1px solid ${S.border}` : "none" }}>
                      ${p}
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="O escribí tu precio..." value={webPrecio} onChange={e => setWebPrecio(e.target.value)} style={{ ...inputStyle, padding: "12px 16px" }} />
              </div>

              <button onClick={generarWeb} disabled={(webMode === "manual" && !webTema.trim())}
                style={{ width: "100%", padding: "16px", borderRadius: 14, background: S.grad, color: "white", fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer", opacity: (webMode === "manual" && !webTema.trim()) ? 0.5 : 1 }}>
                🌐 Generar Landing Page
              </button>
            </div>
          </>
        )}

        {/* Cargando */}
        {webGenerating && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: S.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 24px", animation: "pulse 2s infinite" }}>🌐</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Generando tu landing page...</h2>
            <p style={{ color: S.muted, marginBottom: 32 }}>La IA está escribiendo el copywriting y diseñando la página</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: S.grad, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, margin: "40px auto 0" }}>
              {["✍️ Escribiendo headline y subtítulo...", "💡 Generando sección de beneficios...", "💰 Creando sección de precios...", "🎨 Aplicando diseño y estilos..."].map(s => (
                <div key={s} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${S.borderFaint}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, color: S.muted, textAlign: "left" }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Resultado */}
        {webHtml && !webGenerating && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>✅ Landing page lista</h2>
                <p style={{ color: S.muted, fontSize: 14 }}>Tu página de ventas está lista para publicar</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setWebPreview(!webPreview)}
                  style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: "#c4b5fd", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  {webPreview ? "📝 Ver código" : "👁 Preview"}
                </button>
                <button onClick={descargarWeb}
                  style={{ padding: "10px 20px", borderRadius: 10, background: S.grad, border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  ⬇️ Descargar HTML
                </button>
                <button onClick={() => { setWebHtml(null); setWebPreview(false); }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${S.border}`, background: "transparent", color: "#c4b5fd", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  🔄 Regenerar
                </button>
              </div>
            </div>

            {/* Tips de publicación */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { icon: "🚀", text: "Subila a GitHub Pages (gratis)" },
                { icon: "⚡", text: "Publicala en Netlify Drop (gratis)" },
                { icon: "🛒", text: "Conectá Gumroad o Hotmart para cobrar" },
              ].map(t => (
                <div key={t.text} style={{ background: "rgba(112,48,239,0.1)", border: `1px solid ${S.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#c4b5fd", display: "flex", gap: 6, alignItems: "center" }}>
                  {t.icon} {t.text}
                </div>
              ))}
            </div>

            {/* Preview o código */}
            {webPreview ? (
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${S.border}`, height: 600 }}>
                <iframe srcDoc={webHtml} style={{ width: "100%", height: "100%", border: "none" }} title="Preview" />
              </div>
            ) : (
              <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${S.borderFaint}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${S.borderFaint}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                  <span style={{ marginLeft: 8, fontSize: 12, color: S.faint }}>landing.html</span>
                </div>
                <pre style={{ padding: 20, fontSize: 12, color: "#c4b5fd", overflow: "auto", maxHeight: 500, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {webHtml.slice(0, 3000)}
                  {webHtml.length > 3000 && "\n\n... (descargá el archivo para ver el código completo)"}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );

  return null;
}
