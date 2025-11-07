import type { RefObject } from "react";
import { FOOTER_HEIGHT, NAVBAR_HEIGHT, updateLayoutHeights } from "./layout";

export const DEFAULT_SCROLL_SPEED = 3;

export interface AutoScrollRefs {
  scrollTimerRef: RefObject<number | null>;
  lastScrollTimeRef: RefObject<number>;
  accumulatedScrollRef: RefObject<number>;
  firstFrameRef?: RefObject<boolean>;
}

// Find the nearest ancestor that can scroll vertically. If none is found,
// fall back to the document scrolling element.
function findScrollableAncestor(el: Element | null): HTMLElement | Element {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const maybe = node as HTMLElement;
    const style = globalThis.getComputedStyle(maybe as Element);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      maybe.scrollHeight > maybe.clientHeight
    ) {
      return maybe;
    }
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

function scrollByOn(scroller: HTMLElement, amount: number) {
  if (typeof scroller.scrollBy === "function") {
    scroller.scrollBy({ top: amount, left: 0, behavior: "auto" });
  } else if (typeof scroller.scrollTop === "number") {
    scroller.scrollTop = (scroller.scrollTop || 0) + amount;
  } else {
    globalThis.scrollBy?.({ top: amount, behavior: "auto" } as ScrollToOptions);
  }
}

// Scroll #chord-display so it sits at the top of its scroll container (accounting for navbar).
export function alignChordDisplayToTop() {
  const chord = document.querySelector("#chord-display");
  if (!chord) return;
  const scrollerEl = findScrollableAncestor(chord);
  const scroller = (scrollerEl as HTMLElement) || document.documentElement;

  // Compute offsetTop relative to the scroller
  let offset = 0;
  let el: Element | null = chord;
  while (el && el !== scroller && el instanceof HTMLElement) {
    offset += el.offsetTop || 0;
    el = el.offsetParent || null;
  }

  const target = Math.max(0, offset - (NAVBAR_HEIGHT || 0));

  if (
    scroller instanceof HTMLElement &&
    typeof scroller.scrollTo === "function"
  ) {
    scroller.scrollTo({ top: target, behavior: "auto" });
  } else if (scroller instanceof HTMLElement) {
    scroller.scrollTop = target;
  } else {
    globalThis.scrollTo?.({ top: target, behavior: "auto" } as ScrollToOptions);
  }
}

// Smooth-scroll helper that returns a Promise resolved when scrolling completes
function smoothScrollTo(
  scroller: HTMLElement | Element,
  target: number
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const isElement = scroller instanceof HTMLElement;
      const getScroll = () =>
        isElement
          ? scroller.scrollTop
          : document.scrollingElement?.scrollTop || globalThis.scrollY;

      if (isElement && typeof scroller.scrollTo === "function") {
        scroller.scrollTo({ top: target, behavior: "smooth" });
      } else {
        globalThis.scrollTo?.({
          top: target,
          behavior: "smooth",
        } as ScrollToOptions);
      }

      let settled = false;

      const checkDone = () => {
        const cur = getScroll();
        if (Math.abs(cur - target) <= 1) {
          cleanup();
          resolve();
        }
      };

      const onScroll = () => {
        checkDone();
      };

      const cleanup = () => {
        if (isElement) {
          scroller.removeEventListener("scroll", onScroll);
        } else {
          globalThis.removeEventListener("scroll", onScroll);
        }
        if (!settled) {
          settled = true;
        }
      };

      if (isElement) {
        scroller.addEventListener("scroll", onScroll, { passive: true });
      } else {
        globalThis.addEventListener("scroll", onScroll, { passive: true });
      }

      // Safety timeout: resolve after reasonable delay even if scroll event not fired
      const dist = Math.abs(getScroll() - target);
      const timeoutMs = Math.min(3000, 600 + dist * 3);
      setTimeout(() => {
        cleanup();
        resolve();
      }, timeoutMs);
    } catch {
      // If anything fails, resolve so caller can proceed
      resolve();
    }
  });
}

// Align chord display to top with optional smooth animation. When smooth is
// true, returns a Promise that resolves when the animation finishes.
export function alignChordDisplayToTopSmooth(smooth = false): Promise<void> {
  const chord = document.querySelector("#chord-display");
  if (!chord) return Promise.resolve();
  const scrollerEl = findScrollableAncestor(chord);
  const scroller = (scrollerEl as HTMLElement) || document.documentElement;

  let offset = 0;
  let el: Element | null = chord;
  while (el && el !== scroller && el instanceof HTMLElement) {
    offset += el.offsetTop || 0;
    el = el.offsetParent || null;
  }

  const target = Math.max(0, offset - (NAVBAR_HEIGHT || 0));

  if (smooth) {
    return smoothScrollTo(scroller, target);
  }

  if (
    scroller instanceof HTMLElement &&
    typeof scroller.scrollTo === "function"
  ) {
    scroller.scrollTo({ top: target, behavior: "auto" });
  } else if (scroller instanceof HTMLElement) {
    scroller.scrollTop = target;
  } else {
    globalThis.scrollTo?.({ top: target, behavior: "auto" } as ScrollToOptions);
  }
  return Promise.resolve();
}

