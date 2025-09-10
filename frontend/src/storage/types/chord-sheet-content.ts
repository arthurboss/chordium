/**
 * Chord sheet content type for true lazy loading
 */

/**
 * Content-only storage for chord sheets
 * Contains only the heavy songChords content, linked to metadata by path
 * Storage metadata is controlled by the songsMetadata store
 */
export interface StoredChordSheetContent {
  /** Primary key for IndexedDB storage. ([artist-name]/[song-title]) - links to metadata */
  path: string;
  /** The actual chord sheet content - the heavy part */
  songChords: string;
}
