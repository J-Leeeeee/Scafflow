# API Reference

**Purpose:** Support endpoint design, integration, and client contract decisions.

**Last reviewed:** 2026-06-24

**Related files:** [02-system-architecture.md](02-system-architecture.md), [04-adaptive-engine.md](04-adaptive-engine.md), `docs/scaffold-api.md`

**Frontend client:** `frontend/src/lib/api.ts`

---

## Authentication

### Mechanism

- JWT stored in **httpOnly cookie** named `token`
- Issued on register/login; cleared on logout
- `requireAuth` middleware reads cookie, verifies with `JWT_SECRET`, sets `req.studentId` from JWT `sub`

### Env vars

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET` | (required) | Signing key |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin |

### Public vs Protected

| Public | Protected |
|--------|-----------|
| `POST /api/auth/register` | All other `/api/*` routes |
| `POST /api/auth/login` | |
| `POST /api/auth/logout` | |
| `GET /health` | |

---

## Error Handling

- Async handlers wrapped in `asyncHandler` — errors → 500 JSON `{ error: "Internal server error" }`
- Validation errors → 400 with `{ error: "message" }`
- Auth failures → 401
- Not found → 404
- Conflict (e.g. hint budget) → 409

Frontend throws `ApiError` with status and parsed body from `frontend/src/lib/api.ts`.

---

## Security Rules (All Endpoints)

1. **`ground_truth_answer`** never in public problem or scaffold responses
2. **MCQ `is_correct`** stripped from scaffold step options
3. **Email** never returned — only internal hash stored
4. **Consent gate** — onboarding write endpoints reject if `consent_given_at` is NULL

---

## Auth Endpoints

### `POST /api/auth/register`

Create account. Hashes email (SHA-256), password (bcrypt cost 12). Initializes `student_skills`, `cognitive_state`, `adaptive_config`. Optionally logs consent if `consent: true` in body.

**Body:**
```json
{
  "email": "netid@uw.edu",
  "password": "string",
  "display_name": "optional",
  "course_level": "intro | intermediate | advanced",
  "consent": true
}
```

**Response:** `{ "id": "uuid" }` + sets JWT cookie

### `POST /api/auth/login`

**Body:** `{ "email", "password" }`

**Response:** `{ "id": "uuid" }` + sets JWT cookie

### `POST /api/auth/logout`

Clears cookie. **Response:** `{ "message": "Logged out" }`

---

## Onboarding Endpoints

### `POST /api/onboarding/consent`

Log FERPA consent. Sets `students.consent_given_at`, appends `consent_log`.

**Body:** `{ "consent": true }` — must be true

**Response:** `{ "consented": true }`

### `POST /api/onboarding/declaration`

Legacy 3-question self-declaration. Sets `adhd_flag`, stress baseline, `course_level`, optional `learner_profile`.

**Body:**
```json
{
  "adhd_flag": false,
  "stress_baseline": 0,
  "course_level": "intro",
  "learner_profile": "starter"
}
```

**Response:** `{ "declared": true }`

### `POST /api/onboarding/self-declare`

21-item survey storage + threshold initialization.

**Body:**
```json
{
  "adhd_flag": false,
  "course_level": "intro",
  "responses": { "item_key": 1-5, ... }
}
```

**Response:** `{ "self_declared": true }`

### `POST /api/onboarding/confidence`

Topic confidence survey → runs profile classifier → sets `learner_profile`.

**Body:**
```json
{
  "topics": {
    "thevenin_norton": 1-5,
    "mesh_current": 1-5,
    "node_voltage": 1-5,
    "kirchhoff_law": 1-5
  }
}
```

**Response:** Full `ProfileClassification` object (scores, assigned profile, confidence, flags)

### `GET /api/onboarding/status`

**Response:**
```json
{
  "consentGiven": true,
  "selfDeclareComplete": true,
  "confidenceComplete": true,
  "learnerProfile": "starter",
  "profileNumber": 1
}
```

### `GET /api/onboarding/problems`

Returns 3 diagnostic problems (no ground truth).

**Response:** `{ "problems": [ PublicProblem, ... ] }`

### `POST /api/onboarding/diagnostic`

Submit diagnostic answers, seed skill vector, set `cold_start_done = true`.

**Body:**
```json
{
  "answers": [
    { "problem_id": "uuid", "submitted_answer": 1.5, "time_spent_s": 120 }
  ]
}
```

**Response:** `{ "completed": true, "session_id": "uuid", "results": [...] }`

---

## Session Endpoints

### `POST /api/sessions`

Create session. Seeds Redis cache.

**Body:** `{ "problem_id": "uuid" }` (optional)

**Response:** `{ "session_id": "uuid" }`

### `GET /api/sessions/:id`

Returns Postgres session row + Redis hot state.

### `POST /api/sessions/:id/end`

End session, increment `sessions_completed`, delete Redis key.

**Response:** `{ "ended": true }`

---

## Problem Endpoints

### `GET /api/problems/next`

Adaptive selection by weakest skill tier. Requires completed onboarding.

### `GET /api/problems/:id`

Single problem (public fields only).

### `POST /api/problems/:id/submit`

Single-shot numeric answer submission.

**Body:**
```json
{
  "session_id": "uuid",
  "submitted_answer": 2.5,
  "time_spent_s": 90
}
```

**Response:**
```json
{
  "correct": true,
  "topic": "thevenin",
  "intervention": null
}
```

`intervention` may be `{ "type": "error_streak", ... }` or `{ "type": "hint_budget_exhausted", ... }`.

### `GET /api/problems/:id/scaffold`

Multi-step scaffold for student's learner profile.

**Query:** `?session_id=uuid` (optional — tracks current step)

**Response:**
```json
{
  "problem_id": "uuid",
  "variant_id": "uuid",
  "learner_profile": "starter",
  "total_steps": 17,
  "current_step_id": "uuid",
  "steps": [
    {
      "id": "uuid",
      "step_order": 1,
      "step_type": "mcq",
      "prompt_text": "...",
      "options": [{ "key": "A", "text": "..." }]
    }
  ]
}
```

### `POST /api/problems/:id/steps/:stepId/submit`

Submit answer for one scaffold step.

**Body:**
```json
{
  "session_id": "uuid",
  "submitted_value": "A",
  "time_spent_s": 45
}
```

**Response:**
```json
{
  "correct": true,
  "ungraded": false,
  "next_step_id": "uuid",
  "misconception_hint": null,
  "attempt_budget": 5,
  "attempts_used": 1,
  "attempts_remaining": 4
}
```

Full detail: `docs/scaffold-api.md`

---

## Hint Endpoint

### `POST /api/hints`

Stream AI hint via SSE.

**Body:**
```json
{
  "session_id": "uuid",
  "problem_id": "uuid",
  "trigger_type": "manual"
}
```

**Response:** `text/event-stream`

**Errors:** 409 if hint budget exhausted (unless trigger is `hint_budget_exhausted`)

---

## Events Endpoint

### `POST /api/events`

Ingest client events (idle, checkin, etc.) into append-only audit tables.

Event types handled include `checkin_response` → updates cognitive state.

---

## Homework Sets Endpoint

### `GET /api/homework-sets`

List problem sets with per-problem attempt status for current student.

**Response:** Array of `HomeworkSet` with nested `problems[]` including `attempted: boolean`

---

## Health Check

### `GET /health`

**Response:** `{ "status": "ok" }`

No auth required.

---

## Frontend API Client Namespaces

From `frontend/src/lib/api.ts`:

| Namespace | Methods |
|-----------|---------|
| `auth` | `register`, `login`, `logout` |
| `onboarding` | `acceptConsent`, `declaration`, `selfDeclare`, `confidence`, `status`, `getDiagnosticProblems`, `submitDiagnostic` |
| `problems` | `get`, `next`, `submit`, `getScaffold`, `submitStep` |
| `sessions` | `create`, `getState`, `end` |
| `homeworkSets` | `list` |

All calls use `credentials: 'include'`. Base URL from `VITE_API_BASE_URL` (empty = same origin / Vite proxy).

---

## Endpoint Summary Table

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | No | Logout |
| POST | /api/onboarding/consent | Yes | FERPA consent |
| POST | /api/onboarding/declaration | Yes | Legacy declaration |
| POST | /api/onboarding/self-declare | Yes | 21-item survey |
| POST | /api/onboarding/confidence | Yes | Profile classification |
| GET | /api/onboarding/status | Yes | Onboarding progress |
| GET | /api/onboarding/problems | Yes | Diagnostic problems |
| POST | /api/onboarding/diagnostic | Yes | Submit diagnostic |
| POST | /api/sessions | Yes | Create session |
| GET | /api/sessions/:id | Yes | Session state |
| POST | /api/sessions/:id/end | Yes | End session |
| GET | /api/problems/next | Yes | Adaptive next problem |
| GET | /api/problems/:id | Yes | Get problem |
| POST | /api/problems/:id/submit | Yes | Submit answer |
| GET | /api/problems/:id/scaffold | Yes | Get scaffold |
| POST | /api/problems/:id/steps/:stepId/submit | Yes | Submit step |
| POST | /api/hints | Yes | Stream hint (SSE) |
| POST | /api/events | Yes | Log client event |
| GET | /api/homework-sets | Yes | List homework |
| GET | /health | No | Health check |
