import { SongData } from "../types/song";
import { toast } from "@/hooks/use-toast";

/**
 * Deletes a song from the user's collection
 */
export const handleDeleteSong = (
  songId: string,
  mySongs: SongData[],
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>,
  selectedSong: SongData | null,
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>
): void => {
  const songToDelete = mySongs.find(song => song.id === songId);
  if (!songToDelete) return;
  
  const updatedSongs = mySongs.filter(song => song.id !== songId);
  setMySongs(updatedSongs);
  
  if (selectedSong?.id === songId) {
    setSelectedSong(null);
  }
  
  toast({
    title: "Song deleted",
    description: `"${songToDelete.title}" has been removed from My Songs`
  });
};
