import { callToolHelloWorld } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export async function POST() {
  try {
    const result = await callToolHelloWorld();
    const text = extractTextFromMcpResponse(result.data);
    return Response.json({ text, raw: result.data, rawText: result.rawText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ text: "", raw: { error: message } }, { status: 500 });
  }
}
