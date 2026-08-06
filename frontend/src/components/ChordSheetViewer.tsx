import { forwardRef, useEffect } from 'react';
import './ChordDisplay/chord-display.css';
import type { ChordSheet, SongMetadata } from '@/types/chordSheet';
import { toast } from 'sonner';
import ChordSheetContent from './ChordDisplay/ChordSheetContent';
import { FONT_FAMILY } from './ChordDisplay/ChordSheetContent/chord-sheet-processing';
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
        fontSize={fontSize}
        fontFamily={FONT_FAMILY[fontStyle]}
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
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
});

ChordSheetViewer.displayName = 'ChordSheetViewer';

export default ChordSheetViewer;
