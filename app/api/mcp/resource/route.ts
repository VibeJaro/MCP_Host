import { NextResponse } from "next/server";
import { readMcpResource, requireMcpServerUrl } from "@/lib/mcpClient";

const MAX_UI_BYTES = 50 * 1024;

function normalizeResourceUri(resourceId: string) {
  if (resourceId.includes("://")) {
    return resourceId;
  }
  return `ui://${resourceId}`;
}

export async function POST() {
  try {
    requireMcpServerUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP config fehlt";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const resourceId = process.env.MCP_RESOURCE_ID ?? "hello_app_panel";
  const resourceUri = normalizeResourceUri(resourceId);

  try {
    const result = await readMcpResource(resourceUri);
    const contents = result.contents ?? [];
    const entry = contents.find((item) => item.text);
    const html = entry?.text ?? "";
    if (!html) {
      return NextResponse.json({ error: "UI Ressource ist leer." }, { status: 502 });
    }
    const byteSize = new TextEncoder().encode(html).length;
    if (byteSize > MAX_UI_BYTES) {
      return NextResponse.json({ error: "UI Ressource ist zu groß." }, { status: 413 });
    }

    return NextResponse.json({
      html,
      mimeType: entry?.mimeType ?? "text/html",
      resourceUri
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP Resource Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
