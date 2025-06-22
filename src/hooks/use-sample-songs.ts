import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import { loadSampleSongs } from "@/utils/sample-songs";
import { chordSheetToSong } from "@/utils/unified-song-storage";
import { getAllFromMySongs } from "@/cache/implementations/my-songs-cache";

// Custom hook to load sample songs and initialize user songs from storage.
export function useSampleSongs() {
  const [sampleSongs, setSampleSongs] = useState<Song[]>([]);
  const [mySongs, setMySongs] = useState<Song[]>([]);

  const refreshMySongs = useCallback(() => {
    // Get My Songs from the cache (this includes both user-added and dev-mode sample songs)
    const chordSheets = getAllFromMySongs();
    const songs = chordSheets.map(chordSheetToSong);
    
    console.log('🔄 Refreshing My Songs from cache:', songs.length, 'songs');
    setMySongs(songs);
  }, []);

  useEffect(() => {
    const initializeSongs = async () => {
      // Load sample songs for the search interface
      const samples = await loadSampleSongs();
      setSampleSongs(samples);
      
      // Initial load of My Songs
      refreshMySongs();
    };
    initializeSongs();
  }, [refreshMySongs]);

  return { sampleSongs, setSampleSongs, mySongs, setMySongs, refreshMySongs };
}
