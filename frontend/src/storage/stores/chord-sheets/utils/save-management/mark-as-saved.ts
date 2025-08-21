/**
 * Save status management for StoredChordSheet objects
 * 
 * Single responsibility: Manages the saved/unsaved state transitions.
 * Handles only save status concerns and related TTL logic.
 */

import type { StoredChordSheet } from "../../../../types/chord-sheet";
import { updateAccess } from "../access-tracking";

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
  // First update access time, then set saved status
  const accessUpdated = updateAccess(storedChordSheet);
  
  return {
    ...accessUpdated,
    storage: {
      ...accessUpdated.storage,
      saved: true,
      expiresAt: null, // Saved items never expire
    },
  };
}
