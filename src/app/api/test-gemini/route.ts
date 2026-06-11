import { NextResponse } from "next/server";

async function testModel(key: string, model: string, extra: Record<string, unknown> = {}) {
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model, prompt: "A simple red circle on white background", n: 1, size: "1024x1024", ...extra }),
    });
    const data = await r.json();
    return { status: r.status, ok: r.ok, error: data.error?.message || null, has_url: !!data.data?.[0]?.url };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function GET() {
  const key = process.env.OPENAI_API_KEY ?? "";
  const results: Record<string, unknown> = {
    key_exists: !!key,
    key_prefix: key ? key.slice(0, 10) + "..." : "NOT SET",
  };

  results["dalle3"] = await testModel(key, "dall-e-3", { quality: "standard" });
  results["dalle2"] = await testModel(key, "dall-e-2");
  results["gpt_image_1"] = await testModel(key, "gpt-image-1");

  return NextResponse.json(results);
}
