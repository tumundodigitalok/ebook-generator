import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildHTML } from "./builder";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { titulo, subtitulo, descripcion, capitulos = [], color_principal = "#7030EF", precio = "27" } = await req.json();

  const caps = capitulos.slice(0, 6).map((c: { titulo: string; descripcion: string; puntos_clave?: string[] }, i: number) => ({
    num: i + 1,
    titulo: c.titulo,
    items: c.puntos_clave?.slice(0, 4) || [c.descripcion],
  }));

  const prompt = `Sos un experto en copywriting de ventas en español argentino. Generá contenido de ventas para una landing page del siguiente producto digital:

PRODUCTO: ${titulo}
SUBTÍTULO: ${subtitulo}
DESCRIPCIÓN: ${descripcion}
PRECIO: $${precio} USD
MÓDULOS/CAPÍTULOS: ${JSON.stringify(caps)}

Devolvé SOLO este JSON sin markdown:
{
  "badge": "frase corta de credibilidad (ej: +500 clientes satisfechos)",
  "headline_top": "frase en mayúsculas tipo gancho (ej: EL SISTEMA COMPLETO PARA...)",
  "headline_main": "título principal de impacto con emoji al inicio (máx 12 palabras)",
  "subheadline": "frase de apoyo explicando el beneficio principal (1-2 líneas)",
  "pain_title": "ESTE PRODUCTO ES PARA VOS SI…",
  "pains": ["dolor 1 con emoji ➡️", "dolor 2", "dolor 3", "dolor 4", "dolor 5"],
  "gains_title": "CON ESTE PRODUCTO VAS A LOGRAR:",
  "gains": ["logro 1 con emoji ✅", "logro 2", "logro 3", "logro 4"],
  "modulos_titulo": "¿QUÉ INCLUYE ESTE PRODUCTO?",
  "modulos": [
    {"num": 1, "emoji": "📘", "titulo": "titulo modulo 1", "items": ["item 1", "item 2", "item 3", "item 4"]},
    {"num": 2, "emoji": "📗", "titulo": "titulo modulo 2", "items": ["item 1", "item 2", "item 3"]},
    {"num": 3, "emoji": "📕", "titulo": "titulo modulo 3", "items": ["item 1", "item 2", "item 3"]},
    {"num": 4, "emoji": "📙", "titulo": "titulo modulo 4", "items": ["item 1", "item 2", "item 3"]},
    {"num": 5, "emoji": "📒", "titulo": "titulo modulo 5", "items": ["item 1", "item 2", "item 3"]}
  ],
  "bonos": [
    {"titulo": "titulo bono 1", "emoji": "🎁"},
    {"titulo": "titulo bono 2", "emoji": "🎁"},
    {"titulo": "titulo bono 3", "emoji": "🎁"}
  ],
  "testimonios": [
    {"nombre": "nombre persona 1", "estrellas": "★★★★★", "texto": "testimonio corto y convincente"},
    {"nombre": "nombre persona 2", "estrellas": "★★★★★", "texto": "testimonio diferente"},
    {"nombre": "nombre persona 3", "estrellas": "★★★★★", "texto": "testimonio con resultado específico"},
    {"nombre": "nombre persona 4", "estrellas": "★★★★★", "texto": "testimonio persuasivo"},
    {"nombre": "nombre persona 5", "estrellas": "★★★★★", "texto": "testimonio final"}
  ],
  "faqs": [
    {"q": "pregunta 1", "a": "respuesta 1"},
    {"q": "pregunta 2", "a": "respuesta 2"},
    {"q": "pregunta 3", "a": "respuesta 3"},
    {"q": "pregunta 4", "a": "respuesta 4"}
  ],
  "cta_text": "texto del botón principal en mayúsculas (ej: ¡SÍ, QUIERO ACCEDER AHORA!)",
  "garantia": "texto de garantía (ej: 7 días para probarlo. Si no te convence, devolvemos el 100%.)",
  "precio_tachado": "${parseFloat(precio) * 3}",
  "footer_text": "texto del footer con nombre del producto y año"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const content = JSON.parse(clean);

    const html = buildHTML(content, titulo, precio, color_principal);
    return NextResponse.json({ ok: true, html, content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error generando web" }, { status: 500 });
  }
}
