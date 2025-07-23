/**
 * Cache item interface for search results storage
 */
import type { Song } from '@chordium/types';

export interface CacheItem {
  key: string;
  results: Song[];
  timestamp: number;
  accessCount: number;
  query: {
    artist: string | null;
    song: string | null;
    [key: string]: string | null;
  };
}
