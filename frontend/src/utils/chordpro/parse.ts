import type { ChordProDocument, ChordProLine, ChordProSegment } from './types';

/**
 * Parser for ChordPro-formatted chord sheet text (e.g. `[G]Saying I [C]love you`).
 * Self-contained: does not share regexes/state with the legacy positional
 * parser in `../chord-sheet-utils.ts`.
 */

const START_TAB_RE = /^\{start_of_tab\}$/i;
const END_TAB_RE = /^\{end_of_tab\}$/i;
const COMMENT_RE = /^\{comment:\s*(.*)\}$/i;
const SHORT_COMMENT_RE = /^\{c:\s*(.*)\}$/i;
const DIRECTIVE_RE = /^\{([a-z_]+)(?::\s*(.*))?\}$/i;
const CHORD_TOKEN_RE = /\[([^\]]*)\]/g;

/**
 * Splits a lyrics line containing zero or more `[chord]` tokens into
 * ChordProSegment[]. A line with no brackets becomes a single segment with
 * `chord: undefined`.
 */
function parseLyricsLine(line: string): ChordProSegment[] {
  const matches: { start: number; end: number; chord: string }[] = [];
  CHORD_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CHORD_TOKEN_RE.exec(line)) !== null) {
    matches.push({ start: match.index, end: CHORD_TOKEN_RE.lastIndex, chord: match[1] });
  }

  if (matches.length === 0) {
    return [{ chord: undefined, lyric: line }];
  }

  const segments: ChordProSegment[] = [];

  const textBeforeFirstChord = line.slice(0, matches[0].start);
  if (textBeforeFirstChord.length > 0) {
    segments.push({ lyric: textBeforeFirstChord });
  }

  matches.forEach((m, i) => {
    const nextStart = i + 1 < matches.length ? matches[i + 1].start : line.length;
    segments.push({ chord: m.chord, lyric: line.slice(m.end, nextStart) });
  });

  return segments;
}

/**
 * Parses ChordPro-formatted text into a structured ChordProDocument.
 */
export function parseChordPro(text: string): ChordProDocument {
  const rawLines = text.split('\n');
  const lines: ChordProLine[] = [];
  let insideTab = false;

  for (const raw of rawLines) {
    const trimmed = raw.trim();

    if (START_TAB_RE.test(trimmed)) {
      insideTab = true;
      continue;
    }
    if (END_TAB_RE.test(trimmed)) {
      insideTab = false;
      continue;
    }

    if (insideTab) {
      lines.push({ type: 'tab', content: raw });
      continue;
    }

    const commentMatch = trimmed.match(COMMENT_RE) || trimmed.match(SHORT_COMMENT_RE);
    if (commentMatch) {
      lines.push({ type: 'comment', text: commentMatch[1].trim() });
      continue;
    }

    const directiveMatch = trimmed.match(DIRECTIVE_RE);
    if (directiveMatch) {
      lines.push({ type: 'directive', name: directiveMatch[1], value: directiveMatch[2] });
      continue;
    }

    if (trimmed === '') {
      lines.push({ type: 'empty' });
      continue;
    }

    lines.push({ type: 'lyrics', segments: parseLyricsLine(raw) });
  }

  return { lines };
}
