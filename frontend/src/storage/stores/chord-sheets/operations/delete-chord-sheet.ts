import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Deletes a chord sheet entirely from cache:
 * - Removes metadata from songsMetadata
 * - Removes content from chordSheets
 */
export default async function deleteChordSheet(path: string): Promise<void> {
  if (!path) {
    throw new Error("Path is required for delete operation");
  }

  await executeWriteTransaction(STORES.SONGS_METADATA, (store) => {
    return store.delete(path);
  });

  await executeWriteTransaction(STORES.CHORD_SHEETS, (store) => {
    return store.delete(path);
  });
}
