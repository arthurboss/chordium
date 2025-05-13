import { useState, useEffect } from 'react';

interface UseScrollPositionProps {
  /** Pixels from bottom to trigger the change */
  threshold?: number;
  /** Optional responsive thresholds based on media queries */
  responsiveThresholds?: {
    /** Threshold for screens that match the media query */
    threshold: number;
    /** Media query as a string (e.g., '(min-width: 768px)') */
    mediaQuery: string;
  }[];
}

/**
 * A hook that tracks if user has scrolled near the bottom of the page
 */
export const useScrollPosition = ({ 
  threshold = 140,
  responsiveThresholds = []
}: UseScrollPositionProps = {}) => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if any responsive threshold is applicable
      let activeThreshold = threshold;
      for (const responsive of responsiveThresholds) {
        if (window.matchMedia(responsive.mediaQuery).matches) {
          activeThreshold = responsive.threshold;
          break;
        }
      }

      setIsAtBottom(scrollPosition >= documentHeight - activeThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, responsiveThresholds]);

  return isAtBottom;
};
