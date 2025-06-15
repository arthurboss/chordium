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

  const updatedSongs = mySongs.filter((song) => song.path !== songPath);
  console.log("updatedSongs count:", updatedSongs.length);

  setMySongs(updatedSongs);

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
