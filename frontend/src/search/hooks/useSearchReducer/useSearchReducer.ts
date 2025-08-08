import { useReducer, useEffect, useState, useCallback, useMemo } from "react";
import type { Artist } from "@chordium/types";
import { useSongActions } from "../useSongActions";
import { initialSearchState } from "./core/initialSearchState";
import { searchStateReducer } from "./core/searchStateReducer";
import { determineUIState } from "./utils/determineUIState";
import { useSearchFetch } from "./handlers/useSearchFetch";
import { useArtistSongsFetch } from "./handlers/useArtistSongsFetch";
import type { UseSearchReducerOptions } from "./useSearchReducer.types";

export const useSearchReducer = ({
  artist,
  song,
  filterSong,
  shouldFetch,
  activeArtist,
  onFetchComplete,
  onLoadingChange,
  onArtistSelect,
  setMySongs,
}: UseSearchReducerOptions) => {
  const [state, dispatch] = useReducer(searchStateReducer, initialSearchState);

  // Search fetch state
  const [searchFetching, setSearchFetching] = useState(false);
  const [artistSongsFetching, setArtistSongsFetching] = useState(false);

  // Single source of truth for loading state
  const isLoading = useMemo(() => {
    return (
      state.loading ||
      state.artistSongsLoading ||
      searchFetching ||
      artistSongsFetching
    );
  }, [
    state.loading,
    state.artistSongsLoading,
    searchFetching,
    artistSongsFetching,
  ]);

  // Notify parent of loading changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Search fetch handler
  const { fetchSearchResults } = useSearchFetch({
    dispatch,
    onFetchComplete,
    setSearchFetching,
  });

  // Artist songs fetch handler
  const { fetchArtistSongsData, clearArtistSongsFetch } = useArtistSongsFetch({
    dispatch,
    setArtistSongsFetching,
  });

  // Effect: Handle search fetch when shouldFetch changes
  useEffect(() => {
    if (shouldFetch && (artist || song)) {
      fetchSearchResults(artist, song);
    }
  }, [artist, song, shouldFetch, fetchSearchResults]);

  // Effect: Handle active artist changes
  useEffect(() => {
    if (activeArtist && activeArtist !== state.activeArtist) {
      fetchArtistSongsData(activeArtist);
    } else if (!activeArtist && state.activeArtist) {
      dispatch({ type: "CLEAR_ARTIST" });
      clearArtistSongsFetch();
    }
  }, [
    activeArtist,
    state.activeArtist,
    fetchArtistSongsData,
    clearArtistSongsFetch,
  ]);

  // Effect: Handle filter changes for artist songs
  useEffect(() => {
    if (state.artistSongs) {
      dispatch({ type: "FILTER_ARTIST_SONGS", filter: filterSong });
    }
  }, [filterSong, state.artistSongs]);

  // Generate UI state data
  const stateData = useMemo(() => determineUIState(state), [state]);

  // Song actions
  const songActions = useSongActions({
    memoizedSongs: state.activeArtist ? state.artistSongs || [] : state.songs,
    setMySongs,
  });

  // Artist selection handler
  const handleArtistSelect = useCallback(
    (artist: Artist) => {
      if (onArtistSelect) {
        onArtistSelect(artist);
      }
    },
    [onArtistSelect]
  );

  return {
    // State
    state,
    stateData,
    isLoading,

    // Data
    artists: state.artists,
    songs: state.songs,
    artistSongs: state.artistSongs,
    filteredArtistSongs: state.filteredArtistSongs,
    activeArtist: state.activeArtist,

    // Actions
    dispatch,
    handleView: songActions.handleView,
    handleAdd: songActions.handleAdd,
    handleArtistSelect,
  };
};
