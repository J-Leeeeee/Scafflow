/**
 * Splits a string into alternating plain-text and inline-math segments.
 *
 * Authoring convention: inline LaTeX is wrapped in single-dollar delimiters,
 * e.g. `Before we can find $R_{\mathrm{th}}$, we need $I_{\mathrm{sc}}$.`.
 * This helper is intentionally free of React/KaTeX imports so it can be unit
 * tested in isolation; `MathText` consumes it and renders the math segments.
 *
 * Edge cases:
 *  - An unclosed `$` (no matching delimiter) leaves the remainder as plain text.
 *  - An empty `$$` does not produce a math segment (treated as plain text).
 *  - A string with no `$` returns a single text segment.
 */
export interface MathSegment {
  type: 'text' | 'math';
  value: string;
}

export function parseMathSegments(text: string): MathSegment[] {
  const pattern = /\$([^$]+)\$/g;
  const segments: MathSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    const tex = match[1];
    if (tex.trim().length > 0) {
      segments.push({ type: 'math', value: tex });
    }
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}
