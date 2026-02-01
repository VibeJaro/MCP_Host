import { readResource } from "@/lib/mcpClient";
import { extractMcpContents, extractTextFromMcpResponse } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type RequestBody = {
  uri?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body?.uri || typeof body.uri !== "string") {
      return Response.json(
        { html: "", contents: [], raw: { error: "Resource URI is required" } },
        { status: 400 }
      );
    }

    const raw = await readResource(body.uri);
    const html = extractTextFromMcpResponse(raw);
    const contents = extractMcpContents(raw);
    return Response.json({ html, contents, raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ html: "", contents: [], raw: { error: message } }, { status: 500 });
  }
}
