import { ChordSheet } from "@/types/chordSheet";
import { IndexedDBCacheCoordinator } from "@/cache/coordinators/indexed-db-cache-coordinator";

/**
 * IndexedDB-based chord sheet data coordinator
 * Follows SRP: Single responsibility for IndexedDB chord sheet operations
 */
class IndexedDBChordSheetDataCoordinator {
  private readonly storage: IndexedDBCacheCoordinator;
  private initialized = false;

  constructor() {
    this.storage = new IndexedDBCacheCoordinator();
  }

  /**
   * Ensure IndexedDB is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.storage.initialize();
      this.initialized = true;
    }
  }

  /**
   * Gets chord sheet data, checking IndexedDB cache first then fetching if needed
   *
   * @param storageKey - Combined storage key (artist_name-song_title) - legacy parameter, unused
   * @param fetchUrl - Song path used for both caching and fetching (e.g., "hillsong-worship/eu-sou-quem-dizes-que-eu-sou")
   * @returns Promise with chord sheet data or null if failed
   */
  async getChordSheetData(
    storageKey: string,
    fetchUrl: string
  ): Promise<ChordSheet | null> {
    await this.ensureInitialized();

    // Use the fetchUrl (path) as the cache key
    const path = fetchUrl;

    // First check IndexedDB cache using path
    const cachedChordSheet = await this.storage.getCachedChordSheetByPath(path);

    if (cachedChordSheet) {
      console.log("Using cached chord sheet from IndexedDB");
      return cachedChordSheet;
    }

    // Not cached, fetch from backend API using path
    try {
      // fetchUrl should already be a path (e.g., "hillsong-worship/eu-sou-quem-dizes-que-eu-sou")
      const backendUrl = `http://localhost:3001/api/cifraclub-chord-sheet?path=${encodeURIComponent(
        fetchUrl
      )}`;

      const response = await fetch(backendUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chordSheet = await response.json();

      if (chordSheet) {
        console.log("✅ Flow Step 8: Caching chord sheet data in IndexedDB");
        // Cache the chord sheet using the path
        await this.storage.cacheChordSheet(path, chordSheet, { saved: false });
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

// Create singleton instance
const indexedDBChordSheetDataCoordinator =
  new IndexedDBChordSheetDataCoordinator();

/**
 * Gets chord sheet data using IndexedDB cache
 *
 * @param storageKey - Combined storage key (artist_name-song_title)
 * @param fetchUrl - URL to fetch from if not cached
 * @returns Promise with chord sheet data or null if failed
 */
export async function getChordSheetDataFromIndexedDB(
  storageKey: string,
  fetchUrl: string
): Promise<ChordSheet | null> {
  return await indexedDBChordSheetDataCoordinator.getChordSheetData(
    storageKey,
    fetchUrl
  );
}
