import { readResource } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

const DEFAULT_RESOURCE_ID = "hello_app_panel";

export async function GET() {
  const resourceId = process.env.MCP_RESOURCE_ID ?? DEFAULT_RESOURCE_ID;

  try {
    const raw = await readResource(resourceId);
    const html = extractTextFromMcpResponse(raw);
    return Response.json({ html, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ html: "", raw: { error: message } }, { status: 500 });
  }
}
