# API Plan — FastAPI Backend Rewrite

**Status:** Draft for review
**Scope:** Defines the API contract for the Python/FastAPI monolith rewrite: what we keep from the current MVP, what changes, and how every endpoint behaves — including error handling.

---

## 1. Overview

Scafflow is an adaptive scaffolding tutor for ECE circuit problems. A student registers, gives consent, completes an onboarding survey and a short diagnostic, then works through scaffolded problems in sessions. The backend adapts difficulty, hint budgets, and intervention thresholds to the student.

We are rewriting the backend from Express/TypeScript to a **Python/FastAPI monolith**. The rewrite changes the implementation, not the product, so the plan is:

- **The React frontend is kept unchanged.** It talks to the backend through exactly 21 HTTP endpoints (all listed in this document). If the new backend serves the same paths, request/response shapes, status codes, and cookie-based auth, the frontend needs zero changes.
- **The Postgres schema is kept unchanged** (18 tables). Python talks to the same database.
- **The API contract in this document is frozen.** The Express handlers are thrown away; their *behavior* — documented here — is the spec the FastAPI implementation must match.
- **Redis is dropped.** Live session state moves into Postgres (the `sessions` table already persists the fields needed to restore state). No endpoint's external shape changes because of this.

**Base URL:** `http://localhost:3000` in development (frontend dev server proxies to it). All endpoints are under `/api/`.

### How to read this document

Section 2 defines the rules that apply to *every* endpoint (auth, error format, status codes) so they are not repeated 21 times. Section 3 is the keep/change/drop decision table. Section 4 is the full endpoint reference. Section 5 walks through the user flows in the order a student actually hits the endpoints — read this first if you are new to the system.

---

## 2. Conventions (apply to every endpoint)

### 2.1 Authentication

- Auth is a **JWT in an `httpOnly` cookie named `token`** (7-day expiry, `SameSite=Strict`, `Secure` in production). The browser sends it automatically; there is no `Authorization` header and no token handling in frontend code.
- `POST /api/auth/register` and `POST /api/auth/login` set the cookie. `POST /api/auth/logout` clears it.
- **Every endpoint except the three auth endpoints requires the cookie.** A missing or invalid cookie always returns:

```
401 { "error": "Authentication required", "code": "UNAUTHENTICATED" }
```

This is not repeated in each endpoint's error table below — assume it everywhere.

### 2.2 Error envelope

Every error response is JSON with this shape:

```json
{
  "error": "Human-readable message, safe to show the student",
  "code": "MACHINE_READABLE_CODE"
}
```

- `error` (string) is what the frontend displays today — **the field name and type must not change**, because the frontend's shared request helper reads `body.error` directly ([api.ts:31](../frontend/src/lib/api.ts)).
- `code` (string) is **new in the rewrite**: a stable identifier the frontend can branch on without string-matching messages. Adding a field is backward compatible.

> **FastAPI implementation note:** FastAPI's defaults do not match this contract, and both must be overridden:
> 1. `HTTPException` serializes as `{"detail": ...}` → use a custom exception class + handler that emits our envelope.
> 2. Pydantic validation failures return **422** by default → the current API returns **400** for malformed input, so register a `RequestValidationError` handler that returns 400 with our envelope. The frontend was built against 400s; keep them.

### 2.3 Status codes

Every endpoint uses the status codes below. The frontend branches on these numbers, so the FastAPI rewrite must match them exactly — not generic HTTP defaults (especially `400` vs `422`).

