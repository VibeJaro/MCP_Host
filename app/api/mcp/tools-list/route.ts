import { listTools } from "@/lib/mcpClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    const raw = await listTools();
    return Response.json({ raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ raw: { error: message } }, { status: 500 });
  }
}
