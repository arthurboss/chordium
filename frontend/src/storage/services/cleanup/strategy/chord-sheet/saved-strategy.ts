import type { StoredSongMetadata } from "../../../../types";
import type { CleanupStrategy } from "../types";

/**
 * Strategy for saved chord sheets
 *
 * CRITICAL: Saved items are NEVER automatically removed (user does it manually)
 *
 * @param metadata The stored chord sheet metadata to evaluate
 * @returns Strategy indicating item cannot be removed
 */
export function calculateSavedChordSheetStrategy(
  metadata: StoredSongMetadata
): CleanupStrategy {
  if (!metadata.storage.saved) {
    throw new Error(
      "calculateSavedChordSheetStrategy called on non-saved item"
    );
  }

  return {
    canRemove: false,
    priority: 0,
    reason: "item is saved by user",
  };
}

/**
 * Checks if a chord sheet is saved
 *
 * @param metadata The stored chord sheet metadata to check
 * @returns True if the item is saved by user
 */
export function isSavedChordSheet(metadata: StoredSongMetadata): boolean {
  return metadata.storage.saved;
}
