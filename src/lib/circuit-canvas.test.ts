import {
  gradeCircuitCanvas,
  hasCircuitCanvasInteraction,
  parseCircuitCanvasState,
} from './circuit-canvas';

describe('parseCircuitCanvasState', () => {
  it('parses a valid JSON string for short_mesh', () => {
    expect(parseCircuitCanvasState('{"isShorted":true,"loops":{"0":"i1","1":"i2","2":"i3"}}')).toEqual({
      task: 'short_mesh',
      isShorted: true,
      loops: { 0: 'i1', 1: 'i2', 2: 'i3' },
      selectedNode: undefined,
    });
  });

  it('parses ground_node payloads', () => {
    expect(parseCircuitCanvasState({
      task: 'ground_node',
      isShorted: false,
      loops: {},
      selectedNode: 'bottom_rail',
    })).toEqual({
      task: 'ground_node',
      isShorted: false,
      loops: {},
      selectedNode: 'bottom_rail',
    });
  });

  it('returns null for invalid payloads', () => {
    expect(parseCircuitCanvasState(null)).toBeNull();
    expect(parseCircuitCanvasState('not-json')).toBeNull();
    expect(parseCircuitCanvasState({ isShorted: 'yes', loops: {} })).toBeNull();
  });
});

describe('hasCircuitCanvasInteraction', () => {
  it('detects short or loop labels for short_mesh', () => {
    expect(hasCircuitCanvasInteraction({ task: 'short_mesh', isShorted: false, loops: {} })).toBe(false);
    expect(hasCircuitCanvasInteraction({ task: 'short_mesh', isShorted: true, loops: {} })).toBe(true);
    expect(hasCircuitCanvasInteraction({ task: 'short_mesh', isShorted: false, loops: { 0: 'i1' } })).toBe(true);
  });

  it('detects ground node selection', () => {
    expect(hasCircuitCanvasInteraction({ task: 'ground_node', isShorted: false, loops: {}, selectedNode: undefined })).toBe(false);
    expect(hasCircuitCanvasInteraction({ task: 'ground_node', isShorted: false, loops: {}, selectedNode: 'bottom_rail' })).toBe(true);
  });
});

describe('gradeCircuitCanvas', () => {
  const complete = { task: 'short_mesh' as const, isShorted: true, loops: { 0: 'i1', 1: 'i2', 2: 'i3' } };

  it('accepts a complete canvas state', () => {
    expect(gradeCircuitCanvas(complete)).toEqual({ correct: true, hint: null });
  });

  it('rejects missing short', () => {
    expect(gradeCircuitCanvas({ ...complete, isShorted: false })).toEqual({
      correct: false,
      hint: 'Click terminal a, then terminal b to short them together.',
    });
  });

  it('rejects missing loops', () => {
    expect(gradeCircuitCanvas({ task: 'short_mesh', isShorted: true, loops: { 0: 'i1' } })).toEqual({
      correct: false,
      hint: 'Add mesh current labels to all three loops.',
    });
  });

  it('rejects when both short and loops are missing', () => {
    expect(gradeCircuitCanvas({ task: 'short_mesh', isShorted: false, loops: {} })).toEqual({
      correct: false,
      hint: 'Short terminals a and b, then label all three mesh loops.',
    });
  });

  it('accepts bottom rail as ground', () => {
    expect(gradeCircuitCanvas({
      task: 'ground_node',
      isShorted: false,
      loops: {},
      selectedNode: 'bottom_rail',
    })).toEqual({ correct: true, hint: null });
  });

  it('rejects wrong ground node', () => {
    expect(gradeCircuitCanvas({
      task: 'ground_node',
      isShorted: false,
      loops: {},
      selectedNode: 'terminal_a',
    })).toEqual({
      correct: false,
      hint: 'For this nodal setup, choose the bottom rail as the reference ground.',
    });
  });
});
