/**
 * Get a single search cache entry by searchKey
 */

import type { SearchCacheEntry } from "../../../types/search-cache";
import type { GetSearchCacheFunction } from "./get-search-cache.types";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../../chord-sheets/database/connection";
import { isExpired } from "../../../core/ttl/validation";

/**
 * Retrieves cached search results for a specific search query
 * 
 * By default, expired entries are treated as not found to ensure users
 * get fresh data when cache has expired.
 * 
 * @param searchKey - The cache key searchKey to retrieve
 * @param checkExpiration - Whether to check if entry has expired (defaults to true)
 * @returns Promise resolving to the cached entry or null if not found/expired
 * @throws {DatabaseOperationError} When database access fails
 */
const getSearchCache: GetSearchCacheFunction = async (
  searchKey: string,
  checkExpiration = true
): Promise<SearchCacheEntry | null> => {
  // Ensure database initialization
  await getDatabase();

  const result = await executeReadTransaction<SearchCacheEntry | undefined>(
    "searchCache",
    (store) => store.get(searchKey)
  );

  if (!result) {
    return null;
  }

  // Check expiration if requested
  if (checkExpiration && result.storage.expiresAt && isExpired(result.storage.expiresAt)) {
    return null;
  }

  return result;
};

export default getSearchCache;
