import type { SearchCacheEntry } from "../../../types/search-cache";
import type { StoreResultsFunction, StoreCacheOptions } from "./store-results.types";
import storeSearchCache from "./store-search-cache";
import { getDefaultTTL } from "../utils/get-default-ttl";

/**
 * Store search results from API data
 *
 * Creates a complete SearchCacheEntry from API results and stores it.
 * Handles TTL calculation and entry structure creation.
 */
const storeResults: StoreResultsFunction = async (
  searchKey: string,
  results: SearchCacheEntry['results'],
  search: SearchCacheEntry['search'],
  options: StoreCacheOptions = {}
): Promise<void> => {
  const ttl = options.ttl || getDefaultTTL(search.dataSource);

  const entry: SearchCacheEntry = {
    searchKey,
    results,
    search,
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + ttl,
    },
  };

  return storeSearchCache(entry);
};

export default storeResults;
