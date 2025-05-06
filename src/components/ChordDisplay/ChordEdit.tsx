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
import { MarkdownDialog } from '../ui/markdown-dialog';

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


  return (
    <div className={`w-full mx-auto flex flex-col transition-all duration-200 ${isFullScreen ? 'fixed inset-0 bg-background z-50' : 'max-w-3xl h-[calc(100vh-12rem)]'}`}>
      <Card className={`mb-4 ${isFullScreen ? 'rounded-none' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Edit Sheet</h2>

              <MarkdownDialog
                title='Chord Sheet Formatting Guide'
                trigger={
                  <Button variant="outline" size="sm" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center border">
                    ?
                  </Button>
                }
                markdownFiles={[
                  'src/guides/chord-sheet-formatting/basic-format.md',
                  'src/guides/chord-sheet-formatting/sections.md',
                  'src/guides/chord-sheet-formatting/example.md',
                  'src/guides/chord-sheet-formatting/tips.md'
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
