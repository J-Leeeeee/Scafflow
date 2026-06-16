# Scaffolding-Backend

Express/TypeScript backend for the adaptive scaffold project, plus a Phase 0
frontend shell in `frontend/` that is ready for Figma-to-frontend MCP work.

## Backend

- Auth uses a JWT stored in an `httpOnly` cookie.
- Redis is used for session state.
- The backend listens on `http://localhost:3000`.
- `FRONTEND_URL` should point to the frontend origin and defaults in code to
  `http://localhost:5173`.

## Frontend Phase 0

- The frontend lives in `frontend/`.
- Stack: React + Vite + TypeScript.
- The frontend listens on `http://localhost:5173`.
- API requests are configured for cookie auth with `credentials: 'include'`.

### Local dev

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev:frontend
```

To build the frontend shell:

```bash
npm run build:frontend
```

## Figma MCP (Claude Code + Cursor)

- Project MCP config: [`.mcp.json`](.mcp.json) — **figma** server via `figma-developer-mcp`
- Set `FIGMA_API_KEY` in [`.env`](.env) (see [`.env.example`](.env.example))
- **Claude Code setup:** [docs/claude-code-figma-mcp.md](docs/claude-code-figma-mcp.md)
- Design file key: `qWB8UPBr4Us99ABkRspWRQ`
- Paste a **single-frame** Figma URL in chat; avoid parent SECTION nodes
