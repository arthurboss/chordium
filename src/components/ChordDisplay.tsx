import { useState, useEffect, useRef } from 'react';
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

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
  onSave?: (content: string) => void;
}

// Enhanced chord regex pattern for better recognition
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

const ChordDisplay = ({ title, artist, content, onSave }: ChordDisplayProps) => {
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
  
  // Update edit content when content prop changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);
  
  // Handle auto-scrolling for the whole page
  useEffect(() => {
    if (autoScroll) {
      const scrollAmount = scrollSpeed * 0.5; // Adjust this multiplier as needed
      
      const doScroll = () => {
        window.scrollBy(0, scrollAmount);
        scrollTimerRef.current = window.setTimeout(doScroll, 100);
      };
      
      scrollTimerRef.current = window.setTimeout(doScroll, 100);
      
      return () => {
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
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
      <div className="w-full max-w-3xl mx-auto">
        <Card className="mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Chord Sheet</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSaveEdits}
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Textarea 
          value={editContent} 
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
        />
      </div>
    );
  }
  
  return (
    <div>
      <div className="w-full max-w-3xl mx-auto">
        {/* Song header */}
        {(title || artist) && (
          <div className="mb-4 text-center">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {artist && <p className="text-muted-foreground">{artist}</p>}
          </div>
        )}
        
        {/* Chord content - Now directly in the main container with improved mobile handling */}
        <div 
          className="bg-white mb-4 p-4 sm:p-6 rounded-lg shadow-sm border"
          style={{ fontSize: `${fontSize}px` }}
          data-testid="chord-content"
        >
          {processedContent.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <h2 className="section-header">{section.title}</h2>
              )}
              
              <div className="mb-5">
                {section.lines.map((line, lineIndex) => {
                  // Hide tabs if hideGuitarTabs is true
                  if (line.type === 'tab' && hideGuitarTabs) {
                    return null;
                  }
                  
                  // Apply view mode filters
                  if (viewMode === "lyrics-only" && (line.type === 'chord' || line.type === 'tab')) {
                    return null;
                  }
                  
                  if (viewMode === "chords-only" && line.type === 'lyrics') {
                    return null;
                  }
                  
                  if (line.type === 'tab') {
                    return (
                      <pre key={lineIndex} className="font-mono text-xs overflow-x-auto whitespace-pre mb-1 break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                        {line.content}
                      </pre>
                    );
                  } else if (line.type === 'chord') {
                    // Replace chord patterns with interactive chord elements
                    let lastIndex = 0;
                    const parts = [];
                    let match;
                    
                    // Create a new RegExp object each time to reset lastIndex
                    const chordRegexGlobal = new RegExp(CHORD_REGEX);
                    
                    // Find all chord matches and split the line into chord and non-chord parts
                    while ((match = chordRegexGlobal.exec(line.content)) !== null) {
                      // Add the text before the chord
                      if (match.index > lastIndex) {
                        parts.push(line.content.substring(lastIndex, match.index));
                      }
                      
                      // Add the chord with tooltip/popover
                      parts.push(renderChord(match[0]));
                      
                      lastIndex = match.index + match[0].length;
                    }
                    
                    // Add any remaining text after the last chord
                    if (lastIndex < line.content.length) {
                      parts.push(line.content.substring(lastIndex));
                    }
                    
                    return (
                      <div key={lineIndex} className="chord-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                        {parts.length > 0 ? parts : line.content}
                      </div>
                    );
                  } else if (line.type === 'lyrics') {
                    return (
                      <div key={lineIndex} className="lyrics-line break-words" style={{overflowWrap: 'break-word', maxWidth: '100%'}}>
                        {line.content}
                      </div>
                    );
                  } else {
                    // Empty line
                    return <div key={lineIndex} className="h-4" />;
                  }
                })}
              </div>
            </div>
          ))}
          
          {processedContent.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No chord content to display
            </div>
          )}
        </div>
        {/* Chord sheet controls - Mobile optimized */}
        <Card className="sticky bottom-0 mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-3">
              {/* Top row - transpose, font size, view mode and actions */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Music size={18} className="text-chord" />
                  <span className="font-medium text-sm sm:text-base hidden sm:inline">Transpose:</span>
                  <Select 
                    value={transpose.toString()} 
                    onValueChange={(value) => setTranspose(parseInt(value))}
                  >
                    <SelectTrigger className="w-[70px] sm:w-[100px] h-8 sm:h-10">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {transposeOptions.map(value => (
                        <SelectItem key={value} value={value.toString()}>
                          {value > 0 ? `+${value}` : value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    disabled={fontSize <= 12}
                  >
                    <ChevronDown size={14} />
                  </Button>
                  <span className="w-10 text-center text-sm">{fontSize}px</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    disabled={fontSize >= 24}
                  >
                    <ChevronUp size={14} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 sm:h-10 gap-1">
                        <Menu size={16} />
                        <span className="hidden sm:inline">View Mode</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Display Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setViewMode("normal")}
                        className={viewMode === "normal" ? "bg-accent text-accent-foreground" : ""}
                      >
                        Normal
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setViewMode("chords-only")}
                        className={viewMode === "chords-only" ? "bg-accent text-accent-foreground" : ""}
                      >
                        Chords Only
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setViewMode("lyrics-only")}
                        className={viewMode === "lyrics-only" ? "bg-accent text-accent-foreground" : ""}
                      >
                        Lyrics Only
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setHideGuitarTabs(!hideGuitarTabs)}
                        className={hideGuitarTabs ? "bg-accent text-accent-foreground" : ""}
                      >
                        {hideGuitarTabs ? "Show Guitar Tabs" : "Hide Guitar Tabs"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAutoScroll(!autoScroll)}
                    title={autoScroll ? "Stop Auto-Scroll" : "Start Auto-Scroll"}
                    data-testid="auto-scroll-toggle"
                  >
                    {autoScroll ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 sm:h-10">
                        <span className="mr-1">•••</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Auto-scroll speed control */}
              {autoScroll && (
                <div className="flex items-center gap-3 pt-2" data-testid="scroll-speed-control">
                  <span className="text-sm font-medium w-20">Speed: {scrollSpeed}</span>
                  <Slider
                    value={[scrollSpeed]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setScrollSpeed(value[0])}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChordDisplay;

