import { useEffect, useRef } from "react";
import { useOffline } from "@/hooks/use-offline";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

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
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      lastOfflineState.current = isOffline;
      return;
    }

    if (lastOfflineState.current !== isOffline) {
      lastOfflineState.current = isOffline;

      if (isOffline) {
        toast({
          title: i18n.t("notifications:youreOffline"),
          description: i18n.t("notifications:youreOfflineDesc"),
          duration: 0,
        });
      } else if (wasOnline) {
        toast({
          title: i18n.t("notifications:backOnline"),
          description: i18n.t("notifications:backOnlineDesc"),
          duration: 3000,
        });
      }
    }
  }, [isOffline, wasOnline, toast]);

  return null;
};

export default OfflineToast;
