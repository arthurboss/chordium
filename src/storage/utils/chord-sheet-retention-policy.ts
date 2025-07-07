/**
 * Cache retention policy constants
 */
export const CHORD_SHEET_RETENTION_POLICY = {
  /** Saved songs never expire */
  SAVED_SONGS: Infinity,
  
  /** Recently deleted songs: 1 day grace period */
  RECENTLY_DELETED: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  
  /** Cached-only songs: 7 days before expiration */
  CACHED_ONLY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

/**
 * Calculate expiration timestamp for a chord sheet record
 * @param record - The chord sheet record
 * @returns Expiration timestamp in milliseconds, or null if never expires
 */
export function calculateExpirationTime(record: {
  saved: boolean;
  timestamp: number;
  deletedAt?: number;
}): number | null {
  // Saved songs never expire
  if (record.saved) {
    return null;
  }
  
  // Recently deleted songs: expire 1 day after deletion
  if (record.deletedAt) {
    return record.deletedAt + CHORD_SHEET_RETENTION_POLICY.RECENTLY_DELETED;
  }
  
  // Cached-only songs: expire 7 days after initial fetch
  return record.timestamp + CHORD_SHEET_RETENTION_POLICY.CACHED_ONLY;
}

/**
 * Check if a chord sheet record has expired
 * @param record - The chord sheet record
 * @param now - Current timestamp (defaults to Date.now())
 * @returns true if the record has expired and should be cleaned up
 */
export function isChordSheetExpired(record: {
  saved: boolean;
  timestamp: number;
  deletedAt?: number;
}, now: number = Date.now()): boolean {
  const expirationTime = calculateExpirationTime(record);
  
  // Never expires
  if (expirationTime === null) {
    return false;
  }
  
  return now > expirationTime;
}
