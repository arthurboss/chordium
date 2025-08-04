import type { ChordSheetData } from "../chord-viewer.types";
import { saveChordSheetToStorage } from "../utils/chord-sheet-storage";
import { showSaveSuccessNotification, showSaveErrorNotification } from "../utils/notifications";

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
      console.warn('No chord sheet data available for saving');
      return;
    }
    
    try {
      await saveChordSheetToStorage(chordSheetData);
      showSaveSuccessNotification(chordSheetData.chordSheet.title);
      
      // Refresh chord sheet state to update isSaved flag
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to save chord sheet:', error);
      showSaveErrorNotification();
    }
  };
  
  return { handleSave };
}