// Start an RAF-driven auto-scroll loop. Returns a cleanup function that stops scrolling.
export function performAutoScroll(
  scrollSpeed: number,
  refs: AutoScrollRefs,
  setAutoScroll: (v: boolean) => void,
  setScrollSpeed?: (v: number) => void
) {
  updateLayoutHeights();
  const chord = document.querySelector("#chord-display");
  const scrollerEl = chord
    ? findScrollableAncestor(chord)
    : document.scrollingElement;
  const scroller = (scrollerEl as HTMLElement) || document.documentElement;

  // Lookup table for pixel-per-second values (1–10).
  // We use an array instead of a Map for faster numeric indexing.
  // The curve below is intentionally gentle at higher speeds.
  const SPEED_MAP = [
    0,
    2, // 1
    4, // 2
    7, // 3
    11, // 4
    16, // 5
    22, // 6
    28, // 7
    35, // 8
    42, // 9
    50, // 10
  ];

  function getPxPerSec(speed: number) {
    if (!speed || speed <= 1) return SPEED_MAP[1];
    if (speed >= 10) return SPEED_MAP[10];
    const lo = Math.floor(speed);
    const hi = Math.ceil(speed);
    if (lo === hi) return SPEED_MAP[lo];
    const t = speed - lo;
    return SPEED_MAP[lo] + (SPEED_MAP[hi] - SPEED_MAP[lo]) * t;
  }

  const pxPerSec = getPxPerSec(scrollSpeed);

  function step(ts: number) {
    if (!refs.lastScrollTimeRef.current) refs.lastScrollTimeRef.current = ts;
    const delta = Math.min(100, ts - (refs.lastScrollTimeRef.current || ts));
    refs.lastScrollTimeRef.current = ts;

    // Compute fractional pixels to allow very low speeds to accumulate over
    // multiple frames instead of rounding to zero each frame.
    const pxFloat = (pxPerSec * delta) / 1000;
    refs.accumulatedScrollRef.current =
      (refs.accumulatedScrollRef.current || 0) + pxFloat;
    const intPx = Math.floor(refs.accumulatedScrollRef.current);
    if (intPx > 0 && scroller instanceof HTMLElement) {
      scrollByOn(scroller, intPx);
      refs.accumulatedScrollRef.current -= intPx;
    }

    const viewport =
      scroller === document.documentElement ||
      !(scroller instanceof HTMLElement)
        ? globalThis.innerHeight
        : scroller.clientHeight;
    let scrollTop: number;
    if (scroller === document.documentElement) {
      scrollTop = globalThis.scrollY;
    } else if (scroller instanceof HTMLElement) {
      scrollTop = scroller.scrollTop || 0;
    } else {
      scrollTop = 0;
    }
    const total =
      scroller instanceof HTMLElement
        ? scroller.scrollHeight
        : document.body.offsetHeight;
    const bottom = viewport + scrollTop;
    const limit = total - (FOOTER_HEIGHT || 0);

    if (bottom >= limit - 1) {
      if (refs.scrollTimerRef.current)
        cancelAnimationFrame(refs.scrollTimerRef.current);
      refs.scrollTimerRef.current = null;
      refs.lastScrollTimeRef.current = 0;
      refs.accumulatedScrollRef.current = 0;
      if (setScrollSpeed) setScrollSpeed(DEFAULT_SCROLL_SPEED);
      setAutoScroll(false);
      return;
    }

    refs.scrollTimerRef.current = requestAnimationFrame(step);
  }

  refs.scrollTimerRef.current = requestAnimationFrame(step);

  return () => {
    // Cleanup only cancels the RAF and resets timing refs. Do NOT mutate
    // hook state here (setAutoScroll / setScrollSpeed) because this cleanup
    // is invoked when dependencies change (e.g. user adjusts scrollSpeed).
    // Mutating state here causes unintended toggles and prevents speed
    // changes from taking effect.
    if (refs.scrollTimerRef.current)
      cancelAnimationFrame(refs.scrollTimerRef.current);
    refs.scrollTimerRef.current = null;
    refs.lastScrollTimeRef.current = 0;
    refs.accumulatedScrollRef.current = 0;
  };
}

// Toggle helper: if enabling and `startFromChordDisplay` is true, align first.
export async function handleAutoScrollToggle(
  enable: boolean | undefined,
  autoScroll: boolean,
  setAutoScroll: (v: boolean) => void,
  startFromChordDisplay?: boolean
) {
  const shouldEnable = enable ?? !autoScroll;
  if (!shouldEnable) {
    setAutoScroll(false);
    return;
  }

  // If caller requested starting from the chord display, or if the page is
  // currently scrolled to the bottom (which can happen if the caller's
  // `isAtBottom` value was stale), align the chord display to the top before
  // enabling auto-scroll. Use the smooth alignment helper and await it so the
  // auto-scroll starts after the animation finishes.
  try {
    const chord = document.querySelector("#chord-display");
    const scrollerEl = chord
      ? findScrollableAncestor(chord)
      : document.scrollingElement;
    const scroller = (scrollerEl as HTMLElement) || document.documentElement;
    const viewport =
      scroller === document.documentElement ||
      !(scroller instanceof HTMLElement)
        ? globalThis.innerHeight
        : scroller.clientHeight;
    let scrollTop: number;
    if (scroller === document.documentElement) {
      scrollTop = globalThis.scrollY;
    } else if (scroller instanceof HTMLElement) {
      scrollTop = scroller.scrollTop || 0;
    } else {
      scrollTop = 0;
    }
    const total =
      scroller instanceof HTMLElement
        ? scroller.scrollHeight
        : document.body.offsetHeight;
    const bottom = viewport + scrollTop;
    const limit = total - (FOOTER_HEIGHT || 0);
    const atBottom = bottom >= limit - 1;

    if (startFromChordDisplay || atBottom) {
      // Wait for the smooth align to complete before enabling auto-scroll.
      // alignChordDisplayToTopSmooth will resolve immediately if smooth is false
      // or if the element is missing.
      await alignChordDisplayToTopSmooth(true);
    }
  } catch {
    // Ignore DOM read errors and continue enabling auto-scroll.
  }

  setAutoScroll(true);
}