| Status | When the API returns it |
|---|---|
| `200` | Request succeeded. Default for reads and updates that don't create a new resource. |
| `201` | Request succeeded and a new resource was persisted — registration and session creation. |
| `204` | Request succeeded with no response body — event ingestion endpoints. |
| `400` | The request itself is invalid: malformed input, missing or invalid fields, or a reference to something that doesn't exist (e.g. unknown problem ID in a diagnostic submission). Not an auth, consent, or state-order problem. |
| `401` | Authentication failed or absent: missing cookie, expired token, or wrong credentials. Required on every endpoint except register, login, and logout. |
| `403` | Authenticated, but a prerequisite blocks the action. In practice this is almost always **consent not yet recorded** — survey and diagnostic writes before consent. |
| `404` | Resource not found or not accessible to this student. Same response whether the ID is unknown or belongs to someone else — we never reveal cross-student resources. |
| `409` | Valid request that conflicts with current state: duplicate account, onboarding already completed, hint budget exhausted, survey steps submitted out of order. |
| `422` | Request shape is valid but processing couldn't finish — **profile classification failure only**. Do not use for generic validation errors; those are `400`. |
| `500` | Unhandled server error. Body is always `{ "error": "Internal server error", "code": "INTERNAL" }`; never expose stack traces or internal details. |
| `503` | Server is up but a dependency isn't ready — e.g. problem bank not seeded. |

### 2.4 Data-handling rules the new backend must preserve

These are compliance/pedagogy constraints, not style choices:

1. **Raw emails are never stored.** Emails are SHA-256 hashed before any DB write; login re-hashes and compares.
2. **Ground truth never leaves the server.** Problem and step responses omit `ground_truth_answer`, `tolerance`, and MCQ `is_correct` flags. Grading happens server-side only.
3. **Numeric answers are graded with tolerance** (`|submitted − truth| ≤ tolerance`), never by string comparison.
4. **Event tables are append-only** (`problem_attempts`, `hint_events`, `intervention_events`, `state_snapshots`, `checkin_responses`, `consent_log`). The schema enforces this with SQL rules; the API must never expose update/delete on them.
5. **Consent gates onboarding.** Survey and diagnostic writes are rejected with `403 CONSENT_REQUIRED` until consent is recorded.

---

## 3. What we keep, change, and drop

### 3.1 Component level

The rewrite replaces the **Node server and its tooling**, not the product surface. Users keep the same UI, database, and learning content; the backend is reimplemented in Python while honoring the existing API contract. Components fall into three buckets:

- **Keep as-is** — no behavioral or structural change; the rewrite must not disturb these.
- **Port to Python** — same logic and outward behavior, new implementation language; parity must be provable.
- **Drop** — Node-specific infrastructure with no Python equivalent needed; replaced by simpler or native alternatives.

| Component | Verdict | What stays the same | What changes |
|---|---|---|---|
| React frontend (`frontend/`) | **Keep as-is** | Entire UI and user flows. The frontend talks to the backend only through `frontend/src/lib/api.ts`. | Nothing — **contract freeze** means zero frontend changes during the rewrite. |
| Postgres schema (`schema.sql`) | **Keep as-is** | All 18 tables, columns, constraints, and append-only rules. | Only **migration tooling**: rewrite in Python (Alembic). The schema file itself is not edited. |
| Problem content / seed data | **Keep** | The actual data: problem bank, homework sets, variants, cohort priors. | **Import scripts** rewritten in Python; the payloads they load are unchanged. |
| Adaptive engine logic | **Port to Python** | All pedagogy behavior: skill-tier hysteresis, weakest-topic problem selection, adaptive thresholds, hint budgets, profile classifier, numeric + circuit-canvas grading. | Implementation language only. This is the project's **core IP** — port line-for-line and reuse existing Jest test cases as pytest fixtures to prove parity. |
| Auth flow (bcrypt + JWT cookie) | **Port to Python** | Login/register/logout behavior, bcrypt hashing, JWT cookie auth. Same cookie name, claims (`sub` = student ID), and expiry. | Implementation language only. Existing frontend auth code and **even active sessions** should survive the cutover. |
| Express app, middleware, `asyncHandler` | **Drop** | — | The Node HTTP layer goes away. Replaced by FastAPI idioms: Pydantic models, `Depends` for auth, exception handlers. |
| Redis session cache | **Drop** | External API shape and session semantics from the client's perspective. | Session working state moves to **Postgres** instead of Redis — one fewer dependency, same outward behavior. |
| Node tooling (Jest, tsx, embedded-postgres) | **Drop** | Test coverage intent and CI gates. | Replaced by **pytest** and standard Python tooling (uv/poetry, Alembic, etc.). |

