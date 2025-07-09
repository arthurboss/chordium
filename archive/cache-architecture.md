# Chordium Cache Architecture

## Overview

Chordium implements a sophisticated **frontend-only caching system** designed to optimize user experience by reducing redundant API calls and improving application responsiveness. The caching architecture consists of three specialized cache layers, each optimized for different data types and usage patterns.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Caching                  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │  Search Cache   │  │  Artist Cache   │  │ Chord Sheet Cache│ │
│  │                 │  │                 │  │                  │ │
│  │ • 30-day TTL    │  │ • 4-hour TTL    │  │ • 72-hour TTL    │ │
│  │ • 100 items     │  │ • 20 items      │  │ • 50 items       │ │
│  │ • 4MB limit     │  │ • LRU eviction  │  │ • LRU eviction   │ │
│  │ • LRU eviction  │  │                 │  │                  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ CifraClub API   │  │ Puppeteer       │  │ Express Server   │ │
│  │ Scraping        │  │ Browser         │  │                  │ │
│  │                 │  │ Automation      │  │ • Stateless      │ │
│  │ • No caching    │  │                 │  │ • Fresh data     │ │
│  │ • Fresh data    │  │ • No caching    │  │   per request    │ │
│  │   per request   │  │ • Fresh data    │  │                  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

The cache system is organized under `/src/cache/` with clear separation of concerns:

```
src/cache/
├── index.ts                    # Main entry point - exports all cache functionality
├── types.ts                    # Centralized type definitions for all cache systems
├── config.ts                   # Configuration constants and debug utilities
├── core/
│   └── base-cache.ts          # Abstract BaseCache class with common functionality
├── implementations/
│   ├── search-cache.ts        # Search results caching implementation
│   ├── artist-cache.ts        # Artist songs caching implementation
│   └── chord-sheet-cache.ts   # Chord sheet data caching implementation
├── utils/
│   └── cache-debug.ts         # Debug utilities and global cache inspection
└── __tests__/
    ├── unit/                  # Unit tests for individual cache components
    ├── integration/           # Integration tests for cache workflows
    └── utils/                 # Shared test utilities and helpers
```

## Core Components

### Type System (`src/cache/types.ts`)

Defines the foundational interfaces for all cache implementations:

```typescript
// Base interface that all cache items extend
interface BaseCacheItem {
  timestamp: number;
  accessCount: number;
}

// Search cache specific types
interface SearchCacheItem extends BaseCacheItem {
  key: string;
  results: SearchResultItem[];
  query: SearchQuery;
}

// Artist cache specific types  
interface ArtistCacheItem extends BaseCacheItem {
  artistPath: string;
  songs: Song[];
  artistName?: string;
}

// Chord sheet cache specific types
interface ChordSheetCacheItem extends BaseCacheItem {
  key: string;
  data: CachedChordSheetData;
}
```

### Configuration (`src/cache/config.ts`)

Centralizes all cache configuration with environment-aware settings:

```typescript
export const CACHE_CONFIG = {
  // Search cache settings
  SEARCH: {
    TTL: 30 * 24 * 60 * 60 * 1000,        // 30 days
    MAX_ITEMS: 100,
    MAX_SIZE_BYTES: 4 * 1024 * 1024,      // 4MB
    STORAGE_KEY: 'chordium-search-cache'
  },
  
  // Artist cache settings  
  ARTIST: {
    TTL: 4 * 60 * 60 * 1000,              // 4 hours
    MAX_ITEMS: 20,
    STORAGE_KEY: 'chordium-artist-songs-cache'
  },
  
  // Chord sheet cache settings
  CHORD_SHEET: {
    TTL: 72 * 60 * 60 * 1000,             // 72 hours
    MAX_ITEMS: 50,
    STORAGE_KEY: 'chordium-chord-sheet-cache'
  }
};
```

### Base Cache Class (`src/cache/core/base-cache.ts`)

Provides abstract foundation with common caching functionality:

```typescript
export abstract class BaseCache<T extends BaseCacheItem> {
  protected abstract storageKey: string;
  protected abstract maxItems: number;
  protected abstract ttl: number;

  // Core cache operations
  protected abstract validateCacheItem(item: unknown): item is T;
  protected abstract createCacheItem(data: any): T;
  
  // Common functionality
  protected loadCache(): T[] { /* localStorage implementation */ }
  protected saveCache(items: T[]): void { /* localStorage implementation */ }
  protected isExpired(item: T): boolean { /* TTL checking */ }
  protected evictLRU(items: T[]): T[] { /* LRU eviction */ }
}
```

## Cache Implementations

