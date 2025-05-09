import React, { useState, useRef, useEffect } from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Save, ArrowLeft, Maximize2, Minimize2, Eye, Edit2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import ChordContent from './ChordContent';
import ChordDiagram from '../ChordDiagram';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { transposeChord } from '@/utils/chordUtils';
import { useIsMobile } from '@/hooks/use-mobile';

import { MarkdownDialog } from '../ui/markdown-dialog';

// Import the MDX files directly as components
import Sections from '../../assets/guides/sections.mdx';
import ChordNotation from '../../assets/guides/chord-notation.mdx';
import Example from '../../assets/guides/example.mdx';
import Tips from '../../assets/guides/tips.mdx';

// For chord detection in preview mode
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

const ChordEdit: React.FC<ChordEditProps> = ({
  editContent,
  setEditContent,
  handleSaveEdits,
  setIsEditing,
  onReturn
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontStyle, setFontStyle] = useState('');
  const [fontSpacing, setFontSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.0);
  const [viewMode, setViewMode] = useState('normal');
  const [hideGuitarTabs, setHideGuitarTabs] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const checkScroll = () => {
    if (contentRef.current) {
      // Use a small buffer to account for potential rounding or padding issues
      const { scrollHeight, clientHeight } = contentRef.current;
      const isScrollable = scrollHeight > clientHeight + 1;
      console.log('Scroll check:', {
        scrollHeight,
        clientHeight,
        difference: scrollHeight - clientHeight,
        isScrollable
      });

      // Force update to ensure scroll button visibility
      setShowScrollButton(isScrollable);
      return isScrollable;
    }
    return false;
  };

  // Process chord content into structured format for preview
  const processContent = (rawContent: string) => {
    if (!rawContent) return [{ type: 'section', title: '', lines: [] }];
    
    const lines = rawContent.split('\n');
    const sections = [];
    let currentSection = { type: 'section', title: '', lines: [] };
    
    for (const line of lines) {
      // Detect section headers (e.g., [Chorus], [Verse], etc.)
      if (line.match(/^\[.*\]$/)) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { 
          type: 'section', 
          title: line.replace(/[[\]]/g, ''),
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

  useEffect(() => {
    // Comprehensive scroll detection
    const performScrollCheck = () => {
      // Ensure content is fully rendered
      const checkScrollWithRetry = (retriesLeft = 5) => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          console.log('Scroll check retry:', {
            scrollHeight,
            clientHeight,
            difference: scrollHeight - clientHeight,
            retriesLeft
          });

          // Use a small buffer to account for potential rounding or padding issues
          const isScrollable = scrollHeight > clientHeight + 1;

          setShowScrollButton(isScrollable);

          if (!isScrollable && retriesLeft > 0) {
            setTimeout(() => checkScrollWithRetry(retriesLeft - 1), 300);
          }
        }
      };

      checkScrollWithRetry();
    };

    // Multiple methods to trigger scroll check
    performScrollCheck();
    const checkTimers = [
      setTimeout(performScrollCheck, 100),
      setTimeout(performScrollCheck, 300),
      setTimeout(performScrollCheck, 500),
      setTimeout(performScrollCheck, 1000)
    ];

    // Resize observer for dynamic content
    const resizeObserver = new ResizeObserver(() => {
      console.log('Resize detected, checking scroll');
      performScrollCheck();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      checkTimers.forEach(clearTimeout);
      resizeObserver.disconnect();
    };
  }, []);

  // Process content for preview
  const processedContent = processContent(editContent);

  return (
    <div className={`w-full mx-auto flex flex-col transition-all duration-200 ${isFullScreen ? 'fixed inset-0 bg-background z-50' : 'max-w-3xl h-[calc(100vh-12rem)]'}`}>
      <Card className={`mb-4 ${isFullScreen ? 'rounded-none' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{isPreviewMode ? 'Preview Sheet' : 'Edit Sheet'}</h2>

              <MarkdownDialog
                title='Chord Sheet Formatting Guide'
                trigger={
                  <Button variant="outline" size="sm" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center border">
                    ?
                  </Button>
                }
                mdxComponents={[
                  { title: 'Sections', component: Sections },
                  { title: 'Chords', component: ChordNotation },
                  { title: 'Example', component: Example },
                  { title: 'Tips', component: Tips }
                ]}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReturn}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                title={isPreviewMode ? "Switch to Edit" : "Switch to Preview"}
              >
                {isPreviewMode ? (
                  <Edit2 className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveEdits}>
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isPreviewMode ? (
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: '#F8F9FA',
            padding: '1rem',
            borderRadius: isFullScreen ? '0' : '0.375rem'
          }}
        >
          <ChordContent
            processedContent={processedContent}
            fontSize={fontSize}
            fontSpacing={fontSpacing}
            fontStyle={fontStyle}
            lineHeight={lineHeight}
            viewMode={viewMode}
            hideGuitarTabs={hideGuitarTabs}
            renderChord={renderChord}
          />
        </div>
      ) : (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className={`flex-1 font-mono text-sm resize-none ${isFullScreen ? 'rounded-none' : ''}`}
        />
      )}
    </div>
  );
};

export default ChordEdit;
