import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import { loadSampleSongs } from "@/utils/sample-songs";
import { chordSheetToSong } from "@/utils/chord-sheet-storage";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";

// Custom hook to load sample songs and initialize user songs from storage.
export function useSampleSongs() {
  const [sampleSongs, setSampleSongs] = useState<Song[]>([]);
  const [myChordSheets, setMySongs] = useState<Song[]>([]);

  const refreshMySongs = useCallback(() => {
    // Get My Chord Sheets from the cache (this includes both user-added and dev-mode sample songs)
    const chordSheets = unifiedChordSheetCache.getAllSavedChordSheets();
    const songs = chordSheets.map(chordSheetToSong);
    
    setMySongs(songs);
  }, []);

  useEffect(() => {
    const initializeSongs = async () => {
      // Load sample songs for the search interface
      const samples = await loadSampleSongs();
      setSampleSongs(samples);
      
      // Initial load of My Chord Sheets
      refreshMySongs();
    };
    initializeSongs();
  }, [refreshMySongs]);

  return { sampleSongs, setSampleSongs, myChordSheets, setMySongs, refreshMySongs };
}
