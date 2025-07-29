/**
 * Retrieves a chord sheet from storage by song path
 */

import type { Song } from '@chordium/types';
import type { StoredChordSheet } from '../../../types';
import executeReadTransaction from '../utils/transactions/read-transaction';

/**
 * @param path - Song path identifier
 * @returns StoredChordSheet if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getChordSheet(path: Song["path"]): Promise<StoredChordSheet | null> {
  return executeReadTransaction<StoredChordSheet | undefined>((store) => 
    store.get(path)
  ).then(result => result || null);
}
