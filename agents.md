# agents.md

## Project: MCP Host Web App (Next.js + TypeScript)

### Goal
Build a Vercel-deployable Next.js host application that can:
1) show a simple chat UI
2) connect to a remote MCP server (URL in env)
3) load and render an MCP-Apps UI resource (hello_app_panel)
4) allow triggering the MCP tool `hello_world` and display its result

### Non-goals
- No complex auth in this iteration
- No database
- No arbitrary code execution / no shell commands

### Security constraints
- Never expose secrets to the browser.
- All API keys must be server-side only (Vercel env vars).
- Validate request bodies on server routes.
- Hard limits:
  - /api/chat response <= 10 KB
  - Any UI payload rendered <= 50 KB
- Rate limit light for demo endpoints.

### Environment variables
- OPENAI_API_KEY (optional; if absent, return deterministic dummy responses)
- MCP_SERVER_URL (required to test MCP integration)
- MCP_RESOURCE_ID (optional; default "hello_app_panel")

### Required routes
- GET /api/health
  - Returns { ok: true }
  - Optionally checks MCP connectivity (HEAD/GET) without leaking details
- POST /api/chat
  - Validates input: { message: string }
  - If OPENAI_API_KEY missing -> return dummy assistant text
  - Else call OpenAI server-side

### MCP integration requirements
- Provide a "Load MCP App" action in the UI that attempts to load the MCP resource by id.
- Provide a fallback test button "Call hello_world" that calls the MCP tool directly and prints the result.
- Do not invent protocol APIs. Prefer proven libraries/examples.

### UX requirements
- Single page: chat + MCP panel area.
- Clear status indicators:
  - MCP connected / error
  - Last MCP response / last tool result

### Deliverables checklist
- [ ] Vercel deploy works with no local setup
- [ ] README includes env setup + how to test
- [ ] /api/health present
- [ ] MCP tool call test works
- [ ] MCP-Apps UI rendering works OR fallback host UI proves the server works
