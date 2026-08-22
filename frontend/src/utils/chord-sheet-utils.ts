import { transposeChord } from './chordUtils';

// Type definitions for chord sheet processing
export interface ChordLine {
  type: 'chord' | 'lyrics' | 'tab' | 'empty';
  content: string;
}

export interface ChordSection {
  type: 'section';
  title: string;
  lines: ChordLine[];
  isTabSection?: boolean;
}

// Enhanced chord regex pattern for better recognition
// Trailing (?![A-Za-z0-9#]) instead of \b so sharp chords ending in '#'
// (e.g. F#, C#, D/F#) are fully matched — a \b after '#' fails before a space,
// which previously dropped the '#' and broke chord-line detection.
//
// Keep this alternation in sync with CHORD_TOKEN_SOURCE in
// packages/scraping/src/extractors.ts — that copy runs inside page.evaluate
// (serialized into the browser, no imports allowed) so it can't share this
// constant directly. "6/9" must stay listed before the bare "6" alternative:
// unlike the other additions here, its trailing '/' passes the negative
// lookahead on its own, so if "6" were tried first it would match and the
// engine would stop before ever trying "6/9" (no lookahead failure to force
// backtracking into the longer alternative).
//
// The trailing (?:\(\d{1,2}[+-]?\))? covers the Brazilian cipher convention
// of appending a parenthesized extension after the quality — e.g. "F#m7(5-)"
// (half-diminished), "D7M(9)", "F7(11+)" — found by testing real bossa nova
// chord sheets (Tom Jobim, João Gilberto). It's independent of the quality
// group so it also matches a bare extension straight off the root, e.g.
// "Bb(9)".
//
// Bare "5" (power chord, e.g. "D5", "F#5") and "m5" (the same, written with
// an "m" despite the third being absent — seen in the wild, e.g. "Em5") were
// added after finding them undetected on real rock chord sheets (Cazuza,
// Legião Urbana). Distinct from the "b5"/"#5" alterations already covered
// elsewhere in this alternation.
//
// The trailing slash group accepts either a real bass-note letter (the
// existing, standard slash chord, e.g. "G/B") or a bare 1-2 digit number
// (e.g. "D7/4"). The latter isn't a bass note — CifraClub's own authored
// markup confirms real transcribers use "/N" as shorthand for an added
// scale-degree alongside the same song's bare "D4" (add4) chord. Digits
// there are intentionally never transposed by transposeChord() — a scale
// degree relative to the root doesn't change when the root does, unlike an
// actual bass note.
export const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|sus2|sus4|add|add9|add11|add13|add2|add4|maj7|m7|m7b5|7M|9M|11M|13M|7|9|11|13|6\/9|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7|m5|5|4|2)?(?:\(\d{1,2}[+-]?\))?(?:\/(?:[A-G][#b]?|\d{1,2}))?)(?![A-Za-z0-9#])/g;

/**
 * Normalizes unicode accidentals (♭, ♯) to the ASCII 'b'/'#' the chord regex
 * and transposeChord() actually recognize. Sheets pasted in from sources that
 * use the musical symbols instead of plain characters would otherwise fail
 * chord detection and transposition entirely.
 */
export function normalizeChordAccidentals(text: string): string {
  return text.replace(/♭/g, 'b').replace(/♯/g, '#');
}

function isChordLine(line: string): boolean {
  CHORD_REGEX.lastIndex = 0;
  if (!CHORD_REGEX.test(line)) return false;
  // Strip chord matches and check that only whitespace remains
  CHORD_REGEX.lastIndex = 0;
  const stripped = line.replace(CHORD_REGEX, '');
  return stripped.trim() === '';
}

function pushSection(sections: ChordSection[], section: ChordSection): void {
  // Only push if the section has a title or meaningful (non-empty) lines
  const hasContent = section.lines.some(l => l.type !== 'empty');
  if (section.title || hasContent) {
    sections.push(section);
  }
}

/**
 * Process chord sheet content into structured sections and lines.
 * Tab blocks are delimited by [TAB]/[/TAB] markers injected by the scraper
 * (from span.tablatura elements). Everything inside a TAB block is typed as
 * 'tab' regardless of content. Outside TAB blocks the normal chord/lyric
 * heuristics apply.
 */
export function processContent(rawContent: string, transpose: number = 0): ChordSection[] {
  if (!rawContent || typeof rawContent !== "string") {
    return [{ type: "section", title: "", lines: [], isTabSection: false }];
  }

  const rawLines = normalizeChordAccidentals(rawContent).split('\n');
  const sections: ChordSection[] = [];
  let currentSection: ChordSection = { type: 'section', title: '', lines: [] };
  let insideTabBlock = false;

  for (let line of rawLines) {
    const trimmed = line.trim();

    if (trimmed === '[TAB]') {
      insideTabBlock = true;
      // Push whatever was accumulated before this TAB block
      pushSection(sections, currentSection);
      currentSection = { type: 'section', title: '', lines: [], isTabSection: true };
      continue;
    }

    if (trimmed === '[/TAB]') {
      insideTabBlock = false;
      pushSection(sections, currentSection);
      currentSection = { type: 'section', title: '', lines: [] };
      continue;
    }

    const isSectionHeader = /^\[.*\]$/.test(trimmed);

    if (insideTabBlock) {
      if (isSectionHeader) {
        pushSection(sections, currentSection);
        currentSection = {
          type: 'section',
          title: trimmed.replace(/[[\]]/g, ''),
          lines: [],
          isTabSection: true,
        };
      } else if (trimmed === '') {
        currentSection.lines.push({ type: 'empty', content: ' ' });
      } else {
        currentSection.lines.push({ type: 'tab', content: line });
      }
      continue;
    }

    // Outside tab blocks — normal section/chord/lyric parsing
    if (isSectionHeader) {
      pushSection(sections, currentSection);
      currentSection = {
        type: 'section',
        title: trimmed.replace(/[[\]]/g, ''),
        lines: [],
      };
    } else if (trimmed === '') {
      currentSection.lines.push({ type: 'empty', content: ' ' });
    } else {
      if (isChordLine(line)) {
        if (transpose !== 0) {
          CHORD_REGEX.lastIndex = 0;
          line = line.replace(CHORD_REGEX, match => transposeChord(match, transpose));
        }
        currentSection.lines.push({ type: 'chord', content: line });
      } else {
        currentSection.lines.push({ type: 'lyrics', content: line });
      }
    }
  }

  pushSection(sections, currentSection);

  return sections;
}

/**
 * Generate options for the transpose selector
 * @returns Array of transpose options from -11 to +11 semitones (all 12 unique keys)
 */
export function getTransposeOptions(): number[] {
  return [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}
