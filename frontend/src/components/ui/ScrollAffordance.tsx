import type { RefObject } from "react";
import { ScrollArrow } from "@/components/ui/ScrollArrow";
import { useScrollState } from "@/hooks/useScrollState";
import { cyAttr } from "@/utils/test-utils";

interface ScrollAffordanceProps {
  parentRef: RefObject<HTMLElement>;
  getTotalSize?: () => number;
}

/**
 * Fade and jump arrow shown under a scrollable list whenever it has rows
 * outside the viewport. Hidden entirely when the list fits.
 */
const ScrollAffordance = ({ parentRef, getTotalSize }: ScrollAffordanceProps) => {
  const { isScrollable, isAtBottom } = useScrollState({
    ref: parentRef,
    getTotalSize,
  });

  if (!isScrollable) return null;

  return (
    <div className="relative w-full z-10" {...cyAttr("scroll-affordance")}>
      {/* Fades straight into the card colour the list sits on, so it reads as
          the card itself rather than a blurred view of the rows. */}
      {!isAtBottom && (
        <div
          className="pointer-events-none absolute h-8 w-full translate-y-[-2rem]"
          style={{
            background:
              'linear-gradient(to bottom, hsl(var(--card) / 0) 0%, hsl(var(--card) / 0.1) 20%, hsl(var(--card) / 0.6) 50%, hsl(var(--card) / 0.9) 80%, hsl(var(--card)) 100%)',
          }}
          {...cyAttr("scroll-fade")}
        />
      )}
      <div className="flex justify-center w-fit mx-auto translate-y-[-1rem]">
        <ScrollArrow
          parentRef={parentRef}
          getTotalSize={getTotalSize ?? (() => parentRef.current?.scrollHeight ?? 0)}
        />
      </div>
    </div>
  );
};

export default ScrollAffordance;
