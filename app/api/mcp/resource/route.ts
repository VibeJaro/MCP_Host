import { readResource } from "@/lib/mcpClient";
import { extractMcpContents, extractTextFromMcpResponse } from "@/lib/mcpParsing";

const DEFAULT_RESOURCE_ID = "hello_app_panel";

export async function GET() {
  const resourceId = process.env.MCP_RESOURCE_ID ?? DEFAULT_RESOURCE_ID;

  try {
    const raw = await readResource(resourceId);
    const html = extractTextFromMcpResponse(raw);
    const contents = extractMcpContents(raw);
    return Response.json({ html, contents, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ html: "", contents: [], raw: { error: message } }, { status: 500 });
  }
}
