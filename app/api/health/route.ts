import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mcpConfigured: Boolean(process.env.MCP_SERVER_URL)
  });
}
