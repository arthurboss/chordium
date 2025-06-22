import { Song } from "../types/song";
import { toast } from "@/hooks/use-toast";
import { removeFromMySongs, parseMySongsCacheKey } from '@/cache/implementations/my-songs-cache';

/**
 * Deletes a song from persistent storage (localStorage) by extracting 
 * artist and title from the song path and using the cache system
 * 
 * @param songPath - The song path in format 'artist_name-song_title' (same as cache key format)
 */
export function deleteSongFromStorage(songPath: string): void {
  console.log('🗑️ Deleting song from storage:', {
    songPath
  });

  if (!songPath?.includes('-')) {
    console.warn('Invalid song path format. Expected format: artist_name-song_title', songPath);
    return;
  }

  // Use the same parsing logic as the cache system
  const { artist, title } = parseMySongsCacheKey(songPath);
  
  console.log('🗑️ Parsed artist and title:', { artist, title });
  
  // Use the cache system to remove from localStorage
  removeFromMySongs(artist, title);
}

/**
 * Deletes a song from the user's collection (both UI state and persistent storage)
 */
export const handleDeleteSong = (
  songPath: string,
  mySongs: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  selectedSong: Song | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  console.log("🗑️ handleDeleteSong called");
  console.log("songPath:", songPath);
  console.log("mySongs count:", mySongs.length);
  console.log("selectedSong:", selectedSong);

  const songToDelete = mySongs.find((song) => song.path === songPath);
  console.log("songToDelete:", songToDelete);

  if (!songToDelete) {
    console.error("Song not found in mySongs!");
    return;
  }

  // Remove from UI state
  const updatedSongs = mySongs.filter((song) => song.path !== songPath);
  console.log("updatedSongs count:", updatedSongs.length);

  setMySongs(updatedSongs);

  // Remove from persistent storage (localStorage)
  deleteSongFromStorage(songPath);

  if (selectedSong?.path === songPath) {
    console.log("Clearing selectedSong");
    setSelectedSong(null);
  }

  toast({
    title: "Song deleted",
    description: `"${songToDelete.title}" has been removed from My Songs`,
  });

  console.log("Delete completed");
};
