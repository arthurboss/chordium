import { useEffect } from "react";

export function useRestoreScrollPosition(ref: React.RefObject<HTMLElement>, scroll?: number) {
  useEffect(() => {
    if (typeof scroll === "number" && ref.current) {
      ref.current.scrollTop = scroll;
    }
  }, [scroll, ref]);
}

export function usePersistScrollPosition(ref: React.RefObject<HTMLElement>, setScroll?: (scroll: number) => void) {
  useEffect(() => {
    const node = ref.current;
    return () => {
      if (setScroll && node) {
        setScroll(node.scrollTop);
      }
    };
  }, [setScroll, ref]);
}
