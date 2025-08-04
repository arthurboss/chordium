/**
 * Type definitions for getting all search cache entries
 */

import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * Function to retrieve all search cache entries from IndexedDB
 * 
 * Returns all cached search entries. Useful for cache management,
 * cleanup operations, and cache analytics.
 * 
 * @returns Promise resolving to array of all cached search entries
 * @throws {DatabaseOperationError} When database access fails
 */
export type GetAllSearchCacheFunction = () => Promise<SearchCacheEntry[]>;
