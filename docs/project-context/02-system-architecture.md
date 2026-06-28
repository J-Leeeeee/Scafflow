# System Architecture

**Purpose:** Support infrastructure, deployment, and structural decisions.

**Last reviewed:** 2026-06-24

**Related files:** [03-data-model-and-domain.md](03-data-model-and-domain.md), [05-api-reference.md](05-api-reference.md), [08-development-guide.md](08-development-guide.md)

---

## Repository Layout

Single git repository with **two loosely coupled packages** — not a formal monorepo (no npm workspaces, Turborepo, or Lerna).

```
Scafflow/
├── src/                    # Backend (Express + TypeScript)
│   ├── index.ts            # HTTP server entry
│   ├── app.ts              # Express app factory
│   ├── api/                # Route handlers by domain
│   ├── services/           # Business logic
│   ├── db/                 # Postgres client, migrations
│   ├── redis/              # Session cache
│   ├── lib/                # Shared utilities
│   └── types/schema.ts     # TS types mirroring schema.sql
├── frontend/               # React SPA (Vite)
│   └── src/
│       ├── routes/         # Page components
│       ├── components/     # Shared UI
│       ├── design/         # Figma-aligned workspace components
│       └── lib/api.ts      # Typed API client
├── scripts/                # CLI tools (seed, test, infra)
├── docs/                   # Design docs
├── schema.sql              # Postgres DDL (source of truth)
├── docker-compose.yml      # Local Postgres + Redis
└── package.json            # Backend scripts orchestrate both packages
```

Root scripts call frontend via `npm --prefix frontend` and `concurrently` for `dev:all`.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Backend runtime | Node.js, TypeScript 5.5 | Compiled with `tsc` → `dist/` |
| HTTP | Express 4 | Helmet, CORS, cookie-parser |
| Database | PostgreSQL 16 | Raw SQL via `pg` pool — **no ORM** |
| Cache | Redis 7 | Session hot state via `ioredis` |
| AI | Anthropic SDK | Streaming hints; model from `ANTHROPIC_HINT_MODEL` |
| Auth | JWT + bcrypt | httpOnly `token` cookie |
| Frontend | React 19, Vite 6 | SPA, not Next.js |
| Routing | React Router 7 | Client-side only |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin |
| Math | KaTeX, mathjs | Problem rendering and input |

---

## Runtime Architecture

```mermaid
flowchart TB
  subgraph client [Browser SPA]
    Vite[Vite dev :5173 or static dist]
    ApiClient[frontend/src/lib/api.ts]
  end

  subgraph server [Express :3000]
    App[src/app.ts]
    Auth[requireAuth middleware]
    Handlers[API handlers]
    Services[services/]
  end

  subgraph data [Data stores]
    PG[(PostgreSQL schema.sql)]
    Redis[(Redis session cache)]
  end

  subgraph external [External]
    Anthropic[Anthropic Claude API]
  end

  Vite --> ApiClient
  ApiClient -->|credentials include cookie| App
  App --> Auth --> Handlers --> Services
  Handlers --> PG
  Handlers --> Redis
  Services --> PG
  Services --> Anthropic
```

---

## Entry Points

| Layer | File | Role |
|-------|------|------|
| Backend server | `src/index.ts` | Listens on `PORT` (default 3000) |
| Backend app | `src/app.ts` | Middleware, route mounts, static frontend |
| Frontend bootstrap | `frontend/src/main.tsx` | React DOM mount |
| Frontend routes | `frontend/src/router.tsx` | All page routes |
| DB schema | `schema.sql` | DDL source of truth |
| DB migrate | `src/db/migrate.ts` | Apply schema (`npm run migrate`) |
| Frontend build | `frontend/vite.config.ts` | Dev proxy `/api` → `:3000` |

---

## API Mount Points

From `src/app.ts`:

| Mount path | Domain |
|------------|--------|
| `/api/auth` | Register, login, logout |
| `/api/onboarding` | Consent, surveys, diagnostic |
| `/api/problems` | Problems, scaffolds, submit |
| `/api/sessions` | Session lifecycle |
| `/api/hints` | SSE hint streaming |
| `/api/events` | Client event ingestion |
| `/api/homework-sets` | Homework listing |
| `/health` | Health check |

All `/api/*` routes except auth require JWT cookie auth.

---

## Production Deployment Model

**Current state:** Manual deployment; no Dockerfile for the app, no CI/CD.

1. Build frontend: `npm run build:all`
2. Start backend: `npm start` (serves `frontend/dist` when `NODE_ENV !== 'test'`)
3. Point env vars at **Supabase** (or managed Postgres + Redis) per `.env.example` comments
4. Run `npm run migrate` on fresh database

SSL for remote Postgres: `{ rejectUnauthorized: false }` when host is not localhost (`src/db/client.ts`).

Express catch-all serves `index.html` for client-side routing in production.

---

## Local Development Infrastructure

Two options for Postgres + Redis:

### Option A — Docker Compose

```bash
docker compose up   # from repo root
```

- Postgres: `postgresql://scaffold:scaffold@localhost:5432/scaffold`
- Redis: `redis://localhost:6379`

File: `docker-compose.yml`

### Option B — Embedded Postgres + local Redis

```bash
npm run infra   # scripts/start-local-infra.ts
```

- Postgres data in `.local/pgdata`
- Expects Redis at `~/.local/redis/bin/redis-server` (install separately)
- Runs until Ctrl+C

---

## Backend Code Organization Pattern

```
api/{domain}/
  router.ts      # Thin: wires routes + requireAuth + asyncHandler
  handler.ts     # Request/response logic
  *.test.ts      # Unit tests (mocked DB)
  *.integration.test.ts   # Integration tests (real Postgres)
services/
  {name}.ts      # Pure business logic, no Express imports
  {name}.test.ts
```

`asyncHandler` (`src/api/asyncHandler.ts`) forwards async errors to Express error middleware.

---

## Frontend ↔ Backend Contract

- All HTTP calls go through **`frontend/src/lib/api.ts`** — never raw `fetch` in route components
- Cookie auth: `credentials: 'include'` on every request
- Dev: Vite proxies `/api` to backend; prod: same origin (backend serves static files)
- Types duplicated in frontend API module (mirrors backend enums) — keep in sync with `src/types/schema.ts`

Frontend declares `"scaffolding-backend": "file:.."` in `package.json` for monorepo-style linking (unusual for a UI package; primarily for shared contracts).

---

## External Integrations

| Service | Used for | Env var |
|---------|----------|---------|
| PostgreSQL | Primary datastore | `DATABASE_URL` |
| Redis | Session cache | `REDIS_URL` |
| Anthropic | AI hints | `ANTHROPIC_API_KEY`, `ANTHROPIC_HINT_MODEL` |

**Not integrated:** OpenAI, Stripe, OAuth providers, email delivery (no forgot-password flow).

---

## Figma Design Reference

- Design file key: `qWB8UPBr4Us99ABkRspWRQ`
- MCP config in `.mcp.json` (tool-specific; see `docs/claude-code-figma-mcp.md`)
- Frontend `design/` layer implements Figma-aligned step components

See [06-frontend-and-ux.md](06-frontend-and-ux.md) for UI architecture.
