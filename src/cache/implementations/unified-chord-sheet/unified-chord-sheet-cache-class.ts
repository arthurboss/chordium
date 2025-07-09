import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from "@/cache/storage/indexeddb/repositories/chord-sheet-repository";
import {
  CacheConfig,
  UnifiedCacheStats,
  CacheChordSheetOptions,
} from "@/cache/types/unified-chord-sheet-cache";

// Import modular functions
import { getDefaultCacheConfig } from "./get-default-cache-config";
import { initializeChordSheetRepository } from "./initialize-repository";
import { cacheChordSheet as cacheChordSheetImpl } from "./cache-chord-sheet";
import { getCachedChordSheetByPath as getCachedChordSheetImpl } from "./get-cached-chord-sheet";
import { setSavedStatus } from "./management/set-saved-status";
import { removeChordSheet } from "./management/remove-chord-sheet";
import { clearExpiredEntries } from "./management/clear-expired-entries";
import { clearAllCache } from "./management/clear-all-cache";
import { getAllSavedChordSheets } from "./queries/get-all-saved-chord-sheets";
import { isChordSheetSaved } from "./queries/is-chord-sheet-saved";
import { isChordSheetCached } from "./queries/is-chord-sheet-cached-check";
import { getCacheStats } from "./queries/get-cache-stats";
import { parseCacheKeyToComponents } from "./utilities/parse-cache-key";
import { getConfig } from "./utilities/get-config";
import { closeRepository } from "./utilities/close-repository";

/**
 * Normalize a string for use in paths (memory-efficient version)
 */
function normalizeStringForPath(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/g, "")
    .replace(/-+$/g, "");
}

/**
 * Generate a path from artist and title
 */
function generatePathFromArtistTitle(artist: string, title: string): string {
  const normalizedArtist = normalizeStringForPath(artist);
  const normalizedTitle = normalizeStringForPath(title);
  return `${normalizedArtist}/${normalizedTitle}`;
}

/**
 * IndexedDB-based unified chord sheet cache with modular architecture
 * Each method delegates to a specific single-purpose function
 */
export class UnifiedChordSheetCache {
  private readonly config: CacheConfig;
  private readonly repository: ChordSheetRepository;
  private initialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...getDefaultCacheConfig(), ...config };
    this.repository = new ChordSheetRepository();
  }

  /**
   * Initialize the IndexedDB connection
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await initializeChordSheetRepository(this.repository);
      this.initialized = true;
    }
  }

  /**
   * Close the IndexedDB connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      await closeRepository(this.repository, (status) => {
        this.initialized = status;
      });
    }
  }

  /**
   * Get the current cache configuration
   */
  getConfig(): CacheConfig {
    return getConfig(this.config);
  }

  /**
   * Cache a chord sheet with optional metadata
   */
  async cacheChordSheet(
    artist: string,
    title: string,
    chordSheet: ChordSheet,
    options: CacheChordSheetOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();
    await cacheChordSheetImpl(
      this.repository,
      artist,
      title,
      chordSheet,
      options
    );
  }

  /**
   * Cache a chord sheet by path
   */
  async cacheChordSheetByPath(
    path: string,
    chordSheet: ChordSheet,
    options: CacheChordSheetOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();
    // Use the repository's storeByPath method directly - no path reconstruction!
    await this.repository.storeByPath(path, chordSheet, {
      saved: options.saved ?? false,
      dataSource: options.dataSource,
    });
  }

  /**
   * Get cached chord sheet by path if it exists and is not expired
   */
  async getCachedChordSheetByPath(path: string): Promise<ChordSheet | null> {
    await this.ensureInitialized();
    return await getCachedChordSheetImpl(this.repository, path);
  }

  /**
   * Set the saved status of a chord sheet
   */
  async setSavedStatus(
    artist: string,
    title: string,
    saved: boolean
  ): Promise<boolean> {
    await this.ensureInitialized();
    return await setSavedStatus(this.repository, artist, title, saved);
  }

  /**
   * Set the saved status of a chord sheet by path
   */
  async setSavedStatusByPath(path: string, saved: boolean): Promise<boolean> {
    await this.ensureInitialized();
    // Parse path to extract artist and title for the legacy method
    const components = parseCacheKeyToComponents(path);
    return await setSavedStatus(
      this.repository,
      components.artist,
      components.title,
      saved
    );
  }

  /**
   * Get all saved chord sheets
   */
  async getAllSavedChordSheets(): Promise<ChordSheet[]> {
    await this.ensureInitialized();
    return await getAllSavedChordSheets(this.repository);
  }

  /**
   * Get all saved chord sheets with their paths
   */
  async getAllSavedChordSheetsWithPaths(): Promise<
    Array<{ path: string; chordSheet: ChordSheet }>
  > {
    await this.ensureInitialized();
    return await this.repository.getAllSavedWithPaths();
  }

  /**
   * Get all chord sheets (both saved and cached)
   */
  async getAllChordSheets(): Promise<ChordSheet[]> {
    await this.ensureInitialized();
    const records = await this.repository.getAll();
    return records.map((record) => record.chordSheet);
  }

  /**
   * Check if a chord sheet is saved
   */
  async isChordSheetSaved(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();
    return await isChordSheetSaved(this.repository, artist, title);
  }

  /**
   * Check if a chord sheet is saved by path
   */
  async isChordSheetSavedByPath(path: string): Promise<boolean> {
    await this.ensureInitialized();
    // Parse path to extract artist and title for the legacy method
    const components = parseCacheKeyToComponents(path);
    return await isChordSheetSaved(
      this.repository,
      components.artist,
      components.title
    );
  }

  /**
   * Check if a chord sheet is cached (saved or regular)
   */
  async isChordSheetCached(artist: string, title: string): Promise<boolean> {
    await this.ensureInitialized();
    return await isChordSheetCached(this.repository, artist, title);
  }

  /**
   * Check if a chord sheet is cached by path
   */
  async isChordSheetCachedByPath(path: string): Promise<boolean> {
    await this.ensureInitialized();
    // Parse path to extract artist and title for the legacy method
    const components = parseCacheKeyToComponents(path);
    return await isChordSheetCached(
      this.repository,
      components.artist,
      components.title
    );
  }

  /**
   * Remove a chord sheet from cache
   */
  async removeChordSheet(artist: string, title: string): Promise<void> {
    await this.ensureInitialized();
    await removeChordSheet(this.repository, artist, title);
  }

  /**
   * Remove a chord sheet by path
   */
  async removeChordSheetByPath(path: string): Promise<void> {
    await this.ensureInitialized();
    // Use the repository's deleteByPath method directly - no need to parse the path
    await this.repository.deleteByPath(path);
  }

  /**
   * Clear all expired cache entries
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();
    return await clearExpiredEntries(this.repository);
  }

  /**
   * Clear all cached chord sheets
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();
    await clearAllCache(this.repository);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<UnifiedCacheStats> {
    await this.ensureInitialized();
    return await getCacheStats(this.repository, this.config);
  }

  /**
   * Parse a cache key back to artist and title
   */
  static parseCacheKey(cacheKey: string): { artist: string; title: string } {
    return parseCacheKeyToComponents(cacheKey);
  }
