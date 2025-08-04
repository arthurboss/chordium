import { useNavigate } from "react-router-dom";
import deleteChordSheet from "@/storage/stores/chord-sheets/operations/delete-chord-sheet";
import { showDeleteSuccessNotification, showDeleteErrorNotification } from "../utils/notifications";

/**
 * Hook for chord sheet delete operations
 * 
 * @param path - Storage path of chord sheet
 * @param songTitle - Title for notifications
 * @returns Delete handler function
 */
export function useChordSheetDelete(path: string, songTitle: string) {
  const navigate = useNavigate();
  
  const handleDelete = async (): Promise<void> => {
    try {
      await deleteChordSheet(path);
      showDeleteSuccessNotification(songTitle);
      navigate('/my-chord-sheets');
    } catch (error) {
      console.error('Failed to delete chord sheet:', error);
      showDeleteErrorNotification();
    }
  };
  
  return { handleDelete };
}
