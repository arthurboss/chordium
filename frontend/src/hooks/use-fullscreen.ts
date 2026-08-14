import { useCallback, useSyncExternalStore } from 'react';
import { scrollContainerTo } from '@/utils/scroll-container';

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
}

/**
 * Reads fullscreen state from the document rather than tracking it locally, so the
 * control stays honest when fullscreen is left with Escape or the browser's own UI.
 */
export function useFullscreen(targetId: string) {
  const fullscreenElementId = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement?.id ?? null,
    () => null
  );

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      const target = document.getElementById(targetId);
      if (!target) return;
      await target.requestFullscreen().catch(() => {});
    }
    // Each mode scrolls a different element, so whichever is now in charge is sent
    // to the top: switching mode should not land the reader mid-song.
    scrollContainerTo(0, 'auto');
  }, [targetId]);

  return { isFullscreen: fullscreenElementId === targetId, toggleFullscreen };
}
