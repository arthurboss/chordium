import type { RefObject } from "react";
import { useScrollState } from "./useScrollState";

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
  return useScrollState(options).isAtBottom;
}
