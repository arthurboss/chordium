import { Song } from "../types/song";
import { ChordSheet } from "../types/chordSheet";
import { toast } from "@/hooks/use-toast";
import { updateInMySongs, getFromMySongs } from "@/cache/implementations/my-songs-cache";

/**
 * Updates an existing song's chord content in the ChordSheet storage system
 * Follows SRP: Single responsibility to update chord content via cache API
 */
export const handleUpdateSong = (
  content: string,
  selectedSong: Song | null,
  mySongs: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  if (!selectedSong) {
    console.warn('No song selected for update');
    return;
  }
  
  // Parse the cache key (song.path) to get artist and title
  const dashIndex = selectedSong.path.lastIndexOf('-');
  if (dashIndex === -1) {
    console.error('Invalid song path format for update:', selectedSong.path);
    toast({
      title: "Update failed",
      description: "Invalid song format",
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
  const existingChordSheet = getFromMySongs(artist, title);
  if (!existingChordSheet) {
    console.error('ChordSheet not found in cache:', { artist, title });
    toast({
      title: "Update failed", 
      description: "Song not found in storage",
      variant: "destructive"
    });
    return;
  }
  
  // Update the chord content
  const updatedChordSheet: ChordSheet = {
    ...existingChordSheet,
    songChords: content
  };
  
  // Save to cache
  updateInMySongs(artist, title, updatedChordSheet);
  
  // Update UI state - keep the same Song object but refresh from new data
  const updatedSongs = mySongs.map(song => 
    song.path === selectedSong.path ? { ...song } : song
  );
  setMySongs(updatedSongs);
  setSelectedSong({ ...selectedSong });
  
  toast({
    title: "Song updated",
    description: `"${selectedSong.title}" has been updated`
  });
};