### 3.2 Endpoint level

At the **HTTP contract** layer, the rewrite is almost a straight port: the frontend keeps calling the same URLs with the same request/response shapes. The goal is **behavioral parity** — a student using the app during or after cutover should not notice which backend is serving them.

Endpoints fall into three verdicts:

- **Keep** — same path, method, auth rules, status codes, and JSON bodies. Reimplemented in FastAPI, but the contract is frozen.
- **Keep (internal change)** — the client sees no difference; only where or how the server stores/serves data changes under the hood.
- **Drop** — dead or superseded route; not implemented in the new backend and removed from `frontend/src/lib/api.ts`.

| # | Area | Endpoint | Verdict | What stays the same | What changes |
|---|---|---|---|---|---|
| 1 | Auth | `POST /api/auth/register` | **Keep** | Creates account, records consent, initializes adaptive state, sets JWT cookie. Request/response shape and error codes (`400`, `409`). | Implementation language only. |
| 2 | Auth | `POST /api/auth/login` | **Keep** | Credential check, JWT cookie issuance, same error codes. | Implementation language only. |
| 3 | Auth | `POST /api/auth/logout` | **Keep** | Clears the auth cookie. | Implementation language only. |
| 4 | Onboarding | `POST /api/onboarding/consent` | **Keep** | Append-only consent log, idempotent `consent_given_at` update. | Implementation language only. |
| 5 | Onboarding | `POST /api/onboarding/declaration` | **Drop** | — | Legacy single-form onboarding (ADHD flag + stress + course level in one call). Superseded by `self-declare` + `confidence`; **no frontend route calls it today**. Not implemented in Python; dead `onboarding.declaration` helper removed from `frontend/src/lib/api.ts`. |
| 6 | Onboarding | `POST /api/onboarding/self-declare` | **Keep** | 21-item Likert survey, adaptive threshold computation, consent gate (`403`). | Implementation language only. |
| 7 | Onboarding | `POST /api/onboarding/confidence` | **Keep** | 4-topic confidence survey, profile classifier, ordered survey gates (`403`, `409`, `422`). | Implementation language only. |
| 8 | Onboarding | `GET /api/onboarding/status` | **Keep** | Onboarding progress flags the frontend uses for routing (`consentGiven`, `selfDeclareComplete`, etc.). | Implementation language only. |
| 9 | Onboarding | `GET /api/onboarding/problems` | **Keep** | 3 diagnostic problems for the student's course level; public problem shape (no ground truth). | Implementation language only. |
| 10 | Onboarding | `POST /api/onboarding/diagnostic` | **Keep** | Submit 3 answers, grade with tolerance, seed skill tiers, mark `cold_start_done`, return `session_id`. | Implementation language only. |
| 11 | Problems | `GET /api/problems/next` | **Keep** | Adaptive next-problem selection (weakest topic → matching difficulty). Route must register `/next` before `/{id}`. | Implementation language only. |
| 12 | Problems | `GET /api/problems/:id` | **Keep** | Fetch one problem in the public shape. | Implementation language only. |
| 13 | Problems | `POST /api/problems/:id/submit` | **Keep** | Final answer grading, attempt logging, skill-tier update, optional intervention payload. | Implementation language only. |
| 14 | Problems | `GET /api/problems/:id/scaffold` | **Keep** | Profile-selected scaffold steps, optional `session_id` resume, empty-list degrade (not 404). | Implementation language only. |
| 15 | Problems | `POST /api/problems/:id/steps/:stepId/submit` | **Keep** | Per-step grading (MCQ, numeric, circuit canvas), attempt logging, skill updates. | Implementation language only. |
| 16 | Sessions | `POST /api/sessions` | **Keep** | Create a work session, initialize working state, return `session_id`. | Storage backend only — state written to Postgres instead of Redis. |
| 17 | Sessions | `GET /api/sessions/:id` | **Keep (internal change)** | Response shape: session row + `state` object (step position, hint counters, drafts, etc.). | `state` is served from **Postgres** instead of Redis — always present (no cache-miss `null`), which the frontend already tolerates. |
| 18 | Sessions | `POST /api/sessions/:id/end` | **Keep** | End session, increment completed-session count, race-safe 404 on double-end. | Storage backend only. |
| 19 | Hints | `POST /api/hints` | **Keep** | SSE token stream (`text/event-stream`), hint depth escalation, budget enforcement, pre-`done` logging. | Streaming via FastAPI `StreamingResponse` + async generator; Anthropic Python SDK for generation. |
| 20 | Events | `POST /api/events` | **Keep** | Fire-and-forget telemetry into append-only audit tables; `204` on success. | Implementation language only. |
| 21 | Homework | `GET /api/homework-sets` | **Keep** | Problem sets with per-student `attempted` flags for the assignments dashboard. | Implementation language only. |

