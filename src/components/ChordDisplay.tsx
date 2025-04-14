
import { useState } from 'react';
import { ChevronUp, ChevronDown, Music, Eye, EyeOff, AlignLeft, TabletSmartphone } from 'lucide-react';
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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
}

const ChordDisplay = ({ title, artist, content }: ChordDisplayProps) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [showChords, setShowChords] = useState(true);
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const [lyricsMode, setLyricsMode] = useState(false);
  const isMobile = useIsMobile();
  
  // Process the chord content into sections and lines with chords highlighted
  const processContent = (rawContent: string) => {
    if (!rawContent) return [{ type: 'section', title: 'No content', lines: [] }];
    
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
  
          // Chord line detection - has sparse content and contains chord patterns
          const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
          const hasChordPattern = line.match(/\b[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?\b/);
          
          if (isTabLine) {
            currentSection.lines.push({ type: 'tab', content: line });
          } else if (nonSpaceRatio < 0.3 && line.trim().length > 0 && hasChordPattern) {
            // Replace chords with transposed versions if needed
            if (transpose !== 0) {
              // Find chord patterns and transpose them
              line = line.replace(/\b[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?\b/g, 
                match => transposeChord(match, transpose));
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
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Song header */}
      {(title || artist) && (
        <div className="mb-4 text-center">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {artist && <p className="text-muted-foreground">{artist}</p>}
        </div>
      )}
      
      {/* Chord sheet controls - Mobile optimized */}
      <Card className="mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3">
            {/* Top row - transpose and font size */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Music size={18} className="text-chord" />
                <span className="font-medium text-sm sm:text-base">Transpose:</span>
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
            </div>
            
            {/* Bottom row - display toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ToggleGroup type="multiple" className="justify-center">
                <ToggleGroupItem 
                  value="showChords" 
                  aria-label={showChords ? "Hide chords" : "Show chords"}
                  className={`text-xs sm:text-sm flex items-center gap-1 ${!showChords ? 'bg-muted-foreground/20' : ''}`}
                  pressed={showChords}
                  onClick={() => setShowChords(!showChords)}
                >
                  <Music size={14} />
                  <span className="hidden sm:inline">Chords</span>
                </ToggleGroupItem>
                
                <ToggleGroupItem 
                  value="hideGuitarTabs" 
                  aria-label={hideGuitarTabs ? "Show tabs" : "Hide tabs"}
                  className={`text-xs sm:text-sm flex items-center gap-1 ${hideGuitarTabs ? 'bg-muted-foreground/20' : ''}`}
                  pressed={hideGuitarTabs}
                  onClick={() => setHideGuitarTabs(!hideGuitarTabs)}
                >
                  <TabletSmartphone size={14} />
                  <span className="hidden sm:inline">Guitar Tabs</span>
                </ToggleGroupItem>
                
                <ToggleGroupItem 
                  value="lyricsMode" 
                  aria-label={lyricsMode ? "Normal mode" : "Lyrics mode"}
                  className={`text-xs sm:text-sm flex items-center gap-1 ${lyricsMode ? 'bg-muted-foreground/20' : ''}`}
                  pressed={lyricsMode}
                  onClick={() => setLyricsMode(!lyricsMode)}
                >
                  <AlignLeft size={14} />
                  <span className="hidden sm:inline">Lyrics Mode</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Chord content */}
      <div 
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border"
        style={{ fontSize: `${fontSize}px` }}
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
                
                // Hide chords if lyricsMode is true
                if ((line.type === 'chord' || line.type === 'tab') && lyricsMode) {
                  return null;
                }
                
                // Hide chords if showChords is false but not in lyrics mode
                if (line.type === 'chord' && !showChords && !lyricsMode) {
                  return null;
                }
                
                if (line.type === 'tab') {
                  return (
                    <pre key={lineIndex} className="font-mono text-xs overflow-x-auto whitespace-pre mb-1">
                      {line.content}
                    </pre>
                  );
                } else if (line.type === 'chord' && showChords && !lyricsMode) {
                  // Replace chord patterns with interactive chord elements
                  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?)\b/g;
                  let lastIndex = 0;
                  const parts = [];
                  let match;
                  
                  // Find all chord matches and split the line into chord and non-chord parts
                  while ((match = chordRegex.exec(line.content)) !== null) {
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
                    <div key={lineIndex} className="chord-line">
                      {parts.length > 0 ? parts : line.content}
                    </div>
                  );
                } else if (line.type === 'lyrics') {
                  return (
                    <div key={lineIndex} className="lyrics-line">
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
    </div>
  );
};

export default ChordDisplay;
