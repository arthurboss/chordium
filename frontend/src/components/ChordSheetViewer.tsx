import { forwardRef, useEffect } from 'react';
import './ChordDisplay/chord-text.css';
import './ChordDisplay/chord-tab.css';
import type { ChordSheet, SongMetadata } from '@/types/chordSheet';
import { toast } from 'sonner';
import ChordSheetContent from './ChordDisplay/ChordSheetContent';
import StickyControlsBar from './ChordDisplay/components/StickyControlsBar';
import ChordEdit from './ChordDisplay/ChordEdit';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChordDisplaySettings } from '@/hooks/use-chord-display-settings';
import { useChordEditor } from '@/hooks/use-chord-editor';
import { downloadTextFile } from '@/utils/download-utils';
import { cyAttr } from '@/utils/test-utils';

interface ChordSheetViewerProps {
  chordSheet: ChordSheet & SongMetadata;
  content: string;
  onSave?: (content: string) => void;
  isLoading?: boolean;
  showControlsBar?: boolean;
  onViewModeChange?: (viewMode: string) => void;
  initialViewMode?: string;
  effectiveTranspose?: number;
  fontSize?: number;
  viewMode?: string;
}

/**
 * Orchestrates the full chord sheet viewing experience.
 *
 * When `effectiveTranspose` is provided by a parent (e.g. SongViewer), the
 * internal capo/transpose state is unused. Otherwise falls back to the internal
 * state for standalone usage (e.g. UploadTab).
 *
 * The forwarded ref points to the root `#chord-sheet-viewer` div, which parent
 * components (e.g. auto-scroll) use to measure scroll position.
 */
const ChordSheetViewer = forwardRef<HTMLDivElement, ChordSheetViewerProps>(({
  chordSheet,
  content,
  onSave,
  isLoading,
  showControlsBar = true,
  onViewModeChange,
  initialViewMode,
  effectiveTranspose: externalEffectiveTranspose,
  fontSize: externalFontSize,
  viewMode: externalViewMode,
}, ref) => {

  const {
    autoScroll,
    scrollSpeed,
    setScrollSpeed,
    toggleAutoScroll
  } = useAutoScroll();

  const {
    fontSize: internalFontSize,
    fontStyle,
    viewMode: internalViewMode,
    setViewMode,
  } = useChordDisplaySettings(content, chordSheet.songKey, chordSheet.guitarCapo, initialViewMode);

  const fontSize = externalFontSize ?? internalFontSize;
  const viewMode = externalViewMode ?? internalViewMode;
  const effectiveTranspose = externalEffectiveTranspose ?? 0;

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

  const handleDownload = () => {
    const result = downloadTextFile(content, chordSheet.title || 'chord-sheet');
    toast.success(result.title, { description: result.description });
  };

  if (isEditing) {
    return (
      <ChordEdit
        editContent={editContent}
        setEditContent={setEditContent}
        handleSaveEdits={saveEdits}
        setIsEditing={setIsEditing}
      />
    );
  }

  return (
    <div ref={ref} id="chord-sheet-viewer" {...cyAttr('chord-display')}>
      <ChordSheetContent
        rawHtml={chordSheet.rawHtml}
        songChords={chordSheet.songChords}
        fontSize={fontSize}
        fontStyle={fontStyle}
        viewMode={viewMode}
        transpose={effectiveTranspose}
        isLoading={isLoading}
      />
      {showControlsBar && (
        <StickyControlsBar
          autoScroll={autoScroll}
          setAutoScroll={toggleAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          setIsEditing={setIsEditing}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
});

ChordSheetViewer.displayName = 'ChordSheetViewer';

export default ChordSheetViewer;
