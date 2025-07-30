/**
 * Factory for creating new StoredChordSheet objects
 * 
 * Handles the complex initialization of storage metadata required for
 * IndexedDB persistence, cache management, and LRU tracking.
 */

import type { ChordSheet } from "@chordium/types";
import type { StoredChordSheet } from "../../../../types/chord-sheet";
import { calculateCacheExpiration } from "../ttl-constants";
import type { CreateStoredChordSheetOptions } from "./create-stored-chord-sheet.types";

/**
 * Creates a new StoredChordSheet for first-time storage
 * 
 * Initializes both timestamp and lastAccessed to the same value because
 * creation represents the first access, ensuring accurate LRU tracking.
 */
export function createStoredChordSheet(
  chordSheet: ChordSheet,
  path: string,
  options: CreateStoredChordSheetOptions = {}
): StoredChordSheet {
  const now = Date.now();
  const saved = options.saved ?? false;

  return {
    // Inherit ChordSheet fields directly
    ...chordSheet,
    
    // Add path for IndexedDB key (redundant but required for UI compatibility)
    path,
    
    // Storage metadata
    storage: {
      saved,
      timestamp: now, // When first stored
      lastAccessed: now, // When first accessed (same as storage for new items)
      accessCount: 1, // First access
      version: 1, // Schema version
      expiresAt: options.expiresAt ?? (saved ? null : calculateCacheExpiration(now)),
    },
  };
}
