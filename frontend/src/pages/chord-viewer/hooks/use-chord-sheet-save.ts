import type { ChordSheetData } from "../chord-viewer.types";
import { saveChordSheetToStorage } from "../utils/chord-sheet-storage";
import { showSaveSuccessNotification, showSaveErrorNotification } from "../utils/notifications";

/**
 * Hook for chord sheet save operations
 * 
 * @param chordSheetData - Chord sheet data to save
 * @returns Save handler function
 */
export function useChordSheetSave(chordSheetData: ChordSheetData | null) {
  const handleSave = async (): Promise<void> => {
    if (!chordSheetData?.chordSheet) {
      console.warn('No chord sheet data available for saving');
      return;
    }
    
    try {
      await saveChordSheetToStorage(chordSheetData);
      showSaveSuccessNotification(chordSheetData.chordSheet.title);
    } catch (error) {
      console.error('Failed to save chord sheet:', error);
      showSaveErrorNotification();
    }
  };
  
  return { handleSave };
}
