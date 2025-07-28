/**
 * TTL (Time To Live) configuration constants
 */

/** TTL Configuration constants */
export const TTL_CONFIG = {
  /** Chord sheets */
  CHORD_SHEET_UNSAVED: 72 * 60 * 60 * 1000, // 72 hours for cached items
  CHORD_SHEET_SAVED: null, // Never expires for saved items
  
  /** Search results */
  SEARCH_CACHE: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;
