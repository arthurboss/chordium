/**
 * IndexedDB Migration Utility for Production
 * Migrates existing localStorage data to IndexedDB on first run
 * Follows SRP: Single responsibility for data migration
 */

import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '../repositories/chord-sheet-repository';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skippedCount: number;
}

type MigrationSubResult = Pick<MigrationResult, 'migratedCount' | 'errors' | 'skippedCount'>;

interface LegacyCacheItem {
  key?: string;
  data: unknown;
  timestamp?: number;
  accessCount?: number;
}

interface ChordSheetCacheData {
  chordSheet: ChordSheet;
  metadata: {
    saved: boolean;
  };
}

interface LegacyChordSheetData {
  title: string;
  artist: string;
  songChords?: string;
  content?: string;
  songKey?: string;
  key?: string;
  guitarTuning?: string[];
  guitarCapo?: number;
  saved?: boolean;
  isSaved?: boolean;
}

/**
 * Production migration utility to move localStorage data to IndexedDB
 */
export class IndexedDBMigrationService {
  private readonly repository: ChordSheetRepository;
  private readonly MIGRATION_FLAG = 'chordium-indexeddb-migration-completed';

  constructor() {
    this.repository = new ChordSheetRepository();
  }

  /**
   * Check if migration has already been completed
   */
  isMigrationCompleted(): boolean {
    return localStorage.getItem(this.MIGRATION_FLAG) === 'true';
  }

  /**
   * Mark migration as completed
   */
  private markMigrationCompleted(): void {
    localStorage.setItem(this.MIGRATION_FLAG, 'true');
  }

