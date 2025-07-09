/**
 * Testable IndexedDB Migration Service
 * Uses in-memory storage for testing
 * Follows SRP: Single responsibility for migration testing
 */

import { ChordSheet } from '@/types/chordSheet';
import { TestableChordSheetRepository } from './testable-chord-sheet-repository';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skippedCount: number;
}

type MigrationSubResult = Pick<MigrationResult, 'migratedCount' | 'errors' | 'skippedCount'>;

interface LegacyCacheItem {
  key: string;
  data: ChordSheet;
  timestamp: number;
  accessCount: number;
  saved?: boolean;
}

interface ChordSheetCacheData {
  items: LegacyCacheItem[];
}

interface LegacyChordSheetData {
  [key: string]: ChordSheet;
}

/**
 * Testable migration utility using in-memory storage
 */
export class TestableIndexedDBMigrationService {
  private readonly repository: TestableChordSheetRepository;
  private readonly MIGRATION_FLAG = 'chordium-indexeddb-migration-completed';

  constructor() {
    this.repository = new TestableChordSheetRepository();
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
      if (!this.isValidChordSheetCacheItem(item)) {
        result.errors.push(`Invalid cache item structure for key: ${item.key}`);
        return result;
      }

      // Extract artist and title from chord sheet data
      const artist = item.data.artist || 'Unknown Artist';
      const title = item.data.title || 'Unknown Title';

      // Check if already exists (avoid duplicates)
      const existingRecord = await this.repository.get(artist, title);
      if (existingRecord) {
        result.skippedCount++;
        return result;
      }

      // Store in IndexedDB using repository
      await this.repository.store(artist, title, item.data, { saved: item.saved || false });

      result.migratedCount++;

    } catch (error) {
      result.errors.push(`Failed to migrate item ${item.key}: ${error}`);
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
        if (!this.isValidLegacyChordSheetItem(item)) {
          result.errors.push(`Invalid legacy item structure for key: ${item.key}`);
          continue;
        }

        // Extract artist and title from chord sheet data
        const artist = item.data.artist || 'Unknown Artist';
        const title = item.data.title || 'Unknown Title';

        // Check if already exists (avoid duplicates)
        const existingRecord = await this.repository.get(artist, title);
        if (existingRecord) {
          result.skippedCount++;
          continue;
        }

        // Store in IndexedDB using repository
        await this.repository.store(artist, title, item.data, { saved: item.saved || false });

        result.migratedCount++;

      } catch (error) {
        result.errors.push(`Failed to migrate legacy item ${item.key}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Validate chord sheet cache item structure
   */
  private isValidChordSheetCacheItem(item: LegacyCacheItem): boolean {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.key === 'string' &&
      item.data &&
      typeof item.data === 'object' &&
      typeof item.timestamp === 'number'
    );
  }

  /**
   * Validate legacy chord sheet item structure
   */
  private isValidLegacyChordSheetItem(item: LegacyCacheItem): boolean {
    return this.isValidChordSheetCacheItem(item);
  }

  /**
   * Clean up legacy localStorage keys after migration
   */
  async cleanupLocalStorage(dryRun: boolean = false): Promise<void> {
    const keysToRemove = [
      'chordium-chord-sheet-cache',
      'chord-sheet-cache',
      'my-chord-sheets',
      'myChordSheets',
      'my-chord-sheets-cache'
    ].filter(key => localStorage.getItem(key) !== null);

    for (const key of keysToRemove) {
      if (dryRun) {
        console.log(`Would remove localStorage key: ${key}`);
      } else {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
      }
    }
  }
}
