import { useState, useEffect } from "react";
import { SongData } from "@/types/song";
import { Artist } from "@/types/artist";
import { fetchArtistSongs } from "@/utils/artist-utils";

/**
 * Custom hook to fetch songs for a selected artist.
 * Returns: { songs, loading, error }
 */
export function useArtistSongs(artist: Artist | null) {
  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artist) {
      setSongs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchArtistSongs(artist.path)
      .then(setSongs)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch artist songs'))
      .finally(() => setLoading(false));
  }, [artist]);

  return { songs, loading, error };
}
