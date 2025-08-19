/**
 * Delete a search cache entry from IndexedDB
 */

import type { DeleteSearchCacheFunction } from "./delete-search-cache.types";
import { executeWriteTransaction, executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../../chord-sheets/database/connection";

/**
 * Deletes a cached search entry by its searchKey
 * 
 * First checks if the entry exists, then deletes it if found.
 * This approach allows us to return whether deletion actually occurred.
 * 
 * @param searchKey - The cache key to delete
 * @returns Promise resolving to true if deleted, false if not found
 * @throws {DatabaseOperationError} When database deletion fails
 */
const deleteSearchCache: DeleteSearchCacheFunction = async (
  searchKey: string
): Promise<boolean> => {
  // Ensure database initialization
  await getDatabase();

  // First check if entry exists
  const existingEntry = await executeReadTransaction<unknown>(
    "searchCache",
    (store) => store.get(searchKey)
  );

  if (!existingEntry) {
    return false;
  }

  // Delete the entry
  await executeWriteTransaction<undefined>(
    "searchCache",
    (store) => store.delete(searchKey)
  );

  return true;
};

export default deleteSearchCache;
