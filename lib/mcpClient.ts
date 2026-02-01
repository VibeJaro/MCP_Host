const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

function getServerUrl(): string {
  if (!MCP_SERVER_URL) {
    throw new Error("MCP_SERVER_URL is not set");
  }
  return MCP_SERVER_URL;
}

const MCP_ACCEPT_HEADER = "application/json, text/event-stream";

function parseMcpResponse(payload: string, contentType: string | null): unknown {
  if (contentType?.includes("text/event-stream")) {
    const dataLines = payload
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""));

    const lastPayload = dataLines.at(-1);
    if (!lastPayload) {
      throw new Error("MCP response was empty");
    }
    return JSON.parse(lastPayload);
  }

  return JSON.parse(payload);
}

async function requestMcp(method: string, params: Record<string, unknown>): Promise<unknown> {
  const serverUrl = getServerUrl();
  const headers = new Headers();
  headers.set("Accept", MCP_ACCEPT_HEADER);
  headers.set("Content-Type", "application/json");

  const response = await fetch(serverUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`MCP request failed (${response.status}): ${text}`);
  }

  try {
    return parseMcpResponse(text, response.headers.get("content-type"));
  } catch (error) {
    throw new Error("MCP response was not valid JSON");
  }
}

export async function callToolHelloWorld(): Promise<unknown> {
  return requestMcp("tools/call", {
    name: "hello_world",
    arguments: {}
  });
}

export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  return requestMcp("tools/call", {
    name,
    arguments: args
  });
}

export async function readResource(resourceId: string): Promise<unknown> {
  return requestMcp("resources/read", {
    uri: resourceId
  });
}

export async function listTools(): Promise<unknown> {
  return requestMcp("tools/list", {});
}

export async function listResources(): Promise<unknown> {
  return requestMcp("resources/list", {});
}
