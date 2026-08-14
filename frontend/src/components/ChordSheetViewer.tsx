import { forwardRef, useEffect, useMemo, useState } from 'react';
import './ChordDisplay/chord-display.css';
import type { ChordSheet, SongMetadata } from '@/types/chordSheet';
import { toast } from 'sonner';
import ChordSheetContent from './ChordDisplay/ChordSheetContent';
import StickyControlsBar from './ChordDisplay/components/StickyControlsBar';
import ChordEdit from './ChordDisplay/ChordEdit';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChordDisplaySettings } from '@/hooks/use-chord-display-settings';
import { useChordEditor } from '@/hooks/use-chord-editor';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { downloadTextFile } from '@/utils/download-utils';
import { interleaveTranslation } from '@/utils/interleave-translation';
import { cyAttr } from '@/utils/test-utils';

const CHORD_SHEET_VIEWER_ID = 'chord-sheet-viewer';

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
  /** The words and their translation, when both are available to show at once. */
  lyricsSplit?: { original: string; translated: string };
  // When provided by a parent, editing state is controlled externally
  isEditing?: boolean;
  setIsEditing?: (v: boolean) => void;
  editContent?: string;
  setEditContent?: (v: string) => void;
  handleSaveEdits?: () => void;
}

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
  lyricsSplit,
  isEditing: externalIsEditing,
  setIsEditing: externalSetIsEditing,
  editContent: externalEditContent,
  setEditContent: externalSetEditContent,
  handleSaveEdits: externalHandleSaveEdits,
}, ref) => {

  const {
    autoScroll,
    scrollSpeed,
    setScrollSpeed,
    toggleAutoScroll
  } = useAutoScroll();

  const { isFullscreen, toggleFullscreen } = useFullscreen(CHORD_SHEET_VIEWER_ID);
  const [interleaveRequested, setInterleaveRequested] = useState(false);

  const canInterleave = isFullscreen && !!lyricsSplit;
  const isInterleaved = canInterleave && interleaveRequested;

  const interleavedHtml = useMemo(
    () => (isInterleaved && lyricsSplit ? interleaveTranslation(lyricsSplit.original, lyricsSplit.translated) : undefined),
    [isInterleaved, lyricsSplit]
  );

  const {
    fontSize: internalFontSize,
    fontStyle,
    viewMode: internalViewMode,
    setViewMode,
  } = useChordDisplaySettings(content, chordSheet.songKey, chordSheet.guitarCapo, initialViewMode);

  const fontSize = externalFontSize ?? internalFontSize;
  const viewMode = externalViewMode ?? internalViewMode;
  const effectiveTranspose = externalEffectiveTranspose ?? 0;

  const internal = useChordEditor(content, onSave);

  useEffect(() => {
    internal.updateEditContent(content);
  }, [content, internal.updateEditContent]);

  useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);

  const isEditing = externalIsEditing ?? internal.isEditing;
  const setIsEditing = externalSetIsEditing ?? internal.setIsEditing;
  const editContent = externalEditContent ?? internal.editContent;
  const setEditContent = externalSetEditContent ?? internal.setEditContent;
  const handleSaveEdits = externalHandleSaveEdits ?? internal.handleSaveEdits;

  const handleDownload = () => {
    const result = downloadTextFile(content, chordSheet.title || 'chord-sheet');
    toast.success(result.title, { description: result.description });
  };

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
    <div ref={ref} id={CHORD_SHEET_VIEWER_ID} {...cyAttr('chord-display')}>
      <ChordSheetContent
        rawHtml={interleavedHtml ?? chordSheet.rawHtml}
        songChords={interleavedHtml ? undefined : chordSheet.songChords}
        fontSize={fontSize}
        fontStyle={fontStyle}
        viewMode={viewMode}
        transpose={effectiveTranspose}
        isLoading={isLoading}
        // Short words would otherwise sit in a card a fraction of the screen tall.
        // Growing is inert until fullscreen, which is the only place the viewer is a
        // column with height to spare.
        className="grow"
      />
      {showControlsBar && (
        <StickyControlsBar
          autoScroll={autoScroll}
          setAutoScroll={toggleAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          handleDownload={handleDownload}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          canInterleave={canInterleave}
          isInterleaved={isInterleaved}
          onToggleInterleave={() => setInterleaveRequested((s) => !s)}
        />
      )}
    </div>
  );
});

ChordSheetViewer.displayName = 'ChordSheetViewer';

export default ChordSheetViewer;
