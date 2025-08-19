/**
 * Type definitions for getting a single search cache entry
 */

import type { SearchCacheEntry } from "../../../types/search-cache";

/**
 * Function signature for getting a single search cache entry by searchKey
 * 
 * @param searchKey - The cache key searchKey to retrieve
 * @param checkExpiration - Whether to check if entry has expired (defaults to true)
 * @returns Promise resolving to the cached entry or null if not found/expired
 * @throws {DatabaseOperationError} When database access fails
 */
export type GetSearchCacheFunction = (
  searchKey: string,
  checkExpiration?: boolean
) => Promise<SearchCacheEntry | null>;
