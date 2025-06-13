import { useEffect } from "react";
import { Song } from "@/types/song";
import { saveSongs } from "@/utils/unified-song-storage";

// Custom hook to save user songs to localStorage whenever they change.
export function useSaveSongs(mySongs: Song[]) {
  useEffect(() => {
    if (mySongs.length > 0) {
      saveSongs(mySongs);
    }
  }, [mySongs]);
}
