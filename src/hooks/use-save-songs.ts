import { useEffect } from "react";
import { SongData } from "@/types/song";
import { saveSongs } from "@/utils/song-storage";

// Custom hook to save user songs to localStorage whenever they change.
export function useSaveSongs(mySongs: SongData[]) {
  useEffect(() => {
    if (mySongs.length > 0) {
      saveSongs(mySongs);
    }
  }, [mySongs]);
}
