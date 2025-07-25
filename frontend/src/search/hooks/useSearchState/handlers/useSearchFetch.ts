import { useCallback, useRef } from "react";
import type { Artist, Song } from "@chordium/types";
import { 
  cacheSearchResults, 
  getCachedSearchResults 
} from "@/cache/implementations/search-cache";
import type { SearchResultsAction } from "@/search/types/searchResultsAction";
import { getApiBaseUrl } from "@/utils/api-base-url";

interface UseSearchFetchOptions {
  dispatch: React.Dispatch<SearchResultsAction>;
  onFetchComplete?: () => void;
  setSearchFetching: (loading: boolean) => void;
}

/**
 * Hook for handling search API requests with caching
 */
export const useSearchFetch = ({ 
  dispatch, 
  onFetchComplete, 
  setSearchFetching 
}: UseSearchFetchOptions) => {
  const isFetching = useRef(false);
  const lastFetchParams = useRef<{ artist: string; song: string }>({
    artist: "",
    song: "",
  });

  const fetchSearchResults = useCallback(async (artistParam: string, songParam: string) => {
    if (isFetching.current) return;
    
    const paramsChanged = 
      artistParam !== lastFetchParams.current.artist ||
      songParam !== lastFetchParams.current.song;
    
    if (!paramsChanged) return;
    
    isFetching.current = true;
    setSearchFetching(true);
    lastFetchParams.current = { artist: artistParam, song: songParam };

    try {
      dispatch({ type: "SEARCH_START" });

      if (!artistParam && !songParam) {
        dispatch({ type: "SEARCH_SUCCESS", artists: [], songs: [] });
        if (onFetchComplete) onFetchComplete();
        return;
      }

      // Check cache first
      const cachedResults = getCachedSearchResults(artistParam, songParam);
      if (cachedResults !== null) {
        if (artistParam) {
          // Artist search - cached results are Artist[]
          dispatch({ 
            type: "SEARCH_SUCCESS", 
            artists: cachedResults as unknown as Artist[], 
            songs: [] 
          });
        } else if (songParam) {
          // Song search - cached results are Song[]
          dispatch({ 
            type: "SEARCH_SUCCESS", 
            artists: [], 
            songs: cachedResults as unknown as Song[] 
          });
        }
        if (onFetchComplete) onFetchComplete();
        return;
      }

      // Make API call based on search type
      const baseUrl = getApiBaseUrl();
      let apiUrl: string;
      if (!artistParam && songParam) {
        // Song only search
        apiUrl = `${baseUrl}/api/cifraclub-search?artist=&song=${encodeURIComponent(songParam)}`;
      } else {
        // Artist search or artist+song search
        apiUrl = `${baseUrl}/api/artists?artist=${encodeURIComponent(artistParam)}&song=${encodeURIComponent(songParam)}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.status}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];

      if (!artistParam && songParam) {
        // Song search
        dispatch({ type: "SEARCH_SUCCESS", artists: [], songs: data });
        cacheSearchResults(artistParam, songParam, data);
      } else {
        // Artist search
        dispatch({ type: "SEARCH_SUCCESS", artists: data, songs: [] });
        cacheSearchResults(artistParam, songParam, data);
      }

      if (onFetchComplete) onFetchComplete();
    } catch (err) {
      console.error("[useSearchFetch] FETCH ERROR:", err);
      const errorObj = err instanceof Error ? err : new Error("Failed to fetch search results");
      dispatch({ type: "SEARCH_ERROR", error: errorObj });
    } finally {
      setSearchFetching(false);
      isFetching.current = false;
    }
  }, [dispatch, onFetchComplete, setSearchFetching]);

  return { fetchSearchResults };
};
