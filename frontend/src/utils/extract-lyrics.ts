import { removeChordsForLyricsOnly, removeTabsFromHtml } from '@/utils/chord-html';
import { resolveSourceHtml } from '@/components/ChordDisplay/ChordSheetContent/chord-sheet-processing';

const BRACKETED = /^\[[^\]]*\]$/;
const TAB_PART = /^parte\s*\d*\s*de\b/i;

/** The names a part of a sheet goes by, in the languages the sources write them in. */
const SECTION_NAMES = [
  'intro', 'introdução', 'introducao', 'introduction',
  'refrão', 'refrao', 'chorus', 'pre-chorus', 'pré-refrão',
  'primeira parte', 'segunda parte', 'terceira parte', 'quarta parte', 'quinta parte',
  'verso', 'estrofe', 'verse', 'ponte', 'bridge',
  'solo', 'riff', 'dedilhado', 'instrumental', 'interlude', 'interlúdio',
  'final', 'outro', 'coda', 'ending', 'variação', 'variacao', 'tab',
];

/** One of those names alone on its line, perhaps numbered, or with a repeat after it. */
const NAMED_SECTION = new RegExp(
  `^(?:${SECTION_NAMES.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})` +
    `(?:\\s*\\d+)?(?:\\s*[-–]\\s*[\\w\\s]{0,12})?\\s*:?$`,
  'i'
);

/**
 * Whether a line names a part of the sheet rather than being sung.
 *
 * Most are marked up as titles and taken out with the markup, but sources also write them
 * as ordinary text, and inconsistently: "Riff", "Introdução:", "Parte 1 de 3 - 2x". What
 * they have in common is standing alone and saying nothing, so a heading that announces
 * itself with a colon and carries no sentence counts as one too.
 */
function isSectionLabel(line: string): boolean {
  const text = line.trim();
  if (!text) return false;
  if (BRACKETED.test(text)) return true;
  if (TAB_PART.test(text)) return true;
  if (NAMED_SECTION.test(text)) return true;
  return text.length <= 30 && text.endsWith(':') && !/[,.?!]/.test(text);
}

function htmlToText(html: string): string {
  const withoutSectionTitles = html.replace(/<span class="section-title">[^<]*<\/span>/g, '');
  const textarea = document.createElement('textarea');
  return withoutSectionTitles
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => {
      // Decode entities per line so &amp; and friends survive as characters
      // without the markup stripping above being undone.
      textarea.innerHTML = line;
      return (textarea.value || '').trimEnd();
    })
    .filter((line) => !isSectionLabel(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Derives the sung words from a chord sheet, which is the version people follow
 * along to, rather than fetching lyrics from the source site separately.
 *
 * Section titles are dropped: they are rendered from translated UI strings
 * already, so translating them again would be wasted work. Keeping them would also
 * cost a line of the translation, which is matched to the words line for line.
 */
export function extractLyricsFromChordSheet(rawHtml?: string, songChords?: string): string {
  const html = resolveSourceHtml(rawHtml, songChords);
  if (!html) return '';
  return htmlToText(removeChordsForLyricsOnly(removeTabsFromHtml(html)));
}
