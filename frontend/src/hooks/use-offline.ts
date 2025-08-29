import { useState, useEffect } from 'react';

interface OfflineState {
  isOffline: boolean;
  wasOnline: boolean;
  lastOnline: Date | null;
}

/**
 * Hook to detect offline status and network connectivity changes
 * 
 * Provides:
 * - Current offline status
 * - Whether the user was previously online
 * - Timestamp of last online connection
 * 
 * @returns OfflineState object with current network status
 */
export function useOffline(): OfflineState {
  const [state, setState] = useState<OfflineState>(() => {
    const initialOffline = !navigator.onLine;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('useOffline Initial State:', {
        navigatorOnLine: navigator.onLine,
        initialOffline,
        userAgent: navigator.userAgent
      });
    }
    
    return {
      isOffline: initialOffline,
      wasOnline: navigator.onLine, // Assume we were online if navigator.onLine is true
      lastOnline: navigator.onLine ? new Date() : null,
    };
  });

  useEffect(() => {
    const handleOnline = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🟢 Online event fired');
      }
      setState(prev => ({
        isOffline: false,
        wasOnline: true,
        lastOnline: new Date(),
      }));
    };

    const handleOffline = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔴 Offline event fired');
      }
      setState(prev => ({
        isOffline: true,
        wasOnline: prev.wasOnline || prev.lastOnline !== null,
        lastOnline: prev.lastOnline,
      }));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
}


