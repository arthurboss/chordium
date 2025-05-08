
import { useEffect, forwardRef } from 'react';
import { updateLayoutHeights } from '@/utils/layout';
import ChordContent from './ChordDisplay/ChordContent';
import ChordSheetControls from './ChordDisplay/ChordSheetControls';
import ChordEdit from './ChordDisplay/ChordEdit';
import { useChordDisplay } from '@/hooks/useChordDisplay';
import { useChordRenderer } from './ChordDisplay/ChordUtils';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChordDisplayProps {
  title?: string;
  artist?: string;
  content: string;
  onSave?: (content: string) => void;
}

const ChordDisplay = forwardRef<HTMLDivElement, ChordDisplayProps>(({ title, artist, content, onSave }, ref) => {
  const chordRenderer = useChordRenderer();
  const autoScrollHook = useAutoScroll();
  const { 
    autoScroll, setAutoScroll, scrollSpeed, setScrollSpeed, 
    scrollTimerRef, lastScrollTimeRef, accumulatedScrollRef, DEFAULT_SCROLL_SPEED 
  } = autoScrollHook;
  
  const { 
    transpose, setTranspose, fontSize, setFontSize,
    fontSpacing, setFontSpacing, fontStyle, setFontStyle,
    viewMode, setViewMode, hideGuitarTabs, setHideGuitarTabs,
    isEditing, setIsEditing, editContent, setEditContent,
    processedContent, transposeOptions, handleSaveEdits, handleDownload
  } = useChordDisplay(content, onSave);
  
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
          renderChord={chordRenderer.renderChord}
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
