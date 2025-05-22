import { useState, useCallback } from 'react';
import { SongData } from '@/types/song';
import { Artist } from '@/types/artist';
import { fetchArtistSongs } from '@/utils/artist-utils';

interface UseArtistSongsHookResult {
  songs: SongData[] | null;
  loading: boolean;
  error: string | null;
  fetchSongs: (artist: Artist) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch and manage artist songs
 */
export function useArtistSongsHook(): UseArtistSongsHookResult {
  const [songs, setSongs] = useState<SongData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async (artist: Artist) => {
    if (!artist.path) {
      setError('Invalid artist: missing path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the new schema to fetch songs by artist path
      const artistSongs = await fetchArtistSongs(artist.path);
      setSongs(artistSongs);
    } catch (err) {
      console.error('Error fetching artist songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artist songs');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSongs(null);
    setError(null);
  }, []);

  return {
    songs,
    loading,
    error,
    fetchSongs,
    reset
  };
}
