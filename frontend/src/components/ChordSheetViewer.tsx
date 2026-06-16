import React, { forwardRef, useEffect } from 'react';
import './ChordDisplay/chord-display.css';
import type { ChordSheet } from '@/types/chordSheet';
import { toast } from '@/hooks/use-toast';
import StickyControlsBar from './ChordDisplay/components/StickyControlsBar';
import ChordEdit from './ChordDisplay/ChordEdit';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChordDisplaySettings } from '@/hooks/use-chord-display-settings';
import { useChordEditor } from '@/hooks/use-chord-editor';
import { downloadTextFile } from '@/utils/download-utils';
import { cyAttr } from '@/utils/test-utils';
import { useContainerColumns } from './ChordDisplay/useContainerColumns';
import { processTabBlocks } from './ChordDisplay/tab-splitting';
import { songChordsToRawHtml } from './ChordDisplay/song-chords-to-raw-html';
import {
  normalizeZeroWidthSpaces,
  fixInlineSectionTitles,
  trimPureChordLineIndent,
  removeTabsFromHtml,
  removeChordsForLyricsOnly,
} from '@/utils/chord-html';

interface ChordSheetViewerProps {
  chordSheet: ChordSheet;
  content: string;
  onSave?: (content: string) => void;
  isLoading?: boolean;
  showControlsBar?: boolean;
  onViewModeChange?: (viewMode: string) => void;
  initialViewMode?: string;
}

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
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4" />
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

function ChordSheetContent({ html, fontFamily }: { html: string; fontFamily: string | undefined }) {
  return (
    <pre
      className="font-inherit whitespace-pre-wrap break-words"
      style={{ fontFamily: fontFamily ?? 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const ChordSheetViewer = forwardRef<HTMLDivElement, ChordSheetViewerProps>(({ chordSheet, content, onSave, isLoading, showControlsBar = true, onViewModeChange, initialViewMode }, ref) => {

  const {
    autoScroll,
    scrollSpeed,
    setScrollSpeed,
    toggleAutoScroll
  } = useAutoScroll();

  const {
    transpose,
    setTranspose,
    defaultTranspose,
    capo,
    setCapo,
    defaultCapo,
    fontSize,
    setFontSize,
    fontStyle,
    setFontStyle,
    viewMode,
    setViewMode,
    hideGuitarTabs,
    setHideGuitarTabs,
    capoTransposeLinked,
    setCapoTransposeLinked,
  } = useChordDisplaySettings(content, chordSheet.songKey, chordSheet.guitarCapo, initialViewMode);

  const {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    updateEditContent,
    handleSaveEdits: saveEdits
  } = useChordEditor(content, onSave);

  useEffect(() => {
    updateEditContent(content);
  }, [content, updateEditContent]);

  useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);

  const handleSaveEdits = () => {
    saveEdits();
  };

  const handleDownload = () => {
    const result = downloadTextFile(content, chordSheet.title || 'chord-sheet');
    toast(result);
  };

  const { containerRef, maxCols } = useContainerColumns(chordSheet.rawHtml);
  const fontFamily = FONT_FAMILY[fontStyle];
  const sourceHtml = chordSheet.rawHtml ?? (chordSheet.songChords ? songChordsToRawHtml(chordSheet.songChords) : undefined);
  const processedHtml = sourceHtml ? processHtml(sourceHtml, viewMode, maxCols) : undefined;

  if (isEditing) {
    return (
      <ChordEdit
        editContent={editContent}
        setEditContent={setEditContent}
        handleSaveEdits={handleSaveEdits}
        setIsEditing={setIsEditing}
      />
    );
  }

  return (
    <div ref={ref} id="chord-sheet-viewer" {...cyAttr('chord-display')}>
      <div
        ref={containerRef}
        className="[font-size:var(--content-font-size,14px)] bg-card mb-4 px-4 py-6 sm:px-6 rounded-lg shadow-xs border"
        style={{ '--content-font-size': `${fontSize}px`, fontFamily } as React.CSSProperties}
      >
        {isLoading ? <ChordLoadingState /> : processedHtml ? <ChordSheetContent html={processedHtml} fontFamily={fontFamily} /> : <ChordEmptyState />}
      </div>
      {showControlsBar && (
        <StickyControlsBar
          transpose={transpose}
          setTranspose={setTranspose}
          defaultTranspose={defaultTranspose}
          songKey={chordSheet.songKey}
          capo={capo}
          setCapo={setCapo}
          defaultCapo={defaultCapo}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontStyle={fontStyle}
          setFontStyle={setFontStyle}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hideGuitarTabs={hideGuitarTabs}
          setHideGuitarTabs={setHideGuitarTabs}
          autoScroll={autoScroll}
          setAutoScroll={toggleAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          capoTransposeLinked={capoTransposeLinked}
          setCapoTransposeLinked={setCapoTransposeLinked}
          setIsEditing={setIsEditing}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
});

ChordSheetViewer.displayName = 'ChordSheetViewer';

export default ChordSheetViewer;
