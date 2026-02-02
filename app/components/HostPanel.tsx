"use client";

import { useMemo, useState } from "react";

import McpAppIframe from "@/app/components/McpAppIframe";

type Props = {
  serverUrlMasked: string;
  dashboardServerUrlMasked: string;
};

type ResponseState = {
  text: string;
  raw: unknown;
};

type ResourceState = {
  html: string;
  raw: unknown;
  mimeType?: string;
  uri?: string;
};

const emptyState: ResponseState = { text: "", raw: null };
const emptyResourceState: ResourceState = { html: "", raw: null };
const defaultDashboardUrl = "https://dashboard-mcp.vercel.app/api/mcp";

export default function HostPanel({ serverUrlMasked, dashboardServerUrlMasked }: Props) {
  const [dashboardHelloState, setDashboardHelloState] = useState<ResponseState>(emptyState);
  const [dashboardResourceState, setDashboardResourceState] =
    useState<ResourceState>(emptyResourceState);
  const [dashboardCustomUrl, setDashboardCustomUrl] = useState(defaultDashboardUrl);
  const [useCustomDashboardUrl, setUseCustomDashboardUrl] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [logToConsole, setLogToConsole] = useState(false);

  const sandboxPermissions = useMemo(
    () => ["allow-scripts", "allow-forms", "allow-modals", "allow-popups"].join(" "),
    []
  );

  const logDebug = (label: string, payload: unknown) => {
    if (logToConsole) {
      console.log(`[MCP Debug] ${label}`, payload);
    }
  };

  const fetchDashboardUi = async () => {
    const trimmedUrl = dashboardCustomUrl.trim();
    if (useCustomDashboardUrl && !trimmedUrl) {
      const error = { error: "Custom server URL is required." };
      setDashboardHelloState({ text: "", raw: error });
      setDashboardResourceState({ html: "", raw: error });
      return;
    }

    setBusy(true);
    try {
      const helloResponse = await fetch(
        useCustomDashboardUrl ? "/api/mcp/dashboard/custom/hello" : "/api/mcp/dashboard/hello",
        useCustomDashboardUrl
          ? {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ serverUrl: trimmedUrl })
            }
          : { method: "POST" }
      );
      const helloData = (await helloResponse.json()) as ResponseState;
      setDashboardHelloState({ text: helloData.text ?? "", raw: helloData.raw });
      logDebug("dashboard_mcp_hello response", helloData);

      const resourceResponse = await fetch(
        useCustomDashboardUrl ? "/api/mcp/dashboard/custom/resource" : "/api/mcp/dashboard/resource",
        useCustomDashboardUrl
          ? {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ serverUrl: trimmedUrl })
            }
          : undefined
      );
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
      setBusy(false);
    }
  };

  const handleOpenDashboard = async () => {
    setChatStarted(true);
    await fetchDashboardUi();
  };

  const renderAppPreview = () => {
    if (!dashboardResourceState.html) {
      return (
        <div className="panel-placeholder">
          <p>No UI loaded yet.</p>
        </div>
      );
    }

    if (!dashboardResourceState.mimeType?.toLowerCase().includes("text/html")) {
      return (
        <div className="panel-placeholder">
          <p>Received non-HTML content (mimeType: {dashboardResourceState.mimeType ?? "unknown"}).</p>
          <pre>{dashboardResourceState.html}</pre>
        </div>
      );
    }

    return (
      <McpAppIframe
        html={dashboardResourceState.html}
        proxyEndpoint={
          useCustomDashboardUrl ? "/api/mcp/dashboard/custom/app-bridge" : "/api/mcp/dashboard/app-bridge"
        }
        sandboxPermissions={sandboxPermissions}
        serverUrl={useCustomDashboardUrl ? dashboardCustomUrl.trim() || undefined : undefined}
        title="MCP Dashboard App"
      />
    );
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">MCP Host · MCP Apps</p>
          <h1>Chatbot Host für MCP-Dashboards</h1>
          <p className="subtle">
            Teste MCP Apps in einem Chat-ähnlichen Verlauf und öffne das Dashboard als eingebettetes
            iframe.
          </p>
        </div>
        <div className="server-badges">
          <span className="badge">MCP Server: {serverUrlMasked}</span>
          <span className="badge">Dashboard MCP: {dashboardServerUrlMasked}</span>
        </div>
      </header>

      <section className="config-card">
        <div className="config-row">
          <div className="config-field">
            <label htmlFor="custom-url">Custom MCP-Server URL</label>
            <input
              id="custom-url"
              type="url"
              placeholder="https://preview.vercel.app/api/mcp"
              value={dashboardCustomUrl}
              onChange={(event) => setDashboardCustomUrl(event.target.value)}
            />
            <p className="field-hint">
              Optional für Vercel Preview Deployments. Standard-URL wird verwendet, wenn deaktiviert.
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={useCustomDashboardUrl}
              onChange={(event) => setUseCustomDashboardUrl(event.target.checked)}
            />
            <span>Custom URL verwenden</span>
          </label>
        </div>
      </section>

      <section className="chat-card">
        <div className="chat-header">
          <div>
            <h2>Chatverlauf</h2>
            <p className="subtle">Simuliert einen MCP-Chat, der das Dashboard als App öffnet.</p>
          </div>
          <div className="status-pill">
            <span className={busy ? "pulse" : ""} />
            {busy ? "Dashboard wird geladen" : "Bereit"}
          </div>
        </div>

        <div className="chat-body">
          <div className="message bot">
            <div className="avatar">MCP</div>
            <div className="bubble">
              <p>Hallo, wie kann ich dir heute helfen?</p>
            </div>
          </div>

          {!chatStarted && (
            <div className="suggestions">
              <button className="chip" onClick={handleOpenDashboard} disabled={busy}>
                Öffne die Übersicht
              </button>
            </div>
          )}

          {chatStarted && (
            <>
              <div className="message user">
                <div className="bubble">Öffne die Übersicht</div>
              </div>
              <div className="message bot">
                <div className="avatar">MCP</div>
                <div className="bubble bubble-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Übersicht</h3>
                      <p className="subtle">
                        Tool: dashboard_mcp_hello · {useCustomDashboardUrl ? "Custom" : "Standard"}
                      </p>
                    </div>
                    <button className="button-secondary" onClick={fetchDashboardUi} disabled={busy}>
                      Aktualisieren
                    </button>
                  </div>
                  <div className="panel-body">{renderAppPreview()}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <details className="debug-panel">
        <summary>Debug-Daten anzeigen</summary>
        <div className="debug-grid">
          <div>
            <h4>Tool Response</h4>
            <pre>{dashboardHelloState.text || "(no text)"}</pre>
            <pre>{JSON.stringify(dashboardHelloState.raw, null, 2)}</pre>
          </div>
          <div>
            <h4>Resource Metadata</h4>
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
            <h4>Resource Raw</h4>
            <pre>{JSON.stringify(dashboardResourceState.raw, null, 2)}</pre>
          </div>
        </div>
        <label className="debug-toggle">
          <input
            type="checkbox"
            checked={logToConsole}
            onChange={(event) => setLogToConsole(event.target.checked)}
          />
          MCP responses in der Browser-Konsole loggen
        </label>
      </details>
    </main>
  );
}
