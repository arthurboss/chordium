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
export const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7|4|2)?(?:\/[A-G][#b]?)?)\b/g;

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

  const rawLines = rawContent.split('\n');
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
