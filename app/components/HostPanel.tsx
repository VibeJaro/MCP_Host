"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  serverUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

type AppMessage = {
  id: string;
  timestamp: string;
  origin: string;
  data: unknown;
};

const emptyState: ResponseState = { text: "", raw: null };

const MAX_APP_MESSAGES = 50;

function McpAppViewer({
  html,
  label,
  logToConsole
}: {
  html: string;
  label: string;
  logToConsole: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [messages, setMessages] = useState<AppMessage[]>([]);

  const formattedMessages = useMemo(() => {
    if (messages.length === 0) {
      return "(no messages yet)";
    }
    return JSON.stringify(messages, null, 2);
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [html]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow) {
        return;
      }
      if (event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const entry: AppMessage = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toISOString(),
        origin: event.origin,
        data: event.data
      };

      setMessages((prev) => [entry, ...prev].slice(0, MAX_APP_MESSAGES));

      if (logToConsole) {
        console.log(`[MCP App Message] ${label}`, entry);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [label, logToConsole]);

  if (!html) {
    return <p>(no MCP App HTML to render yet)</p>;
  }

  return (
    <div className="app-viewer">
      <div className="app-viewer__toolbar">
        <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
          Reload iframe
        </button>
        <button type="button" onClick={() => setMessages([])}>
          Clear messages
        </button>
      </div>
      <iframe
        ref={iframeRef}
        key={reloadKey}
        title={`${label} MCP App`}
        className="app-viewer__frame"
        sandbox="allow-scripts allow-forms allow-modals allow-popups"
        srcDoc={html}
      />
      <p>postMessage debug log:</p>
      <pre className="app-viewer__log">{formattedMessages}</pre>
    </div>
  );
}

export default function HostPanel({ serverUrlMasked }: Props) {
  const [helloState, setHelloState] = useState<ResponseState>(emptyState);
  const [resourceState, setResourceState] = useState<ResponseState>(emptyState);
  const [toolsListState, setToolsListState] = useState<ResponseState>(emptyState);
  const [resourcesListState, setResourcesListState] = useState<ResponseState>(emptyState);
  const [customToolState, setCustomToolState] = useState<ResponseState>(emptyState);
  const [customResourceState, setCustomResourceState] = useState<ResponseState>(emptyState);
  const [busy, setBusy] = useState<string | null>(null);
  const [toolName, setToolName] = useState("hello_world");
  const [toolArgs, setToolArgs] = useState("{\n  \n}");
  const [resourceUri, setResourceUri] = useState("hello_app_panel");
  const [logToConsole, setLogToConsole] = useState(true);

  const logDebug = (label: string, payload: unknown) => {
    if (logToConsole) {
      console.log(`[MCP Debug] ${label}`, payload);
    }
  };

  const callHello = async () => {
    setBusy("hello");
    try {
      const response = await fetch("/api/mcp/call-hello", { method: "POST" });
      const data = (await response.json()) as ResponseState;
      setHelloState({ text: data.text ?? "", raw: data.raw });
      logDebug("hello_world response", data);
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
      logDebug("default resource response", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResourceState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const listTools = async () => {
    setBusy("tools-list");
    try {
      const response = await fetch("/api/mcp/tools-list");
      const data = (await response.json()) as { raw?: unknown };
      const text = JSON.stringify(data.raw ?? null, null, 2);
      setToolsListState({ text, raw: data.raw ?? null });
      logDebug("tools/list response", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setToolsListState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const listResources = async () => {
    setBusy("resources-list");
    try {
      const response = await fetch("/api/mcp/resources-list");
      const data = (await response.json()) as { raw?: unknown };
      const text = JSON.stringify(data.raw ?? null, null, 2);
      setResourcesListState({ text, raw: data.raw ?? null });
      logDebug("resources/list response", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResourcesListState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const callCustomTool = async () => {
    setBusy("call-tool");
    try {
      const parsed = toolArgs.trim() ? JSON.parse(toolArgs) : {};
      if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
        throw new Error("Arguments JSON must be an object");
      }
      const response = await fetch("/api/mcp/call-tool", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: toolName, arguments: parsed })
      });
      const data = (await response.json()) as ResponseState;
      setCustomToolState({ text: data.text ?? "", raw: data.raw });
      logDebug("custom tool response", { request: { name: toolName, arguments: parsed }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCustomToolState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const readCustomResource = async () => {
    setBusy("read-resource");
    try {
      const response = await fetch("/api/mcp/read-resource", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uri: resourceUri })
      });
      const data = (await response.json()) as { html?: string; raw?: unknown };
      setCustomResourceState({ text: data.html ?? "", raw: data.raw ?? null });
      logDebug("custom resource response", { request: { uri: resourceUri }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCustomResourceState({ text: "", raw: { error: message } });
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
        <p>Interactive preview:</p>
        <McpAppViewer html={resourceState.text} label="Default MCP App" logToConsole={logToConsole} />
        <p>Raw response:</p>
        <pre>{JSON.stringify(resourceState.raw, null, 2)}</pre>
      </section>

      <section>
        <h2>Debug Console</h2>
        <label>
          <input
            type="checkbox"
            checked={logToConsole}
            onChange={(event) => setLogToConsole(event.target.checked)}
          />
          Log responses to browser console
        </label>
        <p>
          Use the controls below to inspect tools/resources, call custom tools, and read custom
          resources. Errors and raw JSON-RPC payloads will show in the output blocks.
        </p>
      </section>

      <section>
        <h2>Tools list</h2>
        <button onClick={listTools} disabled={busy !== null}>
          Fetch tools/list
        </button>
        <p>Raw response:</p>
        <pre>{toolsListState.text || "(no response yet)"}</pre>
      </section>

      <section>
        <h2>Resources list</h2>
        <button onClick={listResources} disabled={busy !== null}>
          Fetch resources/list
        </button>
        <p>Raw response:</p>
        <pre>{resourcesListState.text || "(no response yet)"}</pre>
      </section>

      <section>
        <h2>Call custom tool</h2>
        <label>
          Tool name
          <input
            type="text"
            value={toolName}
            onChange={(event) => setToolName(event.target.value)}
          />
        </label>
        <label>
          Arguments (JSON object)
          <textarea
            rows={6}
            value={toolArgs}
            onChange={(event) => setToolArgs(event.target.value)}
          />
        </label>
        <button onClick={callCustomTool} disabled={busy !== null}>
          Call tool
        </button>
        <p>Response text:</p>
        <pre>{customToolState.text || "(no text)"}</pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(customToolState.raw, null, 2)}</pre>
      </section>

      <section>
        <h2>Read custom resource</h2>
        <label>
          Resource URI
          <input
            type="text"
            value={resourceUri}
            onChange={(event) => setResourceUri(event.target.value)}
          />
        </label>
        <button onClick={readCustomResource} disabled={busy !== null}>
          Read resource
        </button>
        <p>HTML/Text:</p>
        <pre>{customResourceState.text || "(no html/text)"}</pre>
        <p>Interactive preview:</p>
        <McpAppViewer
          html={customResourceState.text}
          label="Custom MCP App"
          logToConsole={logToConsole}
        />
        <p>Raw response:</p>
        <pre>{JSON.stringify(customResourceState.raw, null, 2)}</pre>
      </section>
    </main>
  );
}
