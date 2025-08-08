import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearchState } from "../context";
import { fromSlug } from "@/utils/url-slug-utils";
import { SearchType } from "@chordium/types";

// Restores search state from URL parameters on mount
export function useSearchRedirect() {
  const location = useLocation();
  const { updateSearchState } = useSearchState();

  useEffect(() => {
    // Only handle search routes
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
      }
    }
  }, [location.search, location.pathname, updateSearchState]);
}
