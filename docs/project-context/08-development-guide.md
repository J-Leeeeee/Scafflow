# Development Guide

**Purpose:** Support local setup, testing, migration, and contribution workflow decisions.

**Last reviewed:** 2026-06-24

**Related files:** [02-system-architecture.md](02-system-architecture.md), [09-status-and-decisions.md](09-status-and-decisions.md)

---

## Prerequisites

- **Node.js** (LTS recommended)
- **PostgreSQL 16** — via Docker Compose or embedded Postgres
- **Redis 7** — via Docker Compose or local install
- **Anthropic API key** — required for AI hint features (optional for most unit tests)

---

## Environment Variables

Copy templates before first run:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.development   # optional
```

### Backend (`.env.example`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | — | Postgres connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS origin |
| `ANTHROPIC_API_KEY` | For hints | — | Anthropic API |
| `ANTHROPIC_HINT_MODEL` | No | `claude-haiku-4-5` | Hint model |
| `FIGMA_API_KEY` | MCP only | — | Figma MCP (not runtime) |

### Frontend (`frontend/.env.example`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | API base URL |

Empty `VITE_API_BASE_URL` uses same-origin / Vite proxy in dev.

### Test (`.env.test`)

Used by integration tests via `src/test/loadEnv.ts`. Creates `scaffold_test` database.

### Script-only

| Variable | Used by |
|----------|---------|
| `TEST_BASE_URL` | `scripts/test-smoke-system.ts`, `scripts/test-adaptive-system.ts` |

**Never commit `.env` files or secrets.**

---

## Quick Start

### 1. Start infrastructure

**Option A — Docker:**
```bash
docker compose up -d
```

Set in `.env`:
```
DATABASE_URL=postgresql://scaffold:scaffold@localhost:5432/scaffold
REDIS_URL=redis://localhost:6379
```

**Option B — No Docker:**
```bash
npm run infra
```

Runs embedded Postgres (`.local/pgdata`) + local Redis until Ctrl+C.

### 2. Migrate database

```bash
npm run migrate
```

### 3. Seed data (optional)

```bash
npm run import-problems
npm run import-thevenin
npm run seed-cohort-priors
```

### 4. Run dev servers

```bash
npm run dev:all
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

Or separately:
```bash
npm run dev           # backend only
npm run dev:frontend  # frontend only
```

---

## npm Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `infra` | `scripts/start-local-infra.ts` | Embedded Postgres + Redis |
| `dev` | `tsx watch src/index.ts` | Backend hot reload |
| `dev:frontend` | Vite dev server | Frontend |
| `dev:all` | Both concurrently | Full stack dev |
| `build` | `tsc` | Compile backend → `dist/` |
| `build:frontend` | Vite build | Frontend → `frontend/dist/` |
| `build:all` | Both | Production build |
| `start` | `node dist/index.js` | Production server |
| `migrate` | `src/db/migrate.ts` | Apply `schema.sql` |
| `migrate:learner-survey` | Incremental migration | Older DBs |
| `import-problems` | Seed problem bank | One-time |
| `import-thevenin` | Seed Thévenin scaffold | One-time |
| `seed-cohort-priors` | Seed cohort priors | One-time |
| `test` | Jest unit tests | Excludes integration |
| `test:integration` | Jest integration | Real Postgres |
| `test:watch` | Jest watch mode | — |
| `test:file` | Single test file | — |
| `test:smoke` | Live HTTP smoke tests | Needs running server |
| `test:adaptive` | Adaptive system verification | Needs running server |
| `test:prepush` | Full pre-push gate | Build + unit + smoke + adaptive |
| `test:prepush:prepare` | Same + migrate + seed | — |

---

## Testing Strategy

### Unit Tests (`*.test.ts`)

```bash
npm test
```

- Mock Postgres via `jest.mock('../../db/client')`
- Mock Anthropic via `jest.mock('@anthropic-ai/sdk')`
- Mock Redis via `moduleNameMapper` → `src/test/redisMock.ts`
- Colocated with source files

