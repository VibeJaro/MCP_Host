# agents.md — MCP Host (Next.js)

## Read-first
- MUST read `MCP_Apps_spec.md` before editing code.
- MUST follow the spec; never invent MCP APIs.

## Goal
A minimal Next.js (App Router) host to test:
1) MCP tool call `hello_world`
2) MCP resource load (MCP Apps UI) by id (default: hello_app_panel)

## Stability first
- Code must compile on Vercel (`npm run build`).
- Prefer runtime validation over fragile TypeScript unions.

## TypeScript rules
- Treat remote JSON as `unknown`.
- Use runtime checks:
  - `typeof x === "object" && x !== null`
  - `Array.isArray(x)`
  - `"field" in obj`
- Avoid narrow type predicates that omit required fields.
  - If a type predicate is used, its asserted type MUST be assignable to the parameter type.
- Limit `any` to a single isolated place if absolutely necessary.

## Routes
- GET /api/health -> { ok: true }
- POST /api/mcp/call-hello -> returns { text: string, raw: unknown }
- GET /api/mcp/resource -> returns { html: string, raw: unknown }

## Env
- MCP_SERVER_URL (required)
- MCP_RESOURCE_ID (optional, default "hello_app_panel")
- OPENAI_API_KEY (optional, not required for MCP tests)

## UI
- A single page with:
  - "Call hello_world" button
  - "Load MCP resource" button
  - Output area for text/html
  - Debug raw JSON viewer

## Security
- No secrets in client.
- Never print env vars fully.
- No shell, no fs, no arbitrary network beyond MCP_SERVER_URL.

## Deliverables
- README with env vars + testing steps.
