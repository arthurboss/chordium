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
    2,  // 1
    4,  // 2
    7,  // 3
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
export function handleAutoScrollToggle(
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

  if (startFromChordDisplay) alignChordDisplayToTop();
  setAutoScroll(true);
}
