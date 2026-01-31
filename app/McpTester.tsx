"use client";

import { useState } from "react";

type ApiResponse = {
  text?: string;
  html?: string;
  raw: unknown;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unserializable]";
  }
}

export default function McpTester({ serverLabel }: { serverLabel: string }) {
  const [helloResponse, setHelloResponse] = useState<ApiResponse | null>(null);
  const [resourceResponse, setResourceResponse] = useState<ApiResponse | null>(null);
  const [loadingHello, setLoadingHello] = useState(false);
  const [loadingResource, setLoadingResource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callHello = async () => {
    setLoadingHello(true);
    setError(null);
    try {
      const response = await fetch("/api/mcp/call-hello", { method: "POST" });
      const data = (await response.json()) as ApiResponse;
      setHelloResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingHello(false);
    }
  };

  const loadResource = async () => {
    setLoadingResource(true);
    setError(null);
    try {
      const response = await fetch("/api/mcp/resource");
      const data = (await response.json()) as ApiResponse;
      setResourceResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingResource(false);
    }
  };

  return (
    <main>
      <h1>MCP Host</h1>
      <p className="small">Server: {serverLabel}</p>
      {error ? <p className="small">Error: {error}</p> : null}

      <section>
        <h2>Tool Test</h2>
        <p className="small">Call the MCP tool <strong>hello_world</strong>.</p>
        <button onClick={callHello} disabled={loadingHello}>
          {loadingHello ? "Calling..." : "Call hello_world"}
        </button>
        <div className="output">
          <p><strong>Text:</strong> {helloResponse?.text ?? "-"}</p>
        </div>
        <pre>{formatJson(helloResponse?.raw ?? null)}</pre>
      </section>

      <section>
        <h2>Resource Test</h2>
        <p className="small">Load MCP resource UI by id.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={loadResource} disabled={loadingResource}>
            {loadingResource ? "Loading..." : "Load MCP resource"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setResourceResponse(null);
            }}
          >
            Clear
          </button>
        </div>
        <div className="output">
          <p><strong>HTML/Text:</strong></p>
          <div>{resourceResponse?.html ?? "-"}</div>
        </div>
        <pre>{formatJson(resourceResponse?.raw ?? null)}</pre>
      </section>
    </main>
  );
}
