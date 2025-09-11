/**
 * Unsave status management for StoredSongMetadata objects
 * 
 * Single responsibility: Converts saved items back to cached items with TTL.
 * Handles only the unsave transition and TTL assignment.
 */

import type { StoredSongMetadata } from "../../../../types/stored-song-metadata";
import { calculateCacheExpiration } from "../../../../core/ttl/cache-expiration";
import { updateAccess } from "../access-tracking";

/**
 * Unmarks a saved chord sheet (converts back to cached with TTL)
 * 
 * Converts a permanently saved item back to a cached item that will
 * be subject to TTL cleanup. Updates access time to reflect the action.
 * 
 * @param metadata - Saved chord sheet metadata to convert to cached
 * @returns Updated StoredSongMetadata with cached status and TTL
 */
export function markAsUnsaved(
  metadata: StoredSongMetadata
): StoredSongMetadata {
  // First update access time, then set unsaved status
  const accessUpdated = updateAccess(metadata);
  
  return {
    ...accessUpdated,
    storage: {
      ...accessUpdated.storage,
      saved: false,
      expiresAt: calculateCacheExpiration(accessUpdated.storage.lastAccessed),
    },
  };
}
