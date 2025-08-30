import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearchState } from "../context";
import { fromSlug } from "@/utils/url-slug-utils";
import { SearchType } from "@chordium/types";
import { useSearchCache } from "@/storage/hooks/use-search-cache";

// Restores search state from URL parameters on mount
export function useSearchRedirect() {
  const location = useLocation();
  const { updateSearchState, searchState } = useSearchState();
  
  // Try to get search cache for fallback restoration
  const { cacheEntry } = useSearchCache({
    searchKey: searchState.query.artist || searchState.query.song ? 
      `${searchState.query.artist}|${searchState.query.song}|${searchState.searchType}` : 
      undefined
  });

  useEffect(() => {
    // Only handle search routes - don't restore from artist page URLs
    if (location.pathname === "/search") {
      const searchParams = new URLSearchParams(location.search);
      const artistParam = searchParams.get("artist");
      const songParam = searchParams.get("song");

      // If URL has search parameters, restore the search state
      if (artistParam || songParam) {
        const artist = artistParam ? fromSlug(artistParam) : "";
        const song = songParam ? fromSlug(songParam) : "";
        
        // Determine search type based on URL parameters
        // Following backend logic in determineSearchType()
        let searchType: SearchType;
        if (artistParam && !songParam) {
          searchType = "artist";
        } else if (!artistParam && songParam) {
          searchType = "song";
        } else if (artistParam && songParam) {
          searchType = "song"; // Backend treats artist+song as song search
        } else {
          searchType = "artist"; // Default fallback
        }

        updateSearchState({ 
          searchType, 
          results: [],
          query: { artist, song }
        });
      } else if (cacheEntry && cacheEntry.search) {
        // Fallback: try to restore from cache if no URL parameters
        // This helps preserve search context when navigating back
        updateSearchState({
          searchType: cacheEntry.search.searchType,
          results: cacheEntry.results,
          query: cacheEntry.search.query
        });
      }
    }
    // Note: We intentionally don't handle artist page URLs here
    // to preserve the original search state when navigating back
  }, [location.search, location.pathname, updateSearchState, cacheEntry]);
}
