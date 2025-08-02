import { getDatabase } from "../../../chord-sheets/database/connection";
import { DatabaseOperationError, StorageQuotaExceededError } from "../../../chord-sheets/types/errors";

/**
 * Executes a write transaction on the searchCache object store
 *
 * @param operation - Function that performs the write operation
 * @returns Promise resolving to the operation result
 * @throws {DatabaseOperationError} When database operation fails
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 */
export default async function executeSearchCacheWriteTransaction<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction(["searchCache"], "readwrite");
  const store = transaction.objectStore("searchCache");

  return new Promise((resolve, reject) => {
    const request = operation(store);

    request.onerror = () => {
      const error = request.error;
      
      // Handle quota exceeded error specifically
      if (error?.name === "QuotaExceededError") {
        reject(
          new StorageQuotaExceededError(
            error ? new Error(error.message) : undefined
          )
        );
        return;
      }

      reject(
        new DatabaseOperationError(
          "write",
          error ? new Error(error.message) : undefined
        )
      );
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}
