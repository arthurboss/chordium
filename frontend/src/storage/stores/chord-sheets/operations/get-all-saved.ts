import type { StoredSongMetadata } from "../../../types/stored-song-metadata";
import { executeReadTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

export type ChordSheetListItem = StoredSongMetadata;

export default async function getAllSavedChordSheets(): Promise<ChordSheetListItem[]> {
  const allRecords = await executeReadTransaction<StoredSongMetadata[]>(STORES.SONGS_METADATA, (store) =>
    store.getAll()
  );
  return allRecords.filter((record) => record.storage?.saved === true);
}
