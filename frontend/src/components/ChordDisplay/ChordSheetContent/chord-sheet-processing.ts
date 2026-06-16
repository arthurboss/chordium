import { processTabBlocks } from '../tab-splitting';
import { songChordsToRawHtml } from '../song-chords-to-raw-html';
import {
  normalizeZeroWidthSpaces,
  fixInlineSectionTitles,
  trimPureChordLineIndent,
  removeTabsFromHtml,
  removeChordsForLyricsOnly,
} from '@/utils/chord-html';

export const FONT_FAMILY: Record<string, string> = {
  serif: 'serif',
  'sans-serif': 'system-ui, sans-serif',
  monospace: 'monospace',
};

export function processHtml(html: string, viewMode: string, maxCols: number): string {
  let result = trimPureChordLineIndent(fixInlineSectionTitles(normalizeZeroWidthSpaces(html)));
  if (viewMode === 'tabs-off' || viewMode === 'lyrics-only') result = removeTabsFromHtml(result);
  if (viewMode === 'lyrics-only') result = removeChordsForLyricsOnly(result);
  if (maxCols > 0) result = processTabBlocks(result, maxCols);
  return result;
}

export function resolveSourceHtml(rawHtml?: string, songChords?: string): string | undefined {
  return rawHtml ?? (songChords ? songChordsToRawHtml(songChords) : undefined);
}
