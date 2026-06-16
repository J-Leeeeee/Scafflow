import { deriveStressBaseline } from './onboarding-survey';

describe('deriveStressBaseline', () => {
  it('mirrors the original frontend attention thresholds', () => {
    expect(deriveStressBaseline([1, 1, 1, 1, 1])).toBe(0);
    expect(deriveStressBaseline([3, 3, 3, 3, 3])).toBe(1);
    expect(deriveStressBaseline([5, 5, 5, 5, 5])).toBe(2);
  });

  it('uses the lower bucket when no attention items are present', () => {
    expect(deriveStressBaseline([])).toBe(0);
  });
});
