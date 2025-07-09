import { ChordSheet } from "@/types/chordSheet";
import { Song } from "@/types/song";
import { GUITAR_TUNINGS } from "@/types/guitarTuning";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { saveChordSheet } from "./saveChordSheet";
import { deleteChordSheet } from "./deleteChordSheet";

/**
 * Save a new chord sheet from UI with state management
 */
export async function handleSaveNewChordSheetFromUI(
  path: string,
  content: string,
  title: string,
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  navigate: NavigateFunction,
  setActiveTab: (tab: string) => void,
  artist?: string,
): Promise<void> {
  try {
    const artistName = artist ?? "Unknown Artist";
    
    // Create a ChordSheet object
    const chordSheet: ChordSheet = {
      title,
      artist: artistName,
      songChords: content,
      songKey: "",
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    // Save the chord sheet using the new unified function
    if (path) {
      await saveChordSheet(path, chordSheet, { saved: true });
    } else {
      // Fallback to old method (for user-uploaded content)
      await unifiedChordSheetCache.cacheChordSheet(artistName, title, chordSheet, { saved: true });
    }

    // Update UI state
    const newSong: Song = {
      title,
      artist: artistName,
      path
    };

    setMySongs(prev => [...prev, newSong]);
    setActiveTab("my-chord-sheets");

    toast({
      title: "Chord sheet saved",
      description: `${artistName} - ${title} has been saved to your chord sheets.`
    });

  } catch (error) {
    console.error("Error saving chord sheet:", error);
    toast({
      title: "Error",
      description: "Failed to save chord sheet. Please try again.",
      variant: "destructive"
    });
  }
}

/**
 * Update an existing chord sheet from UI
 */
export async function handleUpdateChordSheetFromUI(
  content: string,
  selectedSong: Song,
  myChordSheets: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): Promise<void> {
  try {
    // Get the existing chord sheet to preserve metadata
    const existingChordSheet = await unifiedChordSheetCache.getCachedChordSheetByPath(selectedSong.path);
    
    if (!existingChordSheet) {
      throw new Error("Chord sheet not found");
    }

    // Update with new content
    const updatedChordSheet: ChordSheet = {
      ...existingChordSheet,
      songChords: content
    };

    // Save the updated chord sheet
    await unifiedChordSheetCache.cacheChordSheet(
      selectedSong.artist, 
      selectedSong.title, 
      updatedChordSheet, 
      { saved: true }
    );

    toast({
      title: "Chord sheet updated",
      description: `${selectedSong.artist} - ${selectedSong.title} has been updated.`
    });

  } catch (error) {
    console.error("Error updating chord sheet:", error);
    toast({
      title: "Error",
      description: "Failed to update chord sheet. Please try again.",
      variant: "destructive"
    });
  }
}

/**
 * Delete a chord sheet from UI with state management
 */
export async function handleDeleteChordSheetFromUI(
  songPath: string,
  myChordSheets: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  selectedSong: Song | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): Promise<void> {
  try {
    // Remove from cache using unified function
    await deleteChordSheet(songPath);

    // Update UI state
    setMySongs(prev => prev.filter(song => song.path !== songPath));

    // Clear selection if the deleted song was selected
    if (selectedSong && selectedSong.path === songPath) {
      setSelectedSong(null);
    }

    const song = myChordSheets.find(s => s.path === songPath);
    toast({
      title: "Chord sheet deleted",
      description: `${song?.artist ?? "Unknown"} - ${song?.title ?? "Unknown"} has been deleted.`
    });

  } catch (error) {
    console.error("Error deleting chord sheet:", error);
    toast({
      title: "Error",
      description: "Failed to delete chord sheet. Please try again.",
      variant: "destructive"
    });
  }
}
