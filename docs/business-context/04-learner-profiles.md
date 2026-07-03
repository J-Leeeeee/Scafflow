# Learner Profiles

Scafflow assigns one of **four starting support profiles** based on onboarding signals. A profile is **not a fixed label or a judgment about ability**—it only initializes the level of structure, choice, and feedback. Support continues to adapt during problem solving.

---

## How Profiles Are Chosen (Conceptual)

Two kinds of input feed the starting profile:

1. **General learning survey** — How the student learns, focuses, feels supported, and exercises agency. Covers dimensions such as attention, autonomy, competence, self-regulation, and self-efficacy. Completed periodically, not before every assignment.

2. **Topic-readiness check** — Before each homework assignment, a shorter survey on confidence in the specific concepts that assignment covers (e.g., Thévenin/Norton, mesh current, node voltage, Kirchhoff’s laws).

Together, these signals place the student on a starting profile. They do not lock the experience for the whole term.

---

## The Four Profiles

The same homework problem—same circuit, same goal, same learning objective—can feel very different depending on profile. Below, a **Thévenin equivalent** problem illustrates the spectrum.

### Profile 1 — Maximum Structure (“Alex”)

**For learners who benefit from breaking work into small, concrete steps.**

- Many short steps (e.g., on the order of a dozen for a representative Thévenin problem)
- Starts with fundamentals: what a Thévenin model is, naming V-th and R-th, counting nodes before equations
- Interactive moments (e.g., choosing a ground node on the circuit diagram)
- Immediate feedback on each small decision before advancing
- Teaches the **process**, not just the final numeric answer

### Profile 2 — Structure with Agency (“Jordan”)

**For learners who want choice within clear guardrails.**

- Fewer steps than Profile 1, but still guided
- Student **chooses method** where appropriate (nodal vs. mesh vs. source transformation for V-th and again for R-th)
- Same correctness standards; path feels like **their** strategy
- Good fit for learners who engage more when they pick the approach

### Profile 3 — Lower Friction (“Priya”)

**For capable learners who may lose focus during long, fragmented flows.**

- Fewer transitions and less interface noise
- Related steps **merged** (e.g., set up equations and enter V-th on one screen)
- Method choice may remain, but each screen carries more weight
- Different **interaction density**: less clicking, more solving—not merely “fewer steps” for its own sake

### Profile 4 — Independence (“Advanced”)

**For learners ready to work with minimal scaffolding.**

- Single problem-solving space: solve V-th and R-th using any preferred method
- Problem statement and circuit stay visible; the system gets out of the way
- Same homework, same grading expectations, **minimal** imposed structure

---

## Design Principle: Same Problem, Different Entry

| What stays the same | What changes |
|---------------------|--------------|
| Assigned problem statement | Number and size of steps |
| Circuit and learning objective | Amount of prescribed vs. chosen method |
| Correctness expectations | Density of UI and feedback timing |
| Course alignment | How much the system teaches vs. monitors |

Never create different “easier” problems per profile for the same assignment—the adaptation is in **how** students work, not **what** they are asked to learn.

---

## Profiles Are Starting Points

After assignment, real-time adaptation can add structure, offer hints, simplify the next step, or fade help based on how the student is actually doing. A student on Profile 4 might receive more support if they struggle; a student on Profile 1 might need less as they demonstrate mastery.
