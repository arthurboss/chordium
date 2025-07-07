# Chordium App - localStorage Usage Analysis

## Current localStorage Implementation Overview

The Chordium app currently uses **localStorage** for caching various types of data to improve performance and provide offline capabilities. Here's a comprehensive breakdown of all localStorage usage:

## 1. Storage Keys and Data Types

### Primary Cache Keys

- `chordium-search-cache` - Search results cache
- `chordium-artist-songs-cache` - Artist song listings cache  
- `chordium-chord-sheet-cache` - Individual chord sheet data cache (includes saved status)

## 2. Cache Implementations

### 2.1 Search Cache (`chordium-search-cache`)
**File:** `src/cache/implementations/search-cache.ts`

**Data Structure:**
```typescript
interface CacheItem {
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

interface SearchCache {
  items: CacheItem[];
}
```

**Configuration:**
- Max Items: 100
- Expiration: 30 days (30 * 24 * 60 * 60 * 1000 ms)
- Max Size: 4MB
- Has in-memory LRU cache as fallback

**Usage Patterns:**
- Caches search results for artist/song queries
- Implements LRU eviction when cache is full
- Tracks access count for usage analytics
- Size-based cleanup when approaching storage limits

### 2.2 Artist Songs Cache (`chordium-artist-songs-cache`)
**File:** `src/cache/implementations/artist-cache.ts`

**Data Structure:**
```typescript
interface ArtistCacheItem {
  artistPath: string;
  songs: Song[];
  timestamp: number;
  accessCount: number;
  artistName?: string;
}

interface ArtistCache {
  items: ArtistCacheItem[];
}
```

**Configuration:**
- Max Items: 20
- Expiration: 4 hours (4 * 60 * 60 * 1000 ms)
- LRU eviction when full

**Usage Patterns:**
- Caches song listings for specific artists
- Shorter expiration than search cache
- Smaller storage footprint

### 2.3 Unified Chord Sheet Cache (`chordium-chord-sheet-cache`)
**File:** `src/cache/implementations/unified-chord-sheet-cache.ts`

**Data Structure:**
```typescript
interface UnifiedChordSheetData extends ChordSheet {
  metadata: {
    saved: boolean;
    lastAccessed: number;
    accessCount: number;
  };
  cacheInfo: {
    cachedAt: number;
    expiresAt: number;
    version: string;
  };
}

interface UnifiedChordSheetCacheItem {
  key: string;
  data: UnifiedChordSheetData;
  timestamp: number;
  accessCount: number;
}
```

**Configuration:**
- Regular Items: 30 max, 24 hours expiration
- Saved Items: 100 max, never expire
- Single storage key for both regular and saved chord sheets

**Usage Patterns:**
- Replaces both chord-sheet-cache and my-chord-sheets-cache
- Differentiates between regular cached items and user-saved items
- Tracks access patterns and metadata

## 3. Storage Usage Estimates

### Current Storage Footprint:
Based on the code analysis, here are the storage estimates:

**Search Cache:**
- ~100 items max
- Each item: ~2-5KB (depending on results)
- Total: ~200KB - 500KB

**Artist Cache:**
- ~20 items max  
- Each item: ~1-3KB
- Total: ~20KB - 60KB

**Chord Sheet Cache:**
- ~130 items max (30 regular + 100 saved)
- Each item: ~10-50KB (full chord sheet data)
- Total: ~1.3MB - 6.5MB

**Total Current Usage:** ~1.5MB - 7MB

## 4. Current Issues and Limitations

### 4.1 Performance Issues:
- **Synchronous Operations:** All localStorage operations block the main thread
- **JSON Parsing Overhead:** Every read requires full JSON deserialization
- **No Indexing:** Search through cached data is O(n) operation
- **UI Blocking:** Large cache operations can freeze the interface

### 4.2 Storage Limitations:
- **5-10MB Browser Limit:** Current usage could hit storage quotas
- **No Structured Queries:** Cannot efficiently search across cached data
- **No Transactions:** Risk of data corruption on failed writes

### 4.3 Offline Functionality Gaps:
- **Limited Capacity:** Cannot store enough data for meaningful offline use
- **No Complex Queries:** Cannot efficiently search saved chord sheets offline
- **No Relationship Queries:** Cannot link related data (artist -> songs -> chord sheets)

## 5. Migration Necessity Assessment

### Critical Requirements:
1. **Offline Functionality:** Need to cache hundreds of chord sheets
2. **Search Performance:** Fast search across cached content
3. **Scalability:** Support for heavy users with many saved sheets
4. **UI Responsiveness:** Non-blocking operations

### localStorage Inadequacy:
- ❌ **Storage Limit:** 5-10MB insufficient for offline chord sheet collection
- ❌ **Performance:** Synchronous operations will cause UI freezing
- ❌ **Search Capability:** No efficient way to search cached content
- ❌ **Scalability:** Cannot handle hundreds of chord sheets

