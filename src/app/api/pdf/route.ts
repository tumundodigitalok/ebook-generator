import { NextRequest, NextResponse } from "next/server";

async function generarPortada(titulo: string, colorPrincipal: string): Promise<string | null> {
  try {
    const prompt = `Professional ebook cover for "${titulo}". Modern minimalist design, abstract background, premium digital product. Color palette inspired by ${colorPrincipal}. Clean, no text.`;
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard", response_format: "url" }),
    });
    const data = await res.json();
    const url = data.data?.[0]?.url;
    if (!url) return null;
    const imgRes = await fetch(url);
    const buf = await imgRes.arrayBuffer();
    return Buffer.from(buf).toString("base64");
  } catch (e) { console.error("[PDF portada]", e); return null; }
}

export async function POST(req: NextRequest) {
  const ebook = await req.json();
  const { titulo, subtitulo, descripcion, capitulos = [], color_principal = "#7030EF" } = ebook;

  const portadaB64 = await generarPortada(titulo, color_principal);

  const capitulosHtml = (capitulos as { titulo: string; descripcion: string; puntos_clave?: string[] }[]).map((cap, i) => `
    <div class="capitulo">
      <div class="cap-num">Capítulo ${i + 1}</div>
      <h2 class="cap-titulo">${cap.titulo}</h2>
      <p class="cap-desc">${cap.descripcion}</p>
      ${cap.puntos_clave?.length ? `<div class="puntos">${cap.puntos_clave.map(p => `
        <div class="punto"><div class="check">✓</div><span>${p}</span></div>`).join("")}
      </div>` : ""}
    </div>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Georgia, serif; background:#fff; color:#1a1a2e; }

.portada {
  width:100%; height:100vh; min-height:700px;
  background: ${portadaB64 ? `url('data:image/png;base64,${portadaB64}')` : `linear-gradient(135deg,${color_principal},#0d0820)`};
  background-size:cover; background-position:center;
  display:flex; flex-direction:column; justify-content:flex-end;
  padding:64px; position:relative; page-break-after:always;
}
.portada-overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.78) 100%); }
.portada-content { position:relative; z-index:1; }
.portada-badge { display:inline-block; background:${color_principal}; color:white; font-size:11px; font-weight:700; padding:6px 18px; border-radius:20px; letter-spacing:2px; text-transform:uppercase; margin-bottom:24px; font-family:Arial,sans-serif; }
.portada h1 { font-size:56px; font-weight:900; color:white; line-height:1.1; margin-bottom:16px; font-family:Arial,sans-serif; }
.portada h2 { font-size:20px; font-weight:300; color:rgba(255,255,255,0.8); line-height:1.5; font-family:Arial,sans-serif; }
.portada-line { width:64px; height:5px; background:${color_principal}; border-radius:3px; margin-bottom:24px; }

.indice { padding:60px; page-break-after:always; }
.indice h2 { font-size:30px; font-weight:800; color:${color_principal}; margin-bottom:36px; font-family:Arial,sans-serif; }
.indice-item { display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid #f0f0f0; }
.indice-num { width:34px; height:34px; border-radius:50%; background:${color_principal}22; color:${color_principal}; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:Arial,sans-serif; }
.indice-titulo { font-size:15px; color:#333; font-family:Arial,sans-serif; }

.intro { padding:60px; page-break-after:always; }
.intro-label { font-size:11px; font-weight:700; color:${color_principal}; text-transform:uppercase; letter-spacing:3px; margin-bottom:14px; font-family:Arial,sans-serif; }
.intro h2 { font-size:34px; font-weight:800; margin-bottom:24px; font-family:Arial,sans-serif; }
.intro p { font-size:16px; line-height:1.9; color:#555; }

.capitulo { padding:60px; page-break-after:always; border-top:6px solid ${color_principal}; }
.cap-num { font-size:11px; font-weight:700; color:${color_principal}; text-transform:uppercase; letter-spacing:3px; margin-bottom:12px; font-family:Arial,sans-serif; }
.cap-titulo { font-size:34px; font-weight:800; margin-bottom:24px; line-height:1.2; font-family:Arial,sans-serif; }
.cap-desc { font-size:16px; line-height:1.85; color:#555; margin-bottom:32px; }
.puntos { display:flex; flex-direction:column; gap:12px; }
.punto { display:flex; align-items:flex-start; gap:14px; background:${color_principal}0d; padding:16px 20px; border-radius:10px; border-left:4px solid ${color_principal}; }
.check { width:26px; height:26px; border-radius:50%; background:${color_principal}; color:white; font-size:13px; font-weight:700; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:Arial,sans-serif; }
.punto span { font-size:15px; line-height:1.65; color:#333; padding-top:3px; }
</style></head><body>

<div class="portada">
  <div class="portada-overlay"></div>
  <div class="portada-content">
    <div class="portada-badge">Ebook Digital</div>
    <div class="portada-line"></div>
    <h1>${titulo}</h1>
    <h2>${subtitulo}</h2>
  </div>
</div>

<div class="indice">
  <h2>Contenido</h2>
  ${(capitulos as { titulo: string }[]).map((c, i) => `
  <div class="indice-item">
    <div class="indice-num">${i + 1}</div>
    <span class="indice-titulo">${c.titulo}</span>
  </div>`).join("")}
</div>

<div class="intro">
  <div class="intro-label">Introducción</div>
  <h2>Sobre este ebook</h2>
  <p>${descripcion}</p>
</div>

${capitulosHtml}

</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
