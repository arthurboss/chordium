import { useState, useEffect, useRef, forwardRef } from 'react';
import { ChevronUp, ChevronDown, Music, Download, Edit, Save, Play, Pause, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { transposeChord } from '@/utils/chordUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ChordDiagram from '@/components/ChordDiagram';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ChordSection } from './ChordDisplay/types';
import ChordContent from './ChordDisplay/ChordContent';
import ChordSheetControls from './ChordDisplay/ChordSheetControls';
import ChordEdit from './ChordDisplay/ChordEdit';
import { FOOTER_HEIGHT, updateLayoutHeights } from '@/utils/layout';

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
  onSave?: (content: string) => void;
}

// Enhanced chord regex pattern for better recognition
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ title, artist, content, onSave }, ref) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const isMobile = useIsMobile();
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
      // Ensure FOOTER_HEIGHT is up to date
      updateLayoutHeights();
      const baseScrollAmount = scrollSpeed * 0.32; // Reduced from 0.4 to 0.32 (another 20% slower)
      const targetFPS = 60; // Target frames per second
      const frameTime = 1000 / targetFPS; // Target time per frame in ms
      
      const doScroll = (timestamp: number) => {
        if (!lastScrollTimeRef.current) {
          lastScrollTimeRef.current = timestamp;
        }
        const elapsed = timestamp - lastScrollTimeRef.current;
        // Calculate how many frames worth of scrolling we need to do
        accumulatedScrollRef.current += (elapsed / frameTime) * baseScrollAmount;
        const scrollAmount = Math.floor(accumulatedScrollRef.current);
        accumulatedScrollRef.current -= scrollAmount;
        if (scrollAmount > 0) {
          window.scrollBy({ top: scrollAmount, behavior: 'auto' });
        }
        lastScrollTimeRef.current = timestamp;
        // PAUSE auto-scroll if within FOOTER_HEIGHT of page bottom
        const scrollBottom = window.innerHeight + window.scrollY;
        const limit = document.body.offsetHeight - FOOTER_HEIGHT;
        if (scrollBottom >= limit - 1) {
          setAutoScroll(false);
          return;
        }
        scrollTimerRef.current = requestAnimationFrame(doScroll);
      };
      
      scrollTimerRef.current = requestAnimationFrame(doScroll);
      
      return () => {
        if (scrollTimerRef.current) {
          cancelAnimationFrame(scrollTimerRef.current);
        }
        lastScrollTimeRef.current = 0;
        accumulatedScrollRef.current = 0;
      };
    }
  }, [autoScroll, scrollSpeed]);
  
  // Process the chord content into sections and lines with chords highlighted
  const processContent = (rawContent: string) => {
    if (!rawContent) return [{ type: 'section', title: '', lines: [] }];
    
    const lines = rawContent.split('\n');
    const sections = [];
    let currentSection = { type: 'section', title: '', lines: [] };
    
    for (let line of lines) {
      // Detect section headers (e.g., [Chorus], [Verse], etc.)
      if (line.match(/^\[.*\]$/)) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { 
          type: 'section', 
          title: line.replace(/[\[\]]/g, ''), 
          lines: [] 
        };
      } else {
        // Process chord lines and guitar tabs
        if (line.trim() === '') {
          // Add empty line
          currentSection.lines.push({ type: 'empty', content: ' ' });
        } else {
          // Detect if this is a guitar tab line (contains |----|, e|---, etc.)
          const isTabLine = line.includes('|--') || 
                           line.includes('-|') || 
                           line.match(/^[eADGBE]\|/) || 
                           line.match(/^\|/) ||
                           line.match(/^\s*\d+\s*$/) || // Numbers only (fret markers)
                           line.match(/^[eADGBE]:/) || 
                           line.trim().length > 0 && line.trim().split('').every(c => 
                             ['-', '|', '/', '\\', '.', 'h', 'p', 'b', 'r', 's', 't', '(', ')', 
                              '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '\t'].includes(c));
  
          // Chord line detection - has chord patterns
          const hasChordPattern = line.match(CHORD_REGEX);
          const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
          
          if (isTabLine) {
            currentSection.lines.push({ type: 'tab', content: line });
          } else if ((nonSpaceRatio < 0.5 && hasChordPattern) || 
                    (line.length < 30 && hasChordPattern && line.split(CHORD_REGEX).filter(Boolean).every(s => s.trim() === ''))) {
            // Replace chords with transposed versions if needed
            if (transpose !== 0) {
              // Find chord patterns and transpose them
              line = line.replace(CHORD_REGEX, match => transposeChord(match, transpose));
            }
            
            currentSection.lines.push({ type: 'chord', content: line });
          } else {
            currentSection.lines.push({ type: 'lyrics', content: line });
          }
        }
      }
    }
    
    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };
  
  const processedContent = processContent(content);
  
  // Generate options for the transpose selector
  const transposeOptions = Array.from({ length: 25 }, (_, i) => i - 12);
  
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
  
  // Render a chord with tooltip or popover based on device type
  const renderChord = (chord: string) => {
    const chordName = chord.trim();
    
    if (isMobile) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <span className="chord cursor-pointer">
              {chordName}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <ChordDiagram chordName={chordName} />
          </PopoverContent>
        </Popover>
      );
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="chord cursor-pointer">
                {chordName}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-0 bg-background border">
              <ChordDiagram chordName={chordName} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
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
      <div className="w-full max-w-3xl mx-auto">
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
          viewMode={viewMode}
          setViewMode={setViewMode}
          hideGuitarTabs={hideGuitarTabs}
          setHideGuitarTabs={setHideGuitarTabs}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          setIsEditing={setIsEditing}
          handleDownload={handleDownload}
        />
      </div>
    </div>
  );
});

ChordDisplay.displayName = 'ChordDisplay';

export default ChordDisplay;