### IndexedDB Benefits:
- ✅ **Large Storage:** GB-scale storage capacity
- ✅ **Asynchronous:** Non-blocking operations
- ✅ **Indexing:** Fast search and query capabilities
- ✅ **Transactions:** Data integrity guarantees
- ✅ **Structured Data:** Proper relationships between entities

## 6. Migration Priority

**Priority:** **HIGH** - Critical for offline functionality and user experience

**Recommended Approach:**
1. **Phase 1:** Implement IndexedDB for chord sheet storage
2. **Phase 2:** Migrate search cache to IndexedDB
3. **Phase 3:** Add offline search capabilities
4. **Phase 4:** Implement cache synchronization strategies

**Impact:**
- Essential for planned offline functionality
- Prevents performance degradation with heavy usage
- Enables advanced search and filtering features
- Supports scalable user experience

## 7. Implementation Files to Modify

### Core Files:
- `src/cache/implementations/unified-chord-sheet-cache.ts`
- `src/cache/implementations/search-cache.ts`
- `src/cache/implementations/artist-cache.ts`
- `src/hooks/useChordSheet/cache-coordinator.ts`

### New Files Needed:
- `src/storage/indexed-db-storage.ts`
- `src/storage/migration-utils.ts`
- `src/storage/offline-manager.ts`

**Conclusion:** The current localStorage implementation is a significant bottleneck for the app's offline functionality and scalability goals. Migration to IndexedDB is essential and should be prioritized.

## 8. IndexedDB Implementation Strategy - COMPLETED ✅

### 8.1 Full Replacement vs Layer Approach ✅

**Implemented: Full Replacement**
- ✅ Replaced localStorage entirely with IndexedDB for chord sheet storage
- ✅ IndexedDB is now the primary storage mechanism
- ✅ localStorage only used for migration flags and cache cleanup tracking

**Why Not a Layer Over localStorage:**
- localStorage limitations cannot be overcome by abstraction
- Performance issues persist regardless of API layer
- Storage quota limits remain the same
- Synchronous nature still blocks UI

### 8.2 Architecture Design ✅

```typescript
// ✅ COMPLETED: New Architecture Implemented
class IndexedDBCacheCoordinator {
  async storeChordSheet(artist: string, title: string, data: ChordSheet): Promise<void>
  async getCachedChordSheet(artist: string, title: string): Promise<ChordSheet | null>
  async clearExpiredCache(): Promise<number>
  async getExpiredCacheCount(): Promise<number>
}

// ✅ COMPLETED: Cache Coordinator is now async:
export class CacheCoordinator {
  async getChordSheetData(storageKey: string, fetchUrl: string): Promise<ChordSheet | null> {
    // Check IndexedDB first
    const cached = await this.storage.getCachedChordSheet(artist, title);
    if (cached) return cached;
    
    // Fetch and store in IndexedDB
    const data = await fetch(fetchUrl);
    await this.storage.storeChordSheet(artist, title, data);
    return data;
  }
}
```

### 8.3 Migration Strategy ✅

**✅ COMPLETED: Phase 1: Parallel Implementation**
- ✅ Implemented IndexedDB storage alongside localStorage
- ✅ localStorage is now only used for migration tracking
- ✅ Migrated all chord sheet storage to IndexedDB

**✅ COMPLETED: Phase 2: Data Migration**
- ✅ Created migration utility (`IndexedDBMigrationService`) to transfer existing localStorage data to IndexedDB
- ✅ Preserves user's saved chord sheets and search history
- ✅ Clears localStorage after successful migration

**✅ COMPLETED: Phase 3: Complete Replacement**
- ✅ Removed localStorage dependencies for chord sheet storage
- ✅ IndexedDB is now the sole storage solution for chord sheets
- ✅ Added production migration utility for seamless user transition

### 8.4 Implementation Benefits ✅

**✅ Direct Benefits Achieved:**
- ✅ Store 100x more data (GBs vs MBs)
- ✅ Non-blocking UI operations (async/await patterns)
- ✅ Fast indexed searches with cache key generation
- ✅ Proper data relationships with structured records

**✅ Architectural Benefits Achieved:**
- ✅ Clean async/await patterns throughout storage layer
- ✅ Better error handling with try/catch blocks
- ✅ Transaction support via IndexedDB
- ✅ Schema versioning for future updates
- ✅ Modular, testable architecture following SRP and DRY principles

**✅ Implementation Files Completed:**
- ✅ `src/storage/repositories/chord-sheet-repository.ts`
- ✅ `src/storage/coordinators/indexed-db-cache-coordinator.ts`
- ✅ `src/storage/migration/indexeddb-migration-service.ts`
- ✅ `src/hooks/useChordSheet/cache-coordinator.ts` (updated to use IndexedDB)
- ✅ All tests with real fixture data and in-memory storage for TDD

**✅ Next Steps (Optional):**
- Migrate search cache to IndexedDB (current localStorage implementation remains for search/artist caches)
- Add offline search capabilities
- Implement cache synchronization strategies
