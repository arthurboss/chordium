import type { ChordSheet, Song, SongMetadata } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Stores the full arrangement (with tabs) of a chord sheet in the separate
 * full-arrangement store. Its own key/capo/tuning are stored alongside the
 * content when given, since a full arrangement can be transcribed with a
 * different key/tuning than the simplified one in SONGS_METADATA.
 *
 * @param content - Full chord sheet content (and, when available, this arrangement's own metadata) to save
 * @param path - Song identifier for retrieval (same path as the simplified arrangement)
 */
export default async function storeFullChordSheet(
  content: ChordSheet & Partial<Pick<SongMetadata, "songKey" | "guitarCapo" | "guitarTuning">>,
  path: Song["path"]
): Promise<void> {
  const storedContent: StoredChordSheet = {
    path,
    songChords: content.songChords,
    ...(content.rawHtml ? { rawHtml: content.rawHtml } : {}),
    ...(content.songKey ? { songKey: content.songKey } : {}),
    ...(content.guitarCapo !== undefined ? { guitarCapo: content.guitarCapo } : {}),
    ...(content.guitarTuning ? { guitarTuning: content.guitarTuning } : {}),
  };
  await executeWriteTransaction(STORES.FULL_CHORD_SHEETS, (store) => store.put(storedContent));
}
