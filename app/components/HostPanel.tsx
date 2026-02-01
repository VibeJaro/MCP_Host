"use client";

import { useMemo, useState } from "react";

import type { McpContentItem } from "@/lib/mcpParsing";

type Props = {
  serverUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

type ResourceState = {
  text: string;
  raw: unknown;
  contents: McpContentItem[];
};

const emptyState: ResponseState = { text: "", raw: null };
const emptyResourceState: ResourceState = { text: "", raw: null, contents: [] };

export default function HostPanel({ serverUrlMasked }: Props) {
  const [helloState, setHelloState] = useState<ResponseState>(emptyState);
  const [resourceState, setResourceState] = useState<ResourceState>(emptyResourceState);
  const [toolsListState, setToolsListState] = useState<ResponseState>(emptyState);
  const [resourcesListState, setResourcesListState] = useState<ResponseState>(emptyState);
  const [customToolState, setCustomToolState] = useState<ResponseState>(emptyState);
  const [customResourceState, setCustomResourceState] = useState<ResourceState>(emptyResourceState);
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
      const data = (await response.json()) as {
        html?: string;
        raw?: unknown;
        contents?: McpContentItem[];
      };
      setResourceState({
        text: data.html ?? "",
        raw: data.raw ?? null,
        contents: data.contents ?? []
      });
      logDebug("default resource response", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResourceState({ text: "", raw: { error: message }, contents: [] });
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
      const data = (await response.json()) as {
        html?: string;
        raw?: unknown;
        contents?: McpContentItem[];
      };
      setCustomResourceState({
        text: data.html ?? "",
        raw: data.raw ?? null,
        contents: data.contents ?? []
      });
      logDebug("custom resource response", { request: { uri: resourceUri }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCustomResourceState({ text: "", raw: { error: message }, contents: [] });
    } finally {
      setBusy(null);
    }
  };

  const defaultResourcePreview = useMemo(() => toHtmlPreview(resourceState), [resourceState]);
  const customResourcePreview = useMemo(() => toHtmlPreview(customResourceState), [customResourceState]);

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
        <p>Parsed contents:</p>
        <pre>{JSON.stringify(resourceState.contents, null, 2)}</pre>
        <p>Interactive preview:</p>
        {defaultResourcePreview}
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
        <p>Parsed contents:</p>
        <pre>{JSON.stringify(customResourceState.contents, null, 2)}</pre>
        <p>Interactive preview:</p>
        {customResourcePreview}
        <p>Raw response:</p>
        <pre>{JSON.stringify(customResourceState.raw, null, 2)}</pre>
      </section>
    </main>
  );
}

function toHtmlPreview(state: ResourceState) {
  const html = state.text?.trim() ?? "";
  if (!html) {
    return <p>(no HTML to render)</p>;
  }

  const isHtmlLike = /<!doctype html|<html[\s>]|<body[\s>]/i.test(html);
  const title = isHtmlLike ? "MCP App preview" : "Resource preview";

  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox="allow-scripts allow-forms allow-popups"
      style={{ width: "100%", minHeight: "360px", border: "1px solid #ccc" }}
    />
  );
}
