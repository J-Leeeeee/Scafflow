// Relative-tolerance numeric grading shared by single-shot grading
// (problems/handler.ts), cold-start diagnostics (onboarding/handler.ts), and
// per-step scaffold grading (problems/scaffold.ts).
//
// Guards against two failure modes of dividing by a raw ground-truth value:
//   - negative ground truth flips the inequality, so every answer reads as correct
//     (circuit answers are routinely negative);
//   - zero ground truth divides by zero.
// Dividing by Math.abs(groundTruth) and special-casing zero keeps the relative
// tolerance correct for every sign.
export function isNumericAnswerCorrect(
  submittedValue: unknown,
  groundTruth: number,
  tolerance: number,
): boolean {
  const submitted = Number(submittedValue);
  if (!Number.isFinite(submitted)) return false;
  if (groundTruth === 0) return submitted === 0;
  return Math.abs(submitted - groundTruth) / Math.abs(groundTruth) <= tolerance;
}
