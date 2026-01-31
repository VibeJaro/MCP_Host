"use client";

import { useEffect, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type McpResourceResponse = {
  html: string;
  mimeType: string;
  resourceUri: string;
};

type McpToolResponse = {
  resultText: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hi! Ich bin dein MCP Host. Stell mir eine Frage oder teste den MCP-Server."
  }
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [mcpStatus, setMcpStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [resource, setResource] = useState<McpResourceResponse | null>(null);
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [toolLoading, setToolLoading] = useState(false);

  const statusLabel = useMemo(() => {
    if (mcpStatus === "ready") return "MCP verbunden";
    if (mcpStatus === "error") return "MCP Fehler";
    if (mcpStatus === "loading") return "MCP lädt";
    return "MCP idle";
  }, [mcpStatus]);

  const statusClass = useMemo(() => {
    if (mcpStatus === "ready") return "status-pill ok";
    if (mcpStatus === "error") return "status-pill error";
    return "status-pill";
  }, [mcpStatus]);

  const submitMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Chat fehlgeschlagen");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: payload.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Fehler: ${message}` }
      ]);
    } finally {
      setSending(false);
    }
  };

  const loadMcpResource = async () => {
    setMcpStatus("loading");
    setMcpError(null);
    try {
      const response = await fetch("/api/mcp/resource", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "MCP Resource konnte nicht geladen werden");
      }
      setResource(payload as McpResourceResponse);
      setMcpStatus("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      setMcpError(message);
      setMcpStatus("error");
    }
  };

  const callHelloWorld = async () => {
    setToolLoading(true);
    setToolResult(null);
    try {
      const response = await fetch("/api/mcp/hello", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Tool-Call fehlgeschlagen");
      }
      setToolResult((payload as McpToolResponse).resultText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      setToolResult(`Fehler: ${message}`);
    } finally {
      setToolLoading(false);
    }
  };

  useEffect(() => {
    loadMcpResource();
  }, []);

  return (
    <>
      <section>
        <h2>Chat</h2>
        <ul className="chat-list">
          {messages.map((message, index) => (
            <li key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
              {message.content}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <label htmlFor="message">Deine Nachricht</label>
          <textarea
            id="message"
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Schreibe eine Nachricht..."
          />
          <div className="meta-row">
            <button onClick={submitMessage} disabled={sending || input.trim().length === 0}>
              {sending ? "Sende..." : "Senden"}
            </button>
            <span className="helper">Antwort max. 10 KB, 1 req/sec/IP</span>
          </div>
        </div>
      </section>

      <section>
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <h2>Connected MCP Apps</h2>
          <span className={statusClass}>{statusLabel}</span>
        </div>
        <p className="helper">
          Lädt eine MCP UI Ressource und testet den hello_world Tool Call.
        </p>
        <div className="meta-row" style={{ marginBottom: 12 }}>
          <button onClick={loadMcpResource} disabled={mcpStatus === "loading"}>
            {mcpStatus === "loading" ? "Lade..." : "Load MCP App"}
          </button>
          <button onClick={callHelloWorld} disabled={toolLoading} className="secondary">
            {toolLoading ? "Rufe Tool..." : "Call hello_world"}
          </button>
        </div>
        {mcpError && <p className="helper">Fehler: {mcpError}</p>}
        <div className="panel-area">
          {resource ? (
            <iframe
              title="MCP App"
              sandbox="allow-scripts allow-forms"
              srcDoc={resource.html}
            />
          ) : (
            <p className="helper">
              Keine MCP UI geladen. Bitte MCP_SERVER_URL prüfen oder erneut laden.
            </p>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Tool Ergebnis</label>
          <textarea
            rows={3}
            readOnly
            value={toolResult ?? "Noch kein Tool-Result."}
          />
        </div>
      </section>
    </>
  );
}
