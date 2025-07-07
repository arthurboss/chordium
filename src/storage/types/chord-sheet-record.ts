import { ChordSheet } from '@/types/chordSheet';

/**
 * IndexedDB record for chord sheet storage
 */
export interface ChordSheetRecord {
  id: string;                // Primary key: "artist-title"
  artist: string;            // Indexed for efficient artist queries
  title: string;             // Indexed for efficient title queries  
  chordSheet: ChordSheet;    // The actual chord sheet data
  saved: boolean;            // Indexed: true for saved, false for cache
  timestamp: number;         // Cache timestamp for TTL
  accessCount: number;       // Usage tracking for LRU
  deletedAt?: number;        // Timestamp when song was deleted (for retention)
  // Future-ready fields for S3 integration
  dataSource?: 'scraping' | 's3';  // Where the data came from
  version?: number;          // Version for cache invalidation
}