**Net result: 20 of 21 endpoints keep their exact contract; 1 is dropped.** The only client-visible cleanup is removing the unused `declaration` call from the API client.

---

## 4. Endpoint reference

Grouped by area. Every entry follows the same template: purpose → auth → request → success → errors. The `401 UNAUTHENTICATED` error (§2.1) applies to every endpoint marked *Auth: required* and is not repeated.

---

### 4.1 Auth

#### 1. `POST /api/auth/register`

Creates a student account and logs them in. Also records their consent decision, and initializes the adaptive state (cognitive state, adaptive config, and a tier-1 skill entry per topic) so later endpoints never hit missing rows.

**Auth:** none

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | yes | Hashed (SHA-256, lowercased/trimmed) before storage; raw email never stored. |
| `password` | string | yes | Stored as bcrypt hash (cost 12). |
| `display_name` | string | no | |
| `course_level` | `"intro"` \| `"intermediate"` \| `"advanced"` | no | Defaults to `"intro"`. |
| `consent` | boolean | no | Defaults to `false`. Recorded in the append-only consent log either way. |

**Success — `201`** (sets the `token` cookie)

```json
{ "id": "3f7c2a9e-…" }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `email` or `password` missing. |
| 409 | `ACCOUNT_EXISTS` | An account with this email already exists. |

---

#### 2. `POST /api/auth/login`

Verifies credentials and logs the student in.

**Auth:** none

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**Success — `200`** (sets the `token` cookie)

```json
{ "id": "3f7c2a9e-…" }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `email` or `password` missing. |
| 401 | `INVALID_CREDENTIALS` | Unknown email or wrong password — the response never says which. The current implementation also runs bcrypt even when the email is unknown, to keep response timing uniform; **preserve this** in the port. |

---

#### 3. `POST /api/auth/logout`

Clears the auth cookie. Always succeeds, even if not logged in.

**Auth:** none

**Request body:** none

**Success — `200`**

```json
{ "message": "Logged out" }
```

---

### 4.2 Onboarding

The onboarding sequence is: **consent → self-declare survey → confidence survey → diagnostic problems**. Each step is gated on the previous one (see error tables). `GET /status` tells the frontend where the student is in this sequence.

#### 4. `POST /api/onboarding/consent`

Records the student's consent decision. Every call appends to the consent audit log; `consent_given_at` on the student is set only the first time consent is granted (idempotent — re-consenting is harmless).

**Auth:** required

**Request body**

| Field | Type | Required |
|---|---|---|
| `consent` | boolean | yes |

**Success — `200`**

