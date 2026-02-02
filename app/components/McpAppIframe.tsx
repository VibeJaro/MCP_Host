"use client";

import { useEffect, useRef } from "react";

import { isRecord } from "@/lib/mcpParsing";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
};

type JsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
};

type Props = {
  html: string;
  proxyEndpoint: string;
  sandboxPermissions: string;
  serverUrl?: string;
  title?: string;
};

function parseJsonRpcRequest(data: unknown): JsonRpcRequest | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as JsonRpcRequest;
    } catch {
      return null;
    }
  }

  if (!isRecord(data)) {
    return null;
  }

  return data as JsonRpcRequest;
}

function buildError(code: number, message: string, data?: unknown): JsonRpcError {
  return { code, message, data };
}

function normalizeParams(params: unknown): Record<string, unknown> {
  if (isRecord(params)) {
    return params;
  }
  return {};
}

function extractJsonRpcError(raw: unknown): JsonRpcError | null {
  if (!isRecord(raw)) {
    return null;
  }
  if (isRecord(raw.error)) {
    const code = typeof raw.error.code === "number" ? raw.error.code : -32000;
    const message =
      typeof raw.error.message === "string" ? raw.error.message : "Unknown MCP error";
    const data = "data" in raw.error ? raw.error.data : undefined;
    return { code, message, data };
  }
  return null;
}

export default function McpAppIframe({
  html,
  proxyEndpoint,
  sandboxPermissions,
  serverUrl,
  title = "MCP App Preview"
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const request = parseJsonRpcRequest(event.data);
      if (!request || typeof request.method !== "string") {
        return;
      }

      const respond = (payload: { jsonrpc: "2.0"; id: JsonRpcId; result?: unknown; error?: JsonRpcError }) => {
        iframeRef.current?.contentWindow?.postMessage(payload, "*");
      };

      if (request.method === "ui/initialize") {
        respond({
          jsonrpc: "2.0",
          id: request.id ?? null,
          result: {
            host: { name: "MCP Host", version: "0.1.0" },
            capabilities: {}
          }
        });
        return;
      }

      if (request.id === undefined) {
        return;
      }

      try {
        const response = await fetch(proxyEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            method: request.method,
            params: normalizeParams(request.params),
            serverUrl
          })
        });

        const payload = (await response.json()) as { raw?: unknown };
        const raw = payload.raw;
        const error = extractJsonRpcError(raw);

        if (!response.ok || error) {
          respond({
            jsonrpc: "2.0",
            id: request.id,
            error:
              error ?? buildError(-32000, "MCP request failed", { status: response.status })
          });
          return;
        }

        if (isRecord(raw) && "result" in raw) {
          respond({ jsonrpc: "2.0", id: request.id, result: raw.result });
          return;
        }

        respond({
          jsonrpc: "2.0",
          id: request.id,
          error: buildError(-32000, "MCP response missing result")
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        respond({ jsonrpc: "2.0", id: request.id, error: buildError(-32000, message) });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [proxyEndpoint, serverUrl]);

  return (
    <div className="app-preview">
      <iframe
        ref={iframeRef}
        title={title}
        sandbox={sandboxPermissions}
        referrerPolicy="no-referrer"
        srcDoc={html}
      />
    </div>
  );
}
