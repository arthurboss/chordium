import { getDatabase } from "../../stores/chord-sheets/database/connection";
import { DatabaseOperationError, StorageQuotaExceededError } from "../../stores/chord-sheets/types/errors";

/**
 * Generic write transaction executor for any IndexedDB object store
 *
 * @param storeName - Name of the object store to access
 * @param operation - Function that performs the write operation
 * @returns Promise that resolves when the operation completes
 * @throws {DatabaseOperationError} When database operation fails
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 */
export default async function executeWriteTransaction<T = void>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = operation(store);

    request.onerror = () => {
      const error = request.error;

      // Check for quota exceeded error
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
