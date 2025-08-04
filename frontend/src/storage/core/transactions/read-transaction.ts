import { getDatabase } from "../../stores/chord-sheets/database/connection";
import { DatabaseOperationError } from "../../stores/chord-sheets/types/errors";

/**
 * Generic read transaction executor for any IndexedDB object store
 *
 * @param storeName - Name of the object store to access
 * @param operation - Function that performs the read operation
 * @returns Promise resolving to the operation result
 * @throws {DatabaseOperationError} When database operation fails
 */
export default async function executeReadTransaction<T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);

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
