const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

function getServerUrl(): string {
  if (!MCP_SERVER_URL) {
    throw new Error("MCP_SERVER_URL is not set");
  }
  return MCP_SERVER_URL;
}

type McpResponse = {
  raw: unknown;
  rawText: string;
};

function extractJsonFromSse(text: string): unknown | null {
  const lines = text.split(/\r?\n/);
  const dataLines = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice("data: ".length));

  if (dataLines.length === 0) {
    return null;
  }

  let lastParsed: unknown = null;
  for (const data of dataLines) {
    if (!data) {
      continue;
    }
    lastParsed = JSON.parse(data);
  }
  return lastParsed;
}

function parseMcpResponse(text: string): unknown {
  const sseJson = extractJsonFromSse(text);
  if (sseJson !== null) {
    return sseJson;
  }
  return JSON.parse(text);
}

async function requestMcp(method: string, params: Record<string, unknown>): Promise<McpResponse> {
  const serverUrl = getServerUrl();
  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json"
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
    const snippet = text.slice(0, 2000);
    throw new Error(`MCP request failed (${response.status}): ${snippet}`);
  }

  try {
    return { raw: parseMcpResponse(text), rawText: text };
  } catch (error) {
    throw new Error("MCP response was not valid JSON");
  }
}

export async function callToolRollDice(): Promise<McpResponse> {
  return requestMcp("tools/call", {
    name: "roll_dice",
    arguments: { sides: 6 }
  });
}

export async function readResource(resourceId: string): Promise<McpResponse> {
  return requestMcp("resources/read", {
    uri: resourceId
  });
}
