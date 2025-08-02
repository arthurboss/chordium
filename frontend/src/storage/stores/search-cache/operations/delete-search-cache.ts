/**
 * Delete a search cache entry from IndexedDB
 */

import type { DeleteSearchCacheFunction } from "./delete-search-cache.types";
import executeSearchCacheWriteTransaction from "../utils/transactions/write-transaction";
import executeSearchCacheReadTransaction from "../utils/transactions/read-transaction";
import { getDatabase } from "../../chord-sheets/database/connection";

/**
 * Deletes a cached search entry by its path key
 * 
 * First checks if the entry exists, then deletes it if found.
 * This approach allows us to return whether deletion actually occurred.
 * 
 * @param path - The cache key path to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws {DatabaseOperationError} When database deletion fails
 */
const deleteSearchCache: DeleteSearchCacheFunction = async (
  path: string
): Promise<boolean> => {
  // Ensure database initialization
  await getDatabase();

  // First check if entry exists
  const existingEntry = await executeSearchCacheReadTransaction<unknown>(
    (store) => store.get(path)
  );

  if (!existingEntry) {
    return false;
  }

  // Delete the entry
  await executeSearchCacheWriteTransaction<undefined>(
    (store) => store.delete(path)
  );

  return true;
};

export default deleteSearchCache;
