import { forwardRef, useEffect } from 'react';
import type { ChordSheet } from '@/types/chordSheet';
import { toast } from "@/hooks/use-toast";
import ChordContent from './ChordDisplay/ChordContent';
import ChordSheetControls from './ChordDisplay/ChordSheetControls';
import ChordEdit from './ChordDisplay/ChordEdit';
import ChordHeader from './ChordDisplay/ChordHeader';
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
}

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ chordSheet, content, onSave }, ref) => {
  
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
    processedContent,
    transposeOptions
  } = useChordDisplaySettings(content);
  
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
      <ChordHeader 
        title={chordSheet.title}
        artist={chordSheet.artist}
        songKey={chordSheet.songKey}
        tuning={Array.isArray(chordSheet.guitarTuning) ? chordSheet.guitarTuning.join('-') : chordSheet.guitarTuning}
        capo={chordSheet.guitarCapo !== undefined ? chordSheet.guitarCapo.toString() : undefined}
      />
      <ChordContent
        processedContent={processedContent}
        fontSize={fontSize}
        fontSpacing={fontSpacing}
        fontStyle={fontStyle}
        viewMode={viewMode}
        hideGuitarTabs={hideGuitarTabs}
        renderChord={renderChord}
      />
      <ChordSheetControls
        transpose={transpose}
        setTranspose={setTranspose}
        transposeOptions={transposeOptions}
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
        setIsEditing={setIsEditing}
        handleDownload={handleDownload}
      />
    </div>
  );
});

ChordDisplay.displayName = 'ChordDisplay';

export default ChordDisplay;
