const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

function getServerUrl(): string {
  if (!MCP_SERVER_URL) {
    throw new Error("MCP_SERVER_URL is not set");
  }
  return MCP_SERVER_URL;
}

export class McpRequestError extends Error {
  status: number;
  responseText: string;

  constructor(status: number, responseText: string) {
    super(`MCP request failed (${status})`);
    this.status = status;
    this.responseText = responseText;
  }
}

type McpResponse = {
  parsed: unknown;
  rawText: string;
};

function parseMcpResponse(text: string): unknown {
  const lines = text.split(/\r?\n/);
  const dataLines = lines
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice("data: ".length).trim())
    .filter((line) => line.length > 0);

  for (let index = dataLines.length - 1; index >= 0; index -= 1) {
    const line = dataLines[index];
    try {
      return JSON.parse(line);
    } catch {
      continue;
    }
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("MCP response was not valid JSON");
  }
}

async function requestMcp(method: string, params: Record<string, unknown>): Promise<McpResponse> {
  const serverUrl = getServerUrl();
  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new McpRequestError(response.status, text);
  }

  return { parsed: parseMcpResponse(text), rawText: text };
}

export async function callToolRollDice(): Promise<McpResponse> {
  return requestMcp("tools/call", {
    name: "roll_dice",
    arguments: { sides: 6 }
  });
}

export async function readResource(resourceId: string): Promise<unknown> {
  const response = await requestMcp("resources/read", {
    uri: resourceId
  });
  return response.parsed;
}
