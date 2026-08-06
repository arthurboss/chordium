import type { ChordSheet, Song, SongMetadata } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Stores the full arrangement (with tabs) of a chord sheet in the separate
 * full-arrangement store. Title/artist still live in SONGS_METADATA and are
 * shared with the simplified arrangement, but key/tuning/capo are stored
 * alongside this content since CifraClub's full page can report different
 * values for them than the simplified page (e.g. an alternate fingering
 * shape used only in the tab arrangement).
 *
 * @param content - Full chord sheet content to save, plus its own key/tuning/capo if known
 * @param path - Song identifier for retrieval (same path as the simplified arrangement)
 */
export default async function storeFullChordSheet(
  content: ChordSheet & Partial<Pick<SongMetadata, "songKey" | "guitarTuning" | "guitarCapo">>,
  path: Song["path"]
): Promise<void> {
  const storedContent: StoredChordSheet = {
    path,
    songChords: content.songChords,
    ...(content.rawHtml ? { rawHtml: content.rawHtml } : {}),
    ...(content.songKey !== undefined ? { songKey: content.songKey } : {}),
    ...(content.guitarTuning !== undefined ? { guitarTuning: content.guitarTuning } : {}),
    ...(content.guitarCapo !== undefined ? { guitarCapo: content.guitarCapo } : {}),
  };
  await executeWriteTransaction(STORES.FULL_CHORD_SHEETS, (store) => store.put(storedContent));
}
