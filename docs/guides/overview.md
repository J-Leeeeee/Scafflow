# Scafflow API

Adaptive ECE tutoring backend. Students complete onboarding surveys, work through profile-conditioned problem scaffolds, and receive AI hints when stuck.

## Documentation

| Document | Audience |
|----------|----------|
| [**OpenAPI 3.1 spec**](openapi/openapi.yaml) | Integrators, reviewers — industry-standard contract |
| [**Error handling guide**](guides/errors.md) | Plain-English error catalog |
| [OpenAPI README](openapi/README.md) | How to lint and build HTML reference |

**Tell your reviewer:** API documentation follows the [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0).

## Quick start

```bash
# Local API
npm run dev

# Validate API spec
npm run docs:api:lint

# Build browsable HTML reference
npm run docs:api:build
```

Base URL (local): `http://localhost:3000`

## Typical flow

1. `POST /api/auth/register` or `/api/auth/login` → JWT cookie set
2. Onboarding: consent → self-declare → confidence → diagnostic
3. `GET /api/homework-sets` → pick a problem
4. `POST /api/sessions` → `GET /api/problems/{id}/scaffold` → submit steps
5. `POST /api/hints` (SSE) when stuck

See the OpenAPI spec for full request/response schemas and error codes.
