import { useEffect, useState } from 'react';

/**
 * Hook to detect if the user has scrolled to the bottom of the page (with a threshold).
 * @param thresholdPx Number of pixels from the bottom to consider as "at bottom".
 */
export function useStickyAtBottom(thresholdPx: number = 140) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtBottom(scrollPosition >= documentHeight - thresholdPx);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholdPx]);

  return isAtBottom;
}
