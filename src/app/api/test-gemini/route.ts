import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  const results: Record<string, unknown> = {
    key_exists: !!key,
    key_prefix: key ? key.slice(0, 10) + "..." : "NOT SET",
  };

  // Test DALL-E 3
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: "A simple red circle on white background",
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });
    const data = await r.json();
    results["dalle3"] = {
      status: r.status,
      ok: r.ok,
      error: data.error?.message || null,
      has_url: !!data.data?.[0]?.url,
    };
  } catch (e) {
    results["dalle3"] = { error: String(e) };
  }

  return NextResponse.json(results);
}
