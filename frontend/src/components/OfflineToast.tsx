import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useOffline } from "@/hooks/use-offline";
import i18n from "@/i18n/config";

const OFFLINE_TOAST_ID = "offline-status";

const OfflineToast = () => {
  const { isOffline, wasOnline } = useOffline();
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
        toast(i18n.t("notifications:youreOffline"), {
          id: OFFLINE_TOAST_ID,
          description: i18n.t("notifications:youreOfflineDesc"),
          duration: Infinity,
        });
      } else if (wasOnline) {
        toast.dismiss(OFFLINE_TOAST_ID);
        toast.success(i18n.t("notifications:backOnline"), {
          description: i18n.t("notifications:backOnlineDesc"),
          duration: 3000,
        });
      }
    }
  }, [isOffline, wasOnline]);

  return null;
};

export default OfflineToast;
