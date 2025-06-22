import { Song } from "../types/song";
import { ChordSheet } from "../types/chordSheet";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { addToMySongs } from "@/cache/implementations/my-songs-cache";
import { chordSheetToSong } from "@/utils/unified-song-storage";

/**
 * Saves a new song to the user's collection (DEPRECATED)
 * This function is deprecated and should only be used for backward compatibility
 * New code should use addChordSheet from unified-song-storage instead
 */
export const handleSaveNewSong = (
  content: string,
  title: string,
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  navigate: NavigateFunction,
  setActiveTab: (tab: string) => void,
  artist?: string
): void => {
  console.warn('handleSaveNewSong is deprecated. Use addChordSheet instead.');
  
  if (!content.trim()) {
    toast({
      title: "Error",
      description: "No content to save",
      variant: "destructive"
    });
    return;
  }
  
  // Create a basic ChordSheet from the content
  const chordSheet: ChordSheet = {
    title: title || "Untitled Song",
    artist: artist || "Unknown Artist",
    songChords: content,
    songKey: '',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };
  
  // Add to My Songs cache
  addToMySongs(chordSheet.artist, chordSheet.title, chordSheet);
  
  // Convert to Song for UI state
  const newSong = chordSheetToSong(chordSheet);
  
  // Update UI state
  setMySongs(prev => [newSong, ...prev]);
  
  toast({
    title: "Song saved",
    description: `"${title || "Untitled Song"}" has been added to My Songs`
  });
  
  setActiveTab("my-songs");
  navigate("/my-songs");
};
