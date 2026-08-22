import { CHORD_REGEX, normalizeChordAccidentals } from '@/utils/chord-sheet-utils';
import i18next from 'i18next';

const TAB_LINE_REGEX = /^[EBGDAe][\|][-\d]/;

// Characters tolerated around chords on an otherwise chord-only line: repeat
// markers like "(2x)" or "x2", brackets/parens grouping alternate chords
// (e.g. "( Am  C  Am )"), and basic punctuation. Letters are deliberately
// excluded, so real lyric words never slip through as "decoration".
const CHORD_LINE_DECORATION_REGEX = /^[\s()[\]{}xX0-9.,:-]*$/;

const SECTION_TITLE_KEYWORDS: Record<string, string> = {
  'intro': 'sectionTitles.intro',
  'verse': 'sectionTitles.verse',
  'chorus': 'sectionTitles.chorus',
  'pre-chorus': 'sectionTitles.preChorus',
  'bridge': 'sectionTitles.bridge',
  'outro': 'sectionTitles.outro',
  'solo': 'sectionTitles.solo',
  'interlude': 'sectionTitles.interlude',
};

function translateSectionTitle(title: string): string {
  const lowerTitle = title.toLowerCase().trim();
  for (const [keyword, i18nKey] of Object.entries(SECTION_TITLE_KEYWORDS)) {
    if (lowerTitle.includes(keyword)) {
      const translated = i18next.t(i18nKey, { defaultValue: keyword });
      return title.replace(new RegExp(keyword, 'i'), translated);
    }
  }
  return title;
}

function isChordLine(line: string): boolean {
  CHORD_REGEX.lastIndex = 0;
  if (!CHORD_REGEX.test(line)) return false;
  CHORD_REGEX.lastIndex = 0;
  const stripped = line.replace(CHORD_REGEX, '');
  return CHORD_LINE_DECORATION_REGEX.test(stripped);
}

function isTabLine(line: string): boolean {
  return TAB_LINE_REGEX.test(line.trimStart());
}

function wrapChords(line: string): string {
  CHORD_REGEX.lastIndex = 0;
  return line.replace(CHORD_REGEX, '<b>$1</b>');
}

// Ensures exactly one blank line before every header line (never zero,
// never more), except at the very start of the content where there's
// nothing to separate it from. No blank line is added after — the divider
// rendered under the header already provides that separation.
function normalizeHeaderBlankLines(text: string, isHeaderLine: (line: string) => boolean): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isHeaderLine(line.trim())) {
      while (result.length > 0 && result[result.length - 1].trim() === '') {
        result.pop();
      }
      if (result.length > 0) result.push('');
      result.push(line);
      let k = i + 1;
      while (k < lines.length && lines[k].trim() === '') k++;
      i = k;
      continue;
    }
    result.push(line);
    i++;
  }
  return result.join('\n');
}

const TAB_PART_LABEL_REGEX = /^\s*Parte \d+ [Dd]e \d+\s*$/;

export function songChordsToRawHtml(songChords: string): string {
  const lines = normalizeChordAccidentals(songChords).split('\n');
  const result: string[] = [];
  let i = 0;
  // Some sections mix chord-only content and a tab block under a single
  // title with no separate "Tab - <title>" counterpart. Without that second
  // header, the "hide tabs" toggle has nothing tab-named to strip and leaves
  // the tab block behind. Track the section currently in scope so a
  // "Tab - <title>" header can be inserted right before its tab run starts.
  let currentTitle: string | null = null;
  let insertedTabHeaderForSection = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section title: [Title], optionally followed by chords on the same line
    // (e.g. "[Intro] C  Am  C  Am") - split the title onto its own line so it
    // still renders as a heading, and let the remainder fall through to the
    // chord-line check below.
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (sectionMatch) {
      currentTitle = sectionMatch[1];
      insertedTabHeaderForSection = false;
      const translatedTitle = translateSectionTitle(sectionMatch[1]);
      result.push('<span class="section-title">' + translatedTitle + '</span>');
      const rest = sectionMatch[2];
      if (rest) {
        lines[i] = rest;
        continue;
      }
      i++;
      continue;
    }

    if (
      !insertedTabHeaderForSection &&
      currentTitle &&
      !/^(tab|dedilhado)\b/i.test(currentTitle.trim()) &&
      (isTabLine(line) || TAB_PART_LABEL_REGEX.test(line))
    ) {
      result.push('<span class="section-title">Tab - ' + translateSectionTitle(currentTitle) + '</span>');
      insertedTabHeaderForSection = true;
    }

    // Tab block: collect consecutive tab lines (all 6 strings together), plus
    // any fret-hand direction rows (e.g. "↓  ↑ ↓") annotating them. A block
    // can hold several string-groups separated by a blank line each (e.g.
    // "Parte 3 de 5" repeating the pattern) — kept as a single blank, not
    // dropped, or the groups render mashed together and unreadable.
    if (isTabLine(line)) {
      const tabLines: string[] = [];
      const continuesBlock = (l: string) => isTabLine(l) || /^[ \t]*[↓↑][ \t↓↑]*$/.test(l);
      while (i < lines.length && (continuesBlock(lines[i]) || (tabLines.length > 0 && lines[i].trim() === ''))) {
        if (continuesBlock(lines[i])) {
          tabLines.push(lines[i]);
        } else if (tabLines[tabLines.length - 1]?.trim() !== '') {
          tabLines.push('');
        }
        i++;
      }
      while (tabLines.length > 0 && tabLines[tabLines.length - 1].trim() === '') {
        tabLines.pop();
      }
      if (tabLines.length > 0) {
        result.push('<span class="tablatura"><span class="cnt">' + tabLines.join('\n') + '</span></span>');
      }
      continue;
    }

    // Chord line
    if (isChordLine(trimmed) && trimmed.length > 0) {
      result.push(wrapChords(line));
      i++;
      continue;
    }

    // Everything else: lyrics / empty
    result.push(line);
    i++;
  }

  return normalizeHeaderBlankLines(
    result.join('\n').replace(/\n{3,}/g, '\n\n'),
    (line) => /^<span class="section-title">.*<\/span>$/.test(line)
  );
}
