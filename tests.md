# MCP Host Debugging Checklist

> Ziel: Den MCP-Server `https://mcp-app-hello.vercel.app/` (oder deinen eigenen) prüfen, Fehler reproduzieren und die relevanten JSON-RPC-Antworten sammeln.

## Vorbereitung

1. Setze die Umgebungsvariable `MCP_SERVER_URL` auf die Basis-URL deines MCP-Servers (z. B. `https://mcp-app-hello.vercel.app/mcp`).
2. Starte die App:
   ```bash
   npm install
   npm run dev
   ```
3. Öffne `http://localhost:3000` im Browser.
4. Öffne die DevTools-Konsole (Chrome/Edge: `F12` → **Console**). Aktiviere das Debug-Logging per Checkbox **Log responses to browser console**.

## Test 1 – Health Check der Host-App

- **Aktion:** Rufe `http://localhost:3000/api/health` im Browser auf.
- **Erwartung:** `{ "ok": true }`
- **Sammle:** Response-Body und HTTP-Status.

**Ergebnis (bitte ausfüllen):**
```
Status:
Body:
```

## Test 2 – tools/list

- **Aktion:** Klicke **Fetch tools/list**.
- **Sammle:**
  - Der komplette JSON-Block aus **Raw response**.
  - Eventuelle Fehlermeldungen aus der Browser-Konsole.

**Ergebnis (bitte ausfüllen):**
```
Raw response:

Console errors/warnings:
```

## Test 3 – resources/list

- **Aktion:** Klicke **Fetch resources/list**.
- **Sammle:**
  - Der komplette JSON-Block aus **Raw response**.
  - Eventuelle Fehlermeldungen aus der Browser-Konsole.

**Ergebnis (bitte ausfüllen):**
```
Raw response:

Console errors/warnings:
```

## Test 4 – Standard tool (hello_world)

- **Aktion:** Klicke **Call hello_world**.
- **Sammle:**
  - **Response text**
  - **Raw response** (kompletter JSON-Block)
  - Eventuelle Fehlermeldungen aus der Browser-Konsole

**Ergebnis (bitte ausfüllen):**
```
Response text:

Raw response:

Console errors/warnings:
```

## Test 5 – Standard resource (MCP_RESOURCE_ID oder Default)

- **Aktion:** Klicke **Load MCP resource**.
- **Sammle:**
  - **HTML/Text**
  - **Raw response**
  - Eventuelle Fehlermeldungen aus der Browser-Konsole

**Ergebnis (bitte ausfüllen):**
```
HTML/Text:

Raw response:

Console errors/warnings:
```

## Test 6 – Custom tool (aus tools/list)

- **Aktion:** Kopiere einen Tool-Namen aus `tools/list`.
- **Aktion:** Füge den Namen in **Tool name** ein.
- **Aktion:** Trage ein JSON-Objekt in **Arguments (JSON object)** ein (z. B. `{}`) und klicke **Call tool**.
- **Sammle:**
  - **Response text**
  - **Raw response**
  - Eventuelle Fehlermeldungen aus der Browser-Konsole

**Ergebnis (bitte ausfüllen):**
```
Tool name:
Arguments:
Response text:

Raw response:

Console errors/warnings:
```

## Test 7 – Custom resource (aus resources/list)

- **Aktion:** Kopiere eine Resource-URI aus `resources/list` (häufig `ui://...`).
- **Aktion:** Füge die URI in **Resource URI** ein und klicke **Read resource**.
- **Sammle:**
  - **HTML/Text**
  - **Raw response**
  - Eventuelle Fehlermeldungen aus der Browser-Konsole

**Ergebnis (bitte ausfüllen):**
```
Resource URI:
HTML/Text:

Raw response:

Console errors/warnings:
```

## Zusätzliche Hinweise (optional)

- Falls der Server `https://mcp-app-hello.vercel.app/` nicht erreichbar ist:
  - Bitte notiere die genaue Fehlermeldung in den Ergebnissen oben.
  - Prüfe, ob der MCP-Endpunkt evtl. `/mcp` statt `/` ist.
