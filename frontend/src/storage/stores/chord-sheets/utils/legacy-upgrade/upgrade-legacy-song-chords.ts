import type { StoredChordSheet } from "../../../../types/stored-chord-sheet";
import { executeWriteTransaction } from "../../../../core/transactions";
import { isLegacyPositionalFormat, migrateLegacyToChordPro } from "@/utils/chordpro/migrate-legacy";

/**
 * If `content.songChords` is in the legacy positional format, migrates it to
 * ChordPro text and writes the upgraded record back to `storeName` so the
 * migration only happens once per record, not on every read.
 *
 * Runs even when `rawHtml` is present: `rawHtml` takes priority for
 * rendering, but `songChords` is still read directly by the editor and
 * downloads, so it should be kept up to date with the new format too.
 */
export async function upgradeLegacySongChords(
  storeName: string,
  content: StoredChordSheet
): Promise<StoredChordSheet> {
  if (!isLegacyPositionalFormat(content.songChords)) {
    return content;
  }

  const upgraded: StoredChordSheet = {
    ...content,
    songChords: migrateLegacyToChordPro(content.songChords),
  };

  await executeWriteTransaction(storeName, (store) => store.put(upgraded));

  return upgraded;
}