### Search Cache (`src/cache/implementations/search-cache.ts`)

**Purpose**: Caches search query results to eliminate redundant API calls for identical searches.

**Configuration**:
- **TTL**: 30 days (long-term caching for user search patterns)
- **Capacity**: 100 search result sets
- **Size Limit**: 4MB total storage
- **Eviction**: LRU (Least Recently Used)

**Key Features**:
```typescript
// Cache search results with normalized keys
export const cacheSearchResults = (
  artist: string | null, 
  song: string | null, 
  results: SearchResultItem[]
): void

// Retrieve cached results with automatic expiration
export const getCachedSearchResults = (
  artist: string | null, 
  song: string | null
): SearchResultItem[] | null

// Generate consistent cache keys
export const generateCacheKey = (
  artist: string | null, 
  song: string | null, 
  extra?: Record<string, string | null>
): string
```

**Storage Strategy**:
- **Primary**: localStorage for persistence across browser sessions
- **Secondary**: In-memory Map for fast access during current session
- **Hybrid Access**: Check memory first, fallback to localStorage

### Artist Cache (`src/cache/implementations/artist-cache.ts`)

**Purpose**: Caches artist-specific song collections to improve navigation within artist pages.

**Configuration**:
- **TTL**: 4 hours (moderate caching for dynamic content)
- **Capacity**: 20 artist song collections
- **Eviction**: LRU
- **Storage**: localStorage with in-memory optimization

**Key Features**:
```typescript
// Cache artist songs with metadata
export const cacheArtistSongs = (
  artistPath: string, 
  songs: Song[], 
  artistName?: string
): void

// Retrieve artist songs with expiration checking
export const getCachedArtistSongs = (
  artistPath: string
): Song[] | null

// Clear expired entries and inspect cache state
export const clearExpiredArtistCache = (): number
export const inspectArtistCache = (): object
```

**Use Cases**:
- Artist page navigation
- Related song browsing
- Reduced API load for popular artists

### Chord Sheet Cache (`src/cache/implementations/chord-sheet-cache.ts`)

**Purpose**: Caches processed chord sheet data to avoid re-parsing complex musical notation.

**Configuration**:
- **TTL**: 72 hours (extended caching for processed content)
- **Capacity**: 50 chord sheets
- **Eviction**: LRU
- **Storage**: localStorage with metadata preservation

**Key Features**:
```typescript
// Cache processed chord sheet data
export const cacheChordSheet = (
  artist: string | null, 
  song: string | null, 
  data: CachedChordSheetData
): void

// Retrieve cached chord sheet with refresh capability
export const getCachedChordSheet = (
  artist: string | null, 
  song: string | null
): CachedChordSheetData | null

// Background refresh for near-expired content
export const getChordSheetWithRefresh = async (
  artist: string | null, 
  song: string | null
): Promise<CachedChordSheetData | null>
```

**Data Structure**:
```typescript
type CachedChordSheetData = {
  content: string;         // Processed chord notation
  capo: string;           // Capo information
  tuning: string;         // Tuning details
  key: string;            // Musical key
  timestamp?: number;     // Cache timestamp
}
```

## Cache Management

### Debug Utilities (`src/cache/utils/cache-debug.ts`)

Provides comprehensive cache inspection and management tools:

```typescript
// Global cache inspection
export const debugCache = (): void => {
  console.log('Search Cache:', inspectSearchCache());
  console.log('Artist Cache:', inspectArtistCache()); 
  console.log('Chord Sheet Cache:', inspectChordSheetCache());
}

// Clear all caches at once
export const clearAllCaches = (): void => {
  clearSearchCache();
  clearArtistSongsCache();
  clearChordSheetCache();
}

// Global window access for debugging
window.debugCache = debugCache;
window.clearAllCaches = clearAllCaches;
```

### Main Entry Point (`src/cache/index.ts`)

Provides centralized access to all cache functionality:

```typescript
// Export all cache implementations
export { 
  cacheSearchResults, 
  getCachedSearchResults,
  clearSearchCache,
  generateCacheKey as generateSearchCacheKey
} from './implementations/search-cache';

export { 
  cacheArtistSongs, 
  getCachedArtistSongs,
  clearArtistSongsCache
} from './implementations/artist-cache';

export { 
  getCachedChordSheet, 
  cacheChordSheet,
  getChordSheetWithRefresh
} from './implementations/chord-sheet-cache';

// Export utilities and types
export * from './types';
export * from './config';
export { debugCache, clearAllCaches } from './utils/cache-debug';
```

## Integration Points

### React Hooks Integration

