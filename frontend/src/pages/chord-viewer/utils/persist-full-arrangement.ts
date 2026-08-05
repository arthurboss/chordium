import type { ChordSheet, Song } from "@chordium/types";

interface PersistFullArrangementDeps {
  storeFullChordSheet: (content: ChordSheet, path: Song["path"]) => Promise<void>;
  fetchFullSongFromAPI: (path: string) => Promise<ChordSheet | null>;
}

/**
 * Persists the full arrangement (with tabs) as saved, alongside the
 * simplified one, when the user hits Save. Runs independently of the calling
 * component's lifecycle (fire-and-forget), so it still completes if the user
 * navigates away right after saving.
 *
 * - If already fetched (hasFullArrangement), stores it immediately.
 * - Otherwise, fetches it in the background and stores it once it arrives,
 *   so toggling to Full later doesn't need to re-fetch.
 */
export function persistFullArrangementOnSave(
  path: Song["path"],
  hasFullArrangement: boolean,
  fullContent: ChordSheet | null,
  deps: PersistFullArrangementDeps
): void {
  const { storeFullChordSheet, fetchFullSongFromAPI } = deps;

  if (hasFullArrangement && fullContent) {
    storeFullChordSheet(fullContent, path).catch(() => {});
    return;
  }

  if (hasFullArrangement) return; // hasFullArrangement true but content missing - inconsistent state, nothing to persist

  fetchFullSongFromAPI(path)
    .then((full) => {
      if (full?.songChords) {
        storeFullChordSheet(full, path).catch(() => {});
      }
    })
    .catch(() => {});
}
