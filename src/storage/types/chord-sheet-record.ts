import { ChordSheet } from '@/types/chordSheet';

/**
 * Metadata for chord sheet cache entries
 * Follows SRP: Single responsibility for metadata structure
 */
export interface ChordSheetMetadata {
  readonly saved: boolean;
  readonly lastAccessed: number;
  readonly accessCount: number;
}

/**
 * Cache information for chord sheet entries
 * Follows SRP: Single responsibility for cache info structure
 */
export interface ChordSheetCacheInfo {
  readonly cachedAt: number;
  readonly expiresAt: number;
  readonly version: string;
}

/**
 * IndexedDB record for chord sheet storage
 * Follows SRP: Single responsibility for database record structure
 */
export interface ChordSheetRecord {
  readonly id: string;
  readonly artist: string;
  readonly title: string;
  readonly chordSheet: ChordSheet;
  readonly metadata: ChordSheetMetadata;
  readonly cacheInfo: ChordSheetCacheInfo;
}
