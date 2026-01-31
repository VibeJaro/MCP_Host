import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const CLIENT_INFO = { name: "mcp-host", version: "0.1.0" };

export function requireMcpServerUrl(): URL {
  const value = process.env.MCP_SERVER_URL;
  if (!value) {
    throw new Error("MCP_SERVER_URL ist nicht gesetzt");
  }
  return new URL(value);
}

async function withMcpClient<T>(handler: (client: Client) => Promise<T>): Promise<T> {
  const serverUrl = requireMcpServerUrl();
  const transport = new StreamableHTTPClientTransport(serverUrl);
  const client = new Client(CLIENT_INFO, {
    capabilities: { tools: {}, resources: {} }
  });
  await client.connect(transport);
  try {
    return await handler(client);
  } finally {
    await client.close();
  }
}

export async function listMcpTools() {
  return withMcpClient((client) => client.listTools());
}

export async function callHelloWorldTool() {
  return withMcpClient((client) =>
    client.callTool({
      name: "hello_world",
      arguments: { style: "friendly" }
    })
  );
}

export async function readMcpResource(resourceUri: string) {
  return withMcpClient((client) => client.readResource({ uri: resourceUri }));
}
