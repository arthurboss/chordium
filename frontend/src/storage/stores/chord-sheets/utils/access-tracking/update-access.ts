/**
 * Access tracking utilities for StoredSongMetadata objects
 * 
 * Single responsibility: Updates access-related metadata for LRU cache logic.
 * Handles only access tracking concerns, not creation or save status.
 */

import type { StoredSongMetadata } from "../../../../types/stored-song-metadata";

/**
 * Updates lastAccessed and accessCount for existing StoredSongMetadata
 * 
 * Call this every time a user opens/views a chord sheet to maintain
 * accurate LRU (Least Recently Used) tracking for cache eviction.
 * 
 * @param metadata - Existing stored chord sheet metadata to update
 * @returns Updated StoredSongMetadata with incremented access tracking
 */
export function updateAccess(
  metadata: StoredSongMetadata
): StoredSongMetadata {
  return {
    ...metadata,
    storage: {
      ...metadata.storage,
      lastAccessed: Date.now(),
      accessCount: metadata.storage.accessCount + 1,
    },
  };
}
