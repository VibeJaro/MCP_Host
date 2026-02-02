import { readDashboardHelloResourceAt } from "@/lib/mcpClient";
import { extractHtmlFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

type RequestPayload = {
  serverUrl?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    if (!payload.serverUrl || typeof payload.serverUrl !== "string") {
      return Response.json(
        { html: "", raw: { error: "serverUrl is required" }, mimeType: undefined, uri: undefined },
        { status: 400 }
      );
    }
    const raw = await readDashboardHelloResourceAt(payload.serverUrl);
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
