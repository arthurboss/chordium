import { useSyncExternalStore, RefObject } from "react";

/**
 * useAtBottom
 *
 * Generic React hook to determine if a scrollable container or the window is scrolled to the bottom (with optional offset).
 *
 * @param options -
 *   ref: Optional React ref to a scrollable container (HTMLElement). If not provided, listens to window scroll.
 *   element: Optional scrollable container resolved outside React (e.g. the fullscreen element).
 *   getTotalSize: Optional function to get total scrollable height (for virtualized lists). Required if using ref.
 *   offset: Optional pixel offset from the bottom to consider "at bottom" (default: 50)
 * @returns {boolean} - True if at or near the bottom, false otherwise
 */
export function useAtBottom(options?: {
  ref?: RefObject<HTMLElement>;
  element?: HTMLElement | null;
  getTotalSize?: () => number;
  offset?: number;
}): boolean {
  const { ref, element, getTotalSize, offset = 50 } = options || {};

  function resolveContainer(): HTMLElement | null {
    return element ?? ref?.current ?? null;
  }

  // --- Store subscription logic ---
  function subscribe(callback: () => void) {
    let frame: number | null = null;
    const handler = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(callback);
    };
    const container = resolveContainer();
    if (container) {
      container.addEventListener("scroll", handler, { passive: true });
      return () => {
        container.removeEventListener("scroll", handler);
        if (frame !== null) cancelAnimationFrame(frame);
      };
    } else {
      window.addEventListener("scroll", handler, { passive: true });
      window.addEventListener("resize", handler, { passive: true });
      return () => {
        window.removeEventListener("scroll", handler);
        window.removeEventListener("resize", handler);
        if (frame !== null) cancelAnimationFrame(frame);
      };
    }
  }

  // --- Get current snapshot logic ---
  function getSnapshot() {
    const container = resolveContainer();
    if (container) {
      const scrollOffset = container.scrollTop || 0;
      const clientHeight = container.clientHeight || 0;
      const totalSize = getTotalSize ? getTotalSize() : container.scrollHeight || 0;
      const isScrollable = totalSize > clientHeight + 1;
      return (
        isScrollable && scrollOffset >= totalSize - clientHeight - offset
      );
    } else {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isScrollable = documentHeight > windowHeight + 1;
      const scrollPosition = window.scrollY;
      return (
        isScrollable && windowHeight + scrollPosition >= documentHeight - offset
      );
    }
  }

  // --- Get server snapshot (always false) ---
  function getServerSnapshot() {
    return false;
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
