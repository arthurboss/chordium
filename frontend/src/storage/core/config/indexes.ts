/**
 * Index definitions for object stores
 */

/** Index definitions for object stores */
export const INDEXES = {
  chordSheets: {
    artist: 'chordSheet.artist',    // Index nested property
    title: 'chordSheet.title',      // Index nested property
    saved: 'saved',
    timestamp: 'timestamp',
    expiresAt: 'expiresAt',
  },
  searchCache: {
    timestamp: 'timestamp',
    searchType: 'searchType',
    expiresAt: 'expiresAt',
  },
} as const;
