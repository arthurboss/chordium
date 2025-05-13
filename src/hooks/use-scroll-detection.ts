import { useEffect, useState, RefObject, DependencyList } from 'react';

/**
 * Hook to detect if an element has scrollable content
 * 
 * @param elementRef - Reference to the element to check for scrolling
 * @param dependencies - Optional dependency array to trigger scroll check on changes
 * @returns boolean - Whether the element is scrollable
 */
export function useScrollDetection(
  elementRef: RefObject<HTMLElement>,
  dependencies: DependencyList = []
): boolean {
  const [isScrollable, setIsScrollable] = useState(false);

  // This effect will run when elementRef or any dependency changes
  useEffect(() => {
    if (!elementRef.current) return;

    const performScrollCheck = () => {
      // Ensure content is fully rendered
      const checkScrollWithRetry = (retriesLeft = 5) => {
        if (elementRef.current) {
          const { scrollHeight, clientHeight } = elementRef.current;
          
          // Use a small buffer to account for potential rounding or padding issues
          const hasScroll = scrollHeight > clientHeight + 1;
          setIsScrollable(hasScroll);

          if (!hasScroll && retriesLeft > 0) {
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
      performScrollCheck();
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => {
      checkTimers.forEach(clearTimeout);
      resizeObserver.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, ...dependencies]);

  return isScrollable;
}
