import { NextRequest, NextResponse } from "next/server";

// Extrae palabras clave del tema para buscar foto relevante
function extractKeywords(tema: string): string {
  const stopwords = ["de", "el", "la", "los", "las", "un", "una", "para", "con", "en", "del", "al", "y", "o", "a"];
  return tema
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w))
    .slice(0, 3)
    .join(",");
}

export async function POST(req: NextRequest) {
  const { tema = "business", width = 1080, height = 1080 } = await req.json();

  const keywords = extractKeywords(tema) || "business,success,professional";
  const seed = Math.floor(Math.random() * 9999);

  // LoremFlickr — sin API key, fotos por keyword
  const url = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?random=${seed}&lock=0`;

  try {
    console.log(`[Photo] Fetching background for "${keywords}"...`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    console.log(`[Photo] ✅ Got ${arrayBuffer.byteLength} bytes, type: ${contentType}`);

    return NextResponse.json({ ok: true, imageBase64: base64, mimeType: contentType });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Photo] Error:", msg);

    // Fallback: Picsum Photos (fotos aleatorias hermosas, siempre funciona)
    try {
      const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;
      console.log("[Photo] Fallback to Picsum...");
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), 15000);
      const r2 = await fetch(fallbackUrl, { signal: controller2.signal, redirect: "follow" });
      clearTimeout(timer2);
      if (r2.ok) {
        const buf = await r2.arrayBuffer();
        const b64 = Buffer.from(buf).toString("base64");
        return NextResponse.json({ ok: true, imageBase64: b64, mimeType: "image/jpeg" });
      }
    } catch { /* ignore */ }

    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
