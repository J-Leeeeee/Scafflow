import { isNumericAnswerCorrect } from './numeric-grading';

describe('isNumericAnswerCorrect', () => {
  it('accepts a positive answer within tolerance and rejects one outside it', () => {
    expect(isNumericAnswerCorrect(100.5, 100, 0.01)).toBe(true);   // +0.5%
    expect(isNumericAnswerCorrect(102, 100, 0.01)).toBe(false);    // +2%
  });

  // Regression: a negative ground truth used to flip the inequality so every
  // answer was graded correct.
  it('grades negative ground truth by relative magnitude (the bug)', () => {
    expect(isNumericAnswerCorrect(-5, -5, 0.01)).toBe(true);
    expect(isNumericAnswerCorrect(-5.01, -5, 0.01)).toBe(true);    // within 1%
    expect(isNumericAnswerCorrect(-10, -5, 0.01)).toBe(false);     // way off
    expect(isNumericAnswerCorrect(5, -5, 0.01)).toBe(false);       // wrong sign
  });

  it('treats zero ground truth as an exact-zero match (no divide-by-zero)', () => {
    expect(isNumericAnswerCorrect(0, 0, 0.01)).toBe(true);
    expect(isNumericAnswerCorrect(0.1, 0, 0.01)).toBe(false);
  });

  it('rejects non-finite / unparseable submissions', () => {
    expect(isNumericAnswerCorrect('abc', 100, 0.01)).toBe(false);
    expect(isNumericAnswerCorrect(NaN, 100, 0.01)).toBe(false);
    expect(isNumericAnswerCorrect(Infinity, 100, 0.01)).toBe(false);
  });

  it('accepts numeric strings (form inputs arrive as strings)', () => {
    expect(isNumericAnswerCorrect('100', 100, 0.01)).toBe(true);
  });
});
