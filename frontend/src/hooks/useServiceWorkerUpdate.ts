import { useEffect, useRef } from "react";
import { toast } from "./use-toast";
import { ReloadButton } from "../components/ReloadButton";

export function useServiceWorkerUpdate() {
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("swUpdated", (event: CustomEvent) => {
        const waiting = event.detail?.waiting as ServiceWorker | undefined;
        if (waiting) {
          waitingWorkerRef.current = waiting;
          toast({
            title: "Update available",
            description: "A new version is available.",
            action: ReloadButton ? ReloadButton({ waiting }) : undefined,
          });
        }
      });
    }
  }, []);
}
