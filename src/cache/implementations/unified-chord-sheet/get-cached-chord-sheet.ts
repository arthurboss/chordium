import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from "@/cache/storage/indexeddb/repositories/chord-sheet-repository";

/**
 * Get cached chord sheet if it exists and is not expired
 */
export const getCachedChordSheetByPath = async (
  repository: ChordSheetRepository,
  path: string
): Promise<ChordSheet | null> => {
  if (!path) {
    console.warn("Cannot retrieve chord sheet: invalid path", { path });
    return null;
  }

  try {
    const result = await repository.getByPath(path);

    if (!result) {
      return null;
    }

    // Check expiration - saved items never expire, cached items have TTL
    const isSaved = await repository.isSavedByPath(path);

    if (!result.chordSheet && !isSaved) {
      console.log(
        `Chord sheet cache expired (saved: ${isSaved}), already removed`
      );
      return null;
    }

    return result.chordSheet;
  } catch (error) {
    console.error("Failed to get cached chord sheet from IndexedDB:", error);
    return null;
  }
};
