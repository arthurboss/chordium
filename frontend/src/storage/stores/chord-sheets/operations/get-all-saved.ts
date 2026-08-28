import type { StoredSongMetadata } from "../../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeReadTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

export type ChordSheetListItem = StoredSongMetadata;

export default async function getAllSavedChordSheets(): Promise<ChordSheetListItem[]> {
  const allRecords = await executeReadTransaction<StoredSongMetadata[]>(STORES.SONGS_METADATA, (store) =>
    store.getAll()
  );
  const saved = allRecords.filter((record) => record.storage?.saved === true);

  // Show the arrangement the user last viewed: a full arrangement can carry
  // its own key/capo/tuning, distinct from the simplified one stored here.
  return Promise.all(
    saved.map(async (record) => {
      if (record.storage.lastViewedVariant !== "full") return record;
      const full = await executeReadTransaction<StoredChordSheet | undefined>(
        STORES.FULL_CHORD_SHEETS,
        (store) => store.get(record.path)
      );
      if (!full) return record;
      return {
        ...record,
        ...(full.songKey ? { songKey: full.songKey } : {}),
        ...(full.guitarCapo !== undefined ? { guitarCapo: full.guitarCapo } : {}),
        ...(full.guitarTuning ? { guitarTuning: full.guitarTuning } : {}),
      };
    })
  );
}
