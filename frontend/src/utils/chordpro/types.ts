/**
 * ChordPro document model.
 *
 * A parsed representation of ChordPro-formatted chord sheet text
 * (e.g. `[G]Saying I [C]love you`), used as the interchange format between
 * the backend scraper output and any future ChordPro-aware renderer/editor.
 */

export interface ChordProSegment {
  /** e.g. "G", "Am7". Undefined if this segment has no chord before it. */
  chord?: string;
  /** Text following the chord (or from line start / previous chord) up to the next chord or line end. */
  lyric: string;
}

export type ChordProLine =
  | { type: 'lyrics'; segments: ChordProSegment[] }
  /** From `{comment: ...}` or `{c: ...}`. */
  | { type: 'comment'; text: string }
  /** One raw line inside a `{start_of_tab}`/`{end_of_tab}` block. */
  | { type: 'tab'; content: string }
  /** Any other `{name: value}` or `{name}` directive, passthrough. */
  | { type: 'directive'; name: string; value?: string }
  | { type: 'empty' };

export interface ChordProDocument {
  lines: ChordProLine[];
}
