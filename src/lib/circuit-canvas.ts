export type CircuitCanvasTask = 'short_mesh' | 'ground_node';

export type CircuitNodeId =
  | 'bottom_rail'
  | 'left_node'
  | 'center_node'
  | 'terminal_a'
  | 'terminal_b';

export interface CircuitCanvasState {
  task: CircuitCanvasTask;
  isShorted: boolean;
  loops: Record<number, string>;
  selectedNode?: CircuitNodeId;
}

const REQUIRED_LOOP_INDICES = [0, 1, 2] as const;
const VALID_NODE_IDS = new Set<CircuitNodeId>([
  'bottom_rail',
  'left_node',
  'center_node',
  'terminal_a',
  'terminal_b',
]);

export function parseCircuitCanvasState(raw: unknown): CircuitCanvasState | null {
  if (typeof raw === 'string') {
    try {
      return parseCircuitCanvasState(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (!raw || typeof raw !== 'object') return null;

  const value = raw as {
    task?: unknown;
    isShorted?: unknown;
    loops?: unknown;
    selectedNode?: unknown;
  };
  if (typeof value.isShorted !== 'boolean') return null;
  if (!value.loops || typeof value.loops !== 'object') return null;

  const task: CircuitCanvasTask =
    value.task === 'ground_node' ? 'ground_node' : 'short_mesh';

  const loops: Record<number, string> = {};
  for (const [key, label] of Object.entries(value.loops as Record<string, unknown>)) {
    const index = Number(key);
    if (!Number.isInteger(index) || typeof label !== 'string' || !label.trim()) continue;
    loops[index] = label;
  }

  const selectedNode = typeof value.selectedNode === 'string' && VALID_NODE_IDS.has(value.selectedNode as CircuitNodeId)
    ? value.selectedNode as CircuitNodeId
    : undefined;

  return { task, isShorted: value.isShorted, loops, selectedNode };
}

export function hasCircuitCanvasInteraction(state: CircuitCanvasState): boolean {
  if (state.task === 'ground_node') return Boolean(state.selectedNode);
  return state.isShorted || Object.keys(state.loops).length > 0;
}

export function gradeCircuitCanvas(state: CircuitCanvasState): { correct: boolean; hint: string | null } {
  if (state.task === 'ground_node') {
    if (state.selectedNode === 'bottom_rail') {
      return { correct: true, hint: null };
    }

    if (!state.selectedNode) {
      return {
        correct: false,
        hint: 'Click the bottom rail node to choose it as the reference ground.',
      };
    }

    return {
      correct: false,
      hint: 'For this nodal setup, choose the bottom rail as the reference ground.',
    };
  }

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
