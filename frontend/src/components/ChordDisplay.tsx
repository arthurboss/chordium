import { forwardRef, useEffect } from 'react';
import type { ChordSheet } from '@/types/chordSheet';
import { toast } from "@/hooks/use-toast";
import ChordContent from './ChordDisplay/ChordContent';
import StickyControlsBar from './ChordDisplay/components/StickyControlsBar';
import ChordEdit from './ChordDisplay/ChordEdit';
import { renderChord } from './ChordDisplay/chord-tooltip-utils.tsx';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChordDisplaySettings } from '@/hooks/use-chord-display-settings';
import { useChordEditor } from '@/hooks/use-chord-editor';
import { downloadTextFile } from '@/utils/download-utils';
import { cyAttr } from '@/utils/test-utils';

interface ChordDisplayProps {
  chordSheet: ChordSheet;
  content: string;
  onSave?: (content: string) => void;
  isLoading?: boolean;
  showControlsBar?: boolean;
}

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ chordSheet, content, onSave, isLoading, showControlsBar = true }, ref) => {

  // Use custom hooks for different concerns
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
    fontSpacing,
    setFontSpacing,
    fontStyle,
    setFontStyle,
    viewMode,
    setViewMode,
    hideGuitarTabs,
    setHideGuitarTabs,
    capoTransposeLinked,
    setCapoTransposeLinked,
    processedContent
  } = useChordDisplaySettings(content, chordSheet.songKey, chordSheet.guitarCapo);

  const {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    updateEditContent,
    handleSaveEdits: saveEdits
  } = useChordEditor(content, onSave);

  // Update edit content when content prop changes
  useEffect(() => {
    updateEditContent(content);
  }, [content, updateEditContent]);

  // Handle saving edits (with toast notification)
  const handleSaveEdits = () => {
    saveEdits();
  };

  // Handle download of chord sheet
  const handleDownload = () => {
    const result = downloadTextFile(content, chordSheet.title || "chord-sheet");
    toast(result);
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
    <div ref={ref} id="chord-display" {...cyAttr('chord-display')}>
      <ChordContent
        processedContent={processedContent}
        fontSize={fontSize}
        fontSpacing={fontSpacing}
        fontStyle={fontStyle}
        viewMode={viewMode}
        hideGuitarTabs={hideGuitarTabs}
        renderChord={renderChord}
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
          fontSpacing={fontSpacing}
          setFontSpacing={setFontSpacing}
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

ChordDisplay.displayName = 'ChordDisplay';

export default ChordDisplay;
