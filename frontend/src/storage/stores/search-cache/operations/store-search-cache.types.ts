/**
 * Type definitions for storing search cache entries
 */

import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * Function to store a search cache entry in IndexedDB
 * 
 * Stores search results with TTL metadata for future retrieval.
 * Will replace existing entries with the same searchKey.
 * 
 * @param entry - The complete search cache entry to store
 * @returns Promise that resolves when the entry is successfully stored
 * @throws {DatabaseOperationError} When database storage fails
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 */
export type StoreSearchCacheFunction = (
  entry: SearchCacheEntry
) => Promise<void>;
