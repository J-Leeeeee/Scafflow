# Scafflow API — Error Handling Guide

**Standard:** [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0)  
**Machine-readable contract:** [`docs/openapi/openapi.yaml`](../openapi/openapi.yaml)

This guide explains how errors work in plain language. The OpenAPI spec is the authoritative contract; this document is a readable supplement for reviewers and integrators.

---

## Error response shape

Almost every error returns JSON with a single field:

```json
{ "error": "Human-readable message" }
```

**Exception:** `POST /api/onboarding/confidence` may return **422** with an extra `detail` object when profile classification fails:

```json
{
  "error": "Profile classification could not be completed",
  "detail": { "status": "Incomplete", "incompleteConstructs": ["attentionDifficulty"] }
}
```

**Hints (SSE):** Before streaming starts, errors use the JSON shape above. After streaming starts, failures use SSE:

```
event: error
data: {"message":"problem not found for <uuid>"}
```

---

## HTTP status codes

| Status | Meaning | What to do |
|--------|---------|------------|
| **400** | Invalid request — missing or malformed fields | Fix the request body or query params |
| **401** | Not authenticated — missing or bad JWT cookie | Register or log in again |
| **403** | Authenticated but blocked — usually consent not given | Complete consent flow first |
| **404** | Resource not found or not accessible to this student | Check IDs; session may be ended |
| **409** | Conflict with current state | e.g. account exists, onboarding done, hint budget exhausted |
| **422** | Valid JSON but business rule failed | Complete prerequisite steps (e.g. self-declare before confidence) |
| **503** | Server dependency missing | e.g. problem bank not seeded in dev |
| **500** | Unexpected server error | Retry; contact support if persistent |

Every protected endpoint may also return **500** `{ "error": "Internal server error" }` for unhandled failures.

---

## Authentication errors (all protected routes)

| Status | Message | When |
|--------|---------|------|
| 401 | `Authentication required` | No `token` cookie sent |
| 401 | `Invalid or expired token` | Cookie present but JWT invalid or expired |

---

## Errors by journey

### Auth

| Endpoint | Status | Message |
|----------|--------|---------|
| `POST /api/auth/register` | 400 | `email and password are required` |
| `POST /api/auth/register` | 409 | `Account already exists` |
| `POST /api/auth/login` | 400 | `email and password are required` |
| `POST /api/auth/login` | 401 | `Invalid credentials` |

### Onboarding

| Endpoint | Status | Message |
|----------|--------|---------|
| `POST /api/onboarding/consent` | 400 | `consent (boolean) is required` |
| `POST /api/onboarding/declaration` | 400 | `adhd_flag, stress_baseline, and course_level are required` |
| `POST /api/onboarding/declaration` | 400 | `stress_baseline must be 0, 1, or 2` |
| `POST /api/onboarding/declaration` | 400 | `course_level must be intro, intermediate, or advanced` |
| `POST /api/onboarding/declaration` | 400 | `learner_profile must be starter, exploring, distracted, or independent` |
| `POST /api/onboarding/declaration` | 403 | `Consent required before onboarding. Please accept the privacy notice first.` |
| `POST /api/onboarding/self-declare` | 400 | `adhd_flag must be a boolean` |
| `POST /api/onboarding/self-declare` | 400 | `course_level must be intro, intermediate, or advanced` |
| `POST /api/onboarding/self-declare` | 400 | `responses must include all 21 survey item ids with values 1-5` |
| `POST /api/onboarding/self-declare` | 403 | `Consent required before onboarding. Please accept the privacy notice first.` |
| `POST /api/onboarding/confidence` | 400 | `topics must include all confidence topic keys with values 1-5` |
| `POST /api/onboarding/confidence` | 403 | `Consent required before onboarding. Please accept the privacy notice first.` |
| `POST /api/onboarding/confidence` | 409 | `Self-declare survey must be completed before confidence survey` |
| `POST /api/onboarding/confidence` | 422 | `Profile classification could not be completed` (+ `detail`) |
| `GET /api/onboarding/status` | 404 | `Student not found` |
| `GET /api/onboarding/problems` | 403 | `Consent required` |
| `GET /api/onboarding/problems` | 409 | `Onboarding already completed` |
| `GET /api/onboarding/problems` | 503 | `Problem bank not seeded for this course level. Run: npx tsx scripts/import-problems.ts` |
| `POST /api/onboarding/diagnostic` | 400 | `answers must be an array of exactly 3 items` |
| `POST /api/onboarding/diagnostic` | 400 | `One or more problem IDs not found` |
| `POST /api/onboarding/diagnostic` | 400 | `Problem <uuid> not found` |
| `POST /api/onboarding/diagnostic` | 403 | `Consent required` |
| `POST /api/onboarding/diagnostic` | 409 | `Onboarding already completed` |

### Sessions

| Endpoint | Status | Message |
|----------|--------|---------|
| `GET /api/sessions/{id}` | 404 | `Session not found` |
| `POST /api/sessions/{id}/end` | 404 | `Session not found` |

### Problems

| Endpoint | Status | Message |
|----------|--------|---------|
| `GET /api/problems/next` | 400 | `Skill vector not found. Complete onboarding first.` |
| `GET /api/problems/next` | 404 | `No problems available for current skill level` |
| `GET /api/problems/{id}` | 404 | `Problem not found` |
| `POST /api/problems/{id}/submit` | 400 | `session_id, submitted_answer, and time_spent_s are required` |
| `POST /api/problems/{id}/submit` | 404 | `Problem not found` |
| `POST /api/problems/{id}/steps/{stepId}/submit` | 400 | `session_id, submitted_value, and time_spent_s are required` |
| `POST /api/problems/{id}/steps/{stepId}/submit` | 404 | `Step not found for this problem` |

`GET /api/problems/{id}/scaffold` does not return HTTP errors for missing variants — it returns **200** with `total_steps: 0` and `steps: []`.

### Hints

| Endpoint | Status | Message |
|----------|--------|---------|
| `POST /api/hints` | 400 | `session_id and problem_id are required` |
| `POST /api/hints` | 404 | `Session not found` |
| `POST /api/hints` | 409 | `Hint budget exhausted for this problem` |

### Events

| Endpoint | Status | Message |
|----------|--------|---------|
| `POST /api/events` | 400 | `event_type and payload are required` |
| `POST /api/events` | 400 | `Unknown event_type: <value>` |

---

## Frontend handling

The React client (`frontend/src/lib/api.ts`) throws `ApiError` with `status` and parsed body when `res.ok` is false. Hints use raw `fetch` for SSE and must handle JSON pre-stream errors separately.

---

## Keeping docs in sync

When adding or changing handler error messages in `src/api/`, update:

1. `docs/openapi/openapi.yaml` (or shared `components/responses.yaml`)
2. This file

Run `npm run docs:api:lint` to validate the OpenAPI spec.
