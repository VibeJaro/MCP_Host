"use client";

import { useState } from "react";

type Props = {
  serverUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

const emptyState: ResponseState = { text: "", raw: null };

export default function HostPanel({ serverUrlMasked }: Props) {
  const [helloState, setHelloState] = useState<ResponseState>(emptyState);
  const [resourceState, setResourceState] = useState<ResponseState>(emptyState);
  const [busy, setBusy] = useState<string | null>(null);

  const callHello = async () => {
    setBusy("hello");
    try {
      const response = await fetch("/api/mcp/call-hello", { method: "POST" });
      const data = (await response.json()) as ResponseState;
      setHelloState({ text: data.text ?? "", raw: data.raw });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setHelloState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const loadResource = async () => {
    setBusy("resource");
    try {
      const response = await fetch("/api/mcp/resource");
      const data = (await response.json()) as { html?: string; raw?: unknown };
      setResourceState({ text: data.html ?? "", raw: data.raw ?? null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResourceState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  return (
    <main>
      <h1>MCP Host</h1>
      <section>
        <h2>Status</h2>
        <p>
          MCP Server: <strong>{serverUrlMasked}</strong>
        </p>
      </section>

      <section>
        <h2>Tool: hello_world</h2>
        <button onClick={callHello} disabled={busy !== null}>
          Call hello_world
        </button>
        <p>Response text:</p>
        <pre>{helloState.text || "(no text)"}</pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(helloState.raw, null, 2)}</pre>
      </section>

      <section>
        <h2>Resource: MCP App UI</h2>
        <button onClick={loadResource} disabled={busy !== null}>
          Load MCP resource
        </button>
        <p>HTML/Text:</p>
        <pre>{resourceState.text || "(no html/text)"}</pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(resourceState.raw, null, 2)}</pre>
      </section>
    </main>
  );
}
