import type { StoredChordSheetMetadata } from "../../../types/chord-sheet-metadata";
import { executeReadTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Metadata type for list view - only fields actually used by UI components
 */
export type ChordSheetListItem = {
  title: string;
  artist: string;
  path: string;
};

/**
 * @returns Chord sheets marked as saved by the user
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getAllSavedChordSheets(): Promise<
  ChordSheetListItem[]
> {
  // Read only the fields we actually need for the list view
  const savedMetadata = await executeReadTransaction<StoredChordSheetMetadata[]>(STORES.SONGS_METADATA, (store) =>
    store.getAll()
  ).then((allRecords) =>
    allRecords.filter((record) => record.storage?.saved === true)
  );

  // Return minimal objects - only title, artist, path (what UI actually uses)
  return savedMetadata.map((metadata): ChordSheetListItem => ({
    title: metadata.title,
    artist: metadata.artist,
    path: metadata.path,
  }));
}
