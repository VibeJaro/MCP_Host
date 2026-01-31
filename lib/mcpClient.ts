type McpCallResult = {
  rawText: string;
  data: unknown;
};

function getServerUrl(): string | null {
  return process.env.MCP_SERVER_URL ?? null;
}

function parseSsePayload(raw: string): unknown {
  const dataLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6).trim())
    .filter((line) => line.length > 0);

  if (dataLines.length === 0) {
    return null;
  }

  let lastParsed: unknown = null;
  for (const entry of dataLines) {
    try {
      lastParsed = JSON.parse(entry) as unknown;
    } catch {
      lastParsed = { error: "Failed to parse SSE JSON", raw: entry };
    }
  }

  return lastParsed;
}

export async function callMcp(method: string, params: unknown): Promise<McpCallResult> {
  const serverUrl = getServerUrl();
  if (!serverUrl) {
    return {
      rawText: "",
      data: { error: "MCP_SERVER_URL is not set" }
    };
  }

  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  const rawText = await response.text();
  if (!response.ok) {
    return {
      rawText,
      data: {
        error: {
          status: response.status,
          raw: rawText.slice(0, 2000)
        }
      }
    };
  }

  if (rawText.includes("data: ")) {
    const parsed = parseSsePayload(rawText);
    return { rawText, data: parsed };
  }

  try {
    return { rawText, data: JSON.parse(rawText) as unknown };
  } catch {
    return { rawText, data: { error: "MCP response was not valid JSON" } };
  }
}

export async function callToolHelloWorld(): Promise<McpCallResult> {
  return callMcp("tools/call", {
    name: "hello_world",
    arguments: {}
  });
}

export async function readResource(resourceId: string): Promise<McpCallResult> {
  return callMcp("resources/read", {
    uri: resourceId
  });
}
