import { Song } from "../types/song";
import { toast } from "@/hooks/use-toast";

/**
 * Deletes a song from the user's collection
 */
export const handleDeleteSong = (
  songPath: string,
  mySongs: Song[],
  setMySongs: React.Dispatch<React.SetStateAction<Song[]>>,
  selectedSong: Song | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>
): void => {
  const songToDelete = mySongs.find(song => song.path === songPath);
  if (!songToDelete) return;
  
  const updatedSongs = mySongs.filter(song => song.path !== songPath);
  setMySongs(updatedSongs);
  
  if (selectedSong?.path === songPath) {
    setSelectedSong(null);
  }
  
  toast({
    title: "Song deleted",
    description: `"${songToDelete.title}" has been removed from My Songs`
  });
};
