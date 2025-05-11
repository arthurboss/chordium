import { useState, useEffect, useRef, forwardRef } from 'react';
import { toast } from "@/hooks/use-toast";
import ChordContent from './ChordDisplay/ChordContent';
import ChordSheetControls from './ChordDisplay/ChordSheetControls';
import ChordEdit from './ChordDisplay/ChordEdit';
import { renderChord } from './ChordDisplay/chord-tooltip-utils.tsx';
import { 
  DEFAULT_SCROLL_SPEED, 
  handleAutoScrollToggle as toggleAutoScroll,
  performAutoScroll,
  AutoScrollRefs
} from '@/utils/auto-scroll-utils';
import { 
  processContent, 
  getTransposeOptions,
  ChordSection
} from '@/utils/chord-sheet-utils';

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
  onSave?: (content: string) => void;
}

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ title, artist, content, onSave }, ref) => {

  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<string>(content);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(DEFAULT_SCROLL_SPEED);
  const scrollTimerRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef<number>(0);
  
  // Update edit content when content prop changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);
  
  // Handle auto-scrolling for the whole page
  useEffect(() => {
    if (autoScroll) {
      // Create refs object to pass to utility function
      const refs: AutoScrollRefs = {
        scrollTimerRef,
        lastScrollTimeRef,
        accumulatedScrollRef
      };
      
      // Use the utility function to perform auto-scroll
      return performAutoScroll(
        scrollSpeed,
        refs,
        setAutoScroll,
        setScrollSpeed
      );
    }
  }, [autoScroll, scrollSpeed]);
  
  // Process the content with imported utility function
  const processedContent = processContent(content, transpose);
  
  // Generate options for the transpose selector
  const transposeOptions = getTransposeOptions();
  
  // Handle saving edits
  const handleSaveEdits = () => {
    if (onSave) {
      onSave(editContent);
    }
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your chord sheet has been updated"
    });
  };
  
  // Handle download of chord sheet
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title || "chord-sheet"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your chord sheet is being downloaded"
    });
  };
  
  // Enhanced auto-scroll toggle logic
  const handleAutoScrollToggle = (enable?: boolean) => {
    toggleAutoScroll(enable, autoScroll, setAutoScroll);
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
    <div ref={ref} id="chord-display">
      {/* Song header */}
      {(title || artist) && (
        <div className="mb-4 text-center">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {artist && <p className="text-muted-foreground">{artist}</p>}
        </div>
      )}
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
        setAutoScroll={handleAutoScrollToggle}
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