**Coverage areas:** auth, handlers, services, lib (numeric-grading, circuit-canvas), redis session-store

### Integration Tests (`*.integration.test.ts`)

```bash
npm run test:integration
```

- Real Postgres (`scaffold_test` DB created in `src/test/globalSetup.ts`)
- Mock Redis
- Uses `supertest` against `app` from `src/app.ts`
- Helpers: `truncateAll()`, `seedProblem()`, `registerAndLogin()` in `src/test/helpers.ts`

**Files:**
- `src/api/auth/auth.integration.test.ts`
- `src/api/onboarding/onboarding.integration.test.ts`
- `src/api/problems/problems.integration.test.ts`
- `src/api/sessions/sessions.integration.test.ts`
- `src/api/hints/hints.integration.test.ts`

### System / Live Tests

Require running server (`npm run dev` or `TEST_BASE_URL`):

```bash
npm run test:smoke      # HTTP endpoint smoke tests
npm run test:adaptive   # Black-box adaptive engine verification
npm run test:prepush    # Combined gate (build → unit → smoke → adaptive)
```

---

## Database Migrations

### Primary migration

`schema.sql` applied by `npm run migrate`. **Not idempotent** — skips if `topic` enum already exists.

### Incremental scripts

For databases deployed before schema updates:

| Script | When |
|--------|------|
| `src/db/add-learner-survey-responses.ts` | Missing survey table |
| `src/db/add-learner-profile.ts` | Missing learner_profile enum |

Fresh installs: `schema.sql` includes everything — only run `migrate`.

### Integration test bootstrap

`src/test/globalSetup.ts` creates `scaffold_test` and applies schema.

---

## Code Conventions

### Backend

| Pattern | Location |
|---------|----------|
| Router → handler split | `src/api/{domain}/router.ts` + `handler.ts` |
| Business logic in services | `src/services/` — no Express imports |
| Types mirror schema | `src/types/schema.ts` — update with `schema.sql` |
| Async error handling | `asyncHandler` wrapper |
| Auth gate | `requireAuth` on protected routes |

### Frontend

| Pattern | Location |
|---------|----------|
| All HTTP via API client | `frontend/src/lib/api.ts` |
| Page components | `frontend/src/routes/` |
| Shared UI | `frontend/src/components/` |
| Figma-aligned steps | `frontend/src/design/` |
| Tailwind only | No inline styles, no CSS modules |
| Local state | `useState` — no global store |

### Type checking

```bash
npm run build              # backend
cd frontend && npx tsc -b  # frontend
```

---

## Production Build

```bash
npm run build:all
NODE_ENV=production npm start
```

Backend serves `frontend/dist` static files and SPA fallback.

Point `DATABASE_URL` and `REDIS_URL` at Supabase or managed services.

Run `npm run migrate` on fresh production database before first start.

---

## Useful Scripts

| Script | Purpose |
|--------|---------|
| `scripts/demo.ts` | End-to-end demo (register → walkthrough → cleanup) |
| `scripts/test-prepush-balanced.ts` | Pre-push quality gate |
| `scripts/figma-mcp.sh` | Launch Figma MCP (dev tooling) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend "Cannot reach server" | Ensure backend running on :3000 |
| Integration tests fail on DB | Check `.env.test` DATABASE_URL; ensure Postgres running |
| Migrate fails "already exists" | Expected on re-run — schema already applied |
| Hints 500 | Set `ANTHROPIC_API_KEY` in `.env` |
| CORS errors | Match `FRONTEND_URL` to Vite origin |
| Redis connection refused | Start Redis via Docker or `npm run infra` |

---

## Git Ignored Paths

From `.gitignore`: `.env`, `.local/` (embedded Postgres data), `node_modules/`, `dist/`, `frontend/dist/`

Do not commit secrets or local infra data.
