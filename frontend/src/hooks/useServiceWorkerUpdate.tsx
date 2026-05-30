import { useEffect, useRef } from "react";
import { toast } from "./use-toast";
import { ToastAction } from "@/components/ui/toast";
import i18n from "@/i18n/config";

export function useServiceWorkerUpdate() {
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const showUpdateToast = (waiting: ServiceWorker) => {
        waitingWorkerRef.current = waiting;
        toast({
          title: i18n.t("notifications:updateAvailable"),
          description: i18n.t("notifications:updateAvailableDesc"),
          action: (
            <ToastAction
              altText={i18n.t("notifications:updateReloadAltText")}
              onClick={() => {
                waiting.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }}
            >
              {i18n.t("notifications:updateReload")}
            </ToastAction>
          ),
        });
      };

      window.addEventListener("swUpdated", (event: CustomEvent) => {
        const waiting = event.detail?.waiting as ServiceWorker | undefined;
        if (waiting) showUpdateToast(waiting);
      });

      window.addEventListener("workbox-waiting", (event: CustomEvent) => {
        const waiting = event.detail?.waiting as ServiceWorker | undefined;
        if (waiting) showUpdateToast(waiting);
      });
    }
  }, []);
}
