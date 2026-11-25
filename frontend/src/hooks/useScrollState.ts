import { useRef, useSyncExternalStore } from "react";
import type { RefObject } from "react";

export interface ScrollState {
  isScrollable: boolean;
  isAtBottom: boolean;
}

/**
 * Scroll position and overflow state for a scrollable container (or the window
 * when no container is given). Watches scroll, window resize and the container
 * resize, since the lists are sized in JS after mount.
 */
export function useScrollState(options?: {
  ref?: RefObject<HTMLElement>;
  element?: HTMLElement | null;
  getTotalSize?: () => number;
  offset?: number;
}): ScrollState {
  const { ref, element, getTotalSize, offset = 50 } = options || {};
  const cacheRef = useRef<ScrollState>({ isScrollable: false, isAtBottom: false });

  function resolveContainer(): HTMLElement | null {
    return element ?? ref?.current ?? null;
  }

  function subscribe(callback: () => void) {
    let frame: number | null = null;
    const handler = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(callback);
    };

    const container = resolveContainer();
    if (container) {
      container.addEventListener("scroll", handler, { passive: true });
      const observer = new ResizeObserver(handler);
      observer.observe(container);
      return () => {
        container.removeEventListener("scroll", handler);
        observer.disconnect();
        if (frame !== null) cancelAnimationFrame(frame);
      };
    }

    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }

  function getSnapshot(): ScrollState {
    const container = resolveContainer();
    let next: ScrollState;

    if (container) {
      const clientHeight = container.clientHeight || 0;
      const totalSize = getTotalSize ? getTotalSize() : container.scrollHeight || 0;
      const isScrollable = clientHeight > 0 && totalSize > clientHeight + 1;
      next = {
        isScrollable,
        isAtBottom:
          isScrollable &&
          (container.scrollTop || 0) >= totalSize - clientHeight - offset,
      };
    } else {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isScrollable = documentHeight > windowHeight + 1;
      next = {
        isScrollable,
        isAtBottom:
          isScrollable &&
          windowHeight + window.scrollY >= documentHeight - offset,
      };
    }

    const prev = cacheRef.current;
    if (
      prev.isScrollable !== next.isScrollable ||
      prev.isAtBottom !== next.isAtBottom
    ) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }

  function getServerSnapshot(): ScrollState {
    return cacheRef.current;
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
