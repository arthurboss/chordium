import { Artist } from '../types/artist';
import { Song } from '../types/song';
import { fetchArtistSongs } from '../utils/artist-utils';
import { useAsyncFetch } from './useAsyncFetch';
import { useCallback } from 'react';

export const useArtistSongs = (artist: Artist | null) => {
  const fetchFn = useCallback(async (signal: AbortSignal) => {
    if (!artist) {
      throw new Error('No artist provided');
    }
    return await fetchArtistSongs(artist.path);
  }, [artist]);

  const { data: artistSongs, loading, error } = useAsyncFetch<Song[]>(
    fetchFn,
    {
      enabled: !!artist,
      dependencies: [artist?.path]
    }
  );

  return { 
    artistSongs, 
    loading, 
    error 
  };
};
