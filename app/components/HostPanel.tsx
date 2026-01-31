"use client";

import { useState } from "react";

type Props = {
  serverUrlMasked: string;
};

type ResponseState = {
  result: unknown;
  rawText: string;
};

const emptyState: ResponseState = { result: null, rawText: "" };

export default function HostPanel({ serverUrlMasked }: Props) {
  const [rollState, setRollState] = useState<ResponseState>(emptyState);
  const [busy, setBusy] = useState<string | null>(null);

  const rollDice = async () => {
    setBusy("roll");
    try {
      const response = await fetch("/api/mcp/roll-dice", { method: "POST" });
      const data = (await response.json()) as { result?: unknown; rawText?: string };
      setRollState({ result: data.result ?? null, rawText: data.rawText ?? "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRollState({ result: { error: message }, rawText: "" });
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
        <pre>{JSON.stringify(rollState.result, null, 2) || "(no result)"}</pre>
        <p>Raw text:</p>
        <pre>{rollState.rawText || "(no raw text)"}</pre>
      </section>
    </main>
  );
}
