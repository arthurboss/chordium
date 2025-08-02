import { getDatabase } from "../../../chord-sheets/database/connection";
import { DatabaseOperationError } from "../../../chord-sheets/types/errors";

/**
 * Executes a read-only transaction on the searchCache object store
 *
 * @param operation - Function that performs the read operation
 * @returns Promise resolving to the operation result
 * @throws {DatabaseOperationError} When database operation fails
 */
export default async function executeSearchCacheReadTransaction<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction(["searchCache"], "readonly");
  const store = transaction.objectStore("searchCache");

  return new Promise((resolve, reject) => {
    const request = operation(store);

    request.onerror = () => {
      const error = request.error;
      reject(
        new DatabaseOperationError(
          "read",
          error ? new Error(error.message) : undefined
        )
      );
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}