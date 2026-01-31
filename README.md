# MCP Host

Minimal Next.js (App Router) host for testing MCP tools and MCP Apps UI resources.

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `MCP_SERVER_URL` | Yes | Base URL to the MCP server (e.g. `http://localhost:3001/mcp`). |
| `MCP_RESOURCE_ID` | No | MCP resource id/uri to load. Defaults to `hello_app_panel`. |
| `OPENAI_API_KEY` | No | Not required for this host. |

## Run locally

```bash
npm install
npm run dev
```

## Test flow

1. Set `MCP_SERVER_URL` to your MCP server endpoint.
2. Visit `http://localhost:3000`.
3. Click **Call hello_world** to call the MCP tool.
4. Click **Load MCP resource** to fetch the MCP Apps UI resource.

## API routes

- `GET /api/health` -> `{ ok: true }`
- `POST /api/mcp/call-hello` -> `{ text, raw }`
- `GET /api/mcp/resource` -> `{ html, raw }`
