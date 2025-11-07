import { useState, useRef, useEffect } from "react";
import {
  DEFAULT_SCROLL_SPEED,
  AutoScrollRefs,
  performAutoScroll,
  handleAutoScrollToggle,
} from "@/utils/auto-scroll-utils";

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
  const isTogglingRef = useRef<boolean>(false);
  const firstFrameRef = useRef<boolean>(false);

  // Handle auto-scrolling for the whole page
  useEffect(() => {
    console.log("useEffect triggered, autoScroll:", autoScroll);
    if (autoScroll) {
      console.log("Starting performAutoScroll");
      // Create refs object to pass to utility function
      const refs: AutoScrollRefs = {
        scrollTimerRef,
        lastScrollTimeRef,
        accumulatedScrollRef,
        firstFrameRef,
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
  const toggleAutoScroll = async (
    enable?: boolean,
    startFromChordDisplay?: boolean
  ) => {
    console.log(
      "toggleAutoScroll called with enable:",
      enable,
      "startFromChordDisplay:",
      startFromChordDisplay,
      "current autoScroll:",
      autoScroll,
      "isToggling:",
      isTogglingRef.current
    );

    // Prevent rapid successive calls
    if (isTogglingRef.current) {
      console.log("Already toggling, ignoring call");
      return;
    }

    isTogglingRef.current = true;
    try {
      await handleAutoScrollToggle(
        enable,
        autoScroll,
        setAutoScroll,
        startFromChordDisplay
      );
    } finally {
      // Reset the flag after a short delay regardless of success/failure
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 100);
    }
  };

  return {
    autoScroll,
    scrollSpeed,
    setScrollSpeed,
    toggleAutoScroll,
  };
};
