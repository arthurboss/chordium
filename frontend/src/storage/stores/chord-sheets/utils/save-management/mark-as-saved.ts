/**
 * Save status management for StoredChordSheet objects
 * 
 * Single responsibility: Manages the saved/unsaved state transitions.
 * Handles only save status concerns and related TTL logic.
 */

import type { StoredChordSheet } from "../../../../types/chord-sheet";

/**
 * Marks a chord sheet as saved by user (never expires)
 * 
 * Saved items are permanent user storage and bypass TTL cleanup.
 * Updates access time to reflect the save action.
 * 
 * @param storedChordSheet - Chord sheet to mark as saved
 * @returns Updated StoredChordSheet with saved status
 */
export function markAsSaved(
  storedChordSheet: StoredChordSheet
): StoredChordSheet {
  return {
    ...storedChordSheet,
    storage: {
      ...storedChordSheet.storage,
      saved: true,
      expiresAt: null, // Saved items never expire
      lastAccessed: Date.now(), // Update access time when saving
    },
  };
}
