/**
 * Factory for creating StoredChordSheet objects with proper metadata
 * Handles both new storage and access tracking for LRU logic
 */

import type { ChordSheet } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";

/**
 * Creates a new StoredChordSheet for first-time storage
 * Sets both timestamp (when stored) and lastAccessed (when first accessed)
 */
export function createStoredChordSheet(
  chordSheet: ChordSheet,
  path: string,
  options: {
    saved?: boolean;
    source?: string;
    expiresAt?: number | null;
  } = {}
): StoredChordSheet {
  const now = Date.now();

  return {
    // Inherit ChordSheet fields directly
    ...chordSheet,
    
    // Add path for IndexedDB key
    path,
    
    // Storage metadata
    storage: {
      saved: options.saved ?? false,
      timestamp: now, // When first stored
      lastAccessed: now, // When first accessed (same as storage for new items)
      accessCount: 1, // First access
      version: 1, // Schema version
      expiresAt:
        options.expiresAt ??
        (options.saved ? null : now + 7 * 24 * 60 * 60 * 1000), // 7 days for cached
    },
  };
}

/**
 * Updates lastAccessed and accessCount for existing StoredChordSheet
 * Call this every time a user opens/views a chord sheet
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

/**
 * Marks a chord sheet as saved by user (never expires)
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

/**
 * Unmarks a saved chord sheet (converts back to cached with TTL)
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
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days TTL
      lastAccessed: now,
    },
  };
}
