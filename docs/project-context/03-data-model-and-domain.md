# Data Model and Domain

**Purpose:** Support schema, privacy, and data-contract decisions.

**Last reviewed:** 2026-06-24

**Related files:** [04-adaptive-engine.md](04-adaptive-engine.md), [07-onboarding-and-profiles.md](07-onboarding-and-profiles.md)

**Canonical sources:** `schema.sql`, `src/types/schema.ts`

---

## Schema Approach

- **Source of truth:** `schema.sql` — single DDL file, deployed via `npm run migrate`
- **TypeScript mirror:** `src/types/schema.ts` — hand-maintained, **not auto-generated**
- **Rule:** Any schema change requires updating both files
- **No ORM:** All queries use raw SQL through `pg.Pool` (`src/db/client.ts`)

Migration is **not idempotent** — bare `CREATE TYPE` / `CREATE TABLE`. Re-run skips if `topic` enum exists. Incremental one-off scripts exist for older deployments (`src/db/add-learner-profile.ts`, `src/db/add-learner-survey-responses.ts`).

---

## Enums

| Enum | Values | Used for |
|------|--------|----------|
| `topic` | `kvl`, `kcl`, `phasors`, `impedance`, `thevenin` | Skill tracking, problem tagging |
| `difficulty` | `easy`, `medium`, `hard` | Problem selection |
| `hint_depth` | `socratic`, `concrete` | AI hint style preference |
| `response_length` | `short`, `brief`, `medium` | AI response budget |
| `course_level` | `intro`, `intermediate`, `advanced` | Onboarding, thresholds |
| `learner_profile` | `starter`, `exploring`, `distracted`, `independent` | Scaffold variant selection |
| `step_type` | `planning`, `mcq`, `numeric`, `open`, `drawing_task` | Multi-step scaffolds |

---

## Core Mutable Tables

### `students`

Identity and onboarding state.

| Column | Purpose |
|--------|---------|
| `email_hash` | SHA-256 of lowercased trimmed email — **raw email never stored** |
| `password_hash` | bcrypt (cost 12) |
| `consent_given_at` | NULL until FERPA consent logged — **gates onboarding** |
| `adhd_flag` | Affects adaptive thresholds |
| `cold_start_done` | TRUE after diagnostic completes |
| `learner_profile` | Set after confidence survey classification |
| `course_level` | intro / intermediate / advanced |
| `sessions_completed` | Decays self-report weight in stress blend |

### `student_skills`

One row per `(student_id, topic)`. Tier 0–3 with hysteresis counters.

| Column | Purpose |
|--------|---------|
| `tier` | 0 = novice, 3 = advanced |
| `consecutive_up` / `consecutive_down` | Hysteresis counters (2 consecutive → tier change) |
| `confidence` | 0.0–1.0 float |
| `hint_depth_preference` | `socratic` or `concrete` |

### `adaptive_config`

Per-student intervention thresholds. Rewritten when stress recalculates.

| Column | Default | Purpose |
|--------|---------|---------|
| `idle_threshold_s` | 90 | Seconds idle before intervention |
| `error_threshold` | 3 | Consecutive errors before intervention |
| `hint_budget` | 3 | Max hints per problem |
| `response_length_budget` | `medium` | AI hint length cap |

### `cognitive_state`

Live behavioral + self-report blend.

| Column | Purpose |
|--------|---------|
| `stress_level` | 0, 1, or 2 |
| `focus_quality` | Self-report overlay |
| `idle_streak_s` | Current idle duration |
| `consecutive_errors` | Resets on correct answer |
| `self_report_weight` | Decays with `sessions_completed` |

### `sessions`

Postgres source of truth for session records. Redis caches hot state.

| Column | Purpose |
|--------|---------|
| `current_problem_state` | JSONB — problem context |
| `hint_history` | JSONB array |
| `last_seen_at` | Heartbeat timestamp |

---

## Problem Bank Tables

### `problem_sets` → `problems`

Static problem bank. Each problem has topic, difficulty, text, numeric ground truth, tolerance (default ±1%), and `error_taxonomy[]`.

### `problem_variants` → `problem_steps`

Multi-step scaffolds per learner profile.

```
problems (1) ──< problem_variants (per learner_profile) ──< problem_steps (ordered)
```

| `problem_steps` column | Purpose |
|----------------------|---------|
| `step_type` | planning, mcq, numeric, open, drawing_task |
| `options` | JSONB MCQ options (includes `is_correct` — stripped in API) |
| `ground_truth_answer` | Numeric steps only |
| `misconception_triggers` | JSONB — condition → hint text |

### `cohort_priors`

Semester-level average tier priors per `(course_level, topic)` for cold-start seeding.

---

## Append-Only Audit Tables

**IRB requirement:** SQL rules block UPDATE/DELETE on these tables.

| Table | Records |
|-------|---------|
| `consent_log` | FERPA consent events (optional `ip_hash`) |
| `problem_attempts` | Single-shot problem submissions |
| `problem_step_attempts` | Scaffold step submissions |
| `hint_events` | AI hints streamed (level, text, absorption) |
| `intervention_events` | Threshold breaches (error streak, hint budget) |
| `state_snapshots` | Stress/focus at state changes |
| `checkin_responses` | Self-report check-ins |
| `learner_survey_responses` | Raw onboarding survey JSONB |

Never design features that require editing or deleting audit rows.

---

## Views

### `student_profile`

Joins `students`, `cognitive_state`, `adaptive_config` for a single read used by AI tutor and adaptive logic. Loaded via `src/db/queries/student-profile.ts`.

---

## Redis Session Cache

**Key pattern:** `session:{session_id}` (`src/redis/keys.ts`)

**TTL:** 24 hours, extended on heartbeat

**Shape (`RedisSession` in schema types):**

| Field | Purpose |
|-------|---------|
| `current_problem_id` | Active problem |
| `hints_used_this_problem` | Hint budget tracking |
| `hint_history` | Recent hint metadata |
| `idle_streak_seconds` | Idle detection |
| `consecutive_errors` | Mirrors cognitive state for fast reads |

**Fallback:** On Redis miss, `session-store.ts` re-hydrates from Postgres — never fails silently.

---

## Privacy and Security Constraints

These are **decision-critical** and enforced in code:

| Constraint | Implementation |
|------------|----------------|
| No raw email storage | SHA-256 hash in `students.email_hash` |
| Consent before onboarding | Handlers check `consent_given_at` before writes |
| No ground truth to client | Stripped in `getProblem`, scaffold handlers |
| MCQ answers hidden | `is_correct` removed from public scaffold responses |
| JWT not in localStorage | httpOnly `token` cookie |
| Append-only audit | DB rules on log tables |

---

## Domain Concepts Quick Reference

| Concept | Storage | Range |
|---------|---------|-------|
| Skill tier | `student_skills.tier` | 0–3 |
| Stress level | `cognitive_state.stress_level` | 0–2 |
| Hint budget | `adaptive_config.hint_budget` | Typically 2–4 |
| Learner profile | `students.learner_profile` | 4 enum values |
| Profile number (UI) | Derived | 1–4 maps to enum |

---

## Incremental Migration Scripts

| Script | npm command | When needed |
|--------|-------------|-------------|
| `src/db/migrate.ts` | `npm run migrate` | Fresh DB or first deploy |
| `src/db/add-learner-survey-responses.ts` | `npm run migrate:learner-survey` | Older DBs missing survey table |
| `src/db/add-learner-profile.ts` | Manual: `node --import tsx src/db/...` | Pre-enum databases only |

For new environments, `schema.sql` already includes all objects — run `migrate` only.
