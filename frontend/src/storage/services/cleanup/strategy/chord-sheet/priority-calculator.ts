import type { StoredSongMetadata } from "../../../../types";
import type { CleanupStrategy } from "../types";
import {
  calculateSavedChordSheetStrategy,
  isSavedChordSheet,
} from "./saved-strategy";
import { calculateCachedChordSheetStrategy } from "./cached-strategy";

/**
 * Calculates cleanup priority for a chord sheet
 *
 * Routes to appropriate strategy based on whether item is saved or cached.
 * CRITICAL: Saved items are NEVER automatically removed (user does it manually)
 *
 * @param metadata The stored chord sheet metadata to evaluate
 * @returns Cleanup strategy with priority and removal permission
 */
export function calculateChordSheetCleanupPriority(
  metadata: StoredSongMetadata
): CleanupStrategy {
  // Saved items use simple strategy: never remove
  if (isSavedChordSheet(metadata)) {
    return calculateSavedChordSheetStrategy(metadata);
  }

  // Cached items use complex LRU strategy
  return calculateCachedChordSheetStrategy(metadata);
}
