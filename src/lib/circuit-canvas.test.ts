import {
  gradeCircuitCanvas,
  hasCircuitCanvasInteraction,
  parseCircuitCanvasState,
} from './circuit-canvas';

describe('parseCircuitCanvasState', () => {
  it('parses a valid JSON string', () => {
    expect(parseCircuitCanvasState('{"isShorted":true,"loops":{"0":"i1","1":"i2","2":"i3"}}')).toEqual({
      isShorted: true,
      loops: { 0: 'i1', 1: 'i2', 2: 'i3' },
    });
  });

  it('returns null for invalid payloads', () => {
    expect(parseCircuitCanvasState(null)).toBeNull();
    expect(parseCircuitCanvasState('not-json')).toBeNull();
    expect(parseCircuitCanvasState({ isShorted: 'yes', loops: {} })).toBeNull();
  });
});

describe('hasCircuitCanvasInteraction', () => {
  it('detects short or loop labels', () => {
    expect(hasCircuitCanvasInteraction({ isShorted: false, loops: {} })).toBe(false);
    expect(hasCircuitCanvasInteraction({ isShorted: true, loops: {} })).toBe(true);
    expect(hasCircuitCanvasInteraction({ isShorted: false, loops: { 0: 'i1' } })).toBe(true);
  });
});

describe('gradeCircuitCanvas', () => {
  const complete = { isShorted: true, loops: { 0: 'i1', 1: 'i2', 2: 'i3' } };

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
    expect(gradeCircuitCanvas({ isShorted: true, loops: { 0: 'i1' } })).toEqual({
      correct: false,
      hint: 'Add mesh current labels to all three loops.',
    });
  });

  it('rejects when both short and loops are missing', () => {
    expect(gradeCircuitCanvas({ isShorted: false, loops: {} })).toEqual({
      correct: false,
      hint: 'Short terminals a and b, then label all three mesh loops.',
    });
  });
});
