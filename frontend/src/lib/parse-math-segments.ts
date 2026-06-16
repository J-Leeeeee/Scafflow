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

export type MathRenderSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; trailingPunctuation?: string };

const TRAILING_MATH_PUNCTUATION_PATTERN = /^[.,:;!?]+/;

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

export function bindTrailingMathPunctuation(segments: MathSegment[]): MathRenderSegment[] {
  const renderSegments: MathRenderSegment[] = [];

  for (const segment of segments) {
    if (segment.type === 'math') {
      renderSegments.push({ type: 'math', value: segment.value });
      continue;
    }

    const match = segment.value.match(TRAILING_MATH_PUNCTUATION_PATTERN);
    const previous = renderSegments[renderSegments.length - 1];

    if (match && previous?.type === 'math') {
      const punctuation = match[0];
      renderSegments[renderSegments.length - 1] = {
        ...previous,
        trailingPunctuation: `${previous.trailingPunctuation ?? ''}${punctuation}`,
      };

      const remainingText = segment.value.slice(punctuation.length);
      if (remainingText.length > 0) {
        renderSegments.push({ type: 'text', value: remainingText });
      }
      continue;
    }

    renderSegments.push({ type: 'text', value: segment.value });
  }

  return renderSegments;
}

export function formatMathTex(tex: string, trailingPunctuation?: string): string {
  if (!trailingPunctuation) return tex;
  return `${tex}\\text{${escapeTextMacroContent(trailingPunctuation)}}`;
}

function escapeTextMacroContent(value: string): string {
  let escaped = '';

  for (const char of value) {
    switch (char) {
      case '\\':
        escaped += '\\textbackslash{}';
        break;
      case '{':
      case '}':
      case '$':
      case '&':
      case '%':
      case '#':
      case '_':
        escaped += `\\${char}`;
        break;
      default:
        escaped += char;
    }
  }

  return escaped;
}
