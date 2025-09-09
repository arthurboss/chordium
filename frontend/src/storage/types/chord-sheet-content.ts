/**
 * Chord sheet content type for true lazy loading
 */

import type { StoredRecord } from "./stored-record";

/**
 * Content-only storage for chord sheets
 * Contains only the heavy songChords content, linked to metadata by path
 */
export interface StoredChordSheetContent extends StoredRecord {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) - links to metadata */
  path: string;
  /** The actual chord sheet content - the heavy part */
  songChords: string;
  /** Storage-specific metadata for content */
  storage: StoredRecord["storage"];
}
