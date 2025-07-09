import { ChordSheet } from "@/types/chordSheet";
import { IndexedDBCacheCoordinator } from "@/cache/coordinators/indexed-db-cache-coordinator";
import { parseStorageKey } from "./utils/parse-storage-key";

/**
 * Cache coordination for useChordSheet hook using IndexedDB
 * Hook-specific: handles cache operations and refresh logic
 * Follows SRP: Single responsibility of cache interaction
 */
export class IndexedDBHookCacheCoordinator {
  private readonly storage: IndexedDBCacheCoordinator;

  constructor() {
    this.storage = new IndexedDBCacheCoordinator();
  }

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  /**
   * Close IndexedDB connection
   */
  async close(): Promise<void> {
    await this.storage.close();
  }

  /**
   * Gets chord sheet data, checking cache first then fetching if needed
   *
   * @param storageKey - Combined storage key (artist_name-song_title)
   * @param fetchUrl - URL to fetch from if not cached
   * @returns Promise with chord sheet data or null if failed
   */
  async getChordSheetData(
    storageKey: string,
    fetchUrl: string
  ): Promise<ChordSheet | null> {
    const { artist, title } = parseStorageKey(storageKey);

    // Check IndexedDB cache first
    const cachedChordSheet = await this.storage.getCachedChordSheetByPath(
      artist,
      title
    );

    if (cachedChordSheet) {
      console.log("Using cached chord sheet from IndexedDB");
      return cachedChordSheet;
    }

    // Not cached, fetch from backend
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chordSheet = await response.json();

      if (chordSheet) {
        console.log("✅ Flow Step 8: Caching chord sheet data in IndexedDB");
        // Cache the chord sheet
        await this.storage.cacheChordSheet(artist, title, chordSheet, {
          saved: false,
        });
        console.log(
          "✅ Flow Step 9: Chord sheet cached successfully in IndexedDB"
        );
      }

      return chordSheet;
    } catch (error) {
      console.error("Failed to fetch chord sheet:", error);
      return null;
    }
  }
}