The cache system integrates seamlessly with React hooks for data fetching:

**Search Integration** (`src/hooks/useSearchResults.ts`):
```typescript
import { cacheSearchResults, getCachedSearchResults } from '@/cache';

export function useSearchResults(artist: string, song: string) {
  // Check cache before API call
  const cachedResults = getCachedSearchResults(artist, song);
  if (cachedResults) {
    return { data: cachedResults, loading: false };
  }
  
  // Fetch and cache new results
  const results = await fetchSearchResults(artist, song);
  cacheSearchResults(artist, song, results);
  return { data: results, loading: false };
}
```

**Chord Sheet Integration** (`src/hooks/useChordSheet.ts`):
```typescript
import { getCachedChordSheet, cacheChordSheet } from '@/cache';

export function useChordSheet(artist: string, song: string) {
  // Attempt cache retrieval with background refresh
  const cachedData = await getChordSheetWithRefresh(artist, song);
  if (cachedData) {
    return { data: cachedData, loading: false };
  }
  
  // Fetch and cache new data
  const freshData = await fetchChordSheet(artist, song);
  cacheChordSheet(artist, song, freshData);
  return { data: freshData, loading: false };
}
```

**Artist Utils Integration** (`src/utils/artist-utils.ts`):
```typescript
import { cacheArtistSongs, getCachedArtistSongs } from '@/cache';

export async function getArtistSongs(artistPath: string): Promise<Song[]> {
  // Check cache first
  const cached = getCachedArtistSongs(artistPath);
  if (cached) return cached;
  
  // Fetch and cache
  const songs = await fetchArtistSongs(artistPath);
  cacheArtistSongs(artistPath, songs);
  return songs;
}
```

## Storage Implementation

### localStorage Strategy

All caches use localStorage for persistence across browser sessions:

```typescript
// Consistent storage pattern
const saveToStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache storage failed:', error);
  }
}

const loadFromStorage = (key: string): any | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Cache retrieval failed:', error);
    return null;
  }
}
```

### In-Memory Optimization

Fast access layer for frequently used data:

```typescript
// Memory cache for active session
const memoryCache = new Map<string, CacheItem>();

// Hybrid access pattern
const getCacheItem = (key: string): CacheItem | null => {
  // Check memory first
  const memoryItem = memoryCache.get(key);
  if (memoryItem) return memoryItem;
  
  // Fallback to localStorage
  const storageItem = loadFromStorage(key);
  if (storageItem) {
    memoryCache.set(key, storageItem);
    return storageItem;
  }
  
  return null;
}
```

## Cache Eviction Policies

### LRU (Least Recently Used)

All caches implement LRU eviction when capacity limits are reached:

```typescript
const evictLRU = (items: CacheItem[], maxItems: number): CacheItem[] => {
  if (items.length <= maxItems) return items;
  
  // Sort by access pattern (access count + recency)
  return items
    .sort((a, b) => {
      const scoreA = a.accessCount * 0.7 + (a.timestamp / Date.now()) * 0.3;
      const scoreB = b.accessCount * 0.7 + (b.timestamp / Date.now()) * 0.3;
      return scoreB - scoreA; // Descending order
    })
    .slice(0, maxItems);
}
```

### Time-Based Expiration

Automatic cleanup of expired entries:

```typescript
const isExpired = (item: CacheItem, ttl: number): boolean => {
  return Date.now() - item.timestamp > ttl;
}

const clearExpired = (items: CacheItem[], ttl: number): CacheItem[] => {
  return items.filter(item => !isExpired(item, ttl));
}
```

### Size-Based Limits

Storage size monitoring and cleanup (Search Cache):

```typescript
const enforceSize = (items: CacheItem[], maxSizeBytes: number): CacheItem[] => {
  let totalSize = 0;
  const validItems: CacheItem[] = [];
  
  // Sort by priority and add items until size limit
  for (const item of items.sort(byPriority)) {
    const itemSize = JSON.stringify(item).length;
    if (totalSize + itemSize <= maxSizeBytes) {
      validItems.push(item);
      totalSize += itemSize;
    }
  }
  
  return validItems;
}
```

## Performance Features

### Background Refresh

Stale-while-revalidate pattern for improved user experience:

```typescript
const getWithRefresh = async (key: string): Promise<CacheItem | null> => {
  const cached = getCacheItem(key);
  
  if (cached && !isExpired(cached)) {
    // Fresh data - return immediately
    return cached;
  }
  
  if (cached && isNearExpiration(cached)) {
    // Serve stale data while refreshing in background
    scheduleBackgroundRefresh(key);
    return cached;
  }
  
  // No valid cache - fetch fresh data
  return null;
}
```

