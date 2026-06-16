import React from 'react';
import { useContainerColumns } from '../useContainerColumns';
import { FONT_FAMILY, processHtml, resolveSourceHtml } from './chord-sheet-processing';
import { ChordLoadingState } from './ChordLoadingState';
import { ChordEmptyState } from './ChordEmptyState';
import { ChordSheetPre } from './ChordSheetPre';

interface ChordSheetContentProps {
  rawHtml?: string;
  songChords?: string;
  fontSize: number;
  fontStyle: string;
  viewMode: string;
  isLoading?: boolean;
}

const ChordSheetContent: React.FC<ChordSheetContentProps> = ({
  rawHtml,
  songChords,
  fontSize,
  fontStyle,
  viewMode,
  isLoading,
}) => {
  const { containerRef, maxCols } = useContainerColumns(rawHtml);
  const fontFamily = FONT_FAMILY[fontStyle];
  const sourceHtml = resolveSourceHtml(rawHtml, songChords);
  const processedHtml = sourceHtml ? processHtml(sourceHtml, viewMode, maxCols) : undefined;

  return (
    <div
      ref={containerRef}
      className="[font-size:var(--content-font-size,14px)] bg-card mb-4 px-4 py-6 sm:px-6 rounded-lg shadow-xs border"
      style={{ '--content-font-size': `${fontSize}px`, fontFamily } as React.CSSProperties}
    >
      {isLoading ? <ChordLoadingState /> : processedHtml ? <ChordSheetPre html={processedHtml} fontFamily={fontFamily} /> : <ChordEmptyState />}
    </div>
  );
};

export default ChordSheetContent;