```json
{ "consented": true }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `consent` missing or not a boolean. |

---

#### 5. `POST /api/onboarding/declaration` — **DROPPED**

Legacy single-form onboarding (ADHD flag + stress baseline + course level in one call). Superseded by `self-declare` + `confidence`; no frontend route calls it. **Not implemented in the new backend.** The dead `onboarding.declaration` function in `frontend/src/lib/api.ts` is removed as part of the rewrite.

---

#### 6. `POST /api/onboarding/self-declare`

Stores the 21-item self-declaration survey (Likert 1–5) and computes the student's adaptive thresholds (idle threshold, error threshold, hint budget, response-length budget) from the ADHD flag, the attention-difficulty items, and course level.

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `adhd_flag` | boolean | yes | |
| `course_level` | `"intro"` \| `"intermediate"` \| `"advanced"` | yes | |
| `responses` | object | yes | Must contain **all 21** item IDs, each an integer 1–5: `b1_1`–`b1_5` (attention difficulty), `au_1`–`au_4` (autonomy), `co_1`–`co_4` (competence), `sr_1`–`sr_4` (self-regulation), `se_1`–`se_4` (self-efficacy). |

**Success — `200`**

```json
{ "self_declared": true }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `adhd_flag` not boolean, `course_level` invalid, or `responses` missing any of the 21 IDs / value outside 1–5. |
| 403 | `CONSENT_REQUIRED` | Consent not yet given. |

---

#### 7. `POST /api/onboarding/confidence`

Stores the 4-topic confidence survey, runs the learner-profile classifier over the (already stored) self-declare responses, and assigns the student's `learner_profile` — which later selects which scaffold variant they see.

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `topics` | object | yes | All four keys required, each an integer 1–5: `thevenin_norton`, `mesh_current`, `node_voltage`, `kirchhoff_law`. |

**Success — `200`** — the classifier result plus a topic-confidence score:

