import { Song } from '@/types/song';
import { BaseCacheRepository } from './base-cache-repository';
import { ChordSheetDBConnection } from '../connection/chord-sheet-db-connection';

/**
 * Artist songs cache metadata
 */
export interface ArtistCacheMetadata {
  readonly cachedAt: number;
  readonly expiresAt: number;
  readonly version: string;
}

/**
 * Artist cache record for IndexedDB storage
 */
export interface ArtistCacheRecord {
  readonly id: string;
  readonly artistPath: string;
  readonly songs: Song[];
  readonly metadata: ArtistCacheMetadata;
}

/**
 * Repository for artist songs cache storage operations
 * Follows SRP: Single responsibility for artist cache persistence
 */
export class ArtistCacheRepository implements BaseCacheRepository<Song[]> {
  private readonly connection: ChordSheetDBConnection;
  private readonly storeName = 'artistCache';
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

  async store(artistPath: string, songs: Song[]): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const now = Date.now();
    const record: ArtistCacheRecord = {
      id: this.generateArtistKey(artistPath),
      artistPath,
      songs,
      metadata: {
        cachedAt: now,
        expiresAt: now + this.expirationTime,
        version: '1.0'
      }
    };

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      
      request.onerror = () => {
        reject(new Error(`Failed to store artist songs for: ${artistPath}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async get(artistPath: string): Promise<Song[] | null> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    const id = this.generateArtistKey(artistPath);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to get artist songs for: ${artistPath}`));
      };
      
      request.onsuccess = () => {
        const record = request.result as ArtistCacheRecord | undefined;
        
        if (!record) {
          resolve(null);
          return;
        }

        // Check expiration
        if (Date.now() > record.metadata.expiresAt) {
          // Remove expired entry
          this.delete(artistPath).catch(console.error);
          resolve(null);
          return;
        }

        resolve(record.songs);
      };
    });
  }

  async getAll(): Promise<Song[][]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onerror = () => {
        reject(new Error('Failed to get all artist songs'));
      };
      
      request.onsuccess = () => {
        const records = request.result as ArtistCacheRecord[];
        const now = Date.now();
        
        // Filter out expired records and return songs
        const validSongs = records
          .filter(record => now <= record.metadata.expiresAt)
          .map(record => record.songs);
        
        resolve(validSongs);
      };
    });
  }

  async delete(artistPath: string): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const id = this.generateArtistKey(artistPath);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to delete artist songs for: ${artistPath}`));
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
        reject(new Error('Failed to clear artist cache'));
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
        reject(new Error('Failed to get artist cache entries for cleanup'));
      };
      
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result as ArtistCacheRecord[];
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
    expiredRecords: ArtistCacheRecord[], 
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

  private generateArtistKey(artistPath: string): string {
    return `artist_${artistPath.toLowerCase().trim().replace(/\s+/g, '_')}`;
  }
}
