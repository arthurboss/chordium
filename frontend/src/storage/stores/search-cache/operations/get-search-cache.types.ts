/**
 * Type definitions for getting a single search cache entry
 */

import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * Function signature for getting a single search cache entry by path
 * 
 * @param path - The cache key path to retrieve
 * @param checkExpiration - Whether to check if entry has expired (defaults to true)
 * @returns Promise resolving to the cached entry or null if not found/expired
 * @throws {DatabaseOperationError} When database access fails
 */
export type GetSearchCacheFunction = (
  path: string,
  checkExpiration?: boolean
) => Promise<SearchCacheEntry | null>;
