import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

const MIN_LIST_HEIGHT = 160;
const HEIGHT_RATIO = 0.6;

/**
 * Height a scrollable list should take so its page exactly fills the viewport.
 *
 * Measured from real chrome around the list (card padding, main padding,
 * footer) rather than from the document height, which already includes the
 * flex slack when the page is shorter than the viewport. A list that latched
 * onto that slack once could never grow back.
 */
export function useFitListHeight(
  ref: RefObject<HTMLElement | null>,
  itemCount: number,
  enabled = true,
  capRatio = HEIGHT_RATIO
): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!enabled || itemCount === 0) return;
    const list = ref.current;
    if (!list) return;

    const measure = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;

      const card = el.closest(".bg-card") as HTMLElement | null;
      const cardBottom = card ? card.getBoundingClientRect().bottom : rect.bottom;
      const main = document.querySelector("main");
      const mainPadBottom = main
        ? parseFloat(getComputedStyle(main).paddingBottom) || 0
        : 0;
      const footer = document.querySelector("footer");
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;

      const available =
        window.innerHeight -
        rect.top -
        (cardBottom - rect.bottom) -
        mainPadBottom -
        footerHeight;
      const contentHeight = el.firstElementChild
        ? el.firstElementChild.getBoundingClientRect().height
        : el.scrollHeight;
      const cap = window.innerHeight * capRatio;

      setHeight(
        Math.max(
          MIN_LIST_HEIGHT,
          Math.floor(Math.min(cap, available, contentHeight))
        )
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    const card = list.closest(".bg-card");
    if (card) observer.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled, itemCount, ref, capRatio]);

  return height;
}
