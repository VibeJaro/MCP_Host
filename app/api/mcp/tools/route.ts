import { NextResponse } from "next/server";
import { listMcpTools, requireMcpServerUrl } from "@/lib/mcpClient";

export async function GET() {
  try {
    requireMcpServerUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP config fehlt";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const tools = await listMcpTools();
    return NextResponse.json({ tools: tools.tools ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP Tool Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
