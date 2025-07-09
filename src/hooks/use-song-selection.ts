import { useNavigate } from "react-router-dom";
import { toSlug } from "@/utils/url-slug-utils";
import { Song } from "@/types/song";

export function useSongSelection(setSelectedSong) {
  const navigate = useNavigate();

  const handleSongSelect = (song: Song) => {
    if (song.artist && song.title) {
      const artistSlug = toSlug(song.artist);
      const songSlug = toSlug(song.title);
      const targetUrl = `/my-chord-sheets/${artistSlug}/${songSlug}`;
      navigate(targetUrl, { state: { song } });
    } else {
      setSelectedSong(song);
      navigate(`/my-chord-sheets?song=${encodeURIComponent(song.path)}`, { state: { song } });
    }
  };

  return { handleSongSelect };
}
