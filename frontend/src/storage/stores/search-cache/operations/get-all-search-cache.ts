/**
 * Get all search cache entries from IndexedDB
 */

import type { SearchCacheEntry } from "../../../types/search-cache";
import type { GetAllSearchCacheFunction } from "./get-all-search-cache.types";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../../chord-sheets/database/connection";

/**
 * Retrieves all cached search entries from IndexedDB
 * 
 * Returns all entries regardless of expiration status. Useful for
 * cache management operations, analytics, and cleanup processes.
 * 
 * @returns Promise resolving to array of all cached search entries
 * @throws {DatabaseOperationError} When database access fails
 */
const getAllSearchCache: GetAllSearchCacheFunction = async (): Promise<SearchCacheEntry[]> => {
  // Ensure database initialization
  await getDatabase();

  const result = await executeReadTransaction<SearchCacheEntry[]>(
    "searchCache",
    (store) => store.getAll()
  );

  return result || [];
};

export default getAllSearchCache;