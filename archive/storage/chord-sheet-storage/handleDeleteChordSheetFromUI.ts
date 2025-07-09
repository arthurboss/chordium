import { Song } from "@/types/song";
import { toast } from "@/hooks/use-toast";
import { deleteChordSheetByPath } from './deleteChordSheetByPath';

/**
 * Handles chord sheet deletion from UI context (both UI state and persistent storage)
 * Follows SRP: Single responsibility to coordinate UI updates with storage deletion
 * 
 * @param songPath - The song path to delete
 * @param myChordSheets - Current UI state array  
 * @param setMySongs - UI state setter
 * @param selectedSong - Currently selected song
 * @param setSelectedSong - Selected song setter
 */
export const handleDeleteChordSheetFromUI = (
  songPath: string,
  myChordSheets: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  selectedSong: Song | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  console.log("🗑️ handleDeleteChordSheetFromUI called");
  console.log("songPath:", songPath);
  console.log("myChordSheets count:", myChordSheets.length);
  console.log("selectedSong:", selectedSong);

  const songToDelete = myChordSheets.find((song) => song.path === songPath);
  console.log("songToDelete:", songToDelete);

  if (!songToDelete) {
    console.error("Chord sheet not found in myChordSheets!");
    return;
  }

  // Remove from UI state
  const updatedSongs = myChordSheets.filter((song) => song.path !== songPath);
  console.log("updatedSongs count:", updatedSongs.length);

  setMySongs(updatedSongs);

  // Remove from persistent storage using modular function
  deleteChordSheetByPath(songPath);

  // Clear selection if the deleted song was selected
  if (selectedSong?.path === songPath) {
    console.log("Clearing selectedSong");
    setSelectedSong(null);
  }

  toast({
    title: "Chord sheet deleted",
    description: `"${songToDelete.title}" has been removed from My Chord Sheets`,
  });

  console.log("Chord sheet deletion completed");
};
