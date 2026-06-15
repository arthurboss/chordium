import { CHORD_REGEX } from '@/utils/chord-sheet-utils';
import i18next from 'i18next';

const TAB_LINE_REGEX = /^[EBGDAe][\|][-\d]/;
const SECTION_REGEX = /^\[([^\]]+)\]$/;

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
  return stripped.trim() === '';
}

function isTabLine(line: string): boolean {
  return TAB_LINE_REGEX.test(line.trimStart());
}

function wrapChords(line: string): string {
  CHORD_REGEX.lastIndex = 0;
  return line.replace(CHORD_REGEX, '<b>$1</b>');
}

export function songChordsToRawHtml(songChords: string): string {
  const lines = songChords.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section title: [Title]
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const translatedTitle = translateSectionTitle(sectionMatch[1]);
      result.push('<span class="section-title">' + translatedTitle + '</span>');
      i++;
      continue;
    }

    // Tab block: collect consecutive tab lines (all 6 strings together)
    if (isTabLine(line)) {
      const tabLines: string[] = [];
      while (i < lines.length && (isTabLine(lines[i]) || (tabLines.length > 0 && lines[i].trim() === ''))) {
        if (isTabLine(lines[i])) {
          tabLines.push(lines[i]);
        }
        i++;
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

  // Normalize spacing around section titles
  return result.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n{2,}(<span class="section-title">)/g, '\n\n$1')
    .replace(/(<\/span>)\n\n+/g, '$1\n');
}
