import { Song } from '@/types/song';
import { Artist } from '@/types/artist';
import { BaseCacheRepository } from './base-cache-repository';
import { ChordSheetDBConnection } from '../connection';

// Union type for search results
export type SearchResultData = Song[] | Artist[];

/**
 * Search results cache metadata
 */
export interface SearchCacheMetadata {
  readonly cachedAt: number;
  readonly expiresAt: number;
  readonly version: string;
}

/**
 * Search cache record for IndexedDB storage
 */
export interface SearchCacheRecord {
  readonly id: string;                 // Serves as both primary key and query identifier
  readonly results: SearchResultData;
  readonly timestamp?: number;         // For timestamp index
  readonly searchType?: string;        // For searchType index  
  readonly dataSource?: string;        // For dataSource index
  readonly metadata: SearchCacheMetadata;
}

/**
 * Repository for search results cache storage operations
 * Follows SRP: Single responsibility for search cache persistence
 */
export class SearchCacheRepository implements BaseCacheRepository<SearchResultData> {
  private readonly connection: ChordSheetDBConnection;
  private readonly storeName = 'searchCache';
  private readonly expirationTime = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.connection = new ChordSheetDBConnection();
  }

  async initialize(): Promise<void> {
    await this.connection.initialize();
  }

  async close(): Promise<void> {
    await this.connection.close();
  }

  async store(query: string, results: SearchResultData): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const now = Date.now();
    const record: SearchCacheRecord = {
      id: this.generateSearchKey(query),
      results,
      timestamp: now, // Add timestamp for index
      searchType: results.length > 0 && Array.isArray(results) && results[0] && 'title' in results[0] ? 'songs' : 'artists', // Add searchType
      dataSource: 'api', // Add dataSource for index
      metadata: {
        cachedAt: now,
        expiresAt: now + this.expirationTime,
        version: '1.0'
      }
    };

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      
      request.onerror = () => {
        reject(new Error(`Failed to store search results for query: ${query}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async get(query: string): Promise<SearchResultData | null> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    const id = this.generateSearchKey(query);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to get search results for query: ${query}`));
      };
      
      request.onsuccess = () => {
        const record = request.result as SearchCacheRecord | undefined;
        
        if (!record) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > record.metadata.expiresAt) {
          // Remove expired entry
          this.delete(query).catch(console.error);
          resolve(null);
          return;
        }

        resolve(record.results);
      };
    });
  }

  async getAll(): Promise<SearchResultData[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onerror = () => {
        reject(new Error('Failed to get all search results'));
      };
      
      request.onsuccess = () => {
        const records = request.result as SearchCacheRecord[];
        const now = Date.now();
        
        // Filter out expired records and return results
        const validResults = records
          .filter(record => now <= record.metadata.expiresAt)
          .map(record => record.results);
        
        resolve(validResults);
      };
    });
  }

  async delete(query: string): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const id = this.generateSearchKey(query);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to delete search results for query: ${query}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onerror = () => {
        reject(new Error('Failed to clear search cache'));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async removeExpired(): Promise<number> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const getAllRequest = store.getAll();
      
      getAllRequest.onerror = () => {
        reject(new Error('Failed to get search cache entries for cleanup'));
      };
      
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result as SearchCacheRecord[];
        const now = Date.now();
        
        const expiredRecords = records.filter(record => now > record.metadata.expiresAt);
        
        if (expiredRecords.length === 0) {
          resolve(0);
          return;
        }

        this.deleteExpiredRecords(store, expiredRecords, resolve);
      };
    });
  }

  private deleteExpiredRecords(
    store: IDBObjectStore, 
    expiredRecords: SearchCacheRecord[], 
    resolve: (value: number) => void
  ): void {
    let removedCount = 0;
    let processedCount = 0;

    const onComplete = () => {
      if (processedCount === expiredRecords.length) {
        resolve(removedCount);
      }
    };

    expiredRecords.forEach(record => {
      const deleteRequest = store.delete(record.id);
      
      deleteRequest.onerror = () => {
        processedCount++;
        onComplete();
      };
      
      deleteRequest.onsuccess = () => {
        removedCount++;
        processedCount++;
        onComplete();
      };
    });
  }

  private generateSearchKey(query: string): string {
    // Convert search query to path-like format (hyphens instead of underscores)
    return query.toLowerCase().trim().replace(/\s+/g, '-');
  }
}
