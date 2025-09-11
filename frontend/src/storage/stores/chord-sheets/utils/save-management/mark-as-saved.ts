/**
 * Save status management for StoredSongMetadata objects
 * 
 * Single responsibility: Manages the saved/unsaved state transitions.
 * Handles only save status concerns and related TTL logic.
 */

import type { StoredSongMetadata } from "../../../../types/stored-song-metadata";
import { updateAccess } from "../access-tracking";

/**
 * Marks a chord sheet as saved by user (never expires)
 * 
 * Saved items are permanent user storage and bypass TTL cleanup.
 * Updates access time to reflect the save action.
 * 
 * @param metadata - Chord sheet metadata to mark as saved
 * @returns Updated StoredSongMetadata with saved status
 */
export function markAsSaved(
  metadata: StoredSongMetadata
): StoredSongMetadata {
  // First update access time, then set saved status
  const accessUpdated = updateAccess(metadata);
  
  return {
    ...accessUpdated,
    storage: {
      ...accessUpdated.storage,
      saved: true,
      expiresAt: null, // Saved items never expire
    },
  };
}
