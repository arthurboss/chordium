import { SongData } from "@/types/song";
import { handleSaveNewSong } from "@/utils/song-actions";
import { useNavigate } from "react-router-dom";

export function useAddToMySongs(setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>, setActiveTab?: (tab: string) => void) {
  const navigate = useNavigate();
  return async (song: SongData) => {
    if (setMySongs && setActiveTab) {
      try {
        const content = `# ${song.title || 'Untitled Song'}\n## ${song.artist || 'Unknown Artist'}\n\n...`;
        handleSaveNewSong(content, song.title, setMySongs, navigate, setActiveTab);
      } catch (err) {
        console.error("Error adding song to My Songs:", err);
      }
    }
  };
}
