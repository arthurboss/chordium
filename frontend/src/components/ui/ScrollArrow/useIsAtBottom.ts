import { useEffect, useState } from "react";

/**
 * useIsAtBottom
 *
 * React hook to determine if a scrollable container is scrolled to the bottom.
 *
 * @param scrollRef - React ref to the scrollable container (HTMLElement)
 * @param getTotalSize - Function that returns the total scrollable height (e.g., from a virtualizer)
 * @returns {boolean} - True if the container is at or near the bottom, false otherwise
 *
 * The hook listens to the scroll event and updates the state when the user scrolls near the bottom (within 30px).
 * Useful for showing/hiding scroll indicators or triggering infinite scroll.
 */
export function useIsAtBottom(
  scrollRef: React.RefObject<HTMLElement>,
  getTotalSize: () => number
) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollOffset = scrollRef.current?.scrollTop || 0;
      const clientHeight = scrollRef.current?.clientHeight || 0;
      const totalSize = getTotalSize();
      setIsAtBottom(scrollOffset >= totalSize - clientHeight - 30);
    };
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, getTotalSize]);

  return isAtBottom;
}