```json
{
  "status": "Ok",
  "learnerProfile": "exploring",
  "constructScores": { "autonomy": 3.5, "competence": 2.75, "selfRegulation": 3.0, "selfEfficacy": 3.25, "attentionDifficulty": 2.4 },
  "topicConfidenceScore": 2.75
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `topics` missing a key or value outside 1–5. |
| 403 | `CONSENT_REQUIRED` | Consent not yet given. |
| 409 | `SELF_DECLARE_REQUIRED` | Self-declare survey not completed yet — surveys must be done in order. |
| 422 | `CLASSIFICATION_FAILED` | Classifier could not produce a profile from the stored responses. Response includes a `detail` object with the classifier output for debugging. |

---

#### 8. `GET /api/onboarding/status`

Reports where the student is in the onboarding sequence. The frontend calls this on load to route the student to the right screen.

**Auth:** required

**Success — `200`**

```json
{
  "consentGiven": true,
  "selfDeclareComplete": true,
  "confidenceComplete": false,
  "learnerProfile": null,
  "profileNumber": null
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| 404 | `STUDENT_NOT_FOUND` | Token references a student that no longer exists. |

---

#### 9. `GET /api/onboarding/problems`

Returns the 3 diagnostic problems for the student's course level (one per topic, difficulty matched to level, randomly picked). Ground truth is never included.

**Auth:** required

**Success — `200`**

```json
{
  "problems": [
    { "id": "…", "topic": "kvl", "difficulty": "easy", "problem_text": "…", "error_taxonomy": ["sign_error", "…"] }
  ]
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| 403 | `CONSENT_REQUIRED` | Consent not yet given. |
| 409 | `ALREADY_ONBOARDED` | Diagnostic already completed — it can only run once. |
| 503 | `PROBLEM_BANK_EMPTY` | No problems seeded for this course level (dev/deploy issue, not a user error). |

---

#### 10. `POST /api/onboarding/diagnostic`

Submits the 3 diagnostic answers. Each is graded with numeric tolerance; each topic's skill tier is seeded (correct → tier 2, incorrect → tier 1); the student is marked onboarded (`cold_start_done`). Creates an internal session so the attempts satisfy audit-log foreign keys.

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `answers` | array | yes | **Exactly 3 items**, each `{ "problem_id": string, "submitted_answer": number, "time_spent_s": number }`. |

**Success — `200`**

```json
{
  "completed": true,
  "session_id": "9d41f0b2-…",
  "results": [
    { "problem_id": "…", "topic": "kvl", "correct": true },
    { "problem_id": "…", "topic": "kcl", "correct": false },
    { "problem_id": "…", "topic": "phasors", "correct": true }
  ]
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_ANSWERS` | `answers` is not an array of exactly 3 items. |
| 400 | `UNKNOWN_PROBLEM` | One or more `problem_id`s don't exist. |
| 403 | `CONSENT_REQUIRED` | Consent not yet given. |
| 409 | `ALREADY_ONBOARDED` | Diagnostic already completed. |

---

### 4.3 Problems & scaffolding

Problem responses are always the **public shape** — `id`, `topic`, `difficulty`, `problem_text`, `error_taxonomy`, `created_at` — never ground truth (§2.4).

#### 11. `GET /api/problems/next`

Picks the next problem adaptively: finds the student's weakest topic (lowest skill tier) and returns a random problem at the matching difficulty (tier 0–1 → easy, 2 → medium, 3 → hard).

> **Routing note:** `/next` must be registered before `/{id}` or "next" gets parsed as a problem ID. True in Express today; equally true in FastAPI.

**Auth:** required

**Success — `200`** — one problem in the public shape.

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `NO_SKILL_VECTOR` | Student has no skill entries — onboarding not completed. |
| 404 | `NO_PROBLEMS_AVAILABLE` | Problem bank has nothing at the required topic/difficulty. |

---

#### 12. `GET /api/problems/:id`

Fetches one problem by ID, public shape.

**Auth:** required

**Success — `200`**

```json
{ "id": "…", "topic": "kcl", "difficulty": "medium", "problem_text": "…", "error_taxonomy": ["…"], "created_at": "2026-05-01T…" }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 404 | `PROBLEM_NOT_FOUND` | No problem with this ID. |

---

#### 13. `POST /api/problems/:id/submit`

Submits a final numeric answer for a whole problem. Grades with tolerance, appends to the attempt log, updates the topic's skill tier (factoring in hints used this problem) and the consecutive-error counter, and may return an intervention for the frontend to display (e.g. a break suggestion).

**Auth:** required

**Request body**

| Field | Type | Required |
|---|---|---|
| `session_id` | string | yes |
| `submitted_answer` | number | yes |
| `time_spent_s` | number | yes |

**Success — `200`**

```json
{ "correct": false, "topic": "kcl", "intervention": null }
```

`intervention` is `null` or an intervention object when a threshold (error streak, hint exhaustion) was crossed.

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | Any of the three fields missing. |
| 404 | `PROBLEM_NOT_FOUND` | No problem with this ID. |

---

#### 14. `GET /api/problems/:id/scaffold`

Returns the ordered scaffold steps for this problem, chosen by the student's `learner_profile` (falls back to the `starter` variant if their profile has no variant; returns an empty step list if the problem has no variants at all — **200, not 404**, so the frontend can degrade to plain problem view).

**Auth:** required

**Query parameters**

| Param | Required | Notes |
|---|---|---|
| `session_id` | no | If given, the response includes the student's saved position (`current_step_id`) so a reopened problem resumes where they left off. |

**Success — `200`**

```json
{
  "problem_id": "…",
  "variant_id": "…",
  "learner_profile": "starter",
  "total_steps": 4,
  "current_step_id": null,
  "steps": [
    {
      "id": "…",
      "step_order": 1,
      "step_type": "mcq",
      "prompt_text": "Which law applies at node A?",
      "options": [ { "key": "A", "text": "KCL" }, { "key": "B", "text": "KVL" } ],
      "interaction_type": null
    }
  ]
}
```

Step types: `mcq`, `numeric`, `planning`, `open`, `drawing_task`. MCQ options are stripped of `is_correct`. `interaction_type` (`"ground_node"`, `"short_mesh"`, or `null`) tells the frontend to render the interactive circuit canvas.

**Errors:** none beyond auth — missing variants degrade to an empty list by design.

---

#### 15. `POST /api/problems/:id/steps/:stepId/submit`

Grades one scaffold step and advances the student's position. Grading depends on step type: MCQ by option key; numeric by tolerance (or ungraded if the step has no ground truth); `planning`/`open` are acknowledgment-only (always accepted); circuit-canvas steps are graded structurally and can return a misconception hint. Wrong answers report the attempt budget (5 per step).

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `session_id` | string | yes | |
| `submitted_value` | string \| number | yes | Option key for MCQ, number for numeric, serialized canvas state for circuit steps. |
| `time_spent_s` | number | yes | |

**Success — `200`** (a wrong answer is still a 200 — `correct` carries the result)

```json
{
  "correct": false,
  "ungraded": false,
  "next_step_id": null,
  "misconception_hint": "Check the sign convention on your loop direction.",
  "attempt_budget": 5,
  "attempts_used": 2,
  "attempts_remaining": 3
}
```

On a correct (or ungraded) answer, `next_step_id` is the next step's ID, or `null` when the scaffold is finished, and the attempt fields are omitted.

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | Any of the three fields missing. |
| 404 | `STEP_NOT_FOUND` | Step doesn't exist **or belongs to a different problem** than the URL says — cross-problem submissions are rejected. |

---

### 4.4 Sessions

A session brackets one sitting of work. The frontend creates one when the student opens a problem and ends it when they leave.

#### 16. `POST /api/sessions`

Creates a session and initializes its working state (current step, hint counters, idle tracking).

**Auth:** required

**Request body**

| Field | Type | Required |
|---|---|---|
| `problem_id` | string | no |

**Success — `201`**

```json
{ "session_id": "9d41f0b2-…" }
```

**Errors:** none beyond auth.

---

#### 17. `GET /api/sessions/:id`

Returns the session row plus its live working state. Only active (un-ended) sessions belonging to the requesting student are visible.

**Auth:** required

**Success — `200`**

```json
{
  "session": { "id": "…", "current_problem_id": "…", "started_at": "…", "last_seen_at": "…" },
  "state": {
    "current_problem_id": "…",
    "current_step_id": "…",
    "current_problem_state": { "answer_draft": null, "steps": [], "last_modified": "…" },
    "hint_history": [],
    "idle_streak_seconds": 0,
    "consecutive_errors": 0,
    "hints_used_this_problem": 1
  }
}
```

> **Rewrite note:** today `state` comes from Redis and can be `null` on a cache miss. In the new backend it is stored in Postgres, so it is always present — a strict improvement the frontend already tolerates.

**Errors**

| Status | Code | When |
|---|---|---|
| 404 | `SESSION_NOT_FOUND` | Session doesn't exist, already ended, or belongs to another student — indistinguishable by design. |

---

#### 18. `POST /api/sessions/:id/end`

Ends the session and increments the student's completed-session count. Race-safe: ending an already-ended session is a 404, and the counter can't double-increment.

**Auth:** required

**Request body:** none

**Success — `200`**

```json
{ "ended": true }
```

**Errors**

| Status | Code | When |
|---|---|---|
| 404 | `SESSION_NOT_FOUND` | Session doesn't exist, already ended, or belongs to another student. |

---

### 4.5 Hints

#### 19. `POST /api/hints`

Requests an AI tutor hint. **This is the one streaming endpoint:** the response is Server-Sent Events (`Content-Type: text/event-stream`), streaming the hint token-by-token. Hint depth escalates with each hint used on the same problem, and hints are limited by the student's adaptive hint budget.

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `session_id` | string | yes | |
| `problem_id` | string | yes | |
| `trigger_type` | string | no | `"idle"`, `"error_streak"`, `"hint_budget_exhausted"`, or `"manual"` (default). Unknown values fall back to `"manual"`. |

**Success — `200`, SSE stream**

```
data: {"token": "Start"}
data: {"token": " by"}
data: {"token": " labeling"}
…
event: done
data: {"hint_id": "…", "hint_level": 2, "hint_depth": "socratic", "response_budget": 120}
```

If generation fails mid-stream, the stream ends with:

```
event: error
data: {"message": "…"}
```

The hint is logged and the per-problem hint counter incremented **before** the `done` event is sent, so a concurrent request always sees the updated count.

**Errors** (as normal JSON, before the stream starts)

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `session_id` or `problem_id` missing. |
| 404 | `SESSION_NOT_FOUND` | No active session with this ID. |
| 409 | `HINT_BUDGET_EXHAUSTED` | Hints used ≥ budget for this problem (unless the trigger is `hint_budget_exhausted`, which is allowed through for the final wrap-up hint). |

> **Rewrite note:** FastAPI serves this with `StreamingResponse` over an async generator; the Anthropic Python SDK supports streaming. Handle client disconnects (stop generating, still persist the hint log) as the current implementation does.

---

### 4.6 Events

#### 20. `POST /api/events`

Ingests client-observed telemetry into the append-only audit tables. Fire-and-forget from the frontend's perspective.

**Auth:** required

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `event_type` | string | yes | `"problem_attempt"`, `"hint_event"`, `"intervention_event"`, `"state_snapshot"`, or `"checkin_response"`. |
| `payload` | object | yes | Shape depends on `event_type`; unknown fields default rather than error. A `checkin_response` additionally updates the student's cognitive state. |

**Success — `204`** — no body.

**Errors**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION` | `event_type` or `payload` missing. |
| 400 | `UNKNOWN_EVENT_TYPE` | `event_type` not one of the five values. |

---

### 4.7 Homework sets

#### 21. `GET /api/homework-sets`

Lists all problem sets with their problems, plus a per-student `attempted` flag (true if the student has submitted any scaffold step on that problem). Drives the assignments dashboard.

**Auth:** required

**Success — `200`**

```json
[
  {
    "id": "…",
    "name": "HW 1 — Network Theorems",
    "course_level": "intro",
    "topic": "kvl",
    "problems": [
      { "id": "…", "topic": "kvl", "difficulty": "easy", "problem_text": "…", "attempted": true }
    ]
  }
]
```

**Errors:** none beyond auth.

---

## 5. Flows — the endpoints in the order a student hits them

### New student

1. `POST /api/auth/register` — account created, logged in (cookie set).
2. `POST /api/onboarding/consent` — must be `true` to proceed; everything below returns `403 CONSENT_REQUIRED` until then.
3. `POST /api/onboarding/self-declare` — 21-item survey; adaptive thresholds computed.
4. `POST /api/onboarding/confidence` — 4-topic survey; learner profile assigned (`409` if step 3 was skipped).
5. `GET /api/onboarding/problems` → `POST /api/onboarding/diagnostic` — 3 problems graded; skill tiers seeded; onboarding done (`409` if repeated).

### Working a problem

6. `GET /api/homework-sets` (dashboard) or `GET /api/problems/next` (adaptive pick).
7. `POST /api/sessions` — start a sitting.
8. `GET /api/problems/:id/scaffold?session_id=…` — fetch the step sequence for the student's profile, resuming at `current_step_id` if returning.
9. Repeat per step: `POST /api/problems/:id/steps/:stepId/submit` — each response says correct/incorrect and where to go next.
10. As needed: `POST /api/hints` (streamed, budget-limited) and `POST /api/events` (telemetry).
11. Optionally `POST /api/problems/:id/submit` for a final whole-problem answer — may return an `intervention`.
12. `POST /api/sessions/:id/end` — close the sitting.

### Returning student

1. `POST /api/auth/login`.
2. `GET /api/onboarding/status` — frontend routes to the first incomplete onboarding step, or to the dashboard when everything is done.
3. Continue at "Working a problem".

---

## 6. Keeping this document honest

The previous API document went stale because it was maintained by hand, disconnected from the code. Two mechanisms prevent that this time:

1. **FastAPI generates an OpenAPI spec and interactive docs (`/docs`) automatically** from the route signatures and Pydantic models. The generated spec is the always-accurate reference; this document is the narrative layer (decisions, flows, constraints) that a generated spec can't express.
2. **Contract tests.** Each endpoint's success and error cases in section 4 map one-to-one to pytest cases ported from the existing Jest suites. If the implementation drifts from this document, tests fail.
