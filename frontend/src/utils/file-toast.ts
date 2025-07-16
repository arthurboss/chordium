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
    title: "Invalid file format",
    description: "Please upload a text file (.txt, .text, or .chord)",
    variant: "destructive",
  });
};

/**
 * Shows an error toast for file reading errors
 */
export const showFileReadError = (toast: ToastFunction): void => {
  toast({
    title: "Error reading file",
    description: "There was a problem reading the file content",
    variant: "destructive",
  });
};
