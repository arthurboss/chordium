import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Deletes a song and everything belonging to it: its metadata, both
 * arrangements, and its lyrics. Every store is cleared even when the song never
 * had that part, since deleting an absent key is a no-op, and skipping any of
 * them would leave rows behind that nothing else collects.
 */
export default async function deleteChordSheet(path: string): Promise<void> {
  if (!path) {
    throw new Error("Path is required for delete operation");
  }

  const stores = [
    STORES.SONGS_METADATA,
    STORES.CHORD_SHEETS,
    STORES.FULL_CHORD_SHEETS,
    STORES.SONG_LYRICS,
  ];

  for (const storeName of stores) {
    await executeWriteTransaction(storeName, (store) => store.delete(path));
  }
}
