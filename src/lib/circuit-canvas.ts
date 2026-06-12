export interface CircuitCanvasState {
  isShorted: boolean;
  loops: Record<number, string>;
}

const REQUIRED_LOOP_INDICES = [0, 1, 2] as const;

export function parseCircuitCanvasState(raw: unknown): CircuitCanvasState | null {
  if (typeof raw === 'string') {
    try {
      return parseCircuitCanvasState(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (!raw || typeof raw !== 'object') return null;

  const value = raw as { isShorted?: unknown; loops?: unknown };
  if (typeof value.isShorted !== 'boolean') return null;
  if (!value.loops || typeof value.loops !== 'object') return null;

  const loops: Record<number, string> = {};
  for (const [key, label] of Object.entries(value.loops as Record<string, unknown>)) {
    const index = Number(key);
    if (!Number.isInteger(index) || typeof label !== 'string' || !label.trim()) continue;
    loops[index] = label;
  }

  return { isShorted: value.isShorted, loops };
}

export function hasCircuitCanvasInteraction(state: CircuitCanvasState): boolean {
  return state.isShorted || Object.keys(state.loops).length > 0;
}

export function gradeCircuitCanvas(state: CircuitCanvasState): { correct: boolean; hint: string | null } {
  const missingShort = !state.isShorted;
  const missingLoops = REQUIRED_LOOP_INDICES.filter((index) => !state.loops[index]);

  if (!missingShort && missingLoops.length === 0) {
    return { correct: true, hint: null };
  }

  if (missingShort && missingLoops.length > 0) {
    return {
      correct: false,
      hint: 'Short terminals a and b, then label all three mesh loops.',
    };
  }

  if (missingShort) {
    return {
      correct: false,
      hint: 'Click terminal a, then terminal b to short them together.',
    };
  }

  return {
    correct: false,
    hint: 'Add mesh current labels to all three loops.',
  };
}
