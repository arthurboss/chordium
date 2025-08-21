import { toast } from "@/hooks/use-toast";

/**
 * Shows success notification for chord sheet save
 * 
 * @param title - Title of the saved chord sheet
 */
export function showSaveSuccessNotification(title: string): void {
  toast({
    title: "Chord sheet saved",
    description: `"${title}" has been added to My Chord Sheets`
  });
}

/**
 * Shows error notification for chord sheet save failure
 */
export function showSaveErrorNotification(): void {
  toast({
    title: "Save failed",
    description: "Failed to save chord sheet. Please try again.",
    variant: "destructive"
  });
}

/**
 * Shows success notification for chord sheet deletion
 * 
 * @param title - Title of the deleted chord sheet
 */
export function showDeleteSuccessNotification(title: string): void {
  toast({
    title: "Chord sheet deleted",
    description: `"${title}" has been removed from My Chord Sheets`
  });
}

/**
 * Shows error notification for chord sheet deletion failure
 */
export function showDeleteErrorNotification(): void {
  toast({
    title: "Delete failed",
    description: "Failed to delete chord sheet. Please try again.",
    variant: "destructive"
  });
}
