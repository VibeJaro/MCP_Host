import { readDashboardHelloResource } from "@/lib/mcpClient";
import { extractHtmlFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await readDashboardHelloResource();
    const { html, mimeType, uri } = extractHtmlFromMcpResponse(raw);
    return Response.json({ html, raw, mimeType, uri });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { html: "", raw: { error: message }, mimeType: undefined, uri: undefined },
      { status: 500 }
    );
  }
}
