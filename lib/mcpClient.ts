type McpCallResult = {
  rawText: string;
  data: any;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSsePayload(rawText: string): unknown[] {
  const lines = rawText.split(/\r?\n/);
  const payloads: unknown[] = [];

  for (const line of lines) {
    if (!line.startsWith("data:")) {
      continue;
    }
    const jsonText = line.replace(/^data:\s?/, "").trim();
    if (!jsonText) {
      continue;
    }
    try {
      payloads.push(JSON.parse(jsonText));
    } catch {
      continue;
    }
  }

  return payloads;
}

function getServerUrlError(): McpCallResult {
  return {
    rawText: "",
    data: {
      error: {
        status: 500,
        body: "MCP_SERVER_URL is not set"
      }
    }
  };
}

export async function callMcp(method: string, params: unknown): Promise<McpCallResult> {
  const serverUrl = process.env.MCP_SERVER_URL;
  if (!serverUrl) {
    return getServerUrlError();
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
          body: rawText.slice(0, 2000)
        }
      }
    };
  }

  const shouldParseSse = rawText.includes("data:");
  if (shouldParseSse) {
    const payloads = parseSsePayload(rawText);
    if (payloads.length > 0) {
      return { rawText, data: payloads[payloads.length - 1] };
    }
  }

  try {
    const parsed = JSON.parse(rawText);
    return { rawText, data: parsed };
  } catch {
    return {
      rawText,
      data: {
        error: {
          status: 502,
          body: "Failed to parse MCP response as JSON."
        }
      }
    };
  }
}

export function extractResultValue(data: unknown): unknown {
  if (isRecord(data) && "result" in data) {
    return data.result;
  }
  return data;
}
