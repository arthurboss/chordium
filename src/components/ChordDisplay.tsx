import { useState, useEffect, useRef, forwardRef } from 'react';
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
import { toast } from "@/hooks/use-toast";
import ChordContent from './ChordDisplay/ChordContent';
import ChordSheetControls from './ChordDisplay/ChordSheetControls';
import ChordEdit from './ChordDisplay/ChordEdit';
import { FOOTER_HEIGHT, NAVBAR_HEIGHT, updateLayoutHeights } from '@/utils/layout';

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
  onSave?: (content: string) => void;
}

// Enhanced chord regex pattern for better recognition
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

const DEFAULT_SCROLL_SPEED = 3;

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ title, artist, content, onSave }, ref) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontSpacing, setFontSpacing] = useState(0);
  const [fontStyle, setFontStyle] = useState('');
  const [viewMode, setViewMode] = useState("normal"); // "normal", "chords-only", "lyrics-only"
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(DEFAULT_SCROLL_SPEED);
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
      const mainEl = document.getElementById('chord-display');
      if (mainEl) {
        const mainBottom = mainEl.offsetTop + mainEl.offsetHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        // If we're at or past the bottom, scroll to the top of the header/title (if present), else main element
        if (viewportBottom >= mainBottom - 2) {
          let scrollTarget = mainEl.offsetTop;
          const headerEl = document.querySelector('#chord-display .mb-4');
          if (headerEl) {
            // Scroll to the header/title if it exists
            let navbarOffset = 0;
            try {
              // Use NAVBAR_HEIGHT from utils/layout
              // (updateLayoutHeights should have run just before this)
              // If not available, fallback to measuring the header
              if (typeof NAVBAR_HEIGHT === 'number' && NAVBAR_HEIGHT > 0) {
                navbarOffset = NAVBAR_HEIGHT;
              } else {
                const nav = document.querySelector('header');
                if (nav) navbarOffset = nav.getBoundingClientRect().height;
              }
            } catch {}
            scrollTarget = headerEl.getBoundingClientRect().top + window.scrollY - navbarOffset - 8; // 8px buffer for aesthetics
          }
          window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          // Wait for scroll to reach the top, then start auto-scroll
          let rafId: number;
          const waitForTop = () => {
            // Allow a small margin for floating point errors
            if (Math.abs(window.scrollY - scrollTarget) < 2) {
              startAutoScroll();
            } else {
              rafId = requestAnimationFrame(waitForTop);
            }
          };
          const startAutoScroll = () => {
            updateLayoutHeights();
            const baseScrollAmount = scrollSpeed * 0.32;
            const targetFPS = 60;
            const frameTime = 1000 / targetFPS;
            const doScroll = (timestamp: number) => {
              if (!lastScrollTimeRef.current) {
                lastScrollTimeRef.current = timestamp;
              }
              const elapsed = timestamp - lastScrollTimeRef.current;
              accumulatedScrollRef.current += (elapsed / frameTime) * baseScrollAmount;
              const scrollAmount = Math.floor(accumulatedScrollRef.current);
              accumulatedScrollRef.current -= scrollAmount;
              if (scrollAmount > 0) {
                window.scrollBy({ top: scrollAmount, behavior: 'auto' });
              }
              lastScrollTimeRef.current = timestamp;
              const scrollBottom = window.innerHeight + window.scrollY;
              const limit = document.body.offsetHeight - FOOTER_HEIGHT;
              if (scrollBottom >= limit - 1) {
                setAutoScroll(false);
                setScrollSpeed(DEFAULT_SCROLL_SPEED);
                return;
              }
              scrollTimerRef.current = requestAnimationFrame(doScroll);
            };
            scrollTimerRef.current = requestAnimationFrame(doScroll);
          };
          rafId = requestAnimationFrame(waitForTop);
          // Cleanup for this special case
          return () => {
            cancelAnimationFrame(rafId);
            if (scrollTimerRef.current) {
              cancelAnimationFrame(scrollTimerRef.current);
            }
            lastScrollTimeRef.current = 0;
            accumulatedScrollRef.current = 0;
          };
        }
      }
      // If not at the bottom, start auto-scroll immediately
      updateLayoutHeights();
      const baseScrollAmount = scrollSpeed * 0.32;
      const targetFPS = 60;
      const frameTime = 1000 / targetFPS;
      const doScroll = (timestamp: number) => {
        if (!lastScrollTimeRef.current) {
          lastScrollTimeRef.current = timestamp;
        }
        const elapsed = timestamp - lastScrollTimeRef.current;
        accumulatedScrollRef.current += (elapsed / frameTime) * baseScrollAmount;
        const scrollAmount = Math.floor(accumulatedScrollRef.current);
        accumulatedScrollRef.current -= scrollAmount;
        if (scrollAmount > 0) {
          window.scrollBy({ top: scrollAmount, behavior: 'auto' });
        }
        lastScrollTimeRef.current = timestamp;
        const scrollBottom = window.innerHeight + window.scrollY;
        const limit = document.body.offsetHeight - FOOTER_HEIGHT;
        if (scrollBottom >= limit - 1) {
          setAutoScroll(false);
          setScrollSpeed(DEFAULT_SCROLL_SPEED);
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
  
  // Helper to get the title/artist element
  const getTitleArtistElement = () => {
    return document.querySelector('#chord-display .mb-4');
  };

  // Enhanced auto-scroll toggle logic
  const handleAutoScrollToggle = (enable?: boolean) => {
    const shouldEnable = enable !== undefined ? enable : !autoScroll;
    if (!shouldEnable) {
      setAutoScroll(false);
      return;
    }
    const headerEl = getTitleArtistElement();
    if (headerEl) {
      const navbar = document.querySelector('header');
      let navbarOffset = 0;
      if (navbar) navbarOffset = navbar.getBoundingClientRect().height;
      const targetTop = headerEl.getBoundingClientRect().top + window.scrollY - navbarOffset - 8; // 8px buffer
      // If viewport is above the title/artist
      if (window.scrollY + 10 < targetTop) {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        // Wait for scroll to finish before enabling auto-scroll
        let rafId;
        const waitForScroll = () => {
          if (Math.abs(window.scrollY - targetTop) < 2) {
            setAutoScroll(true);
          } else {
            rafId = requestAnimationFrame(waitForScroll);
          }
        };
        waitForScroll();
        return;
      }
    }
    setAutoScroll(true);
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
          <PopoverContent className="w-auto p-4 bg-background border-2 border-chord shadow-lg">
            <div className="font-comic">
              <ChordDiagram chordName={chordName} />
            </div>
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
            <TooltipContent side="top" className="p-4 bg-background border-2 border-chord shadow-lg">
              <div className="font-comic">
                <ChordDiagram chordName={chordName} />
              </div>
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
    </div>
  );
});

ChordDisplay.displayName = 'ChordDisplay';

export default ChordDisplay;
