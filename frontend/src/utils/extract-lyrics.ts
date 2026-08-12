import { removeChordsForLyricsOnly, removeTabsFromHtml } from '@/utils/chord-html';
import { resolveSourceHtml } from '@/components/ChordDisplay/ChordSheetContent/chord-sheet-processing';

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
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Derives the sung words from a chord sheet, which is the version people follow
 * along to, rather than fetching lyrics from the source site separately.
 *
 * Section titles are dropped: they are rendered from translated UI strings
 * already, so translating them again would be wasted work.
 */
export function extractLyricsFromChordSheet(rawHtml?: string, songChords?: string): string {
  const html = resolveSourceHtml(rawHtml, songChords);
  if (!html) return '';
  return htmlToText(removeChordsForLyricsOnly(removeTabsFromHtml(html)));
}
