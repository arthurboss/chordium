import { useLayoutEffect, useInsertionEffect, useRef } from "react";
import { Artist, Song } from "@chordium/types";
import type { SearchEffectsProps } from "@/search/types";

export const useSearchEffects = ({
  loading,
  error,
  artists,
  songs,
  artistSongs,
  artistSongsError,
  artistSongsLoading,
  activeArtist,
  hasSearched,
  state,
  dispatch,
}: SearchEffectsProps) => {
  // Use refs to prevent infinite loops by tracking what we've already dispatched
  const lastDispatchedRef = useRef<{
    loading?: boolean;
    error?: Error | string | null;
    artists?: Artist[];
    songs?: Song[];
    artistSongs?: Song[] | null;
    artistSongsError?: Error | string | null;
    activeArtist?: Artist | null;
  }>({});

  // Use useInsertionEffect for initialization - runs before DOM mutations
  useInsertionEffect(() => {
    // Initialize state if needed - no dispatch needed here
    // The state will be initialized by the other effects
  }, []);

  // Use useLayoutEffect for search state changes - prevents UI flashing
  useLayoutEffect(() => {
    const lastDispatched = lastDispatchedRef.current;

    if (loading && !state.loading && lastDispatched.loading !== loading) {
      dispatch({ type: "SEARCH_START" });
      lastDispatched.loading = loading;
    } else if (
      !loading &&
      !error &&
      (hasSearched || artists.length > 0 || songs.length > 0) &&
      (lastDispatched.artists !== artists || lastDispatched.songs !== songs)
    ) {
      dispatch({ type: "SEARCH_SUCCESS", artists, songs });
      lastDispatched.artists = artists;
      lastDispatched.songs = songs;
      lastDispatched.loading = loading;
    } else if (
      !loading &&
      error &&
      error !== state.error &&
      lastDispatched.error !== error
    ) {
      const errorObj = typeof error === "string" ? new Error(error) : error;
      dispatch({ type: "SEARCH_ERROR", error: errorObj });
      lastDispatched.error = error;
      lastDispatched.loading = loading;
    }
  }, [
    loading,
    error,
    artists,
    songs,
    state.loading,
    state.error,
    dispatch,
    hasSearched,
  ]);

  // Use useLayoutEffect for artist songs changes - prevents UI flashing
  useLayoutEffect(() => {
    const lastDispatched = lastDispatchedRef.current;

    if (
      artistSongsError &&
      artistSongsError !== state.artistSongsError &&
      lastDispatched.artistSongsError !== artistSongsError
    ) {
      dispatch({
        type: "ARTIST_SONGS_ERROR",
        error:
          typeof artistSongsError === "string"
            ? artistSongsError
            : artistSongsError.message,
      });
      lastDispatched.artistSongsError = artistSongsError;
    } else if (
      !artistSongsLoading &&
      artistSongs !== null &&
      lastDispatched.artistSongs !== artistSongs
    ) {
      dispatch({ type: "ARTIST_SONGS_SUCCESS", songs: artistSongs });
      lastDispatched.artistSongs = artistSongs;
    }
  }, [
    artistSongs,
    artistSongsError,
    artistSongsLoading,
    state.artistSongs,
    state.artistSongsError,
    state.artistSongsLoading,
    dispatch,
  ]);

  // Use useLayoutEffect for artist selection - prevents UI flashing
  useLayoutEffect(() => {
    const lastDispatched = lastDispatchedRef.current;

    if (
      activeArtist !== state.activeArtist &&
      lastDispatched.activeArtist !== activeArtist
    ) {
      if (activeArtist) {
        dispatch({ type: "ARTIST_SONGS_START", artist: activeArtist });
        lastDispatched.activeArtist = activeArtist;
      } else if (state.activeArtist) {
        dispatch({ type: "CLEAR_ARTIST" });
        lastDispatched.activeArtist = null;
      }
    }
  }, [activeArtist, state.activeArtist, dispatch]);
};
