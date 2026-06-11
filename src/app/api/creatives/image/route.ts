import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tema = "business", estilo = "dark", headline = "", cta = "", precio = "", mostrarPrecio = false } = await req.json();

  const estiloDesc = estilo === "dark" ? "dark cinematic dramatic background, moody atmosphere, deep shadows"
    : estilo === "gradient" ? "vibrant colorful gradient background, neon lights, energetic"
    : estilo === "minimal" ? "clean white minimalist studio background, elegant professional"
    : "bold high contrast colors, striking aggressive style";

  const prompt = `Design a high-quality professional social media advertising image for a digital product.

PRODUCT: "${tema}"
HEADLINE: "${headline}"
CTA BUTTON TEXT: "${cta}"

VISUAL STYLE: ${estiloDesc}

DESIGN REQUIREMENTS:
- Split layout: left side has bold large typography with the headline, bullet points with benefits, and a CTA button; right side has a realistic product mockup (ebook, guide, notebook, or digital course visual) with relevant lifestyle photography related to the product topic
- Background: dark or black with subtle texture or gradient
- Typography: extra bold, modern sans-serif, high contrast white and accent color text
- Include 3-4 benefit icons or checkmarks with short benefit text
- Add a prominent rounded CTA button at the bottom in a bright accent color
- Include trust badges or small icons (instant access, lifetime, guarantee)
- Product mockup should look like a real physical book or tablet showing content related to "${tema}"
- Real photography elements: include a relevant human or hands interacting with the product
- Professional commercial advertising quality, like a $50,000 marketing campaign
- All Spanish text, no placeholder text
- Ultra realistic, photographic quality, 4K resolution aesthetic
- NO price shown unless specified`;

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
