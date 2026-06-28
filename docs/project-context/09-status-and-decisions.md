# Status and Decisions

**Purpose:** Current implementation truth, launch blockers, open questions, and decision log. **Read this before trusting HANDOFF.md.**

**Last reviewed:** 2026-06-24

**Related files:** All other project-context docs; `HANDOFF.md` (partially stale)

---

## Implementation Status Summary

| Area | Status | Notes |
|------|--------|-------|
| Backend core | Done | Auth, sessions, problems, adaptive engine |
| Backend onboarding API | Done | Consent, self-declare, confidence, diagnostic |
| Backend scaffolds | Done | Profile variants, step grading |
| Backend AI hints | Partial | SSE streaming works; feedback endpoint missing |
| Frontend auth | Done | Login, register |
| Frontend onboarding | Partial | Self-declare + confidence done; consent + diagnostic placeholders |
| Frontend workspace | Split | Mock design route + live API route both exist |
| CI/CD | Not started | Pre-push script only |
| Production deploy | Manual | Supabase-oriented |

---

## Backend — Implemented

### Sprint 1 (Foundation)
- Postgres schema via `schema.sql` + `migrate.ts`
- Email auth + JWT httpOnly cookie (SHA-256 email hash)
- Redis session store (24h TTL)
- Event logging (`POST /api/events`)
- Problem DB import scripts
- Onboarding flow API (consent-gated)
- Static + adaptive problem endpoints
- Skill vector seeding from diagnostic

### Sprint 2 (Adaptive Engine)
- `skill-updater.ts` — hysteresis tier logic
- `cognitive-state.ts` — stress blend, threshold updates
- `adaptive-engine.ts` — intervention triggers
- Wired into submit, heartbeat, checkin events
- Unit tests for all services

### Sprint 3 (AI Tutor — Partial)
- `@anthropic-ai/sdk` installed
- `ai-tutor.ts` — prompt builder, streaming
- `POST /api/hints` — SSE endpoint, hint_events logging, Redis hint count
- Tests with mocked Anthropic

### Additional (Post-Sprint)
- Profile classifier (`profile-classifier.ts`) + confidence survey handler
- Multi-step scaffold API (`scaffold.ts`) + Thévenin problem seed
- Homework sets listing endpoint
- Learner survey responses table

---

## Backend — Not Implemented

| Item | Source doc | Notes |
|------|------------|-------|
| `POST /api/feedback` | sprint3-backend-design | Targeted error feedback via Sonnet |
| Auto-hint on intervention | sprint3-backend-design | Wire engine trigger → hint stream |
| Hint absorption on submit | sprint3-backend-design | Update `hint_events.absorbed` |
| Session heartbeat route | sprint3 design | Not in codebase — no `/api/sessions/:id/heartbeat` |
| `alternative_track` | adaptive-signal-design | See [10-future-roadmap.md](10-future-roadmap.md) |
| Forgot password | HANDOFF | No endpoint |

---

## Frontend — Implemented

| Route | Component | Notes |
|-------|-----------|-------|
| `/login` | LoginRoute | NetID → `@uw.edu` |
| `/register` | RegisterRoute | Full form + inline consent |
| `/dashboard` | DashboardRoute | Hardcoded course card |
| `/courses/:courseId` | CourseAssignmentsRoute | Onboarding gate + HW list |
| `/courses/.../confidence` | ConfidenceSurveyRoute | Live API → profile assignment |
| `/onboarding/self-declare` | SelfDeclareRoute | 21-item survey, live API |
| `/problemset` | DesignProblemRoute | Mock workspace with local fixtures |
| `/problems/:id` | ProblemRoute | API-backed scaffold workspace |
| `/design/showcase` | DesignShowcaseRoute | Step state review grid |

---

## Frontend — Placeholders / Incomplete

| Route | Component | Severity |
|-------|-----------|----------|
| `/onboarding/consent` | ConsentRoute | **Launch blocker** — stub panel only |
| `/onboarding/diagnostic` | DiagnosticRoute | Placeholder — API ready |
| AI hint UI | — | Backend SSE ready; no frontend panel |
| Forgot password | LoginRoute | `alert()` only |
| Dashboard Figma variants | — | Not built |
| Full Figma profile flows | DesignProblemRoute | Mock only; not wired to homework gate's live API path |
| Settings screens | — | Not in Figma inventory as built |

