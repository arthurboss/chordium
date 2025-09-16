import { useNavigation } from "@/hooks/navigation";
import { useSmartBackNavigation } from "@/hooks/navigation/useSmartBackNavigation";
import { useChordSheetSave, useChordSheetDelete } from "@/storage/hooks";
import type { ChordSheetData } from "../../chord-viewer/chord-viewer.types";

/**
 * Custom hook for managing chord sheet actions and navigation
 * 
 * Handles save/delete operations and navigation logic for the chord sheet page.
 */
export const useChordSheetActions = (
  chordSheetData: ChordSheetData | null,
  path: string,
  isSaved: boolean,
  setIsSaved: (saved: boolean) => void
) => {
  const navigation = useNavigation();
  const handleSmartBack = useSmartBackNavigation();

  // Single smart back handler for all contexts
  const handleBack = handleSmartBack;

  // Chord sheet operations using focused hooks
  const { handleSave: baseHandleSave } = useChordSheetSave(chordSheetData);
  
  // Wrap handleSave to update local isSaved state immediately after save
  const handleSave = async () => {
    await baseHandleSave();
    setIsSaved(true);
  };

  const { handleDelete } = useChordSheetDelete(
    path,
    chordSheetData?.chordSheet.title ?? 'Chord Sheet'
  );

  return {
    handleBack,
    handleSave,
    handleDelete
  };
};
