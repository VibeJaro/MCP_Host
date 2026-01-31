import { NextResponse } from "next/server";
import { callHelloWorldTool, listMcpTools, requireMcpServerUrl } from "@/lib/mcpClient";

const MAX_TOOL_BYTES = 10 * 1024;

function trimToByteSize(text: string, maxBytes: number) {
  const encoder = new TextEncoder();
  let result = text;
  while (encoder.encode(result).length > maxBytes) {
    result = result.slice(0, Math.max(0, result.length - 1));
  }
  return result;
}

export async function POST() {
  try {
    requireMcpServerUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP config fehlt";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const tools = await listMcpTools();
    const toolNames = tools.tools?.map((tool) => tool.name) ?? [];
    if (!toolNames.includes("hello_world")) {
      return NextResponse.json(
        { error: "Tool hello_world nicht gefunden." },
        { status: 404 }
      );
    }

    const result = await callHelloWorldTool();
    const contentItems: Array<unknown> = Array.isArray(result.content) ? result.content : [];
    const textContent = contentItems
      .filter(
        (item): item is { type: "text"; text: string } =>
          typeof item === "object" &&
          item !== null &&
          "type" in item &&
          "text" in item &&
          (item as { type?: string }).type === "text"
      )
      .map((item) => item.text)
      .join("\n")
      .trim();
    const resultText = trimToByteSize(textContent || "[kein Text]", MAX_TOOL_BYTES);

    return NextResponse.json({ resultText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP Tool Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
