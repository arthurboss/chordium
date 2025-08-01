import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import deleteChordSheet from "@/storage/stores/chord-sheets/operations/delete-chord-sheet";
import type { ChordSheetOperations, ChordSheetData } from "../chord-viewer.types";

/**
 * Parameters for chord sheet operations hook
 */
interface UseChordSheetOperationsParams {
  chordSheetData: ChordSheetData | null;
  path: string;
  songTitle: string;
}

/**
 * Hook for chord sheet save and delete operations
 * Handles database operations and user feedback
 * 
 * @param params - Operation parameters
 * @returns Save and delete handlers
 */
export function useChordSheetOperations(params: UseChordSheetOperationsParams): ChordSheetOperations {
  const navigate = useNavigate();
  const { chordSheetData, path, songTitle } = params;
  
  const handleSaveChordSheet = async (): Promise<void> => {
    if (!chordSheetData?.chordSheet) {
      console.warn('No chord sheet data available for saving');
      return;
    }
    
    try {
      // Store as saved chord sheet (saved: true)
      await storeChordSheet(chordSheetData.chordSheet, true, chordSheetData.path);
      
      toast({
        title: "Chord sheet saved",
        description: `"${chordSheetData.chordSheet.title}" has been added to My Chord Sheets`
      });
    } catch (error) {
      console.error('Failed to save chord sheet:', error);
      toast({
        title: "Save failed",
        description: "Failed to save chord sheet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSong = async (): Promise<void> => {
    try {
      // Delete from database using the path
      await deleteChordSheet(path);

      // Show toast notification
      toast({
        title: "Chord sheet deleted",
        description: `"${songTitle}" has been removed from My Chord Sheets`
      });

      // Navigate back to My Chord Sheets
      navigate('/my-chord-sheets');
    } catch (error) {
      console.error('Failed to delete chord sheet:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete chord sheet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    handleSaveChordSheet,
    handleDeleteSong
  };
}
