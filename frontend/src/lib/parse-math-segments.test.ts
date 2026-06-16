import {
  bindTrailingMathPunctuation,
  formatMathTex,
  parseMathSegments,
} from './parse-math-segments';

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

describe('bindTrailingMathPunctuation', () => {
  it('binds periods and commas that immediately follow inline math', () => {
    expect(bindTrailingMathPunctuation(parseMathSegments('find $R_{\\mathrm{th}}$, then $I_{\\mathrm{sc}}$.'))).toEqual([
      { type: 'text', value: 'find ' },
      { type: 'math', value: 'R_{\\mathrm{th}}', trailingPunctuation: ',' },
      { type: 'text', value: ' then ' },
      { type: 'math', value: 'I_{\\mathrm{sc}}', trailingPunctuation: '.' },
    ]);
  });

  it('binds colons used in field labels', () => {
    expect(bindTrailingMathPunctuation(parseMathSegments('Final value of $R_{\\mathrm{th}}$:'))).toEqual([
      { type: 'text', value: 'Final value of ' },
      { type: 'math', value: 'R_{\\mathrm{th}}', trailingPunctuation: ':' },
    ]);
  });

  it('binds punctuation runs without changing the remaining text', () => {
    expect(bindTrailingMathPunctuation(parseMathSegments('Is it $V_{ab}$?! yes'))).toEqual([
      { type: 'text', value: 'Is it ' },
      { type: 'math', value: 'V_{ab}', trailingPunctuation: '?!' },
      { type: 'text', value: ' yes' },
    ]);
  });

  it('leaves spaced punctuation as normal text', () => {
    expect(bindTrailingMathPunctuation(parseMathSegments('value $R_{\\mathrm{th}}$ :'))).toEqual([
      { type: 'text', value: 'value ' },
      { type: 'math', value: 'R_{\\mathrm{th}}' },
      { type: 'text', value: ' :' },
    ]);
  });
});

describe('formatMathTex', () => {
  it('appends trailing punctuation with KaTeX text macro', () => {
    expect(formatMathTex('V_{\\mathrm{th}}', '.')).toBe('V_{\\mathrm{th}}\\text{.}');
    expect(formatMathTex('R_{\\mathrm{th}}', ':')).toBe('R_{\\mathrm{th}}\\text{:}');
    expect(formatMathTex('I_{\\mathrm{sc}}', '?!')).toBe('I_{\\mathrm{sc}}\\text{?!}');
  });

  it('does not change math without trailing punctuation', () => {
    expect(formatMathTex('V_{\\mathrm{th}}')).toBe('V_{\\mathrm{th}}');
  });

  it('escapes text macro content before appending it', () => {
    expect(formatMathTex('x', '{}\\')).toBe('x\\text{\\{\\}\\textbackslash{}}');
  });
});
