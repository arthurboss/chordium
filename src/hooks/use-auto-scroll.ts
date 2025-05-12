import { useState, useRef, useEffect } from 'react';
import { 
  DEFAULT_SCROLL_SPEED, 
  AutoScrollRefs, 
  performAutoScroll, 
  handleAutoScrollToggle
} from '@/utils/auto-scroll-utils';

/**
 * Custom hook to manage auto-scrolling functionality
 * @returns Auto-scroll state and handlers
 */
export const useAutoScroll = () => {
  // Auto-scroll state
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(DEFAULT_SCROLL_SPEED);
  
  // Refs for auto-scroll state management
  const scrollTimerRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef<number>(0);
  
  // Handle auto-scrolling for the whole page
  useEffect(() => {
    if (autoScroll) {
      // Create refs object to pass to utility function
      const refs: AutoScrollRefs = {
        scrollTimerRef,
        lastScrollTimeRef,
        accumulatedScrollRef
      };
      
      // Use the utility function to perform auto-scroll
      return performAutoScroll(
        scrollSpeed,
        refs,
        setAutoScroll,
        setScrollSpeed
      );
    }
  }, [autoScroll, scrollSpeed]);

  // Enhanced auto-scroll toggle handler
  const toggleAutoScroll = (enable?: boolean) => {
    handleAutoScrollToggle(enable, autoScroll, setAutoScroll);
  };

  return {
    autoScroll,
    scrollSpeed,
    setScrollSpeed,
    toggleAutoScroll
  };
};
