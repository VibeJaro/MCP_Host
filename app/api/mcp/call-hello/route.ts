import { NextResponse } from "next/server";
import { callToolHelloWorld } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export async function POST() {
  try {
    const raw = await callToolHelloWorld();
    const text = extractTextFromMcpResponse(raw);
    return NextResponse.json({ text, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ text: "", raw: { error: message } }, { status: 500 });
  }
}
