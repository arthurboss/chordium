import { useState, useCallback } from "react";
import { SongData } from "@/types/song";
import { fetchArtistSongs } from "@/utils/artist-utils";

export function useArtistSongs() {
  const [artistSongs, setArtistSongs] = useState<SongData[] | null>(null);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState<string | null>(null);

  const handleArtistClick = useCallback(async (artistUrl: string) => {
    if (artistLoading) return;
    setArtistLoading(true);
    setArtistError(null);
    try {
      const songs = await fetchArtistSongs(artistUrl);
      setArtistSongs(songs);
    } catch (e: any) {
      setArtistError(e.message || 'Failed to fetch artist songs');
    } finally {
      setArtistLoading(false);
    }
  }, [artistLoading]);

  const resetArtistSongs = () => setArtistSongs(null);

  return { artistSongs, artistLoading, artistError, handleArtistClick, resetArtistSongs };
}
