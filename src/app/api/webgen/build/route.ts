import { NextRequest, NextResponse } from "next/server";
import { buildHTML } from "../builder";

export async function POST(req: NextRequest) {
  const { content, titulo, precio, color } = await req.json();
  const html = buildHTML(content, titulo, precio, color);
  return NextResponse.json({ ok: true, html });
}
