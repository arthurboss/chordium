import { ChordSheet } from '@/types/chordSheet';

/**
 * Metadata for chord sheet records
 */
export interface ChordSheetMetadata {
  saved: boolean;
  timestamp: number;
  accessCount: number;
  version?: number;
  deletedAt?: number;
  expiresAt?: number;
}

/**
 * IndexedDB record for chord sheet storage
 */
export interface ChordSheetRecord {
  path: string;              // Primary key: backend path (e.g., "oasis/wonderwall")
  artist: string;            // Indexed for efficient artist queries
  title: string;             // Indexed for efficient title queries  
  chordSheet: ChordSheet;    // The actual chord sheet data
  saved: boolean;            // Indexed: true for saved, false for cache
  timestamp: number;         // Cache timestamp for TTL
  accessCount: number;       // Usage tracking for LRU
  deletedAt?: number;        // Timestamp when song was deleted (for retention)
  expiresAt?: number;        // Optional expiration timestamp for cache items
  // Future-ready fields for S3 integration
  version?: number;          // Version for cache invalidation
}
