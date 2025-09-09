/**
 * Retrieves chord sheet metadata from IndexedDB storage
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheetMetadata } from "../../../types/chord-sheet-metadata";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { STORES } from "../../../core/config/stores";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";

/**
 * Gets stored chord sheet metadata by its unique path identifier
 * 
 * @param path - Song path identifier
 * @returns StoredChordSheetMetadata if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getChordSheetMetadata(
  path: Song["path"]
): Promise<StoredChordSheetMetadata | null> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  // Try direct path lookup first
  let result = await executeReadTransaction<StoredChordSheetMetadata | undefined>(
    STORES.SONGS_METADATA,
    (store) => store.get(path)
  );

  // If not found, try sample path resolution for format differences
  if (!result) {
    const resolvedPath = resolveSampleChordSheetPath(path);
    if (resolvedPath !== path) {
      result = await executeReadTransaction<StoredChordSheetMetadata | undefined>(
        STORES.SONGS_METADATA,
        (store) => store.get(resolvedPath)
      );
    }
  }

  return result || null;
}
