import type { ChordSheet, Song, SongMetadata } from "@chordium/types";

type FullArrangementContent = ChordSheet & Partial<Pick<SongMetadata, "songKey" | "guitarTuning" | "guitarCapo">>;

interface PersistFullArrangementDeps {
  storeFullChordSheet: (content: FullArrangementContent, path: Song["path"]) => Promise<void>;
  fetchFullSongFromAPI: (path: string) => Promise<FullArrangementContent | null>;
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
  fullContent: FullArrangementContent | null,
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
