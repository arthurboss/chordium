import React, { useState, useRef, useEffect } from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Save, ArrowLeft, ArrowRight, Maximize2, Minimize2, ChevronDown, ArrowUp, RotateCw } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const ChordEdit: React.FC<ChordEditProps> = ({
  editContent,
  setEditContent,
  handleSaveEdits,
  setIsEditing,
  onReturn
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const sections = ['#basic-format', '#sections', '#example', '#tips'];

  const navigateSection = (direction: 'next' | 'prev' | 'reset') => {
    let newIndex;
    if (direction === 'next') {
      newIndex = currentSectionIndex < sections.length - 1 ? currentSectionIndex + 1 : 0;
    } else if (direction === 'prev') {
      newIndex = currentSectionIndex > 0 ? currentSectionIndex - 1 : sections.length - 1;
    } else { // reset
      newIndex = 0;
    }

    setCurrentSectionIndex(newIndex);

    if (contentRef.current) {
      const nextSectionEl = contentRef.current.querySelector(sections[newIndex]) as HTMLElement | null;

      if (nextSectionEl) {
        nextSectionEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`w-full mx-auto flex flex-col transition-all duration-200 ${isFullScreen ? 'fixed inset-0 bg-background z-50' : 'max-w-3xl h-[calc(100vh-12rem)]'}`}>
      <Card className={`mb-4 ${isFullScreen ? 'rounded-none' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Edit Sheet</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center border">
                    ?
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[425px] w-[90vw] max-h-[80vh] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pb-8">
                  <DialogHeader className="text-left">
                    <DialogTitle>Chord Sheet Formatting Guide</DialogTitle>
                  </DialogHeader>
                  <div
                    ref={contentRef}
                    onScroll={() => checkScroll()}
                    className="snap-y snap-mandatory overflow-y-scroll max-h-[calc(80vh-8rem)] relative scroll-smooth"
                  >
                    <div id="basic-format" className="snap-center h-full w-full flex flex-col p-4 border-b">
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-2 pb-2 border-b border-muted text-center">Basic Format</h3>
                        <p className="text-sm text-muted-foreground">
                          Each line should contain either lyrics or chords. Chords should be placed above the corresponding lyrics.
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Next: Sections</span>
                        <span className="text-sm text-muted-foreground">Part 1 of 4</span>
                      </div>
                    </div>
                    <div id="sections" className="snap-center h-full w-full flex flex-col p-4 border-b">
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-2 pb-2 border-b border-muted text-center">Sections</h3>
                        <p className="text-sm text-muted-foreground">
                          To separate different sections of the song (Intro, Verse, Chorus, etc.), use a blank line followed by the section name in square brackets.
                        </p>
                        <pre className="text-sm bg-muted p-2 rounded">
                          {`[Intro]
[C]      [G]      [Am]
Let it be, let it be, let it be

[Verse 1]
[C]      [G]      [Am]
When I find myself in times of trouble`}
                        </pre>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Next: Example</span>
                        <span className="text-sm text-muted-foreground">Part 2 of 4</span>
                      </div>
                    </div>
                    <div id="example" className="snap-center h-full w-full flex flex-col p-4 border-b">
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-2 pb-2 border-b border-muted text-center">Example</h3>
                        <pre className="text-sm bg-muted p-2 rounded">
                          {`[C]      [G]      [Am]
Let it be, let it be, let it be`}
                        </pre>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Next: Tips</span>
                        <span className="text-sm text-muted-foreground">Part 3 of 4</span>
                      </div>
                    </div>
                    <div id="tips" className="snap-center h-full w-full flex flex-col p-4">
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-2 pb-2 border-b border-muted text-center">Tips</h3>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          <li>Use square brackets [ ] around chords</li>
                          <li>Align chords with the corresponding lyrics</li>
                          <li>Use spaces to position chords correctly</li>
                          <li>Each line should be either chords or lyrics, not both</li>
                          <li>Separate sections with a blank line and section name in brackets</li>
                          <li>Common section names: [Intro], [Verse 1], [Chorus], [Bridge], [Outro]</li>
                        </ul>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Next: Basic Format</span>
                        <span className="text-sm text-muted-foreground">Part 4 of 4</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
                    {currentSectionIndex > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => navigateSection('prev')}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="w-8 h-8"></div> // Placeholder to maintain layout
                    )}
                    {currentSectionIndex === sections.length - 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => navigateSection('reset')}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={() => navigateSection('next')}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReturn}>
                <ArrowLeft className="h-4 w-4" />
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
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className={`flex-1 font-mono text-sm resize-none ${isFullScreen ? 'rounded-none' : ''}`}
      />
    </div>
  );
};

export default ChordEdit;