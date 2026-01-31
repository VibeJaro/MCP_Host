"use client";

import { useState } from "react";

type Props = {
  serverUrlMasked: string;
};

type ToolResponseState = {
  result: string;
  rawText: string;
};

type ResourceState = {
  text: string;
  raw: unknown;
};

const emptyToolState: ToolResponseState = { result: "", rawText: "" };
const emptyResourceState: ResourceState = { text: "", raw: null };

export default function HostPanel({ serverUrlMasked }: Props) {
  const [rollState, setRollState] = useState<ToolResponseState>(emptyToolState);
  const [resourceState, setResourceState] = useState<ResourceState>(emptyResourceState);
  const [busy, setBusy] = useState<string | null>(null);

  const rollDice = async () => {
    setBusy("roll");
    try {
      const response = await fetch("/api/mcp/roll-dice", { method: "POST" });
      const data = (await response.json()) as ToolResponseState;
      setRollState({ result: data.result ?? "", rawText: data.rawText ?? "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRollState({ result: "", rawText: message });
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
        <h2>Tool: roll_dice</h2>
        <button onClick={rollDice} disabled={busy !== null}>
          Roll dice
        </button>
        <p>Result:</p>
        <pre>{rollState.result || "(no result)"}</pre>
        <p>Raw response text:</p>
        <pre>{rollState.rawText || "(no raw response text)"}</pre>
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
