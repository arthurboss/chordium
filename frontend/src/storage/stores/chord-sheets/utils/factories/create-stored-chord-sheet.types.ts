/**
 * Options for creating a new stored chord sheet
 */
export interface CreateStoredChordSheetOptions {
  /** Whether the chord sheet is saved by user (true) or cached (false) */
  saved?: boolean;
  /** Source of the chord sheet (e.g., 'api', 'sample', 'user') */
  source?: string;
  /** Custom expiration timestamp (overrides default TTL) */
  expiresAt?: number | null;
}
