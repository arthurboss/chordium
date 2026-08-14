import { processTabBlocks } from '../tab-splitting';
import { songChordsToRawHtml } from '../song-chords-to-raw-html';
import {
  normalizeZeroWidthSpaces,
  fixInlineSectionTitles,
  trimPureChordLineIndent,
  removeTabsFromHtml,
  removeChordsForLyricsOnly,
} from '@/utils/chord-html';
import { transposeChord } from '@/utils/chordUtils';

/** Maps fontStyle setting values to CSS font-family strings. */
export const FONT_FAMILY: Record<string, string> = {
  serif: 'serif',
  'sans-serif': 'system-ui, sans-serif',
  monospace: 'monospace',
};

function transposeHtmlChords(html: string, halfSteps: number): string {
  if (halfSteps === 0) return html;
  return html.replace(/<b([^>]*)>([^<]+)<\/b>/g, (_, attrs, chordName) => {
    return `<b${attrs}>${transposeChord(chordName.trim(), halfSteps)}</b>`;
  });
}

/**
 * Applies all view-mode transformations to raw chord HTML.
 *
 * Order matters: transpose → normalisation → section titles → indent trimming → tab removal
 * → lyrics-only stripping → tab-block column splitting.
 */
export function processHtml(html: string, viewMode: string, maxCols: number, transpose = 0): string {
  let result = transposeHtmlChords(trimPureChordLineIndent(fixInlineSectionTitles(normalizeZeroWidthSpaces(html))), transpose);
  if (viewMode === 'tabs-off' || viewMode === 'lyrics-only') result = removeTabsFromHtml(result);
  if (viewMode === 'lyrics-only') result = removeChordsForLyricsOnly(result);
  if (maxCols > 0) result = processTabBlocks(result, maxCols);
  return result;
}

const TAB_LINE = /^[EBGDAe]\|/;

/**
 * The lines fullscreen has to size itself around, as plain text, with tags and entities
 * back down to the one character each stands for: counting markup would shrink the words
 * to fit text that is not there.
 *
 * Tab lines are left out, because they are the one thing here that reflows. A sung line
 * cannot be broken without losing which chord belongs over which word, so the words must
 * shrink to fit it; a tab block can be split into parts instead, and is. Sizing to a tab
 * line would shrink the whole song for something that had another way out, and would also
 * put the two calculations in a circle, each waiting on the other.
 */
export function fittableLines(html?: string): string[] {
  if (!html) return [];
  return html
    .split('\n')
    .map((line) => line.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, ' '))
    .filter((line) => !TAB_LINE.test(line.trim()));
}

/**
 * Resolves the HTML source for a chord sheet.
 * Prefers `rawHtml` (scraped); falls back to converting plain-text `songChords`.
 */
export function resolveSourceHtml(rawHtml?: string, songChords?: string): string | undefined {
  return rawHtml ?? (songChords ? songChordsToRawHtml(songChords) : undefined);
}