---

## HANDOFF.md Staleness

`HANDOFF.md` (2026-05-21) claims these are placeholders but they are now implemented:

- `/register` — full RegisterRoute with API
- `/problems/:id` — ProblemRoute with scaffold API
- Self-declare — expanded to 21-item survey (not just 3 sections)

Still accurate in HANDOFF:
- Consent is placeholder / launch blocker
- Diagnostic is placeholder
- Figma profile flows largely not built as production routes
- Survey Sections 2–3 collected but only Section 1 feeds stress baseline

---

## Launch Blockers

1. **FERPA Consent screen** — Backend requires `consent_given_at`. Register has inline checkbox but dedicated consent route is stub. Users hitting onboarding gate without register consent path need real UI calling `onboarding.acceptConsent()`.

2. **Consent before self-declare** — Backend rejects onboarding writes without consent. Any flow skipping consent will 400.

---

## Key Decisions Log

| Decision | Alternatives | Rationale | Revisit? |
|----------|--------------|-----------|----------|
| NetID → `@uw.edu` email | Raw NetID as key | UW convention | Yes — if SSO added |
| SHA-256 email hash only | Store raw email | FERPA/IRB | No |
| JWT httpOnly cookie | localStorage | XSS mitigation | No |
| Redis session cache | Postgres only | <50ms reads | No |
| Numeric ±1% tolerance | String match | Float answers | No |
| Append-only audit tables | Soft delete | IRB audit trail | No |
| 2-consecutive tier hysteresis | Single event | Prevent thrash | No |
| Raw SQL, no ORM | Prisma/Drizzle | Explicit control, IRB schema | Maybe at scale |
| Two workspace implementations | Single route | Design iteration parallel to API integration | Yes — unify |
| Mock homework path (`/problemset`) | Live `/problems/:id` | Design-first workflow | Yes — wire gate to live route |
| Anthropic haiku for hints | OpenAI, single model | Sprint 3 design | Maybe for feedback (sonnet) |
| Register inline consent | Separate consent only | Faster signup | Needs dedicated screen too |

---

## Open Questions (Need Team Input)

| Question | Context | Options |
|----------|---------|---------|
| Diagnostic vs homework Figma frames | ~32 Profile 1 frames — which 3 are diagnostic? | Design team labels |
| Survey question rewrite | Workplace-themed copy in self-declare | ECE-specific rewrite |
| Persist Sections 2–4? | Only Attention feeds stress_baseline | New table + endpoint vs drop collection |
| Unify workspace routes | Mock vs live split confuses flow | Wire `/problemset` to API or redirect to `/problems/:id` |
| Hint UI placement | Sprint 3 streams hints | Need Figma frame |
| Absorption window | `hint_events.absorbed` undefined cutoff | Define max minutes before null |
| SSE disconnect handling | Partial hint text in DB | Log partial vs skip |
| CI/CD platform | No automation today | GitHub Actions vs other |

---

## Test Coverage Snapshot

| Layer | Tool | Status |
|-------|------|--------|
| Unit | Jest | Auth, handlers, services, lib |
| Integration | Jest + supertest | Auth, onboarding, problems, sessions, hints |
| System | Custom scripts | Smoke + adaptive (needs running server) |
| Pre-push | `test-prepush-balanced.ts` | Local quality gate, not CI |
| Frontend | — | No automated frontend tests |

---

## Seeded Demo Data

After migrate + seed scripts:

- Core problem bank (`import-problems`)
- Thévenin multi-step scaffold for all 4 profiles (`import-thevenin`)
- Cohort priors (`seed-cohort-priors`)

Smoke tests expect `learner_profile=distracted` Thévenin variant.

---

## Documentation Map

| Need | Read |
|------|------|
| Product scope | 01-product-overview |
| Architecture | 02-system-architecture |
| Schema | 03-data-model-and-domain |
| Tutoring logic | 04-adaptive-engine |
| API contracts | 05-api-reference |
| UI/routes | 06-frontend-and-ux |
| Profile algorithm | 07-onboarding-and-profiles |
| Local dev | 08-development-guide |
| Future plans | 10-future-roadmap |