  /**
   * Perform migration from localStorage to IndexedDB
   * @returns Migration result summary
   */
  async migrate(): Promise<MigrationResult> {
    if (this.isMigrationCompleted()) {
      return {
        success: true,
        migratedCount: 0,
        errors: [],
        skippedCount: 0
      };
    }

    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      await this.repository.initialize();

      // Migrate chord sheet cache
      const chordSheetResult = await this.migrateChordSheetCache();
      result.migratedCount += chordSheetResult.migratedCount;
      result.errors.push(...chordSheetResult.errors);
      result.skippedCount += chordSheetResult.skippedCount;

      // If migration was successful, mark as completed
      if (result.errors.length === 0) {
        this.markMigrationCompleted();
        console.log(`✅ IndexedDB migration completed: ${result.migratedCount} items migrated`);
      } else {
        result.success = false;
        console.error('❌ IndexedDB migration had errors:', result.errors);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Migration initialization failed: ${error}`);
      console.error('❌ IndexedDB migration failed:', error);
    } finally {
      await this.repository.close();
    }

    return result;
  }

  /**
   * Migrate chord sheet cache from localStorage to IndexedDB
   */
  private async migrateChordSheetCache(): Promise<MigrationSubResult> {
    const result: MigrationSubResult = {
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      // Check for unified chord sheet cache
      const unifiedCacheData = localStorage.getItem('chordium-chord-sheet-cache');
      if (unifiedCacheData) {
        const cacheResult = await this.migrateUnifiedChordSheetCache(unifiedCacheData);
        result.migratedCount += cacheResult.migratedCount;
        result.errors.push(...cacheResult.errors);
        result.skippedCount += cacheResult.skippedCount;
      }

      // Check for old chord sheet cache keys (legacy cleanup)
      const legacyKeys = [
        'chord-sheet-cache',
        'my-chord-sheets',
        'myChordSheets',
        'my-chord-sheets-cache'
      ];

      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const legacyResult = await this.migrateLegacyCache(legacyData, key);
          result.migratedCount += legacyResult.migratedCount;
          result.errors.push(...legacyResult.errors);
          result.skippedCount += legacyResult.skippedCount;
        }
      }

    } catch (error) {
      result.errors.push(`Chord sheet cache migration failed: ${error}`);
    }

    return result;
  }

  /**
   * Migrate legacy cache data
   */
  private async migrateLegacyCache(cacheData: string, key: string): Promise<MigrationSubResult> {
    const result: MigrationSubResult = {
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      const parsed = JSON.parse(cacheData);
      if (parsed.items && Array.isArray(parsed.items)) {
        const legacyResult = await this.migrateLegacyChordSheetItems(parsed.items);
        result.migratedCount += legacyResult.migratedCount;
        result.errors.push(...legacyResult.errors);
        result.skippedCount += legacyResult.skippedCount;
      }
    } catch (error) {
      result.errors.push(`Failed to migrate legacy key ${key}: ${error}`);
    }

    return result;
  }

  /**
   * Migrate unified chord sheet cache items
   */
  private async migrateUnifiedChordSheetCache(cacheData: string): Promise<MigrationSubResult> {
    const result: MigrationSubResult = {
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      const cache = JSON.parse(cacheData);
      
      if (cache.items && Array.isArray(cache.items)) {
        for (const item of cache.items) {
          const itemResult = await this.migrateUnifiedCacheItem(item);
          result.migratedCount += itemResult.migratedCount;
          result.errors.push(...itemResult.errors);
          result.skippedCount += itemResult.skippedCount;
        }
      }

    } catch (error) {
      result.errors.push(`Failed to parse unified cache: ${error}`);
    }

    return result;
  }

  /**
   * Migrate a single unified cache item
   */
  private async migrateUnifiedCacheItem(item: LegacyCacheItem): Promise<MigrationSubResult> {
    const result: MigrationSubResult = {
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      if (this.isValidChordSheetCacheItem(item)) {
        const chordSheetData = this.extractChordSheetData(item);
        
        // Check if already exists in IndexedDB
        const existing = await this.repository.get(chordSheetData.artist, chordSheetData.title);
        if (existing) {
          result.skippedCount++;
          return result;
        }

        // Store in IndexedDB
        await this.repository.store(
          chordSheetData.artist, 
          chordSheetData.title, 
          chordSheetData.chordSheet, 
          { saved: chordSheetData.saved }
        );
        result.migratedCount++;
        
      } else {
        result.skippedCount++;
      }
    } catch (error) {
      result.errors.push(`Failed to migrate item ${item.key ?? 'unknown'}: ${error}`);
    }

    return result;
  }

  /**
   * Migrate legacy chord sheet cache items
   */
  private async migrateLegacyChordSheetItems(items: LegacyCacheItem[]): Promise<MigrationSubResult> {
    const result: MigrationSubResult = {
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    for (const item of items) {
      try {
        if (this.isValidLegacyChordSheetItem(item)) {
          const chordSheetData = this.extractLegacyChordSheetData(item);
          
          // Check if already exists in IndexedDB
          const existing = await this.repository.get(chordSheetData.artist, chordSheetData.title);
          if (existing) {
            result.skippedCount++;
            continue;
          }

          // Store in IndexedDB
          await this.repository.store(
            chordSheetData.artist, 
            chordSheetData.title, 
            chordSheetData.chordSheet, 
            { saved: chordSheetData.saved }
          );
          result.migratedCount++;
          
        } else {
          result.skippedCount++;
        }
      } catch (error) {
        result.errors.push(`Failed to migrate legacy item: ${error}`);
      }
    }

    return result;
  }

  /**
   * Validate chord sheet cache item structure
   */
  private isValidChordSheetCacheItem(item: LegacyCacheItem): boolean {
    const data = item.data as ChordSheetCacheData;
    return data?.chordSheet?.title && 
           data?.chordSheet?.artist && 
           typeof data?.metadata?.saved === 'boolean';
  }

  /**
   * Validate legacy chord sheet item structure
   */
  private isValidLegacyChordSheetItem(item: LegacyCacheItem): boolean {
    const data = item.data as LegacyChordSheetData;
    return Boolean(data?.title && 
                   data?.artist && 
                   (data?.songChords || data?.content));
  }

  /**
   * Extract chord sheet data from cache item
   */
  private extractChordSheetData(item: LegacyCacheItem): {
    artist: string;
    title: string;
    chordSheet: ChordSheet;
    saved: boolean;
  } {
    const data = item.data as ChordSheetCacheData;
    const { chordSheet, metadata } = data;
    
    return {
      artist: chordSheet.artist,
      title: chordSheet.title,
      chordSheet: chordSheet,
      saved: metadata.saved
    };
  }

  /**
   * Extract chord sheet data from legacy item
   */
  private extractLegacyChordSheetData(item: LegacyCacheItem): {
    artist: string;
    title: string;
    chordSheet: ChordSheet;
    saved: boolean;
  } {
    const data = item.data as LegacyChordSheetData;
    
    // Convert legacy format to current ChordSheet format
    const chordSheet: ChordSheet = {
      title: data.title,
      artist: data.artist,
      songChords: data.songChords ?? data.content ?? '',
      songKey: data.songKey ?? data.key ?? '',
      guitarTuning: (data.guitarTuning as ChordSheet['guitarTuning']) ?? ['E', 'A', 'D', 'G', 'B', 'E'] as ChordSheet['guitarTuning'],
      guitarCapo: data.guitarCapo ?? 0
    };

    return {
      artist: data.artist,
      title: data.title,
      chordSheet,
      saved: data.saved === true || data.isSaved === true
    };
  }

  /**
   * Clean up localStorage after successful migration
   * @param dryRun - If true, only log what would be removed
   */
  async cleanupLocalStorage(dryRun: boolean = false): Promise<void> {
    const keysToRemove = [
      'chordium-chord-sheet-cache',
      'chord-sheet-cache',
      'my-chord-sheets',
      'myChordSheets',
      'my-chord-sheets-cache'
    ];

    for (const key of keysToRemove) {
      const value = localStorage.getItem(key);
      if (value) {
        if (dryRun) {
          console.log(`Would remove localStorage key: ${key}`);
        } else {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        }
      }
    }
  }
}
