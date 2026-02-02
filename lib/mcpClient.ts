const MCP_SERVER_URL = process.env.MCP_SERVER_URL;
const DASHBOARD_MCP_SERVER_URL =
  process.env.DASHBOARD_MCP_SERVER_URL ?? "https://dashboard-mcp.vercel.app/api/mcp";
const DASHBOARD_RESOURCE_URI = "ui://dashboard_mcp/hello";

function getServerUrl(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is not set`);
  }
  return value;
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

async function requestMcpAt(
  serverUrl: string,
  method: string,
  params: Record<string, unknown>
): Promise<unknown> {
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

async function requestMcp(method: string, params: Record<string, unknown>): Promise<unknown> {
  return requestMcpAt(getServerUrl(MCP_SERVER_URL, "MCP_SERVER_URL"), method, params);
}

async function requestDashboardMcp(
  method: string,
  params: Record<string, unknown>
): Promise<unknown> {
  return requestMcpAt(
    getServerUrl(DASHBOARD_MCP_SERVER_URL, "DASHBOARD_MCP_SERVER_URL"),
    method,
    params
  );
}

async function requestDashboardMcpAt(
  serverUrl: string,
  method: string,
  params: Record<string, unknown>
): Promise<unknown> {
  return requestMcpAt(getServerUrl(serverUrl, "Dashboard server URL"), method, params);
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

export async function callDashboardHelloTool(): Promise<unknown> {
  return requestDashboardMcp("tools/call", {
    name: "dashboard_mcp_hello",
    arguments: {}
  });
}

export async function readDashboardHelloResource(): Promise<unknown> {
  return requestDashboardMcp("resources/read", {
    uri: DASHBOARD_RESOURCE_URI
  });
}

export async function callDashboardHelloToolAt(serverUrl: string): Promise<unknown> {
  return requestDashboardMcpAt(serverUrl, "tools/call", {
    name: "dashboard_mcp_hello",
    arguments: {}
  });
}

export async function readDashboardHelloResourceAt(serverUrl: string): Promise<unknown> {
  return requestDashboardMcpAt(serverUrl, "resources/read", {
    uri: DASHBOARD_RESOURCE_URI
  });
}
