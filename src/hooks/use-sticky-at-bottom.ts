import { useState, useEffect } from 'react';

/**
 * A hook that determines whether the user has scrolled to the bottom of the page.
 * 
 * @param offset - Optional pixel offset from the bottom to consider "at bottom" (default: 50)
 * @returns A boolean indicating if the view is at the bottom
 */
export function useStickyAtBottom(offset: number = 50): boolean {
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate if we're at the bottom of the page (with offset)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY;
      
      // Consider "at bottom" when within the offset of the bottom
      const atBottom = windowHeight + scrollPosition >= documentHeight - offset;
      
      setIsAtBottom(atBottom);
    };

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize as it affects document height
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Clean up listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [offset]);

  return isAtBottom;
}
