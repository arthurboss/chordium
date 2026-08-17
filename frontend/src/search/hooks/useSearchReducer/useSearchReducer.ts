import { useReducer, useEffect, useCallback, useMemo } from "react";
import type { Artist } from "@chordium/types";
import { useSongActions } from "../useSongActions";
import { initialSearchState } from "./core/initialSearchState";
import { searchStateReducer } from "./core/searchStateReducer";
import { determineUIState } from "./utils/determineUIState";
import { useSearchFetch } from "./handlers/useSearchFetch";
import { useArtistSongsFetch } from "./handlers/useArtistSongsFetch";
import type { UseSearchReducerOptions } from "./useSearchReducer.types";

export const useSearchReducer = ({
  query,
  filter,
  shouldFetch,
  activeArtist,
  onFetchComplete,
  onLoadingChange,
  onArtistSelect,
  setMySongs,
}: UseSearchReducerOptions) => {
  const [state, dispatch] = useReducer(searchStateReducer, initialSearchState);

  // Loading state calculation - now uses consolidated state
  const isLoading = useMemo(() => {
    return (
      state.loading ||
      state.artistSongsLoading ||
      state.searchFetching ||
      state.artistSongsFetching
    );
  }, [
    state.loading,
    state.artistSongsLoading,
    state.searchFetching,
    state.artistSongsFetching,
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
    setSearchFetching: (value) => dispatch({ type: "SET_SEARCH_FETCHING", fetching: value }),
  });

  // Artist songs fetch handler
  const { fetchArtistSongsData, clearArtistSongsFetch } = useArtistSongsFetch({
    dispatch,
    setArtistSongsFetching: (value) => dispatch({ type: "SET_ARTIST_SONGS_FETCHING", fetching: value }),
  });

  // Effect: Handle search fetch when shouldFetch changes
  useEffect(() => {
    if (shouldFetch && query) {
      fetchSearchResults(query);
    }
  }, [shouldFetch, query, fetchSearchResults]);

  // Effect: Handle active artist changes - optimized to avoid unnecessary re-runs
  useEffect(() => {
    // Only run if activeArtist actually changed (comparing by path instead of object reference)
    if (activeArtist && activeArtist.path !== state.activeArtist?.path) {
      fetchArtistSongsData(activeArtist);
    } else if (!activeArtist && state.activeArtist) {
      dispatch({ type: "CLEAR_ARTIST" });
      clearArtistSongsFetch();
    }
  }, [
    activeArtist?.path, // Compare by path instead of full object
    state.activeArtist?.path,
    fetchArtistSongsData,
    clearArtistSongsFetch,
    dispatch,
  ]);

  // Effect: Handle filter changes for artist songs - optimized to avoid unnecessary dispatches
  useEffect(() => {
    if (state.artistSongs && filter !== state.lastAppliedFilter) {
      dispatch({ type: "FILTER_ARTIST_SONGS", filter });
    }
  }, [filter, state.artistSongs, state.lastAppliedFilter, dispatch]);

  // Generate UI state data
  const stateData = useMemo(() => determineUIState(state), [state]);

  // Song actions
  const songActions = useSongActions({
    memoizedSongs: state.activeArtist
      ? state.artistSongs || []
      : state.hits.flatMap((hit) => (hit.type === "song" ? [hit] : [])),
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
    hits: state.hits,
    artistSongs: state.artistSongs,
    filteredArtistSongs: state.filteredArtistSongs,
    activeArtist: state.activeArtist,

    // Actions
    dispatch,
    handleView: songActions.handleView,
    handleAdd: songActions.handleAdd,
    handleArtistSelect,
    clearSearch: () => dispatch({ type: "CLEAR_SEARCH" }),
  };
};
