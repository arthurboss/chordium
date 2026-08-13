import { useCallback, useSyncExternalStore } from 'react';

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

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    const target = document.getElementById(targetId);
    if (target) void target.requestFullscreen().catch(() => {});
  }, [targetId]);

  return { isFullscreen: fullscreenElementId === targetId, toggleFullscreen };
}
