import type { ChordSheet, Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Stores the full arrangement (with tabs) of a chord sheet in the separate
 * full-arrangement store. Content only — metadata lives in SONGS_METADATA and
 * is shared with the simplified arrangement.
 *
 * @param content - Full chord sheet content to save
 * @param path - Song identifier for retrieval (same path as the simplified arrangement)
 */
export default async function storeFullChordSheet(
  content: ChordSheet,
  path: Song["path"]
): Promise<void> {
  const storedContent: StoredChordSheet = {
    path,
    songChords: content.songChords,
    ...(content.rawHtml ? { rawHtml: content.rawHtml } : {}),
  };
  await executeWriteTransaction(STORES.FULL_CHORD_SHEETS, (store) => store.put(storedContent));
}
