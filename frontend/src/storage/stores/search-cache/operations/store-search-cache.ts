/**
 * Store a search cache entry in IndexedDB
 */

import type { SearchCacheEntry } from "../../../types/search-cache";
import type { StoreSearchCacheFunction } from "./store-search-cache.types";
import { executeWriteTransaction } from "../../../core/transactions";
import { getDatabase } from "../../chord-sheets/database/connection";

/**
 * Stores search results in IndexedDB with TTL metadata
 * 
 * Will replace any existing entry with the same path. This ensures
 * that cache entries are always updated with the latest data.
 * 
 * @param entry - The complete search cache entry to store
 * @returns Promise that resolves when the entry is successfully stored
 * @throws {DatabaseOperationError} When database storage fails
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 */
const storeSearchCache: StoreSearchCacheFunction = async (
  entry: SearchCacheEntry
): Promise<void> => {
  // Ensure database initialization
  await getDatabase();

  await executeWriteTransaction<IDBValidKey>(
    "searchCache",
    (store) => store.put(entry)
  );
};

export default storeSearchCache;
