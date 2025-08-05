import { useCallback, useRef } from "react";
import type { Artist } from "@chordium/types";
import { fetchArtistSongs } from "@/search/utils";
import type { SearchResultsAction } from "@/search/types/searchResultsAction";

interface UseArtistSongsFetchOptions {
  dispatch: React.Dispatch<SearchResultsAction>;
  setArtistSongsFetching: (loading: boolean) => void;
}

/**
 * Hook for handling artist songs API requests
 */
export const useArtistSongsFetch = ({
  dispatch,
  setArtistSongsFetching,
}: UseArtistSongsFetchOptions) => {
  const isArtistSongsFetching = useRef(false);
  const lastArtistSongsFetch = useRef<string>("");

  const fetchArtistSongsData = useCallback(
    async (artist: Artist) => {
      if (isArtistSongsFetching.current || !artist) return;

      if (lastArtistSongsFetch.current === artist.path) return;

      isArtistSongsFetching.current = true;
      setArtistSongsFetching(true);
      lastArtistSongsFetch.current = artist.path;

      try {
        dispatch({ type: "ARTIST_SONGS_START", artist });
        const songs = await fetchArtistSongs(artist.path);
        dispatch({ type: "ARTIST_SONGS_SUCCESS", songs });
      } catch (err) {
        console.error("[useArtistSongsFetch] ARTIST SONGS ERROR:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch artist songs";
        dispatch({ type: "ARTIST_SONGS_ERROR", error: errorMessage });
      } finally {
        setArtistSongsFetching(false);
        isArtistSongsFetching.current = false;
      }
    },
    [dispatch, setArtistSongsFetching]
  );

  const clearArtistSongsFetch = useCallback(() => {
    lastArtistSongsFetch.current = "";
  }, []);

  return { fetchArtistSongsData, clearArtistSongsFetch };
};
