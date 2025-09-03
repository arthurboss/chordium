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

  // Memoized search type calculation to avoid recalculating on every render
  const searchType = useMemo(() => {
    if (song) return "song"; // Backend treats artist+song as song search
    if (artist) return "artist";
    return "artist"; // Default fallback
  }, [artist, song]);

  // Effect: Handle search fetch when shouldFetch changes - optimized with memoized search type
  useEffect(() => {
    if (shouldFetch && (artist || song)) {
      fetchSearchResults(artist, song, searchType);
    }
  }, [shouldFetch, searchType, fetchSearchResults]);

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
    if (state.artistSongs && filterSong !== state.lastAppliedFilter) {
      dispatch({ type: "FILTER_ARTIST_SONGS", filter: filterSong });
    }
  }, [filterSong, state.artistSongs, state.lastAppliedFilter, dispatch]);

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
    clearSearch: () => dispatch({ type: "CLEAR_SEARCH" }),
  };
};
