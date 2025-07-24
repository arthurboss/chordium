import { useState, useRef, useEffect, useCallback } from "react";
import { Artist, Song } from "@chordium/types";
import {
  cacheSearchResults,
  getCachedSearchResults,
} from "../cache/implementations/search-cache";
import type {
  UseSearchFetchState,
  UseSearchFetchOptions,
} from "@/search/types";

export const useSearchFetch = ({
  artist,
  song,
  shouldFetch,
}: UseSearchFetchOptions): UseSearchFetchState => {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const lastFetchParams = useRef<{ artist: string; song: string }>({
    artist: "",
    song: "",
  });
  const lastResults = useRef<{
    artists: Artist[] | null;
    songs: Song[] | null;
  }>({ artists: null, songs: null });
  const isFetching = useRef(false);

  const fetchData = useCallback(
    async (artistParam: string, songParam: string) => {
      // Prevent concurrent fetches
      if (isFetching.current) {
        return;
      }
      isFetching.current = true;

      if (!artistParam && !songParam) {
        setArtists(null);
        setSongs(null);
        setLoading(false);
        setError(null);
        setHasFetched(true);
        isFetching.current = false;
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedResults = getCachedSearchResults(artistParam, songParam);
        if (cachedResults !== null) {
          if (artistParam) {
            // Artist search - cached results are Artist[]
            setArtists(cachedResults as unknown as Artist[]);
            setSongs(null);
            lastResults.current = {
              artists: cachedResults as unknown as Artist[],
              songs: null,
            };
          } else if (songParam) {
            // Song only search - cached results are Song[]
            setSongs(cachedResults as unknown as Song[]);
            setArtists(null);
            lastResults.current = {
              artists: null,
              songs: cachedResults as unknown as Song[],
            };
          }
          setLoading(false);
          setError(null);
          setHasFetched(true);
          lastFetchParams.current = { artist: artistParam, song: songParam };
          isFetching.current = false;
          return;
        }

        // Make API call based on search type
        if (!artistParam && songParam) {
          // Song only search
          const url = `/api/cifraclub-search?artist=&song=${encodeURIComponent(songParam)}`;
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(
              `Failed to fetch search results: ${response.status}`
            );
          const text = await response.text();
          const data = text ? JSON.parse(text) : [];
          setSongs(data);
          setArtists(null);
          cacheSearchResults(artistParam, songParam, data);
          lastResults.current = { artists: null, songs: data };
        } else if (artistParam || songParam) {
          // Artist only or artist+song search
          const url = `/api/artists?artist=${encodeURIComponent(artistParam)}&song=${encodeURIComponent(songParam)}`;
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(
              `Failed to fetch search results: ${response.status}`
            );
          const text = await response.text();
          const data = text ? JSON.parse(text) : [];
          setArtists(data);
          setSongs(null);
          cacheSearchResults(artistParam, songParam, data);
          lastResults.current = { artists: data, songs: null };
        }
      } catch (err) {
        console.error("[useSearchFetch] FETCH ERROR:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch search results"
        );
        setSongs(null);
        setArtists(null);
        setLoading(false);
        setHasFetched(true);
        lastFetchParams.current = { artist: artistParam, song: songParam };
      } finally {
        isFetching.current = false;
      }
    },
    []
  ); // Remove shouldFetch from dependencies to prevent recreation

  useEffect(() => {
    // Only trigger fetch when shouldFetch is true and search params have changed
    if (shouldFetch) {
      const searchParamsChanged =
        artist !== lastFetchParams.current.artist ||
        song !== lastFetchParams.current.song;
      const shouldTriggerFetch = searchParamsChanged && (artist || song);

      if (shouldTriggerFetch) {
        fetchData(artist, song);
      }
    }
  }, [artist, song, shouldFetch, fetchData]);

  // On filter changes (shouldFetch: false), use lastResults for local filtering
  useEffect(() => {
    if (!shouldFetch && !loading) {
      setArtists(lastResults.current.artists);
      setSongs(lastResults.current.songs);
    }
  }, [shouldFetch, loading]);

  return {
    artists,
    songs,
    loading,
    error,
    hasFetched,
  };
};
