import { processContent, CHORD_REGEX } from '../chord-sheet-utils';

/**
 * One-way migration from the legacy positional chord-sheet format (chords on
 * their own line above lyrics, detected by regex-strip-and-check-whitespace)
 * to ChordPro's inline-bracket format.
 *
 * Reuses the existing `processContent` heuristic parser from
 * `../chord-sheet-utils.ts` to classify lines, then re-emits them as
 * ChordPro text. Does not touch/replace that legacy parser — it stays in
 * place to keep the OLD format working wherever it's still needed.
 */

// Mirrors the (unexported) `isChordLine` heuristic in chord-sheet-utils.ts:
// a line is a "pure chord line" if every non-whitespace run on it matches
// CHORD_REGEX, i.e. stripping all chord matches leaves only whitespace.
function isPureChordLine(line: string): boolean {
  CHORD_REGEX.lastIndex = 0;
  if (!CHORD_REGEX.test(line)) return false;
  CHORD_REGEX.lastIndex = 0;
  const stripped = line.replace(CHORD_REGEX, '');
  return stripped.trim() === '';
}

// ChordPro's inline signature: a closing bracket immediately followed by
// non-whitespace (e.g. "[G]Saying"). The legacy format's bracketed section
// headers ("[Intro]") are always followed by whitespace or end-of-line, so
// they never trigger this.
const CHORDPRO_INLINE_BRACKET_RE = /\]\S/;
// ChordPro directive signature, e.g. "{comment: Intro}", "{start_of_tab}".
const CHORDPRO_DIRECTIVE_RE = /\{[a-zA-Z_]+(?::[^}]*)?\}/;

/**
 * Returns true if `songChords` looks like the OLD positional format: no
 * ChordPro inline brackets or directives, but at least one line the legacy
 * `isChordLine` heuristic would classify as a pure chord line.
 */
export function isLegacyPositionalFormat(songChords: string): boolean {
  if (!songChords || typeof songChords !== 'string') return false;
  if (CHORDPRO_INLINE_BRACKET_RE.test(songChords)) return false;
  if (CHORDPRO_DIRECTIVE_RE.test(songChords)) return false;
  return songChords.split('\n').some(isPureChordLine);
}

// Scraped/legacy source lines sometimes put a section title and chords on
// the same line (e.g. "[Intro] Em  G  D  A") instead of the title alone on
// its own line. `processContent`'s section-header check only matches a line
// that is *exactly* "[Title]", so a combined line like this falls through
// as an unrecognized lyrics line and never gets migrated. Split it into a
// standalone "[Title]" line followed by the remainder, matching how the
// legacy HTML converter (`song-chords-to-raw-html.ts`) already handles the
// same shape.
const TITLE_WITH_TRAILING_CONTENT_RE = /^(\[[^\]]+\])\s+(\S.*)$/;

function splitTitleFromTrailingContent(rawContent: string): string {
  return rawContent
    .split('\n')
    .flatMap((line) => {
      const match = line.match(TITLE_WITH_TRAILING_CONTENT_RE);
      return match ? [match[1], match[2]] : [line];
    })
    .join('\n');
}

interface ChordToken {
  /** Character column (index) of the token's first character in the source chord line. */
  col: number;
  chord: string;
}

// Tokenizes a chord line into its whitespace-delimited chord tokens, each
// tagged with the character column it starts at.
function extractChordTokensWithColumns(line: string): ChordToken[] {
  const tokens: ChordToken[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    tokens.push({ col: match.index, chord: match[0] });
  }
  return tokens;
}

// Inserts `[chord]` brackets into `lyricLine` at the same character columns
// the chord tokens occupied on their own line. If the lyric line is shorter
// than a chord's column, the bracket is appended at the end instead.
function insertChordsAtColumns(lyricLine: string, tokens: ChordToken[]): string {
  const sorted = [...tokens].sort((a, b) => a.col - b.col);
  let result = '';
  let lastPos = 0;
  for (const { col, chord } of sorted) {
    const insertPos = Math.max(Math.min(col, lyricLine.length), lastPos);
    result += lyricLine.slice(lastPos, insertPos);
    result += `[${chord}]`;
    lastPos = insertPos;
  }
  result += lyricLine.slice(lastPos);
  return result;
}

/**
 * Converts legacy positional-format `songChords` text into ChordPro text.
 */
export function migrateLegacyToChordPro(songChords: string): string {
  const sections = processContent(splitTitleFromTrailingContent(songChords), 0);
  const outputLines: string[] = [];

  for (const section of sections) {
    if (section.title) {
      outputLines.push(`{comment: ${section.title}}`);
      outputLines.push('');
    }

    const lines = section.lines;
    let tabRunOpen = false;
    const closeTabRunIfOpen = () => {
      if (tabRunOpen) {
        outputLines.push('{end_of_tab}');
        tabRunOpen = false;
      }
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.type === 'tab' && section.isTabSection) {
        if (!tabRunOpen) {
          outputLines.push('{start_of_tab}');
          tabRunOpen = true;
        }
        outputLines.push(line.content);
        i += 1;
        continue;
      }

      // Any non-tab line closes a currently-open tab run.
      closeTabRunIfOpen();

      if (line.type === 'empty') {
        outputLines.push('');
        i += 1;
        continue;
      }

      if (line.type === 'chord') {
        const next = lines[i + 1];
        const chordTokens = extractChordTokensWithColumns(line.content);
        if (next && next.type === 'lyrics') {
          outputLines.push(insertChordsAtColumns(next.content, chordTokens));
          i += 2;
          continue;
        }
        // Instrumental line: no following lyrics — emit each chord as its
        // own bracket, e.g. "[Em7] [G] [D4]".
        outputLines.push(chordTokens.map((t) => `[${t.chord}]`).join(' '));
        i += 1;
        continue;
      }

      if (line.type === 'lyrics') {
        // Pure lyric-only line (no paired preceding chord line): pass through.
        outputLines.push(line.content);
        i += 1;
        continue;
      }

      i += 1;
    }

    closeTabRunIfOpen();
  }

  return outputLines.join('\n');
}
