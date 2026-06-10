import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test Pollinations básico
  try {
    const url = "https://image.pollinations.ai/prompt/red%20circle?width=64&height=64&nologo=true";
    console.log("[Test] Fetching Pollinations...");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    results["pollinations"] = {
      status: r.status,
      contentType: r.headers.get("content-type"),
      ok: r.ok,
    };

    if (r.ok) {
      const buf = await r.arrayBuffer();
      results["pollinations_bytes"] = buf.byteLength;
    }
  } catch (e) {
    results["pollinations"] = { error: String(e) };
  }

  // Test conexión general
  try {
    const r = await fetch("https://httpbin.org/get");
    results["internet"] = { status: r.status, ok: r.ok };
  } catch (e) {
    results["internet"] = { error: String(e) };
  }

  return NextResponse.json(results);
}
