import { useEffect } from "react";
import type { SearchState } from "../SearchStateContext.types";
import getSearchCache from "@/storage/stores/search-cache/operations/get-search-cache";
import { SEARCH_TYPES, Song } from "@chordium/types";

export function useHydrateSearch(
  setSearchState: (s: SearchState) => void,
  setHydrated: (h: boolean) => void
) {
  useEffect(() => {
    async function hydrate() {
      const cacheKey = "global-search-state";
      const entry = await getSearchCache(cacheKey, false);
      if (entry?.search && Array.isArray(entry.results)) {
        // Use searchType to determine if results should be Song[]
        const isSongArray =
          entry.search.searchType === SEARCH_TYPES.SONG ||
          entry.search.searchType === SEARCH_TYPES.ARTIST_SONG;
        setSearchState({
          artist: entry.search.query.artist ?? "",
          song: entry.search.query.song ?? "",
          results: isSongArray ? (entry.results as Song[]) : [],
        });
      }
      setHydrated(true);
    }
    hydrate();
  }, [setSearchState, setHydrated]);
}
