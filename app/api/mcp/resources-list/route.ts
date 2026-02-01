import { listResources } from "@/lib/mcpClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await listResources();
    return Response.json({ raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ raw: { error: message } }, { status: 500 });
  }
}
