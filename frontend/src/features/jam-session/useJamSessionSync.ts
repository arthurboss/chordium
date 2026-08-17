import { useEffect, useRef, useCallback } from 'react';
import { jamSessionService, type JamSessionState } from '../JamSessionService';

export interface ChordSheetState {
  scrollPercent: number;
  capo: number;
  transpose: number;
  currentPage: number;
}

export function useJamSessionSync(state: ChordSheetState, onStateChange: (state: ChordSheetState) => void) {
  const lastSyncRef = useRef<ChordSheetState | null>(null);
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Broadcast state changes from host to peers
  const broadcastState = useCallback(() => {
    // Only host broadcasts
    if (!jamSessionService['isHost']) return;
    
    // Only broadcast if state actually changed
    if (lastSyncRef.current && JSON.stringify(lastSyncRef.current) === JSON.stringify(state)) {
      return;
    }

    jamSessionService.broadcastState({
      scrollPercent: state.scrollPercent,
      capo: state.capo,
      transpose: state.transpose,
      currentPage: state.currentPage,
    });

    lastSyncRef.current = state;
  }, [state]);

  // Debounce broadcasts to avoid flooding
  const debouncedBroadcast = useCallback(() => {
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
    }

    broadcastTimeoutRef.current = setTimeout(broadcastState, 500);
  }, [broadcastState]);

  // Listen for state updates from host
  useEffect(() => {
    jamSessionService.setOnStateChanged((newState: JamSessionState) => {
      onStateChange({
        scrollPercent: newState.scrollPercent,
        capo: newState.capo,
        transpose: newState.transpose,
        currentPage: newState.currentPage,
      });
    });
  }, [onStateChange]);

  // Broadcast state changes (debounced)
  useEffect(() => {
    debouncedBroadcast();

    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, [debouncedBroadcast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, []);
}
