import { useEffect, useRef } from 'react';
import { useJamSession } from '@/contexts/JamSessionContext';

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

export const useScrollSync = () => {
  const { role, sessionState, broadcastState } = useJamSession();
  const lastBroadcastRef = useRef<number>(0);

  // Host: Broadcast scroll
  useEffect(() => {
    if (role !== 'host') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentage = docHeight > 0 ? scrollTop / docHeight : 0;
      
      // Only broadcast if changed significantly? 
      // Actually, simple throttle is enough.
      broadcastState({ scrollPosition: percentage });
    };

    const throttledScroll = throttle(handleScroll, 100);

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [role, broadcastState]);

  // Peer: Receive scroll
  useEffect(() => {
    if (role !== 'peer') return;
    
    if (typeof sessionState.scrollPosition === 'number') {
       const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
       const targetY = sessionState.scrollPosition * docHeight;

       // Use a small threshold to avoid fighting with local tiny scrolls or rounding errors
       if (Math.abs(window.scrollY - targetY) > 5) {
         window.scrollTo({
           top: targetY,
           behavior: 'auto'
         });
       }
    }
  }, [role, sessionState.scrollPosition]);

  // Handle Auto-Scroll State Sync (Start/Stop)
  // If host toggles auto-scroll, peer should too?
  // The requirement says "Sync scroll ... state".
  // sessionState has `isAutoScrolling` and `scrollSpeed`.
  // We should probaby interface with `useAutoScroll` for that.
  // But simply syncing raw scroll position covers the *result* of auto-scroll too!
  // So we might not need to explicitly sync "isAutoScrolling" boolean if we sync Y position.
  // However, syncing the *state* allows the Peer to show "Auto-scroll ON" UI.
};
