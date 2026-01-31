import { callMcp } from "@/lib/mcpClient";
import { isRecord } from "@/lib/mcpParsing";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = await callMcp("tools/call", {
      name: "roll_dice",
      arguments: { sides: 6 }
    });

    if (isRecord(response.data) && "error" in response.data) {
      const errorValue = response.data.error;
      const status = isRecord(errorValue) && typeof errorValue.status === "number" ? errorValue.status : 502;
      const raw =
        isRecord(errorValue) && typeof errorValue.raw === "string" ? errorValue.raw : "Upstream MCP error";
      return Response.json({ status, raw }, { status: 502 });
    }

    return Response.json({ result: response.data, rawText: response.rawText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ status: 500, raw: message }, { status: 500 });
  }
}
