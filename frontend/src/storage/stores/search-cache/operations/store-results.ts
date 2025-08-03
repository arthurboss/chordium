import type { SearchCacheEntry } from "../../../types/search-cache";
import type { StoreResultsFunction, SearchQuery, StoreCacheOptions } from "./store-results.types";
import type { Artist, Song, SearchType, DataSource } from "@chordium/types";
import storeSearchCache from "./store-search-cache";
import { getDefaultTTL } from "../utils/get-default-ttl";

/**
 * Store search results from API data
 * 
 * Creates a complete SearchCacheEntry from API results and stores it.
 * Handles TTL calculation and entry structure creation.
 */
const storeResults: StoreResultsFunction = async (
  path: string,
  results: Artist[] | Song[],
  query: SearchQuery,
  searchType: SearchType,
  dataSource: DataSource,
  options: StoreCacheOptions = {}
): Promise<void> => {
  const ttl = options.ttl || getDefaultTTL(dataSource);
  
  const entry: SearchCacheEntry = {
    path,
    results,
    search: {
      query,
      searchType,
      dataSource,
    },
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + ttl,
    },
  };

  return storeSearchCache(entry);
};

export default storeResults;
