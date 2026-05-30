import i18n from "@/i18n/config";

export interface ToastFunction {
  (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }): void;
}

/**
 * Shows an error toast for invalid file format
 */
export const showInvalidFileFormatError = (toast: ToastFunction): void => {
  toast({
    title: i18n.t("notifications:invalidFileFormat"),
    description: i18n.t("notifications:invalidFileFormatDesc"),
    variant: "destructive",
  });
};

/**
 * Shows an error toast for file reading errors
 */
export const showFileReadError = (toast: ToastFunction): void => {
  toast({
    title: i18n.t("notifications:fileReadError"),
    description: i18n.t("notifications:fileReadErrorDesc"),
    variant: "destructive",
  });
};
