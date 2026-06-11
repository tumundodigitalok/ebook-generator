import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tema = "business", estilo = "dark", headline = "", cta = "", precio = "" } = await req.json();

  const estiloDesc = estilo === "dark" ? "dark cinematic dramatic background, moody atmosphere, deep shadows"
    : estilo === "gradient" ? "vibrant colorful gradient background, neon lights, energetic"
    : estilo === "minimal" ? "clean white minimalist studio background, elegant professional"
    : "bold high contrast colors, striking aggressive style";

  const prompt = `Professional social media advertisement image. Product: "${tema}". ${estiloDesc}. The ad has bold text overlay "${headline}", a prominent CTA button "${cta}", price tag "$${precio} USD". Style: real marketing ad, commercial photography quality, high contrast text, professional layout. No borders, full bleed image. Photorealistic.`;

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
