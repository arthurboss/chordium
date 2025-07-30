/**
 * Unsave status management for StoredChordSheet objects
 * 
 * Single responsibility: Converts saved items back to cached items with TTL.
 * Handles only the unsave transition and TTL assignment.
 */

import type { StoredChordSheet } from "../../../../types/chord-sheet";
import { calculateCacheExpiration } from "../ttl-constants";

/**
 * Unmarks a saved chord sheet (converts back to cached with TTL)
 * 
 * Converts a permanently saved item back to a cached item that will
 * be subject to TTL cleanup. Updates access time to reflect the action.
 * 
 * @param storedChordSheet - Saved chord sheet to convert to cached
 * @returns Updated StoredChordSheet with cached status and TTL
 */
export function markAsUnsaved(
  storedChordSheet: StoredChordSheet
): StoredChordSheet {
  const now = Date.now();
  
  return {
    ...storedChordSheet,
    storage: {
      ...storedChordSheet.storage,
      saved: false,
      expiresAt: calculateCacheExpiration(now),
      lastAccessed: now,
    },
  };
}
