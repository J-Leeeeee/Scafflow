import { parseMathSegments } from './parse-math-segments';

describe('parseMathSegments', () => {
  it('returns a single text segment when there is no math', () => {
    expect(parseMathSegments('plain text')).toEqual([
      { type: 'text', value: 'plain text' },
    ]);
  });

  it('parses a single inline math segment', () => {
    expect(parseMathSegments('$V_{\\mathrm{th}}$')).toEqual([
      { type: 'math', value: 'V_{\\mathrm{th}}' },
    ]);
  });

  it('parses mixed text and math, preserving surrounding spaces', () => {
    expect(parseMathSegments('find $R_{\\mathrm{th}}$, then $I_{\\mathrm{sc}}$.')).toEqual([
      { type: 'text', value: 'find ' },
      { type: 'math', value: 'R_{\\mathrm{th}}' },
      { type: 'text', value: ', then ' },
      { type: 'math', value: 'I_{\\mathrm{sc}}' },
      { type: 'text', value: '.' },
    ]);
  });

  it('preserves newlines in text segments', () => {
    expect(parseMathSegments('Find $V_{th}$.\nWhere is it?')).toEqual([
      { type: 'text', value: 'Find ' },
      { type: 'math', value: 'V_{th}' },
      { type: 'text', value: '.\nWhere is it?' },
    ]);
  });

  it('treats an unclosed $ as plain text', () => {
    expect(parseMathSegments('it costs $5 today')).toEqual([
      { type: 'text', value: 'it costs $5 today' },
    ]);
  });

  it('does not emit a math segment for an empty $$', () => {
    expect(parseMathSegments('a$$b')).toEqual([
      { type: 'text', value: 'a$$b' },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseMathSegments('')).toEqual([]);
  });
});
