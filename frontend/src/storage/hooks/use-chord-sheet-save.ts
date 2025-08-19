import type { ChordSheetData } from "@/pages/chord-viewer/chord-viewer.types";
import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import { showSaveSuccessNotification, showSaveErrorNotification } from "@/pages/chord-viewer/utils/notifications";

/**
 * Hook for chord sheet save operations
 * 
 * @param chordSheetData - Chord sheet data to save
 * @param refetch - Optional function to refresh chord sheet state after save
 * @returns Save handler function
 */
export function useChordSheetSave(
  chordSheetData: ChordSheetData | null, 
  refetch?: () => void
) {
  const handleSave = async (): Promise<void> => {
    if (!chordSheetData?.chordSheet) {
      if (import.meta.env.DEV) {
        console.warn('No chord sheet data available for saving');
      }
      return;
    }
    
    try {
      // Store chord sheet with saved: true (creates new or updates existing to saved: true)
      await storeChordSheet(chordSheetData.chordSheet, true, chordSheetData.path);
      showSaveSuccessNotification(chordSheetData.chordSheet.title);
      
      // Refresh chord sheet state to update isSaved flag
      if (refetch) {
        refetch();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to save chord sheet:', error);
      }
      showSaveErrorNotification();
    }
  };
  
  return { handleSave };
}
