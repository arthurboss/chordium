import { Song } from "@/types/song";
import { ArtistCacheRepository } from '@/storage/repositories/artist-cache-repository';

// Configuration
const MAX_CACHE_ITEMS = 20;
const CACHE_EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 hours

/**
 * IndexedDB-based artist cache implementation
 * Follows SRP: Single responsibility for artist songs caching using IndexedDB
 * Follows DRY: No duplicate artist data
 */
export class ArtistCacheIndexedDB {
  private readonly repository: ArtistCacheRepository;
  private initialized = false;

  constructor() {
    this.repository = new ArtistCacheRepository();
  }

  /**
   * Initialize the IndexedDB connection
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.repository.initialize();
      this.initialized = true;
    }
  }

  /**
   * Close the IndexedDB connection
   */
  async close(): Promise<void> {
    if (this.initialized) {
      await this.repository.close();
      this.initialized = false;
    }
  }

  /**
   * Cache artist songs
   * @param artistPath - Artist path (e.g., "/john-mayer/")
   * @param songs - Array of songs for the artist
   * @param artistName - Optional artist name for better management
   */
  async cacheArtistSongs(artistPath: string, songs: Song[], artistName?: string): Promise<void> {
    if (!artistPath || !songs) {
      console.warn('Cannot cache artist songs: invalid parameters', { artistPath, songsCount: songs?.length });
      return;
    }

    await this.ensureInitialized();

    try {
      await this.repository.store(artistPath, songs);
      console.log('Artist songs cached successfully', { artistPath, artistName, songsCount: songs.length });
    } catch (error) {
      console.error('Failed to cache artist songs in IndexedDB:', error);
    }
  }

  /**
   * Get cached artist songs
   * @param artistPath - Artist path (e.g., "/john-mayer/")
   * @returns Cached songs or null if not found/expired
   */
  async getCachedArtistSongs(artistPath: string): Promise<Song[] | null> {
    if (!artistPath) {
      console.warn('Cannot retrieve artist songs: invalid artist path', { artistPath });
      return null;
    }

    await this.ensureInitialized();

    try {
      const songs = await this.repository.get(artistPath);
      
      if (songs) {
        console.log('Using cached artist songs', { artistPath, songsCount: songs.length });
      } else {
        console.log('No cached artist songs found', { artistPath });
      }
      
      return songs;
    } catch (error) {
      console.error('Failed to get cached artist songs from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   * @returns Number of entries removed
   */
  async clearExpiredEntries(): Promise<number> {
    await this.ensureInitialized();

    try {
      const removedCount = await this.repository.removeExpired();
      if (removedCount > 0) {
        console.log(`Removed ${removedCount} expired artist cache entries`);
      }
      return removedCount;
    } catch (error) {
      console.error('Failed to clear expired artist cache entries from IndexedDB:', error);
      return 0;
    }
  }

  /**
   * Clear all cached artist songs
   */
  async clearAllCache(): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.repository.clear();
      console.log('All artist cache cleared');
    } catch (error) {
      console.error('Failed to clear all artist cache from IndexedDB:', error);
    }
  }

  /**
   * Remove a specific artist from cache
   * @param artistPath - Artist path to remove
   */
  async removeArtist(artistPath: string): Promise<void> {
    if (!artistPath) {
      console.warn('Cannot remove artist: invalid artist path', { artistPath });
      return;
    }

    await this.ensureInitialized();

    try {
      await this.repository.delete(artistPath);
      console.log('Artist removed from cache', { artistPath });
    } catch (error) {
      console.error('Failed to remove artist from IndexedDB:', error);
    }
  }
}

// Create a singleton instance
export const artistCacheIndexedDB = new ArtistCacheIndexedDB();

// Export convenience functions for the artist cache
export const cacheArtistSongs = async (artistPath: string, songs: Song[], artistName?: string) => 
  await artistCacheIndexedDB.cacheArtistSongs(artistPath, songs, artistName);

export const getCachedArtistSongs = async (artistPath: string) => 
  await artistCacheIndexedDB.getCachedArtistSongs(artistPath);

export const clearArtistCache = async () => 
  await artistCacheIndexedDB.clearAllCache();

export const clearExpiredArtistCache = async () => 
  await artistCacheIndexedDB.clearExpiredEntries();

export const removeArtistFromCache = async (artistPath: string) => 
  await artistCacheIndexedDB.removeArtist(artistPath);
