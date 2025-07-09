import { IndexedDBCacheCoordinator } from '@/cache/coordinators/indexed-db-cache-coordinator';

/**
 * IndexedDB-based cache cleanup coordinator
 * Follows SRP: Single responsibility for IndexedDB cache expiration
 */
class IndexedDBCacheCleanupCoordinator {
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
   * Clear expired cache entries from IndexedDB
   */
  async clearExpiredCache(): Promise<void> {
    await this.ensureInitialized();
    const removedCount = await this.storage.clearExpiredCache();
    console.log(`IndexedDB cache cleanup completed: ${removedCount} entries removed`);
  }
}

// Create singleton instance
const indexedDBCacheCleanupCoordinator = new IndexedDBCacheCleanupCoordinator();

/**
 * Clears expired cache entries from IndexedDB
 */
export async function clearExpiredCacheFromIndexedDB(): Promise<void> {
  await indexedDBCacheCleanupCoordinator.clearExpiredCache();
}
