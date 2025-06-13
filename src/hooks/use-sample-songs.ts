import { useState, useEffect } from "react";
import { Song } from "@/types/song";
import { loadSampleSongs } from "@/utils/sample-songs";
import { loadSongs, migrateSongsFromOldStorage } from "@/utils/unified-song-storage";

// Custom hook to load sample songs and initialize user songs from storage.
export function useSampleSongs() {
  const [sampleSongs, setSampleSongs] = useState<Song[]>([]);
  const [mySongs, setMySongs] = useState<Song[]>([]);

  useEffect(() => {
    const initializeSongs = async () => {
      // Migrate songs from old storage system if needed
      migrateSongsFromOldStorage();
      
      const samples = await loadSampleSongs();
      setSampleSongs(samples);
      const initialSongs = samples.map(song => ({ ...song }));
      setMySongs(loadSongs(initialSongs));
    };
    initializeSongs();
  }, []);

  return { sampleSongs, setSampleSongs, mySongs, setMySongs };
}
