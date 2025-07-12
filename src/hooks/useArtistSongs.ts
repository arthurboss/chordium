import { useState, useEffect, useRef } from 'react';
import { Artist } from '../types/artist';
import { Song } from '../types/song';
import { fetchArtistSongs } from '../utils/artist-utils';

export const useArtistSongs = (artist: Artist | null) => {
  const [artistSongs, setArtistSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentArtistPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Cancel any in-flight request when artist changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state when artist changes
    setArtistSongs(null);
    setLoading(false);
    setError(null);

    if (!artist) {
      currentArtistPathRef.current = null;
      return;
    }

    const artistPath = artist.path;
    currentArtistPathRef.current = artistPath;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const songs = await fetchArtistSongs(artistPath);
        
        // Only update state if this is still the current artist (prevent race conditions)
        if (currentArtistPathRef.current === artistPath) {
          setArtistSongs(songs);
          setLoading(false);
        }
      } catch (err) {
        // Only update state if this is still the current artist and it's not an abort error
        if (currentArtistPathRef.current === artistPath && err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSongs();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [artist]);

  return { artistSongs, loading, error };
};
