import { useEffect, useRef } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { useToast } from '@/hooks/use-toast';

/**
 * Subtle offline status indicator using toast notifications
 * Shows non-intrusive notifications when network status changes
 */
const OfflineToast = () => {
  const { isOffline, wasOnline } = useOffline();
  const { toast } = useToast();
  const lastOfflineState = useRef<boolean | null>(null);
  const hasInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Skip the first render to avoid showing "back online" on page load
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      lastOfflineState.current = isOffline;
      return;
    }

    // Only show toast if the state actually changed
    if (lastOfflineState.current !== isOffline) {
      lastOfflineState.current = isOffline;

      if (isOffline) {
        // Show offline toast
        toast({
          title: "You're offline",
          description: "Some features may not be available until you reconnect.",
          duration: 0, // Wait for user's dismissal
        });
      } else if (wasOnline) {
        // Show online toast only if user was previously online (and now coming back online)
        toast({
          title: "You're back online",
          description: "All features are now available.",
          duration: 3000, // Show for 3 seconds
        });
      }
    }
  }, [isOffline, wasOnline, toast]);

  // This component doesn't render anything visible
  return null;
};

export default OfflineToast;
