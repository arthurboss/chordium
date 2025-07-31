import type { StoredChordSheet, SearchCacheEntry } from "../../../types";

/**
 * Estimates size of a chord sheet in bytes
 */
export function estimateChordSheetSize(item: StoredChordSheet): number {
  return JSON.stringify(item).length * 2;
}

/**
 * Estimates size of a search cache entry in bytes
 */
export function estimateSearchCacheSize(item: SearchCacheEntry): number {
  return JSON.stringify(item).length * 2;
}
