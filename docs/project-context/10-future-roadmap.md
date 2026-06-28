# Future Roadmap (Proposed)

**Purpose:** Document planned designs **not yet implemented**. Do not treat items here as current behavior.

**Last reviewed:** 2026-06-24

**Related files:** [04-adaptive-engine.md](04-adaptive-engine.md) (implemented today), [09-status-and-decisions.md](09-status-and-decisions.md)

**Canonical sources:** `docs/adaptive-signal-design.md`, `docs/sprint3-backend-design.md`

> Every item below is labeled **PROPOSED** unless marked otherwise.

---

## How to Use This Document

When making decisions with ChatGPT or other AI assistants:

- Docs **01–09** describe what exists today
- This doc (**10**) describes what may be built next
- If code and this doc conflict, **trust the code**

---

## PROPOSED: Alternative Learning Track

**Source:** `docs/adaptive-signal-design.md`

### Problem

Current skill updater only uses hint-based signals. Students who avoid hints never get clean DOWN signals; students using external AI may get spurious UP signals from `correct_no_hints`.

### Proposed Solution

Two learning tracks per student:

| Track | Who | Signal source |
|-------|-----|---------------|
| `hint_track` | Normal + advanced | Hint interactions (current behavior) |
| `alternative_track` | Struggling/anxious | Attempt outcomes + AI-help events |

Track is per-student; tier remains per-topic.

### Proposed Alternative Track Signals

| Signal | Condition | Direction |
|--------|-----------|-----------|
| `correct_no_ai` | correct, no AI help, time ≥ min | UP |
| `suspicious_fast` | correct, time < 40% of expected min | UNSCORED |
| `assisted_correct` | correct with AI help | NEUTRAL |
| `attempts_exhausted` | wrong, attempts ≥ budget | DOWN |
| `abandoned` | left without submitting | DOWN |
| `ai_help_still_wrong` | AI help then wrong attempt | DOWN |

`adaptive_config.hint_budget` would be repurposed semantically as attempt budget on alternative track.

### Proposed Track Switching

- HINT → ALTERNATIVE: 3 consecutive no-signal or NEUTRAL events while stress ≥ 1
- ALTERNATIVE → HINT: 3 consecutive UP signals + stress guard (stress ≤ 1)

### Proposed Forced Verification

When `consecutive_assisted >= 5` on a topic: lock AI-help for next 2 problems. Outcome drives UP or DOWN signal.

### Proposed Schema Additions

```sql
-- students
learning_track TEXT DEFAULT 'hint_track'
track_transition_signals INT DEFAULT 0

-- student_skills
consecutive_assisted INT DEFAULT 0

-- problems
expected_min_time_s INT DEFAULT 60

-- New append-only tables
signal_events
track_transitions
```

**Status:** Not in `schema.sql` or codebase today.

---

## PROPOSED: Sprint 3 Remaining Work

**Source:** `docs/sprint3-backend-design.md` (task table marked "Not Started" but partially superseded by implementation)

### Partially Done

| Task | Status |
|------|--------|
| Install Anthropic SDK | Done |
| `ai-tutor.ts` | Done |
| `POST /api/hints` | Done |
| Hint delivery + logging | Done |
| Tests with mocked streaming | Done |

### Still PROPOSED

| Task | Description |
|------|-------------|
| `POST /api/feedback` | Stream targeted feedback naming error from `error_taxonomy[]`; use Sonnet |
| Auto-hint wiring | Connect `InterventionTrigger` from adaptive-engine to immediately invoke hint handler |
| Hint absorption | Set `hint_events.absorbed` on next `submitAnswer` |
| Session heartbeat client | Wire 30s heartbeat from frontend for idle detection |
| `hint_depth_preference` flip | Two consecutive `absorbed=false` → set `concrete` (reset rule TBD) |

### Sprint 3 Open Questions (Unresolved)

| Question | Notes |
|----------|-------|
| Anthropic cold-start latency | Target <300ms skeleton UI |
| SSE disconnect mid-stream | Partial row vs skip logging |
| Absorption time window | Max minutes before `absorbed` stays null |
| Rate limiting | Enforce hint_budget before API call (partially done — 409 on exhaust) |

---

## PROPOSED: Frontend Completion

| Item | Priority | Notes |
|------|----------|-------|
| FERPA consent screen | **Critical** | Launch blocker |
| Diagnostic flow UI | High | API ready |
| AI hint panel | High | Consume SSE from `/api/hints` |
| Unify mock + live workspace | High | Route homework gate to `/problems/:id` |
| Full Figma profile flows | Medium | Profiles 1–3 step sequences |
| Dashboard variants | Medium | 3 Figma variants |
| Settings screens | Low | 5 Figma frames |
| Forgot password | Low | Needs backend + email service |
| Survey copy rewrite | Medium | ECE-specific questions |

---

## PROPOSED: Infrastructure

| Item | Current state | Proposed |
|------|---------------|----------|
| CI/CD | None | GitHub Actions running test + build |
| App containerization | None | Dockerfile for backend + static frontend |
| Deployment automation | Manual Supabase | Documented deploy runbook |
| Environment separation | `.env.test` only | Staging vs production configs |
| Frontend tests | None | Vitest + component tests for critical routes |

---

## PROPOSED: Product / Out of Scope (Future Versions)

Explicitly out of MVP scope but noted for roadmap planning:

| Feature | Notes |
|---------|-------|
| Instructor dashboard | Mentioned in sprint3 out-of-scope |
| SSO / OAuth | True UW NetID integration |
| Batch hint pre-generation | Runtime streaming preferred |
| Multi-course support | Dashboard hardcodes one course |
| Mobile-native app | Web SPA only |

---

## PROPOSED: Data Model Evolution

Beyond alternative_track schema:

| Change | Purpose |
|--------|---------|
| Persist all survey sections | Sections 2–4 currently discarded for stress |
| `learning_track` on students | Track switching |
| `expected_min_time_s` on problems | Anti-gaming time gate |
| Idempotent migrations | Framework (e.g. numbered SQL files) vs single `schema.sql` |

---

## PROPOSED: Design System Completion

From Figma file `qWB8UPBr4Us99ABkRspWRQ`:

| Section | Frames | Status |
|---------|--------|--------|
| Profile 1 (Alex) | ~32 | Components exist; production route incomplete |
| Profile 2 (Jordan) | ~30 | Same |
| Profile 3 (Priya) | ~13 | Same |
| Profile 4 | 3 | Stub |
| AI hint UI | TBD | Not identified in inventory |
| Consent / privacy | 0 | Not in Figma — needs design |

---

## Decision Framework for Prioritization

When choosing what to build next, suggested order:

1. **Consent UI** — unblocks all onboarding (launch blocker)
2. **Wire homework to live API workspace** — end-to-end student path
3. **AI hint frontend panel** — completes Sprint 3 user-visible value
4. **Diagnostic UI** — improves cold-start skill seeding
5. **Sprint 3 feedback endpoint** — deeper error explanation
6. **Alternative track** — anti-gaming for research validity
7. **CI/CD** — team velocity and regression safety

---

## Reference Links (Repo)

| Document | Path |
|----------|------|
| Alternative track design | `docs/adaptive-signal-design.md` |
| Sprint 3 backend design | `docs/sprint3-backend-design.md` |
| Scaffold API detail | `docs/scaffold-api.md` |
| Profile classifier spec | `profile-classification-README.md` |
| Frontend handoff (stale) | `HANDOFF.md` |
