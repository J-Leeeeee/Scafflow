import type { CourseLevel, ResponseLength } from '../types/schema';

export interface AdaptiveThresholds {
  idleThreshold: number;
  errorThreshold: number;
  hintBudget: number;
  responseLength: ResponseLength;
}

export function computeAdaptiveThresholds(
  adhdFlag: boolean,
  stressBaseline: 0 | 1 | 2,
  courseLevel: CourseLevel,
): AdaptiveThresholds {
  const isHighNeed = adhdFlag || stressBaseline === 2;
  const isAdvanced = courseLevel === 'advanced';

  return {
    idleThreshold: isHighNeed ? 60 : isAdvanced ? 180 : 90,
    errorThreshold: isHighNeed ? 2 : isAdvanced ? 4 : 3,
    hintBudget: isHighNeed ? 4 : isAdvanced ? 2 : 3,
    responseLength: isHighNeed ? 'brief' : isAdvanced ? 'short' : 'medium',
  };
}

export function deriveStressBaseline(attentionItems: number[]): 0 | 1 | 2 {
  if (attentionItems.length === 0) return 0;

  const avg = attentionItems.reduce((sum, value) => sum + value, 0) / attentionItems.length;
  const score = avg - 1;
  if (score >= 2.7) return 2;
  if (score >= 1.3) return 1;
  return 0;
}
