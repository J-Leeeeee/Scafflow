# Principles and Scope

## Non-Negotiable Principles

These should guide every product and design decision in a greenfield build.

### 1. Learning Over Answers

Scafflow exists to strengthen reasoning. Features that primarily speed up answer completion without building skill are out of alignment with the mission.

### 2. Same Assignment, Adaptive Path

All students work the **same course problems**. Adaptation changes structure and support—not the underlying learning objective or grading standard.

### 3. Student Agency

Students control help: accept, ignore, request more, or work independently. Profiles that prescribe every click should not be the only mode.

### 4. Instructor Alignment

Teaching teams configure guardrails, scaffolding intensity, and course goals. The product assists instruction; it does not override it.

### 5. Privacy and Trust

Student data handling must meet institutional expectations (FERPA, IRB). Collect only what adaptation requires. Be transparent. Consent is informed and revocable where policy allows.

### 6. Integrity by Design

Do not expose solution keys or correctness flags in ways students can harvest. Numeric and conceptual grading should tolerate reasonable equivalence without encouraging guess-and-check against a leaked answer.

### 7. Accessibility and Inclusion

Scaffolding serves diverse learners—including those with attention differences—not by labeling deficit, but by offering appropriate structure and rhythm.

---

## MVP Scope (Product Level)

### In scope for an initial university pilot

- Student sign-up and sign-in
- Privacy consent flow
- General learning survey and per-assignment topic readiness
- Four profile-based homework experiences for a **problem bank** in circuit analysis
- Adaptive hints and support during problem solving
- Course dashboard with assigned homework sets
- Core topics: KVL/KCL, mesh and nodal methods, phasors/impedance, Thévenin/Norton

### Explicitly out of scope for MVP (may come later)

- Full instructor analytics dashboard
- Campus single sign-on (true university identity federation)
- Native mobile apps (web-first is acceptable)
- Multi-institution marketplace or content store
- Replacing the campus LMS

---

## Future Direction (Aspirational)

These ideas are **directional**, not commitments:

| Area | Vision |
|------|--------|
| **Instructor tools** | Configure scaffolding policies, review aggregate engagement, align AI tone with syllabus |
| **Broader STEM** | Extend scaffold patterns beyond circuits while keeping the same learning loop |
| **Richer reflection** | Help students and instructors see skill growth across topics |
| **Research validation** | Studies on engagement, learning gain, and integrity compared to unmanaged AI use |
| **Integrity innovations** | Smarter detection of unproductive assistance without hostile proctoring |

---

## What Agents Should Optimize For

When implementing a new codebase from this context:

1. **Clarity of the student experience** — Can a new developer explain the five-stage loop and four profiles without reading code?
2. **Faithfulness to profiles** — Does the same Thévenin problem genuinely feel different across profiles?
3. **Live adaptation** — Does support change during a session, not only at onboarding?
4. **Restraint with AI** — Are hints scaffolded, bounded, and course-aligned?
5. **Institutional readiness** — Are consent, privacy, and integrity treated as launch requirements, not backlog polish?

If tradeoffs arise, prefer **smaller scope that fully delivers the learning model** over a wide feature set that dilutes it.

---

## One-Sentence Summary

**Scafflow is a learner-state-aware scaffolding model for AI-supported STEM homework: the same assigned problems, multiple interaction paths, and support that adapts and fades to keep reasoning and motivation under student and instructor control.**
