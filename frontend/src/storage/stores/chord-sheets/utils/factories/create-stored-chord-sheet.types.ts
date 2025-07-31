/**
 * Options for creating a new stored chord sheet
 */

/**
 * Options for creating a new stored chord sheet
 */
export interface CreateStoredChordSheetOptions {
  /** Whether the chord sheet is saved by user (true) or cached (false) */
  saved?: boolean;
  /** Custom expiration timestamp (overrides default TTL) */
  expiresAt?: number | null;
}
