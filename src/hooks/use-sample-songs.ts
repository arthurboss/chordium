import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import { loadSampleSongs } from "@/utils/sample-songs";
import { getMyChordSheetsAsSongs } from "@/utils/chord-sheet-storage";

// Custom hook to load sample songs and initialize user songs from storage.
export function useSampleSongs() {
  const [sampleSongs, setSampleSongs] = useState<Song[]>([]);
  const [myChordSheets, setMySongs] = useState<Song[]>([]);

  const refreshMySongs = useCallback(async () => {
    // Get My Chord Sheets from IndexedDB
    const songs = await getMyChordSheetsAsSongs();
    
    console.log('🔄 Refreshing My Chord Sheets from IndexedDB:', songs.length, 'songs');
    setMySongs(songs);
  }, []);

  useEffect(() => {
    const initializeSongs = async () => {
      // Load sample songs for the search interface
      const samples = await loadSampleSongs();
      setSampleSongs(samples);
      
      // Initial load of My Chord Sheets
      await refreshMySongs();
    };
    initializeSongs();
  }, [refreshMySongs]);

  return { sampleSongs, setSampleSongs, myChordSheets, setMySongs, refreshMySongs };
}
