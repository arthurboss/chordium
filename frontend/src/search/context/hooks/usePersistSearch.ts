import { useEffect } from "react";
import type { SearchState } from "../SearchStateContext.types";
import type { SearchCacheEntry } from "@/storage/types/search-cache";
import storeSearchCache from "@/storage/stores/search-cache/operations/store-search-cache";
import { enforceSearchCacheDataSource } from "@/storage/utils/enforceSearchCacheDataSource";
import type { SearchType, DataSource } from "@chordium/types";

/**
 * usePersistSearch
 *
 * Persists the current search state to the cache when hydrated.
 * Ensures mapping rules between searchType and dataSource are enforced before storing.
 *
 * @param searchState - The current search state to persist
 * @param hydrated - Whether the state has been hydrated from persistent storage
 */
export function usePersistSearch(searchState: SearchState, hydrated: boolean) {
  useEffect(() => {
    if (!hydrated) return;
    const cacheKey = "global-search-state";
    const searchType: SearchType = "artist-song";
    const dataSource: DataSource = "s3";
    let entry: SearchCacheEntry = {
      path: cacheKey,
      results: searchState.results,
      search: {
        query: {
          artist: searchState.artist,
          song: searchState.song,
        },
        searchType,
        dataSource,
      },
      storage: {
        timestamp: Date.now(),
        version: 1,
        expiresAt: null,
      },
    };
    entry = enforceSearchCacheDataSource(entry);
    storeSearchCache(entry);
  }, [searchState, hydrated]);
}
