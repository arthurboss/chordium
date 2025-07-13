import { useEffect, useRef, useState } from "react";
import { Artist } from "@/types/artist";
import { Song } from "@/types/song";
import { useSearchFetch } from "./useSearchFetch";
import { useSearchFilter } from "./useSearchFilter";

export interface UseSearchResultsOptions {
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  shouldFetch?: boolean;
  onFetchComplete?: () => void;
}

/**
 * Custom hook to handle search results fetching and filtering
 * 
 * @param options - Options object for search and filtering
 */
export function useSearchResults({
  artist,
  song,
  filterArtist,
  filterSong,
  shouldFetch = false,
  onFetchComplete,
}: UseSearchResultsOptions) {
  // State for currently displayed results
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  // Refs for last-fetched results
  const lastArtistsRef = useRef<Artist[]>([]);
  const lastSongsRef = useRef<Song[]>([]);
  // Version counter to force filter recompute
  const [filterVersion, setFilterVersion] = useState(0);
  const prevFiltersRef = useRef<{ artist: string; song: string }>({ artist: '', song: '' });

  console.log('[useSearchResults] RENDER:', { artist, song, filterArtist, filterSong, shouldFetch });

  // Fetch data using the dedicated fetch hook
  const { artists, songs, loading, error, hasFetched } = useSearchFetch({
    artist, 
    song, 
    shouldFetch
  });

  console.log('[useSearchResults] FETCH RESULT:', { artists: artists?.length, songs: songs?.length, loading, error, hasFetched });

  // On fetch, update both state and refs
  useEffect(() => {
    if (hasFetched) {
      console.log('[useSearchResults] UPDATING STATE FROM FETCH:', { artists: artists?.length, songs: songs?.length });
      setAllArtists(artists || []);
      setAllSongs(songs || []);
      lastArtistsRef.current = artists || [];
      lastSongsRef.current = songs || [];
      
      // Notify parent that fetch completed successfully
      if (onFetchComplete) {
        console.log('[useSearchResults] FETCH COMPLETE - Calling onFetchComplete');
        onFetchComplete();
      }
    }
  }, [hasFetched, artists, songs, onFetchComplete]);

  // On filter clear, reset state from refs and increment version
  useEffect(() => {
    const currentFilters = { artist: filterArtist, song: filterSong };
    const prevFilters = prevFiltersRef.current;
    
    // Only update if filters actually changed and both are now empty
    if (hasFetched && 
        !currentFilters.artist && 
        !currentFilters.song && 
        (prevFilters.artist || prevFilters.song)) {
      console.log('[useSearchResults] FILTER CLEARED - RESETTING STATE');
      setAllArtists(lastArtistsRef.current);
      setAllSongs(lastSongsRef.current);
      setFilterVersion(v => v + 1);
    }
    
    prevFiltersRef.current = currentFilters;
  }, [filterArtist, filterSong, hasFetched]);

  // Filter results using the dedicated filter hook, include filterVersion in deps
  const { filteredArtists, filteredSongs } = useSearchFilter(
    allArtists,
    allSongs,
    filterArtist,
    filterSong,
    hasFetched,
    shouldFetch,
    filterVersion
  );

  console.log('[useSearchResults] FILTERED RESULTS:', { 
    allArtists: allArtists.length, 
    allSongs: allSongs.length,
    filteredArtists: filteredArtists.length, 
    filteredSongs: filteredSongs.length 
  });

  return {
    artists: filteredArtists,
    songs: filteredSongs,
    loading,
    error
  };
}
