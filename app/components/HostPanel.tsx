"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  serverUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

type AppViewerState = {
  html: string;
  source: string;
  uri?: string;
  updatedAt?: string;
};

type MessageLogEntry = {
  direction: "incoming" | "outgoing";
  timestamp: string;
  origin: string;
  data: unknown;
};

const emptyState: ResponseState = { text: "", raw: null };
const emptyAppViewer: AppViewerState = { html: "", source: "none" };

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
  const [appViewer, setAppViewer] = useState<AppViewerState>(emptyAppViewer);
  const [relaxSandbox, setRelaxSandbox] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(true);
  const [messageLog, setMessageLog] = useState<MessageLogEntry[]>([]);
  const [outgoingMessage, setOutgoingMessage] = useState("{\n  \n}");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sandboxPermissions = useMemo(() => {
    const base = ["allow-scripts", "allow-forms", "allow-modals", "allow-popups", "allow-downloads"];
    if (relaxSandbox) {
      base.push("allow-same-origin");
    }
    return base.join(" ");
  }, [relaxSandbox]);

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
      setAppViewer({
        html: data.html ?? "",
        source: "default resource",
        uri: undefined,
        updatedAt: new Date().toISOString()
      });
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
      setAppViewer({
        html: data.html ?? "",
        source: "custom resource",
        uri: resourceUri,
        updatedAt: new Date().toISOString()
      });
      logDebug("custom resource response", { request: { uri: resourceUri }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCustomResourceState({ text: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const handleSendMessage = () => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }
    const trimmed = outgoingMessage.trim();
    if (!trimmed) {
      return;
    }
    let payload: unknown = trimmed;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      payload = trimmed;
    }
    iframeRef.current.contentWindow.postMessage(payload, "*");
    setMessageLog((prev) => [
      {
        direction: "outgoing",
        timestamp: new Date().toISOString(),
        origin: window.location.origin,
        data: payload
      },
      ...prev
    ]);
    logDebug("postMessage sent", payload);
  };

  const openInNewTab = () => {
    if (!appViewer.html) {
      return;
    }
    const blob = new Blob([appViewer.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    logDebug("opened MCP app in new tab", { url });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      setMessageLog((prev) => [
        {
          direction: "incoming",
          timestamp: new Date().toISOString(),
          origin: event.origin,
          data: event.data
        },
        ...prev
      ]);
      logDebug("postMessage received", { origin: event.origin, data: event.data });
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [logToConsole]);

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

      <section>
        <h2>MCP App Viewer</h2>
        <p>
          Rendered from: <strong>{appViewer.source}</strong>
          {appViewer.uri ? ` (${appViewer.uri})` : ""}{" "}
          {appViewer.updatedAt ? `— updated ${appViewer.updatedAt}` : ""}
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label>
            <input
              type="checkbox"
              checked={relaxSandbox}
              onChange={(event) => setRelaxSandbox(event.target.checked)}
            />
            Relax sandbox (allow-same-origin)
          </label>
          <label>
            <input
              type="checkbox"
              checked={showHtmlPreview}
              onChange={(event) => setShowHtmlPreview(event.target.checked)}
            />
            Show HTML preview
          </label>
          <button onClick={() => setMessageLog([])} disabled={messageLog.length === 0}>
            Clear message log
          </button>
          <button onClick={openInNewTab} disabled={!appViewer.html}>
            Open in new tab
          </button>
        </div>
        <p>Sandbox: {sandboxPermissions || "(none)"}</p>
        <div style={{ border: "1px solid #ccc", borderRadius: 8, overflow: "hidden" }}>
          {appViewer.html ? (
            <iframe
              key={`${appViewer.source}-${appViewer.updatedAt ?? "idle"}`}
              ref={iframeRef}
              sandbox={sandboxPermissions}
              srcDoc={appViewer.html}
              title="MCP App Viewer"
              style={{ width: "100%", minHeight: 320, border: "none" }}
            />
          ) : (
            <div style={{ padding: "1rem" }}>Load a resource to render its UI.</div>
          )}
        </div>
        {showHtmlPreview ? (
          <>
            <p>HTML Preview:</p>
            <pre>{appViewer.html || "(no html/text)"}</pre>
          </>
        ) : null}
        <p>postMessage log:</p>
        <pre>{messageLog.length ? JSON.stringify(messageLog, null, 2) : "(no messages yet)"}</pre>
        <label>
          Send postMessage payload (JSON or text)
          <textarea
            rows={5}
            value={outgoingMessage}
            onChange={(event) => setOutgoingMessage(event.target.value)}
          />
        </label>
        <button onClick={handleSendMessage} disabled={!appViewer.html}>
          Send message to iframe
        </button>
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
        <p>Raw response:</p>
        <pre>{JSON.stringify(customResourceState.raw, null, 2)}</pre>
      </section>
    </main>
  );
}
