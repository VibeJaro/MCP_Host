const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

function getServerUrl(): string {
  if (!MCP_SERVER_URL) {
    throw new Error("MCP_SERVER_URL is not set");
  }
  return MCP_SERVER_URL;
}

async function mcpRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
  const serverUrl = getServerUrl();
  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MCP request failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function callToolHelloWorld(): Promise<unknown> {
  return mcpRequest("tools/call", { name: "hello_world", arguments: {} });
}

export async function readResource(resourceId: string): Promise<unknown> {
  return mcpRequest("resources/read", { uri: resourceId });
}
