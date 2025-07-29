/**
 * Removes a chord sheet from storage
 */

import type { Song } from '@chordium/types';
import executeWriteTransaction from '../utils/transactions/write-transaction';

/**
 * @param path - Song identifier to remove
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function deleteChordSheet(path: Song["path"]): Promise<void> {
  return executeWriteTransaction((store) => 
    store.delete(path)
  );
}