### Preemptive Caching

Strategic cache warming for improved performance:

```typescript
// Cache popular searches proactively
const warmPopularSearches = async (): Promise<void> => {
  const popular = ['john mayer', 'ed sheeran', 'taylor swift'];
  for (const query of popular) {
    if (!getCachedSearchResults(query, null)) {
      const results = await fetchSearchResults(query, null);
      cacheSearchResults(query, null, results);
    }
  }
}
```

## Testing Strategy

### Unit Tests (`src/cache/__tests__/unit/`)

- **minimal-cache.test.ts**: Basic cache operations and key generation
- **safe-cache.test.ts**: Error handling and edge cases

### Integration Tests (`src/cache/__tests__/integration/`)

- **cache-integration.test.ts**: Full workflow testing with realistic scenarios

### Test Utilities (`src/cache/__tests__/utils/`)

- **test-utils.ts**: Shared mocking and helper functions

## Monitoring and Debugging

### Cache Metrics

Real-time statistics for performance monitoring:

```typescript
interface CacheStats {
  hitRate: number;
  missRate: number; 
  totalItems: number;
  totalSize: number;
  evictionCount: number;
}

// Available via debug utilities
const getSearchCacheStats = (): CacheStats => { /* implementation */ }
```

### Debug Commands

Browser console access for development:

```javascript
// Global debug functions
debugCache();           // Inspect all caches
clearAllCaches();       // Clear all cached data
```

## Backend Integration

### Stateless Backend Design

The backend follows a stateless approach with no server-side caching:

- **CifraClub Service**: Fresh web scraping on every request
- **Puppeteer Service**: New browser sessions for dynamic content
- **Express Server**: No cache headers or server-side storage

This design ensures data freshness while allowing frontend caches to optimize user experience.

## Configuration Management

### Environment Awareness

Cache behavior adapts to different environments:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Shorter TTLs in development for easier testing
const TTL = isDevelopment ? 5 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

// Disable logging in test environment to prevent memory leaks
const shouldLog = !isTest && typeof process !== 'undefined';
```

## Best Practices

### Cache Key Design

Consistent, normalized cache keys across all implementations:

```typescript
const normalizeKey = (value: string | null): string => {
  return (value || '').toLowerCase().trim();
}

const createCacheKey = (artist: string | null, song: string | null): string => {
  return `${normalizeKey(artist)}|${normalizeKey(song)}`;
}
```

### Error Handling

Graceful degradation when cache operations fail:

```typescript
const safeCache = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Cache operation failed, continuing without cache:', error);
    return null;
  }
}
```

### Memory Management

Automatic cleanup to prevent memory leaks:

```typescript
// Clear expired entries on cache access
const getWithCleanup = (key: string): CacheItem | null => {
  clearExpiredEntries();
  return getCacheItem(key);
}

// Periodic cleanup in background
setInterval(clearExpiredEntries, 60 * 60 * 1000); // Every hour
```

## Usage Examples

### Basic Cache Operations

```typescript
import { 
  cacheSearchResults, 
  getCachedSearchResults,
  cacheArtistSongs,
  getCachedArtistSongs,
  cacheChordSheet,
  getCachedChordSheet
} from '@/cache';

// Search caching
const searchResults = await fetchSearchResults('john mayer', 'gravity');
cacheSearchResults('john mayer', 'gravity', searchResults);

const cached = getCachedSearchResults('john mayer', 'gravity');
if (cached) {
  console.log('Cache hit:', cached);
}

// Artist caching
const artistSongs = await fetchArtistSongs('/john-mayer/');
cacheArtistSongs('/john-mayer/', artistSongs, 'John Mayer');

// Chord sheet caching
const chordData = await fetchChordSheet('john mayer', 'gravity');
cacheChordSheet('john mayer', 'gravity', chordData);
```

### Debug and Monitoring

```typescript
import { debugCache, clearAllCaches } from '@/cache';

// Inspect cache state
debugCache();

// Clear all caches
clearAllCaches();

// Access from browser console
window.debugCache();
window.clearAllCaches();
```

## Conclusion

Chordium's cache architecture provides a robust, scalable foundation for frontend performance optimization. The system successfully balances:

- **Performance**: Multi-layer caching with memory and persistence
- **Reliability**: Graceful error handling and automatic recovery
- **Maintainability**: Clear structure and comprehensive testing
- **User Experience**: Fast responses with background updates

The centralized structure under `/src/cache/` ensures all cache-related functionality is easily discoverable and maintainable, while the abstract base class provides consistency across different cache implementations.
