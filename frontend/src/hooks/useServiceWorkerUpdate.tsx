import { useEffect, useRef } from "react";
import { toast } from "./use-toast";
import { ToastAction } from "@/components/ui/toast";

export function useServiceWorkerUpdate() {
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Listen for the standard VitePWA update event
      window.addEventListener("swUpdated", (event: CustomEvent) => {
        const waiting = event.detail?.waiting as ServiceWorker | undefined;
        if (waiting) {
          waitingWorkerRef.current = waiting;
          toast({
            title: "Update available",
            description: "A new version is available.",
            action: (
              <ToastAction
                altText="Reload to update"
                onClick={() => {
                  waiting.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }}
              >
                Reload
              </ToastAction>
            ),
          });
        }
      });

      // Also listen for the workbox update event
      window.addEventListener("workbox-waiting", (event: CustomEvent) => {
        const waiting = event.detail?.waiting as ServiceWorker | undefined;
        if (waiting) {
          waitingWorkerRef.current = waiting;
          toast({
            title: "Update available",
            description: "A new version is available.",
            action: (
              <ToastAction
                altText="Reload to update"
                onClick={() => {
                  waiting.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }}
              >
                Reload
              </ToastAction>
            ),
          });
        }
      });
    }
  }, []);
}
