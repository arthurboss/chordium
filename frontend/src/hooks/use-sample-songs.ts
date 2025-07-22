import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import { loadSampleSongs } from "@/utils/sample-songs";
import { chordSheetToSong } from "@/utils/chord-sheet-storage";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";

// Custom hook to initialize My Chord Sheets (includes sample songs in dev mode)
export function useSampleSongs() {
  const [myChordSheets, setMyChordSheets] = useState<Song[]>([]);

  const refreshMySongs = useCallback(() => {
    // Get My Chord Sheets from the cache (this includes both user-added and dev-mode sample songs)
    const chordSheets = unifiedChordSheetCache.getAllSavedChordSheets();
    const songs = chordSheets.map(chordSheetToSong);
    
    setMyChordSheets(songs);
  }, []);

  useEffect(() => {
    const initializeSongs = async () => {
      // Load sample songs in dev mode only - this populates the cache via populateDevModeSampleSongs()
      await loadSampleSongs();
      
      // Load My Chord Sheets (now includes sample songs in dev mode)
      refreshMySongs();
    };
    initializeSongs();
  }, [refreshMySongs]);

  return { myChordSheets, setMySongs: setMyChordSheets, refreshMySongs };
}
