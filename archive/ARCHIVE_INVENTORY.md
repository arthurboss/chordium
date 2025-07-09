# Cache and Storage Archive Inventory

This archive contains all localStorage-based cache and storage implementations that will be replaced with IndexedDB.

## Archive Date
July 9, 2025

## Reason for Archiving
Migrating from localStorage to IndexedDB for better performance, larger storage capacity, and more robust data persistence.

## Files Archived

### Cache System (`/archive/cache/`)
Complete cache implementation with localStorage backend:

#### Core Files
- `index.ts` - Main cache entry point and exports
- `types.ts` - Type definitions for all cache implementations
- `config.ts` - Cache configuration constants

#### Core Classes
- `core/base-cache.ts` - Abstract base class for all cache implementations
- `core/cache-initializer.ts` - Cache initialization utilities
- `core/cache-key-generator.ts` - Cache key generation utilities
- `core/cache-saver.ts` - Cache saving utilities

#### Cache Implementations
- `implementations/search-cache.ts` - Search results caching (30-day TTL, 100 items, 4MB limit)
- `implementations/artist-cache.ts` - Artist songs caching (4-hour TTL, 20 items)
- `implementations/unified-chord-sheet-cache.ts` - Chord sheet caching (72-hour TTL, 50 items)

#### Specialized Types
- `types/unified-chord-sheet-cache.ts` - Unified chord sheet cache type definitions

#### Cache Operations
- `operations/cache-chord-sheet.ts` - Chord sheet caching operations

#### Utilities
- `utils/cache-debug.ts` - Debug utilities and global cache inspection

#### Tests
- `__tests__/` - Complete test suite for cache implementations
  - `unit/minimal-cache.test.ts` - Basic cache operations
  - `unit/safe-cache.test.ts` - Error handling and edge cases
  - `integration/cache-integration.test.ts` - Full workflow testing
  - `localStorage-test.test.ts` - localStorage-specific tests
  - `debug-cache-core.test.ts` - Debug utilities tests
  - `import-test.test.ts` - Import and module tests
  - `unified-chord-sheet-cache.test.ts` - Unified cache tests

### Storage System (`/archive/storage/`)
localStorage-based storage utilities:

#### Chord Sheet Storage
- `chord-sheet-storage/` - Complete chord sheet storage implementation
  - `index.ts` - Main exports
  - `addChordSheet.ts` - Add chord sheet to localStorage
  - `chordSheetToSong.ts` - Convert chord sheet to song format
  - `deleteChordSheet.ts` - Delete chord sheet operations
  - `deleteChordSheetByPath.ts` - Delete by path operations
  - `getChordSheets.ts` - Retrieve chord sheets from localStorage
  - `getMyChordSheetsAsSongs.ts` - Get chord sheets as song objects
  - `handleDeleteChordSheetFromUI.ts` - UI deletion handlers
  - `handleSaveNewChordSheetFromUI.ts` - UI save handlers
  - `handleUpdateChordSheetFromUI.ts` - UI update handlers
  - `updateChordSheet.ts` - Update chord sheet operations

#### Session Storage
- `session-storage-utils.ts` - Session storage utilities for temporary data
- `local-chord-sheet-finder.ts` - Local chord sheet finder using localStorage

#### Empty Directories
- `testing/` - Empty directory for storage testing utilities
- `utils/` - Empty directory for storage utilities

### Tests (`/archive/tests/`)
Test files related to cache and storage:

- `chordsheet-interface-integration.test.ts` - Integration tests for chord sheet interface
- `session-storage-utils.test.ts` - Session storage utility tests
- `local-chord-sheet-finder.test.ts` - Local chord sheet finder tests
- `my-songs-navigation-integration.test.ts` - My songs navigation tests
- `shared/` - Shared test utilities
  - `test-setup.ts` - localStorage mocking and test setup utilities

### Documentation (`/archive/cache-architecture.md`)
- Complete cache architecture documentation
- System design and implementation details
- Configuration and usage examples

## Files Using Cache/Storage (Need Updates)

### Components
- `src/components/SongViewer.tsx` - Uses `unifiedChordSheetCache`
- `src/components/TabContainer.tsx` - Uses chord-sheet-storage utilities

### Pages
- `src/pages/ChordViewer.tsx` - Uses `unifiedChordSheetCache` and chord-sheet-storage

### Hooks
- `src/hooks/useSearchResults.ts` - Uses search cache
- `src/hooks/use-sample-songs.ts` - Uses unified chord sheet cache
- `src/hooks/useAddToMyChordSheets.ts` - Uses chord-sheet-storage

### Utilities
- `src/utils/artist-utils.ts` - Uses artist cache

### Test Setup
- `src/test-setup.ts` - localStorage mocking for tests

## Storage Keys Used
The following localStorage keys were used by the archived system:

- `chordium-search-cache` - Search results cache
- `chordium-artist-songs-cache` - Artist songs cache  
- `chordium-chord-sheet-cache` - Chord sheet cache
- `my-chord-sheets` - User's saved chord sheets

## Migration Notes

### What Needs to be Recreated with IndexedDB:
1. **Search Cache** - 30-day TTL, 100 items, 4MB limit, LRU eviction
2. **Artist Cache** - 4-hour TTL, 20 items, LRU eviction
3. **Chord Sheet Cache** - 72-hour TTL, 50 items, LRU eviction
4. **My Chord Sheets Storage** - User's saved chord sheets
5. **Session Storage Utilities** - Temporary data storage

### Key Features to Maintain:
- LRU eviction policies
- TTL-based expiration
- Size limits and monitoring
- Debug utilities
- Type safety
- Error handling
- Test coverage

### Performance Improvements Expected:
- Larger storage capacity (no 5-10MB localStorage limit)
- Better transaction support
- Asynchronous operations
- Structured queries
- Better concurrent access

## Files to Remove After Migration
Once IndexedDB migration is complete and tested, these files should be removed:

```bash
# Remove cache directory
rm -rf src/cache/

# Remove storage utilities
rm -rf src/utils/chord-sheet-storage/
rm src/utils/session-storage-utils.ts
rm src/utils/local-chord-sheet-finder.ts

# Remove storage directory
rm -rf src/storage/

# Remove cache-related tests
rm src/utils/session-storage-utils.test.ts
rm src/__tests__/chordsheet-interface-integration.test.ts
rm src/utils/__tests__/local-chord-sheet-finder.test.ts
rm src/hooks/__tests__/my-songs-navigation-integration.test.ts
rm -rf src/__tests__/shared/

# Remove documentation
rm docs/cache-architecture.md
```

## Branch Information
- **Migration Branch**: `chore/migrate-cache-to-indexeddb`
- **Original Implementation**: localStorage-based caching and storage
- **Target Implementation**: IndexedDB-based caching and storage
- **Architecture**: Maintain same public APIs, replace storage backend

## Restoration Instructions
If you need to restore any of these files during development:

```bash
# Restore entire cache system
cp -r archive/cache/ src/

# Restore storage utilities
cp -r archive/storage/chord-sheet-storage/ src/utils/
cp archive/storage/session-storage-utils.ts src/utils/
cp archive/storage/local-chord-sheet-finder.ts src/utils/

# Restore tests
cp archive/tests/session-storage-utils.test.ts src/utils/
cp archive/tests/chordsheet-interface-integration.test.ts src/__tests__/
cp archive/tests/local-chord-sheet-finder.test.ts src/utils/__tests__/
cp archive/tests/my-songs-navigation-integration.test.ts src/hooks/__tests__/
cp -r archive/tests/shared/ src/__tests__/

# Restore documentation
cp archive/cache-architecture.md docs/
```
