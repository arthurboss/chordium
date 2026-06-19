import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "./use-toast";
import { ToastAction } from "@/components/ui/toast";
import i18n from "@/i18n/config";

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;

    toast({
      title: i18n.t("notifications:updateAvailable"),
      description: i18n.t("notifications:updateAvailableDesc"),
      duration: Infinity,
      action: (
        <ToastAction
          altText={i18n.t("notifications:updateReloadAltText")}
          onClick={() => updateServiceWorker(true)}
        >
          {i18n.t("notifications:updateReload")}
        </ToastAction>
      ),
    });
  }, [needRefresh, updateServiceWorker]);
}
