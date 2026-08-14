import { useEffect, useMemo, useState, type RefObject } from 'react';

export interface FitMetrics {
  /** Characters in the line that renders widest. */
  chars: number;
  /** What that line's real width is, against what its character count implies. */
  scale: number;
}

const NO_FIT: FitMetrics = { chars: 1, scale: 1 };

// Any size works, since what comes out is a ratio.
const REFERENCE_FONT_SIZE = 100;

/**
 * Describes the line fullscreen has to fit, so the stylesheet can size the words to the
 * width without measuring anything itself.
 *
 * Two things have to be measured rather than counted. The widest line is not necessarily
 * the one with the most characters, since a proportional font gives every character its
 * own width; and that line's real width is narrower than a character count implies, for
 * the same reason. Both describe the font and the words rather than the container, so
 * they survive resizing and are only taken again when the words or the family change.
 */
export function useFitScale(containerRef: RefObject<HTMLElement>, lines: string[]): FitMetrics {
  const [metrics, setMetrics] = useState<FitMetrics>(NO_FIT);

  // Only lines long enough to be in the running are worth measuring, and identical
  // candidates should not retrigger the measurement.
  const candidates = useMemo(() => {
    const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
    return lines.filter((line) => line.trim() && line.length > longest * 0.6);
  }, [lines]);

  const candidateKey = candidates.join('\n');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !candidateKey) return;
    const pre = container.querySelector('pre');
    if (!pre) return;

    const style = window.getComputedStyle(pre);
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'pre';
    probe.style.fontFamily = style.fontFamily;
    // A fixed size rather than the rendered one: the result is a ratio and so is the
    // same at any size, and reading the size this measurement then changes would let
    // the two chase each other.
    probe.style.fontSize = `${REFERENCE_FONT_SIZE}px`;
    probe.style.fontWeight = style.fontWeight;

    const rows = candidateKey.split('\n');
    for (const row of rows) {
      const span = document.createElement('span');
      span.style.display = 'block';
      span.textContent = row;
      probe.appendChild(span);
    }
    container.appendChild(probe);

    let widest = 0;
    let widestChars = 0;
    Array.from(probe.children).forEach((child, index) => {
      const width = child.getBoundingClientRect().width;
      if (width > widest) {
        widest = width;
        widestChars = rows[index].length;
      }
    });

    // What that same line would measure if every character were as wide as `ch`.
    const zeros = document.createElement('span');
    zeros.style.display = 'block';
    zeros.textContent = '0'.repeat(widestChars);
    probe.appendChild(zeros);
    const assumed = zeros.getBoundingClientRect().width;
    container.removeChild(probe);

    if (widest > 0 && assumed > 0 && widestChars > 0) {
      setMetrics({ chars: widestChars, scale: assumed / widest });
    }
  }, [containerRef, candidateKey]);

  return metrics;
}
