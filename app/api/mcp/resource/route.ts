import { readResource } from "@/lib/mcpClient";
import { extractHtmlFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

const DEFAULT_RESOURCE_ID = "ui://hello_app_panel";

export async function GET() {
  const resourceId = process.env.MCP_RESOURCE_ID ?? DEFAULT_RESOURCE_ID;

  try {
    const raw = await readResource(resourceId);
    const { html, mimeType, uri } = extractHtmlFromMcpResponse(raw);
    return Response.json({ html, mimeType, uri, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ html: "", raw: { error: message } }, { status: 500 });
  }
}
