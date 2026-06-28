# Scafflow Project Context — Index

**Purpose:** Guide for uploading Scafflow context into ChatGPT (web) project knowledge.

**Last reviewed:** 2026-06-24

---

## How to Use with ChatGPT

1. Create a new ChatGPT Project (or open an existing one).
2. Upload **all 11 files** in this folder (README + 01–10).
3. Add this custom instruction to the project:

> Scafflow is an adaptive ECE tutoring app. Use docs **01–09** for current state and decisions. Use doc **10** only for planned/future work — do not assume it is implemented. Prefer backend types in `src/types/schema.ts` and the frontend API client in `frontend/src/lib/api.ts` as contracts.

4. When asking questions, reference the doc number if helpful (e.g. "Based on 07-onboarding-and-profiles…").

These files synthesize the repo; deep-dive design docs remain in `docs/` at the repository root.

---

## Recommended Reading Order

| File | Title | Use when deciding… |
|------|-------|-------------------|
| [01-product-overview.md](01-product-overview.md) | Product vision & scope | What Scafflow is, who it's for, what's in/out of scope |
| [02-system-architecture.md](02-system-architecture.md) | System architecture | Stack, repo layout, deployment, data flow |
| [03-data-model-and-domain.md](03-data-model-and-domain.md) | Data model & domain | Schema, enums, privacy constraints, audit tables |
| [04-adaptive-engine.md](04-adaptive-engine.md) | Adaptive engine (implemented) | Skill tiers, stress, interventions, scaffolds, AI hints |
| [05-api-reference.md](05-api-reference.md) | API reference | Endpoints, auth, request/response patterns |
| [APIs.md](APIs.md) | Backend API inventory | Endpoint purposes, rewrite classifications, gaps |
| [06-frontend-and-ux.md](06-frontend-and-ux.md) | Frontend & UX | Routes, components, user flows, design conventions |
| [07-onboarding-and-profiles.md](07-onboarding-and-profiles.md) | Onboarding & profiles | Learner classification, survey pipeline |
| [08-development-guide.md](08-development-guide.md) | Development guide | Local setup, env vars, testing, migrations |
| [09-status-and-decisions.md](09-status-and-decisions.md) | Status & decisions | What's done, blockers, open questions, decision log |
| [10-future-roadmap.md](10-future-roadmap.md) | Future roadmap | **PROPOSED** designs not yet implemented |

---

## Canonical Repo Docs (not duplicated here)

| Path | Contents |
|------|----------|
| `docs/sprint3-backend-design.md` | Full sprint history and backend design |
| `docs/scaffold-api.md` | Scaffold endpoint detail |
| `docs/adaptive-signal-design.md` | Proposed alternative_track design |
| `profile-classification-README.md` | Full profile classifier spec |
| `HANDOFF.md` | Frontend session handoff (partially stale — see 09) |
