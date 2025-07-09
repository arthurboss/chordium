import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { toast } from "@/hooks/use-toast";
import { updateChordSheet } from './updateChordSheet';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

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
export const handleUpdateChordSheetFromUI = (
  content: string,
  selectedSong: Song | null,
  myChordSheets: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  if (!selectedSong) {
    console.warn('No chord sheet selected for update');
    return;
  }
  
  // Parse the cache key (song.path) to get artist and title
  const dashIndex = selectedSong.path.lastIndexOf('-');
  if (dashIndex === -1) {
    console.error('Invalid song path format for update:', selectedSong.path);
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
  
  // Get the existing ChordSheet
  const existingChordSheet = unifiedChordSheetCache.getCachedChordSheet(artist, title);
  if (!existingChordSheet) {
    console.error('ChordSheet not found in cache:', { artist, title });
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
  
  // Save to cache using modular function
  updateChordSheet(artist, title, updatedChordSheet);
  
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
};
