import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { toast } from "@/hooks/use-toast";
import { updateChordSheet } from './updateChordSheet';
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

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
    console.warn('No chord sheet selected for update');
    return;
  }
  
  // Extract artist and title from the song properties or path
  let artist = selectedSong.artist ?? '';
  let title = selectedSong.title ?? '';
  
  // If artist and title are empty, try to extract from path
  if (!artist && !title && selectedSong.path) {
    // Path format: "artist/title" or "artist-title"
    let pathParts;
    if (selectedSong.path.includes('/')) {
      pathParts = selectedSong.path.split('/');
      if (pathParts.length >= 2) {
        artist = decodeURIComponent(pathParts[pathParts.length - 2]).replace(/-/g, ' ');
        title = decodeURIComponent(pathParts[pathParts.length - 1]).replace(/-/g, ' ');
      }
    } else {
      // Legacy format: "artist-title"
      const dashIndex = selectedSong.path.lastIndexOf('-');
      if (dashIndex !== -1) {
        const artistPart = selectedSong.path.substring(0, dashIndex);
        const titlePart = selectedSong.path.substring(dashIndex + 1);
        artist = artistPart.replace(/_/g, ' ');
        title = titlePart.replace(/_/g, ' ');
      }
    }
  }
  
  if (!artist || !title) {
    console.error('Could not extract artist and title from song:', selectedSong);
    toast({
      title: "Update failed",
      description: "Invalid chord sheet format",
      variant: "destructive"
    });
    return;
  }
  
  try {
    // Get the existing ChordSheet from IndexedDB
    const repository = new ChordSheetRepository();
    await repository.initialize();
    const existingRecord = await repository.get(artist, title);
    await repository.close();
    
    if (!existingRecord) {
      console.error('ChordSheet not found in IndexedDB:', { artist, title });
      toast({
        title: "Update failed", 
        description: "Chord sheet not found in storage",
        variant: "destructive"
      });
      return;
    }
    
    // Update the chord content
    const updatedChordSheet: ChordSheet = {
      ...existingRecord.chordSheet,
      songChords: content
    };
    
    // Save to IndexedDB using modular function
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
    console.error('❌ Failed to update chord sheet:', error);
    toast({
      title: "Update failed", 
      description: "Failed to update chord sheet",
      variant: "destructive"
    });
  }
};
