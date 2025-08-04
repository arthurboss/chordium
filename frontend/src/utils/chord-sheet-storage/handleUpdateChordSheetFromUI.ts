import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { toast } from "@/hooks/use-toast";
import { updateChordSheet } from './updateChordSheet';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';

/**
 * Handles chord sheet update from UI context (both UI state and persistent storage)
 * Follows SRP: Single responsibility to coordinate UI updates with storage update
 * 
 * @param content - New chord content
 * @param selectedSong - Currently selected song
 * @param myChordSheets - Current UI state array  
 * @param setMySongs - UI state setter
 * @param setSelectedSong - Selected song setter
 */
export const handleUpdateChordSheetFromUI = async (
  content: string,
  selectedSong: Song | null,
  myChordSheets: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): Promise<void> => {
  if (!selectedSong) {
    toast({
      title: "Update failed",
      description: "No chord sheet selected for update",
      variant: "destructive"
    });
    return;
  }
  
  // Parse the cache key (song.path) to get artist and title
  const dashIndex = selectedSong.path.lastIndexOf('-');
  if (dashIndex === -1) {
    toast({
      title: "Update failed",
      description: "Invalid chord sheet format",
      variant: "destructive"
    });
    return;
  }
  
  const artistPart = selectedSong.path.substring(0, dashIndex);
  const titlePart = selectedSong.path.substring(dashIndex + 1);
  
  // Convert underscores back to spaces
  const artist = artistPart.replace(/_/g, ' ');
  const title = titlePart.replace(/_/g, ' ');
  
  try {
    // Get the existing ChordSheet from storage
    const chordSheetStore = new ChordSheetStore();
    const existingChordSheet = await chordSheetStore.get(selectedSong.path);
    if (!existingChordSheet) {
      toast({
        title: "Update failed", 
        description: "Chord sheet not found in storage",
        variant: "destructive"
      });
      return;
    }
    
    // Update the chord content
    const updatedChordSheet: ChordSheet = {
      ...existingChordSheet,
      songChords: content
    };
    
    // Save to storage using modular function
    await updateChordSheet(artist, title, updatedChordSheet);
    
    // Update UI state - keep the same Song object but refresh from new data
    const updatedSongs = myChordSheets.map(song => 
      song.path === selectedSong.path ? { ...song } : song
    );
    setMySongs(updatedSongs);
    setSelectedSong({ ...selectedSong });
    
    toast({
      title: "Chord sheet updated",
      description: `"${selectedSong.title}" has been updated`
    });
  } catch (error) {
    console.error('Error updating chord sheet:', error);
    toast({
      title: "Update failed",
      description: "Failed to update chord sheet in storage",
      variant: "destructive"
    });
  }
};
