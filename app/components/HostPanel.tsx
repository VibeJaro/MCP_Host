"use client";

import { useState } from "react";

type RollDiceState = {
  result: unknown;
  rawText: string;
};

const emptyState: RollDiceState = { result: null, rawText: "" };

export default function HostPanel() {
  const [rollState, setRollState] = useState<RollDiceState>(emptyState);
  const [busy, setBusy] = useState(false);

  const rollDice = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/mcp/roll-dice", { method: "POST" });
      const data = (await response.json()) as RollDiceState;
      setRollState({ result: data.result ?? null, rawText: data.rawText ?? "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRollState({ result: { error: message }, rawText: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <h1>MCP Host</h1>
      <section>
        <h2>Tool: roll_dice</h2>
        <button onClick={rollDice} disabled={busy}>
          Roll dice
        </button>
        <p>Result:</p>
        <pre>{JSON.stringify(rollState.result, null, 2) || "(no result)"}</pre>
        <p>Raw response:</p>
        <pre>{rollState.rawText || "(no raw text)"}</pre>
      </section>
    </main>
  );
}
