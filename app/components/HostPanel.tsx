"use client";

import { useMemo, useState } from "react";

import McpAppIframe from "@/app/components/McpAppIframe";
import { isRecord } from "@/lib/mcpParsing";

type Props = {
  serverUrlMasked: string;
  dashboardServerUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

const emptyState: ResponseState = { text: "", raw: null };

type ResourceState = {
  html: string;
  raw: unknown;
  mimeType?: string;
  uri?: string;
};

const emptyResourceState: ResourceState = { html: "", raw: null };

type UiTool = {
  name: string;
  title?: string;
  resourceUri: string;
};

export default function HostPanel({ serverUrlMasked, dashboardServerUrlMasked }: Props) {
  const [helloState, setHelloState] = useState<ResponseState>(emptyState);
  const [resourceState, setResourceState] = useState<ResourceState>(emptyResourceState);
  const [dashboardHelloState, setDashboardHelloState] = useState<ResponseState>(emptyState);
  const [dashboardResourceState, setDashboardResourceState] =
    useState<ResourceState>(emptyResourceState);
  const [dashboardCustomUrl, setDashboardCustomUrl] = useState(
    "https://dashboard-mcp.vercel.app/api/mcp"
  );
  const [dashboardCustomHelloState, setDashboardCustomHelloState] =
    useState<ResponseState>(emptyState);
  const [dashboardCustomResourceState, setDashboardCustomResourceState] =
    useState<ResourceState>(emptyResourceState);
  const [toolsListState, setToolsListState] = useState<ResponseState>(emptyState);
  const [resourcesListState, setResourcesListState] = useState<ResponseState>(emptyState);
  const [customToolState, setCustomToolState] = useState<ResponseState>(emptyState);
  const [customResourceState, setCustomResourceState] = useState<ResourceState>(emptyResourceState);
  const [uiTools, setUiTools] = useState<UiTool[]>([]);
  const [selectedUiTool, setSelectedUiTool] = useState("");
  const [selectedUiResourceUri, setSelectedUiResourceUri] = useState("");
  const [uiResourceState, setUiResourceState] = useState<ResourceState>(emptyResourceState);
  const [busy, setBusy] = useState<string | null>(null);
  const [toolName, setToolName] = useState("hello_world");
  const [toolArgs, setToolArgs] = useState("{\n  \n}");
  const [resourceUri, setResourceUri] = useState("ui://hello_app_panel");
  const [logToConsole, setLogToConsole] = useState(true);

  const sandboxPermissions = useMemo(
    () => ["allow-scripts", "allow-forms", "allow-modals", "allow-popups"].join(" "),
    []
  );

  const extractUiTools = (raw: unknown): UiTool[] => {
    if (!isRecord(raw)) {
      return [];
    }
    const result = isRecord(raw.result) ? raw.result : undefined;
    const tools = result && Array.isArray(result.tools) ? result.tools : [];
    return tools
      .filter(isRecord)
      .map((tool) => {
        const name = typeof tool.name === "string" ? tool.name : "";
        const title = typeof tool.title === "string" ? tool.title : undefined;
        const meta = isRecord(tool._meta) ? tool._meta : undefined;
        const ui = meta && isRecord(meta.ui) ? meta.ui : undefined;
        const resourceUri =
          ui && typeof ui.resourceUri === "string" ? ui.resourceUri : "";
        return { name, title, resourceUri };
      })
      .filter((tool) => tool.name && tool.resourceUri);
  };

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

  const loadDashboardHelloUi = async () => {
    setBusy("dashboard-hello");
    try {
      const helloResponse = await fetch("/api/mcp/dashboard/hello", { method: "POST" });
      const helloData = (await helloResponse.json()) as ResponseState;
      setDashboardHelloState({ text: helloData.text ?? "", raw: helloData.raw });
      logDebug("dashboard_mcp_hello response", helloData);

      const resourceResponse = await fetch("/api/mcp/dashboard/resource");
      const resourceData = (await resourceResponse.json()) as {
        html?: string;
        raw?: unknown;
        mimeType?: string;
        uri?: string;
      };
      setDashboardResourceState({
        html: resourceData.html ?? "",
        raw: resourceData.raw ?? null,
        mimeType: resourceData.mimeType,
        uri: resourceData.uri
      });
      logDebug("dashboard ui resource response", resourceData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setDashboardHelloState({ text: "", raw: { error: message } });
      setDashboardResourceState({ html: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const loadCustomDashboardHelloUi = async () => {
    if (!dashboardCustomUrl.trim()) {
      setDashboardCustomHelloState({ text: "", raw: { error: "Server URL is required" } });
      setDashboardCustomResourceState({ html: "", raw: { error: "Server URL is required" } });
      return;
    }
    setBusy("dashboard-custom-hello");
    try {
      const trimmedUrl = dashboardCustomUrl.trim();
      const helloResponse = await fetch("/api/mcp/dashboard/custom/hello", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serverUrl: trimmedUrl })
      });
      const helloData = (await helloResponse.json()) as ResponseState;
      setDashboardCustomHelloState({ text: helloData.text ?? "", raw: helloData.raw });
      logDebug("custom dashboard_mcp_hello response", { serverUrl: trimmedUrl, helloData });

      const resourceResponse = await fetch("/api/mcp/dashboard/custom/resource", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serverUrl: trimmedUrl })
      });
      const resourceData = (await resourceResponse.json()) as {
        html?: string;
        raw?: unknown;
        mimeType?: string;
        uri?: string;
      };
      setDashboardCustomResourceState({
        html: resourceData.html ?? "",
        raw: resourceData.raw ?? null,
        mimeType: resourceData.mimeType,
        uri: resourceData.uri
      });
      logDebug("custom dashboard ui resource response", { serverUrl: trimmedUrl, resourceData });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setDashboardCustomHelloState({ text: "", raw: { error: message } });
      setDashboardCustomResourceState({ html: "", raw: { error: message } });
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
        mimeType?: string;
        uri?: string;
      };
      setResourceState({
        html: data.html ?? "",
        raw: data.raw ?? null,
        mimeType: data.mimeType,
        uri: data.uri
      });
      logDebug("default resource response", data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResourceState({ html: "", raw: { error: message } });
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
      const discoveredUiTools = extractUiTools(data.raw);
      setUiTools(discoveredUiTools);
      if (discoveredUiTools.length > 0) {
        setSelectedUiTool((current) => current || discoveredUiTools[0].name);
        setSelectedUiResourceUri((current) => current || discoveredUiTools[0].resourceUri);
      }
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
        mimeType?: string;
        uri?: string;
      };
      setCustomResourceState({
        html: data.html ?? "",
        raw: data.raw ?? null,
        mimeType: data.mimeType,
        uri: data.uri
      });
      logDebug("custom resource response", { request: { uri: resourceUri }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCustomResourceState({ html: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const loadUiResource = async () => {
    if (!selectedUiResourceUri) {
      setUiResourceState({ html: "", raw: { error: "No UI resource selected" } });
      return;
    }
    setBusy("ui-resource");
    try {
      const response = await fetch("/api/mcp/read-resource", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uri: selectedUiResourceUri })
      });
      const data = (await response.json()) as {
        html?: string;
        raw?: unknown;
        mimeType?: string;
        uri?: string;
      };
      setUiResourceState({
        html: data.html ?? "",
        raw: data.raw ?? null,
        mimeType: data.mimeType,
        uri: data.uri
      });
      logDebug("ui resource response", { request: { uri: selectedUiResourceUri }, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setUiResourceState({ html: "", raw: { error: message } });
    } finally {
      setBusy(null);
    }
  };

  const updateSelectedUiTool = (name: string) => {
    setSelectedUiTool(name);
    const match = uiTools.find((tool) => tool.name === name);
    if (match) {
      setSelectedUiResourceUri(match.resourceUri);
    }
  };

  const renderAppPreview = (
    state: ResourceState,
    emptyLabel: string,
    proxyEndpoint: string,
    serverUrl?: string
  ) => {
    if (!state.html) {
      return <p>{emptyLabel}</p>;
    }

    if (!state.mimeType?.toLowerCase().includes("text/html")) {
      return (
        <div>
          <p>Received non-HTML content (mimeType: {state.mimeType ?? "unknown"}).</p>
          <pre>{state.html}</pre>
        </div>
      );
    }

    return (
      <McpAppIframe
        html={state.html}
        proxyEndpoint={proxyEndpoint}
        sandboxPermissions={sandboxPermissions}
        serverUrl={serverUrl}
      />
    );
  };

  return (
    <main>
      <h1>MCP Host</h1>
      <section>
        <h2>Status</h2>
        <p>
          MCP Server: <strong>{serverUrlMasked}</strong>
        </p>
        <p>
          Dashboard MCP Server: <strong>{dashboardServerUrlMasked}</strong>
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
        <h2>Tool: dashboard_mcp_hello</h2>
        <button onClick={loadDashboardHelloUi} disabled={busy !== null}>
          Load dashboard_mcp_hello + UI
        </button>
        <p>Response text:</p>
        <pre>{dashboardHelloState.text || "(no text)"}</pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(dashboardHelloState.raw, null, 2)}</pre>
        <p>Preview:</p>
        {renderAppPreview(dashboardResourceState, "(no html/text)", "/api/mcp/dashboard/app-bridge")}
        <p>Resource metadata:</p>
        <pre>
          {JSON.stringify(
            {
              mimeType: dashboardResourceState.mimeType ?? null,
              uri: dashboardResourceState.uri ?? null,
              size: dashboardResourceState.html.length
            },
            null,
            2
          )}
        </pre>
        <p>Raw resource response:</p>
        <pre>{JSON.stringify(dashboardResourceState.raw, null, 2)}</pre>
      </section>

      <section>
        <h2>Tool: dashboard_mcp_hello (custom URL)</h2>
        <p>
          Use this to test dashboard MCP servers deployed on per-branch Vercel URLs. Enter the
          server URL (ending with <code>/api/mcp</code>) and load the tool + UI below.
        </p>
        <label>
          Dashboard MCP server URL
          <input
            type="url"
            placeholder="https://your-branch.vercel.app/api/mcp"
            value={dashboardCustomUrl}
            onChange={(event) => setDashboardCustomUrl(event.target.value)}
          />
        </label>
        <button onClick={loadCustomDashboardHelloUi} disabled={busy !== null}>
          Load dashboard_mcp_hello + UI (custom)
        </button>
        <p>Response text:</p>
        <pre>{dashboardCustomHelloState.text || "(no text)"}</pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(dashboardCustomHelloState.raw, null, 2)}</pre>
        <p>Preview:</p>
        {renderAppPreview(
          dashboardCustomResourceState,
          "(no html/text)",
          "/api/mcp/dashboard/custom/app-bridge",
          dashboardCustomUrl.trim() || undefined
        )}
        <p>Resource metadata:</p>
        <pre>
          {JSON.stringify(
            {
              mimeType: dashboardCustomResourceState.mimeType ?? null,
              uri: dashboardCustomResourceState.uri ?? null,
              size: dashboardCustomResourceState.html.length
            },
            null,
            2
          )}
        </pre>
        <p>Raw resource response:</p>
        <pre>{JSON.stringify(dashboardCustomResourceState.raw, null, 2)}</pre>
      </section>

      <section>
        <h2>Resource: MCP App UI</h2>
        <button onClick={loadResource} disabled={busy !== null}>
          Load MCP resource
        </button>
        <p>Preview:</p>
        {renderAppPreview(resourceState, "(no html/text)", "/api/mcp/app-bridge")}
        <p>HTML/Text:</p>
        <pre>{resourceState.html || "(no html/text)"}</pre>
        <p>Resource metadata:</p>
        <pre>
          {JSON.stringify(
            {
              mimeType: resourceState.mimeType ?? null,
              uri: resourceState.uri ?? null,
              size: resourceState.html.length
            },
            null,
            2
          )}
        </pre>
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
        <h2>Interactive App Preview</h2>
        <p>
          Pick a tool that advertises a UI resource via <code>_meta.ui.resourceUri</code> and load
          it into a sandboxed iframe for inspection.
        </p>
        <label>
          Tool with UI metadata
          <select
            value={selectedUiTool}
            onChange={(event) => updateSelectedUiTool(event.target.value)}
          >
            <option value="">(fetch tools/list first)</option>
            {uiTools.map((tool) => (
              <option key={tool.name} value={tool.name}>
                {tool.title ? `${tool.title} (${tool.name})` : tool.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          UI resource URI
          <input
            type="text"
            value={selectedUiResourceUri}
            onChange={(event) => setSelectedUiResourceUri(event.target.value)}
          />
        </label>
        <button onClick={loadUiResource} disabled={busy !== null}>
          Load UI resource
        </button>
        <p>Preview:</p>
        {renderAppPreview(uiResourceState, "(no UI resource loaded)", "/api/mcp/app-bridge")}
        <p>Resource metadata:</p>
        <pre>
          {JSON.stringify(
            {
              mimeType: uiResourceState.mimeType ?? null,
              uri: uiResourceState.uri ?? null,
              size: uiResourceState.html.length
            },
            null,
            2
          )}
        </pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(uiResourceState.raw, null, 2)}</pre>
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
          Resource URI (e.g., ui://hello_app_panel)
          <input
            type="text"
            value={resourceUri}
            onChange={(event) => setResourceUri(event.target.value)}
          />
        </label>
        <button onClick={readCustomResource} disabled={busy !== null}>
          Read resource
        </button>
        <p>Preview:</p>
        {renderAppPreview(customResourceState, "(no html/text)", "/api/mcp/app-bridge")}
        <p>HTML/Text:</p>
        <pre>{customResourceState.html || "(no html/text)"}</pre>
        <p>Resource metadata:</p>
        <pre>
          {JSON.stringify(
            {
              mimeType: customResourceState.mimeType ?? null,
              uri: customResourceState.uri ?? null,
              size: customResourceState.html.length
            },
            null,
            2
          )}
        </pre>
        <p>Raw response:</p>
        <pre>{JSON.stringify(customResourceState.raw, null, 2)}</pre>
      </section>
    </main>
  );
}
