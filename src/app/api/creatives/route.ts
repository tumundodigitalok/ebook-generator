import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { titulo, descripcion, precio, formato, estilo } = await req.json();

  const prompt = `Sos experto en marketing digital y copy para redes sociales en español argentino. Generá copy para un creativo publicitario de ${formato}.

PRODUCTO: ${titulo}
DESCRIPCIÓN: ${descripcion}
PRECIO: $${precio} USD
ESTILO: ${estilo}

Devolvé SOLO este JSON sin markdown:
{
  "variantes": [
    {
      "id": 1,
      "tag": "etiqueta corta en mayúsculas (ej: OFERTA LIMITADA)",
      "headline": "título principal impactante máximo 6 palabras",
      "subheadline": "frase de apoyo máximo 10 palabras",
      "beneficios": ["beneficio corto 1", "beneficio corto 2", "beneficio corto 3"],
      "cta": "texto del botón máximo 4 palabras (ej: ACCEDER AHORA)",
      "emoji_hero": "un emoji relevante al producto"
    },
    {
      "id": 2,
      "tag": "tag diferente",
      "headline": "headline alternativo con ángulo diferente",
      "subheadline": "subheadline alternativo",
      "beneficios": ["beneficio 1", "beneficio 2", "beneficio 3"],
      "cta": "CTA alternativo",
      "emoji_hero": "emoji diferente"
    },
    {
      "id": 3,
      "tag": "tercer ángulo",
      "headline": "headline con urgencia o curiosidad",
      "subheadline": "subheadline con resultado específico",
      "beneficios": ["beneficio 1", "beneficio 2", "beneficio 3"],
      "cta": "CTA con urgencia",
      "emoji_hero": "emoji"
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(clean);
    return NextResponse.json({ ok: true, variantes: data.variantes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Error generando creativos" }, { status: 500 });
  }
}
