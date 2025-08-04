/**
 * Base stored record type definition
 * Common interface for all IndexedDB stored records
 */

/**
 * Base interface for all stored records in IndexedDB
 * Defines common storage metadata patterns shared across all stored types
 */
export interface StoredRecord {
  /** Primary key for IndexedDB storage */
  path: string;
  
  /** Storage-specific metadata grouped for organization */
  storage: {
    /** When first stored/cached */
    timestamp: number;
    /** Schema version for future migrations */
    version: number;
    /** TTL - null for items that never expire, timestamp for cached items */
    expiresAt: number | null;
  };
}
