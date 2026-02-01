import { callToolHelloWorld } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST() {
  try {
    const raw = await callToolHelloWorld();
    const text = extractTextFromMcpResponse(raw);
    return Response.json({ text, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ text: "", raw: { error: message } }, { status: 500 });
  }
}
