Requirements:
• Resolution of 1080p (1920 x 1080) or 4k (3840 x 2160 px), encoded as MP4 using the H.264
codec
• No more than 5 minutes long
• Size: < 250 MB
• Subtitles are required using a separate .srt or .sbv file
Visual at start:
Slide 1 (Kai): Introduction
Old Script: Circuit homework is hard not because students lack ability, but because they get
stuck without feedback that matches how they learn. Scafflow is an adaptive tutoring system
for ECE students. It assigns each learner a profile from a short onboarding survey, then delivers
the same homework problem through a scaffold tailored to that profile step-by-step guidance
for beginners, method choice for explorers, merged steps for advanced learners who need
focus, and minimal structure for independent students.
Visual: interaction flow/model (if we need more slides, feel free to create more)
Revised Script: Generative AI can finish homework in seconds. For STEM learning, that is
exactly the problem. When the answer is one prompt away, students can bypass the reasoning
process that homework is designed to develop.
SCAFFLOW is a needs- and attention-aware AI scaffolding system for STEM homework (or
learning system). Instead of returning quick answers or giving everyone the same static
problem-solving flow, it adapts how students enter the same assigned problem. The goal is to
make difficult STEM problems feel more approachable, helping students stay engaged, reason
through challenges, and remain motivated to learn without turning AI support into an answer
shortcut.
SCAFFLOW is not just another chatbot or online learning platform. Its interaction model is built
around a five-stage learning loop: diagnose where the student starts , scaffold the next useful
step, adapt support as the student works, fade guidance as independence grows, and reflect on
what transfers to the next problem.
Slide 2 (Jacob):
Old Script: Before a student sees homework, Scafflow learns who they are as a learner. After
registration, they complete a 21-item self-report survey across five areas: attention, autonomy,
competence, self-regulation, and self-efficacy. Then they rate confidence on core circuit topics:
Thévenin/Norton, mesh current, node voltage, and Kirchhoff’s laws. The system combines
those signals and assigns one of four learner profiles. That profile drives scaffold depth and how
much structure each step provides, all before they solve a single problem.
Visual:
• Register
• Self-declare flash Attention section, scroll briefly
• Dashboard > Course > Homework 1
• Confidence survey
Revised Script: Before students begin using SCAFFLOW, they complete a general onboarding
survey about how a student learns, how they focus, how supported and capable they feel while
learning, and how much agency they feel. This general survey only needs to be filled out
periodically.
Before each homework assignment, SCAFFLOW adds a shorter topic-readiness check, asking
how confident the student feels about the specific concepts covered in that assignment. From
these signals, SCAFFLOW assigns one of four starting support profiles.
A profile is not a fixed label or a judgment about ability, it is only a starting point. It initializes
the level of structure, choice, and feedback, while support can continue to adapt during
problem solving.
Slide 3 (Alex): Set up the comparison
Visual: Show the Thevenin problem statement and circuit first and maybe use path cards to
show all 4 profiles to demonstrate the difference (comparison purpose…)
Script: To make the differences concrete, we use one Thevenin-equivalent problem (a
representative topic from our testbed Electrical and Computer Engineering course) to show
how the interaction changes. The circuit, problem, problem-solving goal, and learning objective
stay the same. What changes is how the student enters the problem: the amount of structure,
choice, feedback, and support they receive while reasoning through it.
Slide 4 (Jacob): Profile 1
Old Script: Profile 1 is our most heavily scaffolded experience: built for students who benefit
from breaking a problem into small, concrete steps. For this Thévenin problem, that means
twelve steps. We start with fundamentals: identifying what a Thévenin equivalent looks like,
naming V-th and R-th, and even counting essential nodes before writing equations. Interactive
steps, like choosing a ground node on the circuit, make abstract concepts more accessible.
Immediate feedback confirms each small decision before moving on. The system teaches the
process, not just the answer.
Visual: Profile 1 Demo
• Step 1/12: Thévenin model MCQ > submit > show success
• Step 4/12 ground node selection on canvas
• Step 7/12 KCL equation setup
• Quick jump (Next) to Step 12/12 — final R-th > success
Revised Script: For a learner who needs the most support, SCAFFLOW decomposes the task
into small, concrete steps. It starts with the concept of a Thevenin model, then asks the student
to identify circuit elements, choose a ground node directly on the circuit, and set up equations
before calculating. Each step gives immediate feedback on the reasoning, not just the final
answer.
Slide 5 (Jacob): Profile 2
Old Script: Profile 2 targets learners who want agency: fewer hand-holding steps, but clear
structure and choice. Instead of being told every move, the student picks their method: nodal
vs mesh vs source transformation for V-th, then again for R-th. Eleven steps instead of twelve:
same problem, same correctness checks, but the path feels like their path.
Visual: Profile 2 Demo
• Step 3/11 “Select Your Method” for V-th
• Step 9/11 mesh equations
• Step 11/11 final answer
Revised Script: For a learner who benefits from personal agency, SCAFFLOW reduces some
hand-holding but keeps the task structured and clear. Instead of prescribing every move, the
interface lets the student choose a method, such as nodal analysis, mesh analysis, or source
transformation. The system still checks the process, but the path feels more like the student's
own strategy.
Slide 6 (Jacob): Profile 3
Old Script: Profile 3 is built for students who are capable but benefit from a cleaner, lowerfriction layout. Their assignment has fewer transitions and less UI noise. Steps are merged: set
up KCL equations and enter V-th on one screen instead of three separate steps. Method choice
remains, but the amount of steps get tighter. The student still gets method pickers and
interactive canvas work, but each screen carries more weight. Less clicking, more solving.
Visual: Profile 3 Demo
• Step 1/6 method picker
• Step 3/6 combined equations + V-th field
• Step 6/6 R-th success
Revised Script: For a capable learner who may lose focus during long problem solving,
SCAFFLOW changes the interface rhythm/interaction flow. It reduces transitions, merges
related steps, and keeps more of the relevant work on one screen. This is not simply fewer
steps; it is a different interaction density: less clicking, more solving.
Slide 7 (Jacob): Profile 4
Old Script: Profile 4 strips scaffolding entirely. One screen: solve V-th and R-th using whatever
method the student prefers. The problem statement and circuit diagram stay visible; the
system gets out of the way. Same homework. Same grading. Completely different learning
experience.
Visual: Profile 4 Demo
• Step 1/1
• Enter values (or show filled state) > submit > show success feedback
• Hold on Step 1/1
Revised Script: For a learner ready for independence, SCAFFLOW fades the scaffold to a single
problem-solving space. The student chooses their own method, while the system keeps the
work anchored to the assigned course problem.
Slide 8 (Jacob): Why this is more than personalization.
Visual: show the simplified system diagram/provide our technical contributions (include facial
expressions). If you can, also demonstrate why SCAFFLOW is different.
Script: What makes SCAFFLOW distinctive is that the profiles are only the starting point; the
support continues to change during problem solving. SCAFFLOW treats problem solving as a
sequence of learner states: progress, engagement, support uptake, and cognitive effort,
inferred from lightweight signals such as clicks, idle time, attempts, errors, backtracking, and
help requests. As those states change, “SCAFFLOW adjusts the level of support: adding
structure, simplifying the next step, offering guidance, or fading help” vs. “As those states
change, SCAFFLOW adjusts the support accordingly.”
(In future stages, optional privacy-preserving signals such as facial expression will be further
informed this adaptation.) – I am leaning towards not mentioning this verbally, but we should
include it in our visual (simplified system diagram).
The aim is to preserve productive struggle: not to hide AI from learning, but to make AI support
accountable to it.
Slide 9 (Conclusion):
Visual: needs something concise but attractive.
Script: For students, SCAFFLOW keeps AI support optional and controllable: they can accept
help, ignore prompts, request more guidance, or continue independently. For instructors,
SCAFFLOW makes AI support configurable and course-aligned: teaching teams can set
guardrails, define course goals, and adjust the level of scaffolding without replacing
independent reasoning.
SCAFFLOW is a learner-state-aware scaffolding model for AI-supported STEM homework: the
same assigned course problems, multiple interaction paths, and support that adapts and fades
to keep student reasoning and self-motivated under both student and instructor control.