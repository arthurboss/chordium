import type { ChordProLine } from './types';

export interface PlacedChord {
  /** Character column in the plain lyric text where this chord sits. */
  col: number;
  chord: string;
}

/**
 * Splits a parsed lyrics line into its plain lyric text (chords removed)
 * and the column each chord occupies in that plain text -- the inverse of
 * `migrate-legacy.ts`'s column-insertion, needed to rebuild the classic
 * "chord line above lyric line" look from inline ChordPro segments.
 *
 * Shared by `chordpro-to-raw-html.ts` (read-only HTML render) and
 * `ChordProPreview.tsx` (live editor preview) so both layouts stay
 * identical -- computing this independently in two places is what caused
 * them to visually diverge before.
 */
export function toPlainLyricAndChordColumns(
  line: Extract<ChordProLine, { type: 'lyrics' }>
): { lyric: string; chords: PlacedChord[] } {
  let lyric = '';
  const chords: PlacedChord[] = [];
  for (const segment of line.segments) {
    if (segment.chord !== undefined) {
      chords.push({ col: lyric.length, chord: segment.chord });
    }
    lyric += segment.lyric;
  }
  return { lyric, chords };
}

/**
 * Renders a chord-position line as plain text: each chord name placed at
 * its column, separated by at least one space so adjacent chords never run
 * together.
 */
export function renderChordLineText(chords: PlacedChord[]): string {
  let result = '';
  for (const { col, chord } of chords) {
    const padTo = Math.max(col, result.length + (result.length > 0 ? 1 : 0));
    result += ' '.repeat(Math.max(0, padTo - result.length));
    result += chord;
  }
  return result;
}
