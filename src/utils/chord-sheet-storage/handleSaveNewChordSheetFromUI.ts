import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { addChordSheet } from './addChordSheet';
import { chordSheetToSong } from './chordSheetToSong';

/**
 * Handles saving new chord sheet from UI context (both UI state and persistent storage)
 * Follows SRP: Single responsibility to coordinate UI updates with storage save
 * 
 * @param content - Chord sheet content or path identifier
 * @param title - Title of the chord sheet
 * @param setMySongs - UI state setter
 * @param navigate - Navigation function
 * @param setActiveTab - Tab setter function
 * @param artist - Artist name (optional)
 */
export const handleSaveNewChordSheetFromUI = (
  content: string,
  title: string,
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  navigate: NavigateFunction,
  setActiveTab: (tab: string) => void,
  artist?: string
): void => {
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
    title: title || "Untitled Chord Sheet",
    artist: artist || "Unknown Artist",
    songChords: content,
    songKey: '',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };
  
  // Add to My Chord Sheets using modular function
  addChordSheet(chordSheet);
  
  // Convert to Song for UI state
  const newSong = chordSheetToSong(chordSheet);
  
  // Update UI state
  setMySongs(prev => [newSong, ...prev]);
  
  toast({
    title: "Chord sheet saved",
    description: `"${title || "Untitled Chord Sheet"}" has been added to My Chord Sheets`
  });
  
  setActiveTab("my-chord-sheets");
  navigate("/my-chord-sheets");
};
