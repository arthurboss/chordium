import { processTabBlocks } from '../tab-splitting';
import { chordProToRawHtml } from '../chordpro-to-raw-html';
import { isLegacyPositionalFormat, migrateLegacyToChordPro } from '@/utils/chordpro/migrate-legacy';
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

/**
 * Resolves the HTML source for a chord sheet.
 * Prefers `rawHtml` (scraped). Falls back to `songChords`: legacy
 * positional-format text is migrated to ChordPro on the fly before
 * rendering; ChordPro-format text renders directly.
 */
export function resolveSourceHtml(rawHtml?: string, songChords?: string): string | undefined {
  if (rawHtml) return rawHtml;
  if (!songChords) return undefined;
  const chordProText = isLegacyPositionalFormat(songChords)
    ? migrateLegacyToChordPro(songChords)
    : songChords;
  return chordProToRawHtml(chordProText);
}
