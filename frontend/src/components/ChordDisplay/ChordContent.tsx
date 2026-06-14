import React from 'react';
import { ChordContentProps } from './types';
import { useContainerColumns } from './useContainerColumns';
import { processTabBlocks } from './tab-splitting';
import { songChordsToRawHtml } from './song-chords-to-raw-html';
import {
  normalizeZeroWidthSpaces,
  fixInlineSectionTitles,
  trimPureChordLineIndent,
  removeTabsFromHtml,
  removeChordsForLyricsOnly,
} from '@/utils/chord-html';

const FONT_FAMILY: Record<string, string> = {
  serif: 'serif',
  'sans-serif': 'system-ui, sans-serif',
  monospace: 'monospace',
};

function processHtml(html: string, viewMode: string, maxCols: number): string {
  let result = trimPureChordLineIndent(fixInlineSectionTitles(normalizeZeroWidthSpaces(html)));
  if (viewMode === 'tabs-off' || viewMode === 'lyrics-only') result = removeTabsFromHtml(result);
  if (viewMode === 'lyrics-only') result = removeChordsForLyricsOnly(result);
  if (maxCols > 0) result = processTabBlocks(result, maxCols);
  return result;
}

function ChordLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4" />
      <p className="text-sm">Loading chord content...</p>
    </div>
  );
}

function ChordEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      No chord content to display
    </div>
  );
}

function ChordSheet({ html, fontFamily }: { html: string; fontFamily: string | undefined }) {
  return (
    <pre
      className="font-inherit whitespace-pre-wrap break-words"
      style={{ fontFamily: fontFamily ?? 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const ChordContent: React.FC<ChordContentProps> = ({
  rawHtml,
  songChords,
  fontSize,
  fontSpacing,
  fontStyle,
  isLoading,
  viewMode = 'chords',
}) => {
  const { containerRef, maxCols } = useContainerColumns(rawHtml);
  const fontFamily = FONT_FAMILY[fontStyle];
  const sourceHtml = rawHtml ?? (songChords ? songChordsToRawHtml(songChords) : undefined);
  const processedHtml = sourceHtml ? processHtml(sourceHtml, viewMode, maxCols) : undefined;

  return (
    <div
      ref={containerRef}
      className="chord-content-card bg-white dark:bg-[--card] mb-4 px-4 py-6 sm:px-6 rounded-lg shadow-sm border"
      style={{ "--content-font-size": `${fontSize}px`, letterSpacing: `${fontSpacing}em`, fontFamily } as React.CSSProperties}
    >
      {isLoading ? <ChordLoadingState /> : processedHtml ? <ChordSheet html={processedHtml} fontFamily={fontFamily} /> : <ChordEmptyState />}
    </div>
  );
};

export default ChordContent;
