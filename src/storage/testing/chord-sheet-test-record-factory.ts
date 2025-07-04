import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord } from '../types/chord-sheet-record';
import { generateChordSheetCacheKey } from '../utils/generate-chord-sheet-cache-key';

/**
 * Test utility for creating chord sheet records with custom expiration times
 * Follows SRP: Single responsibility for creating test records
 */
export class ChordSheetTestRecordFactory {
  /**
   * Create a chord sheet record with custom expiration
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @param options - Record options
   * @returns Chord sheet record
   */
  static createRecord(
    artist: string,
    title: string,
    chordSheet: ChordSheet,
    options: {
      saved?: boolean;
      expiresAt?: number;
      cachedAt?: number;
    } = {}
  ): ChordSheetRecord {
    const now = Date.now();
    const id = generateChordSheetCacheKey(artist, title);
    
    return {
      id,
      artist,
      title,
      chordSheet,
      metadata: {
        saved: options.saved ?? false,
        lastAccessed: now,
        accessCount: 1
      },
      cacheInfo: {
        cachedAt: options.cachedAt ?? now,
        expiresAt: options.expiresAt ?? (options.saved ? Number.MAX_SAFE_INTEGER : now + (24 * 60 * 60 * 1000)),
        version: '1.0'
      }
    };
  }

  /**
   * Create an expired chord sheet record
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @returns Expired chord sheet record
   */
  static createExpiredRecord(
    artist: string,
    title: string,
    chordSheet: ChordSheet
  ): ChordSheetRecord {
    const now = Date.now();
    const pastTime = now - (25 * 60 * 60 * 1000); // 25 hours ago
    
    return this.createRecord(artist, title, chordSheet, {
      saved: false,
      expiresAt: pastTime,
      cachedAt: pastTime
    });
  }

  /**
   * Create a non-expired chord sheet record
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @returns Non-expired chord sheet record
   */
  static createFreshRecord(
    artist: string,
    title: string,
    chordSheet: ChordSheet
  ): ChordSheetRecord {
    const now = Date.now();
    const futureTime = now + (23 * 60 * 60 * 1000); // 23 hours from now
    
    return this.createRecord(artist, title, chordSheet, {
      saved: false,
      expiresAt: futureTime,
      cachedAt: now
    });
  }

  /**
   * Create a saved chord sheet record (never expires)
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @returns Saved chord sheet record
   */
  static createSavedRecord(
    artist: string,
    title: string,
    chordSheet: ChordSheet
  ): ChordSheetRecord {
    return this.createRecord(artist, title, chordSheet, {
      saved: true
    });
  }
}
