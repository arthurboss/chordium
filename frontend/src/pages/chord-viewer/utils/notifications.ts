import { toast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

/**
 * Shows success notification for chord sheet save
 *
 * @param title - Title of the saved chord sheet
 */
export function showSaveSuccessNotification(title: string): void {
  toast({
    title: i18n.t("notifications:chordSheetSaved"),
    description: i18n.t("notifications:chordSheetSavedDesc", { title }),
  });
}

/**
 * Shows error notification for chord sheet save failure
 */
export function showSaveErrorNotification(): void {
  toast({
    title: i18n.t("notifications:saveFailed"),
    description: i18n.t("notifications:saveFailedDesc"),
    variant: "destructive",
  });
}

/**
 * Shows success notification for chord sheet deletion
 *
 * @param title - Title of the deleted chord sheet
 */
export function showDeleteSuccessNotification(title: string): void {
  toast({
    title: i18n.t("notifications:chordSheetDeleted"),
    description: i18n.t("notifications:chordSheetDeletedDesc", { title }),
  });
}

/**
 * Shows error notification for chord sheet deletion failure
 */
export function showDeleteErrorNotification(): void {
  toast({
    title: i18n.t("notifications:deleteFailed"),
    description: i18n.t("notifications:deleteFailedDesc"),
    variant: "destructive",
  });
}
