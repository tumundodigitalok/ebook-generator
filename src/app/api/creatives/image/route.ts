import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tema = "business", estilo = "dark", headline = "", cta = "", precio = "", mostrarPrecio = false } = await req.json();

  const estiloDesc = estilo === "dark" ? "dark cinematic dramatic background, moody atmosphere, deep shadows"
    : estilo === "gradient" ? "vibrant colorful gradient background, neon lights, energetic"
    : estilo === "minimal" ? "clean white minimalist studio background, elegant professional"
    : "bold high contrast colors, striking aggressive style";

  const prompt = `Create a professional Instagram marketing post (1:1 square format) for a digital product called "${tema}".

Layout: Dark/black background. Large bold title text "${headline}" taking up 40% of the image. Below it, 3-4 bullet points with checkmarks listing key benefits. A bold colored CTA button at the bottom with text "${cta}". Include relevant product mockup photo or lifestyle image related to ${tema} on the right side.

Style: ${estiloDesc}. Professional marketing design like a high-end digital product advertisement. Bold typography, high contrast, clean layout. Similar to premium online course or ebook ads. No lorem ipsum. All text in Spanish.

Visual requirements: Product mockup image showing the digital product (ebook, guide, or course). Icons or badges showing value (e.g. "150+ protocols", "instant access"). Real photography quality. Commercial advertising standard.`;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[DALL-E] Error:", JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ ok: false, error: data.error?.message || "Error DALL-E" }, { status: 400 });
    }

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ ok: false, error: "No image returned" }, { status: 400 });
    }

    // Descargar la imagen y convertir a base64 para el frontend
    const imgResponse = await fetch(imageUrl);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    console.log("[DALL-E] ✅ Image generated");
    return NextResponse.json({ ok: true, imageBase64: base64, mimeType: "image/png" });

  } catch (err) {
    console.error("[DALL-E] Exception:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
