/**
 * Removes all chord sheets from storage
 */

import executeWriteTransaction from '../utils/transactions/write-transaction';

/**
 * @returns Promise that resolves when all data is cleared
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function deleteAllChordSheets(): Promise<void> {
  return executeWriteTransaction((store) => 
    store.clear()
  );
}
