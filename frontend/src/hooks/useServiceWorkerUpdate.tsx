import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import i18n from "@/i18n/config";

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;

    toast(i18n.t("notifications:updateAvailable"), {
      description: i18n.t("notifications:updateAvailableDesc"),
      duration: Infinity,
      action: {
        label: i18n.t("notifications:updateReload"),
        onClick: () => updateServiceWorker(true),
      },
    });
  }, [needRefresh, updateServiceWorker]);
}
