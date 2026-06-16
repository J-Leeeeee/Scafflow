import { Fragment, useMemo } from 'react';
import katex from 'katex';
import {
  bindTrailingMathPunctuation,
  formatMathTex,
  parseMathSegments,
} from '../lib/parse-math-segments';

interface MathTextProps {
  text: string;
}

/**
 * Renders a string that may contain inline LaTeX wrapped in `$...$` delimiters.
 *
 * Returns a bare fragment (no block wrapper) so the whole thing inherits font
 * size, weight, color and `white-space` from the parent element it sits inside
 * (`<h2>`, `<p>`, `<span>`, ...). Plain segments stay raw text nodes so `\n`
 * line breaks keep working under `whitespace-pre-line` parents. Math segments
 * are typeset with KaTeX (mirroring `MathAnswerInput`'s render options), and
 * immediate trailing punctuation is folded into the same KaTeX render via
 * `\text{...}` so it belongs visually to the formula.
 */
export function MathText({ text }: MathTextProps) {
  const segments = useMemo(
    () => bindTrailingMathPunctuation(parseMathSegments(text)),
    [text],
  );

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Fragment key={index}>{segment.value}</Fragment>;
        }

        const tex = formatMathTex(segment.value, segment.trailingPunctuation);
        const html = renderMath(tex);
        if (html === null) {
          // Fall back to the raw TeX as plain text so bad authoring never crashes the route.
          return (
            <Fragment key={index}>
              {segment.value}
              {segment.trailingPunctuation ?? null}
            </Fragment>
          );
        }

        return (
          <span
            key={index}
            className="mathtext-math"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
}

function renderMath(tex: string): string | null {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      trust: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return null;
  }
}
