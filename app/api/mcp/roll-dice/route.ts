import { callMcp, extractResultValue } from "@/lib/mcpClient";

export const runtime = "nodejs";

function isErrorResponse(data: unknown): data is { error: { status: number; body: string } } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "object" &&
    (data as { error?: { status?: unknown } }).error !== null
  );
}

export async function POST() {
  const { rawText, data } = await callMcp("tools/call", {
    name: "roll_dice",
    arguments: { sides: 6 }
  });

  if (isErrorResponse(data)) {
    return Response.json(
      {
        error: data.error,
        rawText
      },
      { status: 502 }
    );
  }

  return Response.json({
    result: extractResultValue(data),
    rawText
  });
}
