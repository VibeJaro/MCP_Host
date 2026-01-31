# MCP Host

Minimal Next.js (App Router) host for testing an MCP server.

## Environment variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `MCP_SERVER_URL` | ✅ | n/a | Base URL for your MCP server (e.g. `http://localhost:3001/mcp`). |
| `MCP_RESOURCE_ID` | ❌ | `hello_app_panel` | Resource id/URI to load from the MCP server. |
| `OPENAI_API_KEY` | ❌ | n/a | Not required for this project. |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API routes

- `GET /api/health` → `{ ok: true }`
- `POST /api/mcp/roll-dice` → calls `roll_dice` tool
- `GET /api/mcp/resource` → loads the MCP resource

## Test flow

1. Set `MCP_SERVER_URL` in your environment.
2. Start the dev server (`npm run dev`).
3. Click **Roll dice** to verify tool calls.
4. Click **Load MCP resource** to verify resource loading.

## Build

```bash
npm run build
npm start
```

## Vercel

Deploy using the default Next.js framework settings (no custom output directory override).
