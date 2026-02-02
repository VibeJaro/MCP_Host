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

## Test flow

1. Set `MCP_SERVER_URL` in your environment.
2. Start the dev server (`npm run dev`).
3. Click **Call hello_world** to verify tool calls.
4. Click **Load MCP resource** to verify resource loading.
5. Use **dashboard_mcp_hello (custom URL)** to test a per-branch Vercel deployment by pasting its `/api/mcp` URL.

## UI sizing

The host layout now allows wider dashboards (up to 1280px), and the embedded MCP App iframe targets a
taller view (min-height 560px, ~70vh) to better fit large dashboards.

## Build

```bash
npm run build
npm start
```

## Vercel

Deploy using the default Next.js framework settings (no custom output directory override).
