import { SongData } from "../types/song";
import { toast } from "@/hooks/use-toast";

/**
 * Updates an existing song in the user's collection
 */
export const handleUpdateSong = (
  content: string,
  selectedSong: SongData | null,
  mySongs: SongData[],
  setMySongs: React.Dispatch<React.SetStateAction<SongData[]>>,
  setSelectedSong: React.Dispatch<React.SetStateAction<SongData | null>>
): void => {
  if (!selectedSong) return;
  
  const updatedSongs = mySongs.map(song => {
    if (song.id === selectedSong.id) {
      return { ...song, path: content };
    }
    return song;
  });
  
  setMySongs(updatedSongs);
  setSelectedSong({ ...selectedSong, path: content });
  
  toast({
    title: "Song updated",
    description: `"${selectedSong.title}" has been updated`
  });
};
