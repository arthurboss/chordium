
import { useState } from 'react';
import { ChevronUp, ChevronDown, Music, Eye, EyeOff } from 'lucide-react';
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

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
}

const ChordDisplay = ({ title, artist, content }: ChordDisplayProps) => {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [showChords, setShowChords] = useState(true);
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
        // Process chord lines
        // This is a simple heuristic: 
        // - Lines with more than 70% non-space characters are considered lyrics
        // - Lines with less than 30% non-space characters are considered chords
        // - For more accurate detection, a more complex algorithm would be needed
        
        if (line.trim() === '') {
          // Add empty line
          currentSection.lines.push({ type: 'empty', content: ' ' });
        } else {
          const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
          
          // Detect chord line (has sparse content, less than 30% non-space characters)
          if (nonSpaceRatio < 0.3 && line.trim().length > 0) {
            // Replace chords with transposed versions if needed
            if (transpose !== 0) {
              // Find chord patterns (single words with capital letters like C, Dm, G#m7)
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
        <div className="mb-6 text-center">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {artist && <p className="text-muted-foreground">{artist}</p>}
        </div>
      )}
      
      {/* Chord sheet controls */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap gap-4 justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <Music size={18} className="text-chord" />
            <span className="font-medium">Transpose:</span>
            <Select 
              value={transpose.toString()} 
              onValueChange={(value) => setTranspose(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
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
              size="sm"
              onClick={() => setShowChords(!showChords)}
              className="mr-2"
              aria-label={showChords ? "Hide chords" : "Show chords"}
            >
              {showChords ? (
                <>
                  <EyeOff size={16} className="mr-1" />
                  <span className="hidden sm:inline">Hide Chords</span>
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-1" />
                  <span className="hidden sm:inline">Show Chords</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              disabled={fontSize <= 12}
            >
              <ChevronDown size={16} />
            </Button>
            <span className="w-12 text-center">{fontSize}px</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              disabled={fontSize >= 24}
            >
              <ChevronUp size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Chord content */}
      <div 
        className="bg-white p-6 rounded-lg shadow-sm border"
        style={{ fontSize: `${fontSize}px` }}
      >
        {processedContent.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <h2 className="section-header">{section.title}</h2>
            )}
            
            <div className="mb-6">
              {section.lines.map((line, lineIndex) => {
                if (line.type === 'chord' && showChords) {
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
                } else if (line.type === 'chord' && !showChords) {
                  // Don't render chord lines when chords are hidden
                  return null;
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
