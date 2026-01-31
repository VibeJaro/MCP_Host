import { McpRequestError, callToolRollDice } from "@/lib/mcpClient";

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength);
}

export async function POST() {
  try {
    const { parsed, rawText } = await callToolRollDice();
    return Response.json({ result: parsed, rawText });
  } catch (error) {
    if (error instanceof McpRequestError) {
      const message = `MCP request failed (${error.status}): ${truncateText(
        error.responseText,
        2000,
      )}`;
      return Response.json({ result: null, rawText: "", error: message }, { status: 502 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ result: null, rawText: "", error: message }, { status: 500 });
  }
}
