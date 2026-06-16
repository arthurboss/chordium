import { forwardRef, useEffect } from 'react';
import './ChordDisplay/chord-display.css';
import type { ChordSheet, SongMetadata } from '@/types/chordSheet';
import { toast } from '@/hooks/use-toast';
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
}

/**
 * Orchestrates the full chord sheet viewing experience.
 *
 * Owns all playback/display state (transpose, capo, font, auto-scroll, edit mode)
 * via custom hooks and passes derived props down to `ChordSheetContent` and
 * `StickyControlsBar`. Switches to `ChordEdit` when the user enters edit mode.
 *
 * The forwarded ref points to the root `#chord-sheet-viewer` div, which parent
 * components (e.g. auto-scroll) use to measure scroll position.
 */
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

  const handleDownload = () => {
    const result = downloadTextFile(content, chordSheet.title || 'chord-sheet');
    toast(result);
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
        isLoading={isLoading}
      />
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
