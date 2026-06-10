"use client";
import { useState } from "react";

type Capitulo = {
  numero: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  puntos_clave: string[];
  tip: string;
  imagen_prompt: string;
};

type Ebook = {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  color_principal: string;
  color_secundario: string;
  capitulos: Capitulo[];
};

export default function Home() {
  const [tema, setTema] = useState("");
  const [paginas, setPaginas] = useState(10);
  const [estilo, setEstilo] = useState("minimalista");
  const [step, setStep] = useState<"form" | "loading" | "editor">("form");
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [editingCap, setEditingCap] = useState<number | null>(null);

  async function generar() {
    if (!tema.trim()) return;
    setStep("loading");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema, paginas, estilo }),
    });
    const json = await res.json();
    if (json.ok) { setEbook(json.data); setStep("editor"); }
    else { alert("Error generando. Intentá de nuevo."); setStep("form"); }
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
    } else { alert("Error generando PDF"); }
    setDownloading(false);
  }

  function updateCap(idx: number, field: keyof Capitulo, value: string | string[]) {
    if (!ebook) return;
    const caps = [...ebook.capitulos];
    caps[idx] = { ...caps[idx], [field]: value };
    setEbook({ ...ebook, capitulos: caps });
  }

  if (step === "form") return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{background: "linear-gradient(135deg, #090820 0%, #1a0a3a 50%, #090820 100%)"}}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Generador de <span style={{background: "linear-gradient(90deg, #7030EF, #DB1FFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>Ebooks IA</span></h1>
          <p className="text-purple-300 text-sm">Crea tu ebook profesional en segundos</p>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{background: "rgba(255,255,255,0.05)", border: "1px solid rgba(112,48,239,0.3)", backdropFilter: "blur(10px)"}}>
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Tema del ebook</label>
            <input
              className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{background: "rgba(255,255,255,0.07)", border: "1px solid rgba(112,48,239,0.4)"}}
              placeholder="Ej: Recetas sin gluten, Marketing digital..."
              value={tema} onChange={e => setTema(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generar()}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Cantidad de páginas</label>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map(n => (
                <button key={n} onClick={() => setPaginas(n)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={paginas === n
                    ? {background: "linear-gradient(135deg, #7030EF, #DB1FFF)", color: "white", border: "none"}
                    : {background: "rgba(255,255,255,0.05)", color: "#c4b5fd", border: "1px solid rgba(112,48,239,0.3)"}}>
                  {n} pág.
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Estilo visual</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "minimalista", label: "Minimalista", emoji: "⬜" },
                { id: "colorido", label: "Colorido", emoji: "🎨" },
                { id: "profesional", label: "Profesional", emoji: "💼" },
                { id: "creativo", label: "Creativo", emoji: "✨" },
              ].map(e => (
                <button key={e.id} onClick={() => setEstilo(e.id)}
                  className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={estilo === e.id
                    ? {background: "linear-gradient(135deg, #7030EF, #DB1FFF)", color: "white", border: "none"}
                    : {background: "rgba(255,255,255,0.05)", color: "#c4b5fd", border: "1px solid rgba(112,48,239,0.3)"}}>
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generar}
            className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
            ✨ Generar Ebook
          </button>
        </div>
      </div>
    </main>
  );

  if (step === "loading") return (
    <main className="min-h-screen flex items-center justify-center" style={{background: "linear-gradient(135deg, #090820 0%, #1a0a3a 50%, #090820 100%)"}}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
          <span className="text-4xl animate-bounce">📚</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Generando tu ebook...</h2>
        <p className="text-purple-300 mb-6">La IA está creando el contenido. Puede tardar unos segundos.</p>
        <div className="flex justify-center gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full animate-bounce"
              style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)", animationDelay: `${i*0.2}s`}}/>
          ))}
        </div>
      </div>
    </main>
  );

  if (!ebook) return null;

  return (
    <main className="min-h-screen" style={{background: "linear-gradient(135deg, #090820 0%, #1a0a3a 100%)"}}>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{background: "rgba(9,8,32,0.9)", borderBottom: "1px solid rgba(112,48,239,0.3)", backdropFilter: "blur(10px)"}}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-white">{ebook.titulo}</h1>
            <p className="text-xs text-purple-400">{ebook.capitulos.length} capítulos • Editá el contenido abajo</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("form")}
              className="px-4 py-2 text-sm rounded-lg text-purple-300 transition hover:text-white"
              style={{border: "1px solid rgba(112,48,239,0.4)"}}>
              ← Nuevo
            </button>
            <button onClick={descargar} disabled={downloading}
              className="px-5 py-2 text-sm font-bold rounded-lg text-white transition hover:opacity-90 disabled:opacity-50"
              style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
              {downloading ? "Generando..." : "⬇️ Descargar PDF"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Info general */}
        <div className="rounded-2xl p-6" style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(112,48,239,0.25)"}}>
          <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Título", key: "titulo", type: "input" },
              { label: "Subtítulo", key: "subtitulo", type: "input" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-purple-300">{f.label}</label>
                <input className="w-full rounded-xl px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.3)"}}
                  value={(ebook as unknown as Record<string,string>)[f.key]}
                  onChange={e => setEbook({...ebook, [f.key]: e.target.value})}/>
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-purple-300">Descripción</label>
              <textarea className="w-full rounded-xl px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.3)"}}
                rows={2} value={ebook.descripcion}
                onChange={e => setEbook({...ebook, descripcion: e.target.value})}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-purple-300">Color principal</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={ebook.color_principal}
                  onChange={e => setEbook({...ebook, color_principal: e.target.value})}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"/>
                <span className="text-sm text-purple-300">{ebook.color_principal}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-purple-300">Color secundario</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={ebook.color_secundario}
                  onChange={e => setEbook({...ebook, color_secundario: e.target.value})}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"/>
                <span className="text-sm text-purple-300">{ebook.color_secundario}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capítulos */}
        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Capítulos</h2>
        {ebook.capitulos.map((cap, idx) => (
          <div key={idx} className="rounded-2xl overflow-hidden" style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(112,48,239,0.25)"}}>
            <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/5 transition"
              onClick={() => setEditingCap(editingCap === idx ? null : idx)}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
                  {cap.numero}
                </span>
                <span className="font-semibold text-white">{cap.titulo}</span>
              </div>
              <span className="text-purple-400">{editingCap === idx ? "▲" : "▼"}</span>
            </div>

            {editingCap === idx && (
              <div className="px-6 pb-6 space-y-4 border-t" style={{borderColor: "rgba(112,48,239,0.2)"}}>
                {[
                  { label: "Título", field: "titulo" as keyof Capitulo, rows: 1 },
                  { label: "Descripción", field: "descripcion" as keyof Capitulo, rows: 1 },
                  { label: "Contenido principal", field: "contenido" as keyof Capitulo, rows: 5 },
                  { label: "Consejo del experto", field: "tip" as keyof Capitulo, rows: 1 },
                ].map(f => (
                  <div key={f.field} className="pt-3">
                    <label className="text-xs font-semibold text-purple-300">{f.label}</label>
                    {f.rows === 1 ? (
                      <input className="w-full rounded-xl px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.3)"}}
                        value={cap[f.field] as string}
                        onChange={e => updateCap(idx, f.field, e.target.value)}/>
                    ) : (
                      <textarea className="w-full rounded-xl px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.3)"}}
                        rows={f.rows}
                        value={cap[f.field] as string}
                        onChange={e => updateCap(idx, f.field, e.target.value)}/>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-purple-300">Puntos clave (uno por línea)</label>
                  <textarea className="w-full rounded-xl px-3 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(112,48,239,0.3)"}}
                    rows={3} value={cap.puntos_clave.join("\n")}
                    onChange={e => updateCap(idx, "puntos_clave", e.target.value.split("\n"))}/>
                </div>
              </div>
            )}
          </div>
        ))}

        <button onClick={descargar} disabled={downloading}
          className="w-full py-4 rounded-xl font-bold text-white text-lg transition hover:opacity-90 disabled:opacity-50"
          style={{background: "linear-gradient(135deg, #7030EF, #DB1FFF)"}}>
          {downloading ? "⏳ Generando PDF..." : "⬇️ Descargar PDF Completo"}
        </button>
      </div>
    </main>
  );
}
