/**
 * Type definitions for deleting search cache entries
 */

/**
 * Function to delete a search cache entry from IndexedDB
 * 
 * Removes a specific cache entry by its path key.
 * Returns true if entry was found and deleted, false if entry didn't exist.
 * 
 * @param path - The cache key path to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws {DatabaseOperationError} When database deletion fails
 */
export type DeleteSearchCacheFunction = (
  path: string
) => Promise<boolean>;
