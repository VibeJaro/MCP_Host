# MCP Host (Next.js)

Minimaler Next.js Host für Chat + MCP-Apps Rendering, inkl. MCP Tool Test.

## Features
- Chat UI mit `/api/chat` (OpenAI oder Dummy).
- MCP App Panel (UI Resource via `MCP_SERVER_URL`).
- Tool Call Button für `hello_world` (style="friendly").
- Rate limiting (1 req/sec/IP) und Response-Limits.

## Setup

### 1) Abhängigkeiten installieren
```bash
npm install
```

### 2) Environment Variablen
Erstelle eine `.env.local`:
```bash
OPENAI_API_KEY="" # optional
MCP_SERVER_URL="https://<dein-mcp-server>/api/mcp"
MCP_RESOURCE_ID="hello_app_panel" # optional
```

### 3) Dev Server starten
```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## MCP Test-Flow
1. Stelle sicher, dass dein MCP Server eine `hello_world` Tool-Funktion anbietet.
2. Stelle sicher, dass die UI-Resource unter `MCP_RESOURCE_ID` verfügbar ist (z.B. `ui://hello_app_panel`).
3. Klicke auf **Load MCP App**, um das UI zu laden.
4. Klicke auf **Call hello_world**, um den Tool Call abzuschicken.

## API Endpoints
- `GET /api/health` → `{ ok: true, mcpConfigured: boolean }`
- `POST /api/chat` → `{ message: string }`
- `POST /api/mcp/resource` → lädt die MCP UI Resource (wird im sandboxed iframe gerendert)
- `POST /api/mcp/hello` → ruft `hello_world` Tool auf
- `GET /api/mcp/tools` → listet Tools

## Security / Limits
- Keine Secrets im Client.
- Strict Input Validation für `/api/chat`.
- Rate limit: 1 Request pro Sekunde pro IP.
- Output Limits: Chat ≤ 10 KB, UI Resource ≤ 50 KB.

## Deployment (Vercel)
- `OPENAI_API_KEY` optional, `MCP_SERVER_URL` erforderlich.
- App Router kompatibel, kein extra Server nötig.
