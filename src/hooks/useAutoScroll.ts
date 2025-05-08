
import { useRef, useState } from 'react';
import { FOOTER_HEIGHT } from '@/utils/layout';

const DEFAULT_SCROLL_SPEED = 3;

export const useAutoScroll = () => {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(DEFAULT_SCROLL_SPEED);
  const scrollTimerRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef<number>(0);

  const handleAutoScrollToggle = (enable?: boolean) => {
    const shouldEnable = enable !== undefined ? enable : !autoScroll;
    if (!shouldEnable) {
      setAutoScroll(false);
      return;
    }

    const headerEl = document.querySelector('#chord-display .mb-4');
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
  };

  return {
    autoScroll,
    setAutoScroll: handleAutoScrollToggle,
    scrollSpeed,
    setScrollSpeed,
    scrollTimerRef,
    lastScrollTimeRef,
    accumulatedScrollRef,
    DEFAULT_SCROLL_SPEED
  };
};
