"use client";
import { useState } from "react";

export default function Landing() {
  const [email, setEmail] = useState("");

  return (
    <main style={{ background: "#090820", color: "white", fontFamily: "sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid rgba(112,48,239,0.3)", backdropFilter: "blur(10px)", background: "rgba(9,8,32,0.9)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>EbookAI</span>
          </div>
          <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#c4b5fd" }}>
            <a href="#features" style={{ color: "#c4b5fd", textDecoration: "none" }}>Funciones</a>
            <a href="#como" style={{ color: "#c4b5fd", textDecoration: "none" }}>Cómo funciona</a>
            <a href="#precios" style={{ color: "#c4b5fd", textDecoration: "none" }}>Precios</a>
          </div>
          <a href="/api/generate" style={{ background: "linear-gradient(135deg,#7030EF,#DB1FFF)", color: "white", padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Empezar gratis →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(112,48,239,0.15)", border: "1px solid rgba(112,48,239,0.4)", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "#c4b5fd", marginBottom: 28 }}>
          ✨ Inteligencia Artificial para crear ebooks profesionales
        </div>
        <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
          Crea ebooks que{" "}
          <span style={{ background: "linear-gradient(90deg,#7030EF,#DB1FFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            se venden solos
          </span>
          {" "}en segundos
        </h1>
        <p style={{ fontSize: 20, color: "#a78bfa", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Escribí el tema, la IA genera el contenido completo con imágenes, diseño premium y listo para vender en minutos.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/" style={{ background: "linear-gradient(135deg,#7030EF,#DB1FFF)", color: "white", padding: "16px 36px", borderRadius: 12, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>
            ✨ Crear mi ebook gratis
          </a>
          <a href="#como" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.4)", color: "white", padding: "16px 36px", borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
            ▶ Ver demo
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
          {[
            { num: "10,000+", label: "Ebooks generados" },
            { num: "2 min", label: "Tiempo promedio" },
            { num: "200+", label: "Temas disponibles" },
            { num: "98%", label: "Satisfacción" },
          ].map(s => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(90deg,#7030EF,#DB1FFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#7a6aaa", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEW */}
      <section style={{ maxWidth: 900, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(112,48,239,0.2),rgba(219,31,255,0.1))", border: "1px solid rgba(112,48,239,0.3)", borderRadius: 24, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Vista previa del ebook generado</div>
          <div style={{ color: "#a78bfa", fontSize: 15, marginBottom: 28 }}>Contenido real, imágenes profesionales, diseño premium</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["✅ Contenido con IA", "✅ Imágenes automáticas", "✅ PDF listo para vender", "✅ Editable al instante"].map(f => (
              <span key={f} style={{ background: "rgba(112,48,239,0.2)", border: "1px solid rgba(112,48,239,0.4)", borderRadius: 100, padding: "6px 14px", fontSize: 13, color: "#c4b5fd" }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Todo lo que necesitás para <span style={{ background: "linear-gradient(90deg,#7030EF,#DB1FFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>vender más</span></h2>
          <p style={{ color: "#a78bfa", fontSize: 18 }}>Una plataforma completa para crear y comercializar productos digitales</p>
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
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(112,48,239,0.25)", borderRadius: 20, padding: 28, transition: "border-color 0.2s" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#a78bfa", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Cómo funciona</h2>
          <p style={{ color: "#a78bfa", fontSize: 18 }}>3 pasos y tu ebook está listo para vender</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { paso: "01", icon: "💬", title: "Escribí tu tema", desc: "Ingresá el tema de tu ebook, elegí la cantidad de páginas y el estilo visual que querés." },
            { paso: "02", icon: "🤖", title: "La IA lo genera", desc: "En segundos tenés contenido completo, estructurado, con imágenes y diseño profesional." },
            { paso: "03", icon: "💰", title: "Editá y vendé", desc: "Personalizá lo que quieras, descargá el PDF y empezá a venderlo en cualquier plataforma." },
          ].map(s => (
            <div key={s.paso} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(112,48,239,0.25)", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 72, fontWeight: 900, position: "absolute", top: -10, right: 16, opacity: 0.06, color: "#7030EF" }}>{s.paso}</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#DB1FFF", letterSpacing: 2, marginBottom: 8 }}>PASO {s.paso}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: "#a78bfa", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Planes simples y transparentes</h2>
          <p style={{ color: "#a78bfa", fontSize: 18 }}>Empezá gratis, escalá cuando quieras</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {[
            { nombre: "Free", precio: "$0", period: "para siempre", color: "rgba(255,255,255,0.03)", borde: "rgba(112,48,239,0.25)", features: ["3 ebooks por mes", "Hasta 10 páginas", "Diseño estándar", "Descarga en PDF"], cta: "Empezar gratis", highlight: false },
            { nombre: "Pro", precio: "$19", period: "por mes", color: "linear-gradient(135deg,rgba(112,48,239,0.2),rgba(219,31,255,0.15))", borde: "#7030EF", features: ["Ebooks ilimitados", "Hasta 50 páginas", "Diseño premium", "Imágenes automáticas", "Creativos publicitarios", "Dashboard completo"], cta: "Empezar Pro", highlight: true },
            { nombre: "Agency", precio: "$49", period: "por mes", color: "rgba(255,255,255,0.03)", borde: "rgba(112,48,239,0.25)", features: ["Todo lo de Pro", "5 usuarios", "API access", "Soporte prioritario", "White label"], cta: "Contactar", highlight: false },
          ].map(p => (
            <div key={p.nombre} style={{ background: p.color, border: `1px solid ${p.borde}`, borderRadius: 24, padding: 36, position: "relative" }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7030EF,#DB1FFF)", borderRadius: 100, padding: "4px 16px", fontSize: 12, fontWeight: 700 }}>MÁS POPULAR</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: "#DB1FFF", marginBottom: 8 }}>{p.nombre}</div>
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 4 }}>{p.precio}</div>
              <div style={{ fontSize: 13, color: "#7a6aaa", marginBottom: 28 }}>{p.period}</div>
              <div style={{ borderTop: "1px solid rgba(112,48,239,0.2)", paddingTop: 24, marginBottom: 28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14, color: "#c4b5fd" }}>
                    <span style={{ color: "#DB1FFF" }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none", background: p.highlight ? "linear-gradient(135deg,#7030EF,#DB1FFF)" : "rgba(112,48,239,0.2)", color: "white", border: p.highlight ? "none" : "1px solid rgba(112,48,239,0.4)" }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 800, margin: "0 auto 100px", padding: "0 24px", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(112,48,239,0.25),rgba(219,31,255,0.15))", border: "1px solid rgba(112,48,239,0.4)", borderRadius: 28, padding: "60px 40px" }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>¿Listo para crear tu primer ebook?</h2>
          <p style={{ color: "#a78bfa", fontSize: 18, marginBottom: 36 }}>Únite a miles de creadores que ya generan ingresos con sus productos digitales.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 480, margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="Tu email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 220, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(112,48,239,0.4)", borderRadius: 12, padding: "14px 18px", color: "white", fontSize: 15, outline: "none" }}
            />
            <a href="/" style={{ background: "linear-gradient(135deg,#7030EF,#DB1FFF)", color: "white", padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none", whiteSpace: "nowrap" }}>
              Empezar gratis →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(112,48,239,0.2)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>EbookAI</span>
        </div>
        <p style={{ color: "#7a6aaa", fontSize: 13 }}>© 2025 EbookAI. Todos los derechos reservados.</p>
      </footer>

    </main>
  );
}
