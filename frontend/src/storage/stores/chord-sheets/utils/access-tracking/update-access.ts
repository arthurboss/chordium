/**
 * Access tracking utilities for StoredChordSheet objects
 * 
 * Single responsibility: Updates access-related metadata for LRU cache logic.
 * Handles only access tracking concerns, not creation or save status.
 */

import type { StoredChordSheet } from "../../../../types/chord-sheet";

/**
 * Updates lastAccessed and accessCount for existing StoredChordSheet
 * 
 * Call this every time a user opens/views a chord sheet to maintain
 * accurate LRU (Least Recently Used) tracking for cache eviction.
 * 
 * @param storedChordSheet - Existing stored chord sheet to update
 * @returns Updated StoredChordSheet with incremented access tracking
 */
export function updateAccess(
  storedChordSheet: StoredChordSheet
): StoredChordSheet {
  return {
    ...storedChordSheet,
    storage: {
      ...storedChordSheet.storage,
      lastAccessed: Date.now(),
      accessCount: storedChordSheet.storage.accessCount + 1,
    },
  };
}
