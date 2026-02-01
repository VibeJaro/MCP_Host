import { readResource } from "@/lib/mcpClient";
import { extractTextFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

type RequestBody = {
  uri?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body?.uri || typeof body.uri !== "string") {
      return Response.json({ html: "", raw: { error: "Resource URI is required" } }, { status: 400 });
    }

    const raw = await readResource(body.uri);
    const html = extractTextFromMcpResponse(raw);
    return Response.json({ html, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ html: "", raw: { error: message } }, { status: 500 });
  }
}
