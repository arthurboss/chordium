/**
 * Index definitions for object stores
 */

/** Index definitions for object stores */
export const INDEXES = {
  chordSheets: {
    artist: 'artist',
    title: 'title',
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
