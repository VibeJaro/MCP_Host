import { callToolRollDice } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export async function POST() {
  try {
    const { raw, rawText } = await callToolRollDice();
    const result = extractTextFromMcpResponse(raw);
    return Response.json({ result, rawText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ result: "", rawText: message }, { status: 502 });
  }
}
