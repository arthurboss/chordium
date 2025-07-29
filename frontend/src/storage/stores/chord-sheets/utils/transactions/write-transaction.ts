/**
 * Executes write operations on the chord sheets IndexedDB store with quota handling
 */

import { getDatabase } from '../../database/connection';
import { DatabaseOperationError, StorageQuotaExceededError } from '../../types/errors';

/**
 * Executes a read-write transaction on the chordSheets object store
 * 
 * @param operation - Function that performs the write operation
 * @returns Promise that resolves when the operation completes
 * @throws {DatabaseOperationError} When database operation fails
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 */
export default async function executeWriteTransaction(
  operation: (store: IDBObjectStore) => IDBRequest
): Promise<void> {
  const db = await getDatabase();
  const transaction = db.transaction(['chordSheets'], 'readwrite');
  const store = transaction.objectStore('chordSheets');
  
  return new Promise((resolve, reject) => {
    const request = operation(store);
    
    request.onerror = () => {
      const error = request.error;
      
      // Check for quota exceeded error
      if (error?.name === 'QuotaExceededError') {
        reject(new StorageQuotaExceededError(
          error ? new Error(error.message) : undefined
        ));
        return;
      }
      
      reject(new DatabaseOperationError(
        'write',
        error ? new Error(error.message) : undefined
      ));
    };
    
    request.onsuccess = () => {
      resolve();
    };
  });
}
