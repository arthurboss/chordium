/**
 * Custom favorite list types
 *
 * A list is a user-named grouping of chord sheets the user has already
 * saved. Lists never duplicate chord sheet data: membership rows
 * (StoredListItem) reference a song only by its StoredSongMetadata path.
 */

/**
 * A custom, user-created list of saved chord sheets.
 */
export interface StoredList {
  /** Primary key for IndexedDB storage (uuid) */
  id: string;
  /** User-chosen display name */
  name: string;
  /** Where the list came from. Only manual creation exists today; reserved
   * for a future Spotify-backed source. */
  source: 'manual';
  /** Position among other lists, for stable ordering in the filter row */
  order: number;
  /** When the list was created (epoch ms) */
  createdAt: number;
}

/**
 * Membership row linking a list to a saved chord sheet.
 *
 * Keyed by `${listId}::${path}` so adding the same song to the same list
 * twice is a no-op `put` rather than a duplicate row, without needing a
 * read-before-write existence check.
 */
export interface StoredListItem {
  /** Primary key for IndexedDB storage (`${listId}::${path}`) */
  id: string;
  /** Owning list's id */
  listId: string;
  /** Linked StoredSongMetadata path */
  path: string;
  /** Position among other items in the same list */
  order: number;
}
