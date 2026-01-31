import McpTester from "./McpTester";

function maskUrl(value: string | undefined): string {
  if (!value) {
    return "[not set]";
  }
  try {
    const url = new URL(value);
    const host = url.host;
    return `${url.protocol}//${host}/…`;
  } catch {
    if (value.length <= 12) {
      return value;
    }
    return `${value.slice(0, 8)}…`;
  }
}

export default function Page() {
  const serverLabel = maskUrl(process.env.MCP_SERVER_URL);
  return <McpTester serverLabel={serverLabel} />;
}
