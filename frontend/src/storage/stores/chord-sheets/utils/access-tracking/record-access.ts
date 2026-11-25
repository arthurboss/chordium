import type { StoredSongMetadata } from "../../../../types/stored-song-metadata";
import storeChordSheetMetadata from "../../operations/store-chord-sheet-metadata";
import { updateAccess } from "./update-access";

// One chord sheet open can mount more than one metadata hook and can redirect
// to a variant path, so collapse those into a single access.
const OPEN_DEDUPE_MS = 2000;
const lastRecorded = new Map<string, number>();

export function recordAccess(metadata: StoredSongMetadata): StoredSongMetadata {
  const now = Date.now();
  const previous = lastRecorded.get(metadata.path);
  if (previous !== undefined && now - previous < OPEN_DEDUPE_MS) {
    return metadata;
  }

  lastRecorded.set(metadata.path, now);
  const updated = updateAccess(metadata);
  storeChordSheetMetadata(updated).catch(() => {});
  return updated;
}
