import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { tema, paginas, estilo } = await req.json();
  const numCaps = Math.max(8, Math.floor(paginas / 2));

  const prompt = `Eres un experto en crear ebooks premium de alta calidad. Genera contenido MUY DETALLADO para un ebook sobre "${tema}".

REGLAS OBLIGATORIAS:
- Genera EXACTAMENTE ${numCaps} capitulos, ni uno menos
- Si el tema es RECETAS: cada capitulo = una receta completa con:
  * Ingredientes con cantidades exactas (ej: 200g de harina de arroz)
  * Pasos numerados muy detallados (minimo 6 pasos)
  * Tiempo de preparacion y porciones
  * Variaciones y sustituciones posibles
- El contenido de cada capitulo debe ser LARGO y DETALLADO (minimo 200 palabras)
- Puntos clave: minimo 4 puntos especificos y utiles
- NO repitas contenido entre capitulos
- Estilo: ${estilo}

Devuelve SOLO JSON sin markdown:
{
  "titulo": "titulo atractivo",
  "subtitulo": "subtitulo que venda",
  "descripcion": "descripcion corta",
  "color_principal": "#7030EF",
  "color_secundario": "#1a0a3a",
  "capitulos": [
    {
      "numero": 1,
      "titulo": "nombre especifico del plato o tema",
      "descripcion": "descripcion apetitosa de una linea",
      "contenido": "contenido muy detallado con ingredientes, pasos, tiempos y consejos. Minimo 200 palabras.",
      "puntos_clave": ["punto util 1", "punto util 2", "punto util 3", "punto util 4"],
      "tip": "consejo practico y especifico del chef o experto",
      "imagen_keyword": "palabra clave en ingles para buscar imagen (ej: pasta, pizza, salad)"
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(clean);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error generando contenido" }, { status: 500 });
  }
}
