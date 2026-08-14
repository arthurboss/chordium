/**
 * A fullscreened element becomes its own scrolling box, so scrolling the window is a
 * no-op while fullscreen is active. Every scroll action resolves its target at call
 * time instead of capturing it, since fullscreen can be left at any moment.
 */
export function getScrollContainer(): HTMLElement | null {
  const fullscreenElement = document.fullscreenElement;
  return fullscreenElement instanceof HTMLElement ? fullscreenElement : null;
}

export function scrollContainerBy(top: number): void {
  const target = getScrollContainer() ?? window;
  target.scrollBy({ top, behavior: 'auto' });
}

export function scrollContainerTo(top: number, behavior: ScrollBehavior = 'smooth'): void {
  const target = getScrollContainer() ?? window;
  target.scrollTo({ top, behavior });
}
