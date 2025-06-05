// Type definitions for artist search tests

export interface CacheItem {
  key: string;
  timestamp: number;
  accessCount: number;
  results: unknown;
  query: {
    artist?: string;
    song?: string;
  };
}

export interface CacheData {
  items: CacheItem[];
}

// Common test data
export const TEST_ARTIST = 'Hillsong United';
