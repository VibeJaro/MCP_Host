import { callTool } from "@/lib/mcpClient";
import { extractTextFromMcpResponse, isRecord } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

type RequestBody = {
  name?: string;
  arguments?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body?.name || typeof body.name !== "string") {
      return Response.json({ text: "", raw: { error: "Tool name is required" } }, { status: 400 });
    }

    const args = isRecord(body.arguments) ? body.arguments : {};
    const raw = await callTool(body.name, args);
    const text = extractTextFromMcpResponse(raw);
    return Response.json({ text, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ text: "", raw: { error: message } }, { status: 500 });
  }
}
