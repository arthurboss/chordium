import { toast } from "sonner";
import i18n from "@/i18n/config";

export const showInvalidFileFormatError = (): void => {
  toast.error(i18n.t("notifications:invalidFileFormat"), {
    description: i18n.t("notifications:invalidFileFormatDesc"),
  });
};

export const showFileReadError = (): void => {
  toast.error(i18n.t("notifications:fileReadError"), {
    description: i18n.t("notifications:fileReadErrorDesc"),
  });
};
