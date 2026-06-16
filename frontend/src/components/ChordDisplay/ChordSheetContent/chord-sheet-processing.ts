import { processTabBlocks } from '../tab-splitting';
import { songChordsToRawHtml } from '../song-chords-to-raw-html';
import {
  normalizeZeroWidthSpaces,
  fixInlineSectionTitles,
  trimPureChordLineIndent,
  removeTabsFromHtml,
  removeChordsForLyricsOnly,
} from '@/utils/chord-html';

/** Maps fontStyle setting values to CSS font-family strings. */
export const FONT_FAMILY: Record<string, string> = {
  serif: 'serif',
  'sans-serif': 'system-ui, sans-serif',
  monospace: 'monospace',
};

/**
 * Applies all view-mode transformations to raw chord HTML.
 *
 * Order matters: normalisation → section titles → indent trimming → tab removal
 * → lyrics-only stripping → tab-block column splitting.
 */
export function processHtml(html: string, viewMode: string, maxCols: number): string {
  let result = trimPureChordLineIndent(fixInlineSectionTitles(normalizeZeroWidthSpaces(html)));
  if (viewMode === 'tabs-off' || viewMode === 'lyrics-only') result = removeTabsFromHtml(result);
  if (viewMode === 'lyrics-only') result = removeChordsForLyricsOnly(result);
  if (maxCols > 0) result = processTabBlocks(result, maxCols);
  return result;
}

/**
 * Resolves the HTML source for a chord sheet.
 * Prefers `rawHtml` (scraped); falls back to converting plain-text `songChords`.
 */
export function resolveSourceHtml(rawHtml?: string, songChords?: string): string | undefined {
  return rawHtml ?? (songChords ? songChordsToRawHtml(songChords) : undefined);
}
