import { callMcpMethodAt } from "@/lib/mcpClient";
import { isRecord } from "@/lib/mcpParsing";

export const dynamic = "force-dynamic";

type RequestPayload = {
  method?: string;
  params?: unknown;
  serverUrl?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    if (!payload.method || typeof payload.method !== "string") {
      return Response.json({ raw: { error: { code: -32600, message: "method is required" } } }, { status: 400 });
    }
    if (!payload.serverUrl || typeof payload.serverUrl !== "string") {
      return Response.json(
        { raw: { error: { code: -32600, message: "serverUrl is required" } } },
        { status: 400 }
      );
    }

    const params = isRecord(payload.params) ? payload.params : {};
    const raw = await callMcpMethodAt(payload.serverUrl, payload.method, params);
    return Response.json({ raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ raw: { error: { code: -32000, message } } }, { status: 500 });
  }
}
