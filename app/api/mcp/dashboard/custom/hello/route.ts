import { callDashboardHelloToolAt } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

type RequestPayload = {
  serverUrl?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    if (!payload.serverUrl || typeof payload.serverUrl !== "string") {
      return Response.json({ text: "", raw: { error: "serverUrl is required" } }, { status: 400 });
    }
    const raw = await callDashboardHelloToolAt(payload.serverUrl);
    const text = extractTextFromMcpResponse(raw);
    return Response.json({ text, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ text: "", raw: { error: message } }, { status: 500 });
  }
}
