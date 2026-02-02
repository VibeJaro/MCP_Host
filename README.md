# MCP Host

Minimal Next.js (App Router) host for testing an MCP server.

## Environment variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `MCP_SERVER_URL` | ✅ | n/a | Base URL for your MCP server (e.g. `http://localhost:3001/mcp`). |
| `DASHBOARD_MCP_SERVER_URL` | ❌ | `https://dashboard-mcp.vercel.app/api/mcp` | Base URL for the hosted MCP dashboard server. |
| `MCP_RESOURCE_ID` | ❌ | `ui://hello_app_panel` | Resource id/URI to load from the MCP server. |
| `OPENAI_API_KEY` | ❌ | n/a | Not required for this project. |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API routes

- `GET /api/health` → `{ ok: true }`
- `POST /api/mcp/call-hello` → calls `hello_world` tool
- `GET /api/mcp/resource` → loads the MCP resource
- `POST /api/mcp/app-bridge` → proxies MCP App JSON-RPC tool/resource calls to the primary server
- `POST /api/mcp/dashboard/app-bridge` → proxies MCP App calls to the dashboard server
- `POST /api/mcp/dashboard/custom/app-bridge` → proxies MCP App calls to a custom dashboard server URL

## Test flow

1. Set `MCP_SERVER_URL` in your environment.
2. Start the dev server (`npm run dev`).
3. Open the chat-style UI and click **Öffne die Übersicht** to invoke `dashboard_mcp_hello`.
4. Use the **Custom MCP-Server URL** field + toggle to test a Vercel preview deployment.
5. Expand **Debug-Daten anzeigen** to inspect raw MCP responses when needed.

## UI sizing

The host layout now allows wider dashboards (up to 1100px), and the embedded MCP App iframe targets a
larger view (min-height 560px, ~70vh) to better fit large dashboards.

## MCP App interactivity

The host now forwards MCP App postMessage JSON-RPC requests (for example, `tools/call`) from the
embedded iframe to the configured MCP server. This enables buttons like **Status aktualisieren** in
app UIs to invoke tools through the host instead of timing out.

## Build

```bash
npm run build
npm start
```

## Vercel

Deploy using the default Next.js framework settings (no custom output directory override).
