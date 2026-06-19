import { toast } from "sonner";
import i18n from "@/i18n/config";

export function showSaveSuccessNotification(title: string): void {
  toast.success(i18n.t("notifications:chordSheetSaved"), {
    description: i18n.t("notifications:chordSheetSavedDesc", { title }),
  });
}

export function showSaveErrorNotification(): void {
  toast.error(i18n.t("notifications:saveFailed"), {
    description: i18n.t("notifications:saveFailedDesc"),
  });
}

export function showDeleteSuccessNotification(title: string): void {
  toast.success(i18n.t("notifications:chordSheetDeleted"), {
    description: i18n.t("notifications:chordSheetDeletedDesc", { title }),
  });
}

export function showDeleteErrorNotification(): void {
  toast.error(i18n.t("notifications:deleteFailed"), {
    description: i18n.t("notifications:deleteFailedDesc"),
  });
}
