import { FOOTER_HEIGHT, NAVBAR_HEIGHT, updateLayoutHeights } from './layout';

// Default scroll speed for auto-scroll
export const DEFAULT_SCROLL_SPEED = 3;

// Interface for auto-scroll state references
export interface AutoScrollRefs {
  scrollTimerRef: React.MutableRefObject<number | null>;
  lastScrollTimeRef: React.MutableRefObject<number>;
  accumulatedScrollRef: React.MutableRefObject<number>;
}

/**
 * Helper to get the title/artist element
 * @returns The title/artist DOM element or null
 */
export function getTitleArtistElement(): Element | null {
  return document.querySelector('#chord-display .mb-4');
}

/**
 * Enhanced auto-scroll toggle logic
 * @param enable - Whether to enable or disable auto-scroll
 * @param autoScroll - Current auto-scroll state
 * @param setAutoScroll - Function to set auto-scroll state
 * @returns void
 */
export function handleAutoScrollToggle(
  enable: boolean | undefined,
  autoScroll: boolean,
  setAutoScroll: (value: boolean) => void
): void {
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
      let rafId: number;
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
}

/**
 * Start auto-scroll from current position
 * @param scrollSpeed - Speed of scrolling
 * @param refs - React refs for scroll state management
 * @param setAutoScroll - Function to set auto-scroll state
 * @param setScrollSpeed - Function to set scroll speed
 */
export function startAutoScroll(
  scrollSpeed: number,
  refs: AutoScrollRefs,
  setAutoScroll: (value: boolean) => void,
  setScrollSpeed: (value: number) => void
): void {
  updateLayoutHeights();
  
  // Get refresh rate from requestAnimationFrame
  const baseScrollAmount = scrollSpeed * 0.06;
  // Use 60 as the reference FPS to keep speeds consistent across different displays
  const referenceFPS = 60;
  const referenceFrameTime = 1000 / referenceFPS;
  
  const doScroll = (timestamp: number) => {
    if (!refs.lastScrollTimeRef.current) {
      refs.lastScrollTimeRef.current = timestamp;
    }
    const elapsed = timestamp - refs.lastScrollTimeRef.current;
    // Scale by reference frame time to ensure consistent speed regardless of display refresh rate
    refs.accumulatedScrollRef.current += (elapsed / referenceFrameTime) * baseScrollAmount;
    const scrollAmount = Math.floor(refs.accumulatedScrollRef.current);
    refs.accumulatedScrollRef.current -= scrollAmount;
    if (scrollAmount > 0) {
      window.scrollBy({ top: scrollAmount, behavior: 'auto' });
    }
    refs.lastScrollTimeRef.current = timestamp;
    const scrollBottom = window.innerHeight + window.scrollY;
    const limit = document.body.offsetHeight - FOOTER_HEIGHT;
    if (scrollBottom >= limit - 1) {
      setAutoScroll(false);
      setScrollSpeed(DEFAULT_SCROLL_SPEED);
      return;
    }
    refs.scrollTimerRef.current = requestAnimationFrame(doScroll);
  };
  
  refs.scrollTimerRef.current = requestAnimationFrame(doScroll);
}

/**
 * Perform auto-scroll actions based on whether we're at the bottom of content
 * @param scrollSpeed - Speed of scrolling
 * @param refs - React refs for scroll state management
 * @param setAutoScroll - Function to set auto-scroll state
 * @param setScrollSpeed - Function to set scroll speed
 */
export function performAutoScroll(
  scrollSpeed: number,
  refs: AutoScrollRefs,
  setAutoScroll: (value: boolean) => void,
  setScrollSpeed: (value: number) => void
): (() => void) | undefined {
  const mainEl = document.getElementById('chord-display');
  if (mainEl) {
    const mainBottom = mainEl.offsetTop + mainEl.offsetHeight;
    const viewportBottom = window.scrollY + window.innerHeight;
    
    // If we're at or past the bottom, scroll to the top of the header/title (if present), else main element
    if (viewportBottom >= mainBottom - 2) {
      let scrollTarget = mainEl.offsetTop;
      const headerEl = getTitleArtistElement();
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
        } catch (e) {
          // Ignore any errors when accessing NAVBAR_HEIGHT
        }
        scrollTarget = headerEl.getBoundingClientRect().top + window.scrollY - navbarOffset - 8; // 8px buffer for aesthetics
      }
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      
      // Wait for scroll to reach the top, then start auto-scroll
      let rafId: number;
      const waitForTop = () => {
        // Allow a small margin for floating point errors
        if (Math.abs(window.scrollY - scrollTarget) < 2) {
          startAutoScroll(scrollSpeed, refs, setAutoScroll, setScrollSpeed);
        } else {
          rafId = requestAnimationFrame(waitForTop);
        }
      };
      
      rafId = requestAnimationFrame(waitForTop);
      
      // Cleanup for this special case
      return () => {
        cancelAnimationFrame(rafId);
        if (refs.scrollTimerRef.current) {
          cancelAnimationFrame(refs.scrollTimerRef.current);
        }
        refs.lastScrollTimeRef.current = 0;
        refs.accumulatedScrollRef.current = 0;
      };
    }
  }
  
  // If not at the bottom, start auto-scroll immediately
  startAutoScroll(scrollSpeed, refs, setAutoScroll, setScrollSpeed);
  
  return () => {
    if (refs.scrollTimerRef.current) {
      cancelAnimationFrame(refs.scrollTimerRef.current);
    }
    refs.lastScrollTimeRef.current = 0;
    refs.accumulatedScrollRef.current = 0;
  };
}