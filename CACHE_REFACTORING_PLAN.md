# Cache System Refactoring Plan

## Current Problems

The cache system is scattered across multiple folders, which makes it confusing and hard to maintain. There are multiple ways to do the same thing, inconsistent patterns, and legacy code using outdated repository methods.

## Current Scattered Structure

### **1. `/src/cache/` - Main Cache Implementations**
```
cache/
├── index.ts                    # Main exports
├── config.ts                   # Cache configuration
├── types.ts                    # Cache type definitions
├── implementations/
│   ├── search-cache/           # Search results caching
│   │   ├── index.ts
│   │   ├── search-cache-class.ts
│   │   ├── operations/         # Cache operations
│   │   ├── queries/            # Cache queries
│   │   └── utilities/          # Search cache utilities
│   └── unified-chord-sheet/    # Chord sheet caching
│       ├── index.ts
│       ├── unified-chord-sheet-cache-class.ts
│       ├── cache-chord-sheet.ts
│       ├── get-cached-chord-sheet.ts
│       ├── management/         # Cache management
│       ├── queries/            # Cache queries
│       └── utilities/          # Chord sheet cache utilities
├── types/
│   └── unified-chord-sheet-cache.ts
└── utils/
    └── cache-debug.ts
```

### **2. `/src/storage/` - Storage Layer (Repository Pattern)**
```
storage/
├── repositories/
│   ├── chord-sheet-repository.ts      # Main chord sheet storage
│   ├── search-cache-repository.ts     # Search cache storage
│   └── base-cache-repository.ts       # Base repository interface
├── coordinators/
│   └── indexed-db-cache-coordinator.ts # Cache coordination
├── connection/
│   └── chord-sheet-db-connection.ts   # IndexedDB connection
├── schema/
│   └── chord-sheet-db-schema.ts       # Database schema
├── types/
│   └── chord-sheet-record.ts          # Storage record types
├── utils/
│   └── chord-sheet-retention-policy.ts # Retention policies
└── testing/
    ├── testable-chord-sheet-repository.ts
    └── testable-indexeddb-migration-service.ts
```

### **3. `/src/utils/chord-sheet-storage/` - Legacy Utils (PROBLEMATIC)**
```
utils/chord-sheet-storage/
├── addChordSheet.ts            # Legacy save functions
├── updateChordSheet.ts         # Legacy update functions  
├── deleteChordSheet.ts         # Legacy delete functions
├── getChordSheets.ts           # Legacy get functions
├── handleSaveNewChordSheetFromUI.ts
└── chordSheetToSong.ts         # Legacy conversions
```

### **4. `/src/hooks/useChordSheet/` - Data Fetching Layer**
```
hooks/useChordSheet/
├── coordinators/
│   └── get-chord-sheet-data-indexeddb.ts  # Cache coordination
└── useChordSheet.ts            # Main hook that uses cache
```

## Problems with Current Structure

1. **Scattered Responsibilities**: Cache logic is spread across `/cache/`, `/storage/`, `/utils/`, and `/hooks/`
2. **Duplicate Functionality**: Multiple ways to do the same thing (cache vs utils vs hooks)
3. **Inconsistent Patterns**: Some use artist/title, others use paths
4. **Legacy Code**: `/utils/chord-sheet-storage/` has outdated functions using removed repository methods
5. **Confusing Imports**: Hard to know which module to import from

## Proposed Unified Structure

```
src/cache/
├── core/
│   ├── types.ts                # All cache type definitions
│   ├── config.ts               # Cache configuration
│   └── interfaces.ts           # Repository interfaces
├── storage/
│   ├── indexeddb/
│   │   ├── connection.ts       # IndexedDB connection
│   │   ├── schema.ts           # Database schema
│   │   └── repositories/
│   │       ├── chord-sheet-repository.ts
│   │       └── search-cache-repository.ts
│   └── policies/
│       └── retention-policy.ts
├── implementations/
│   ├── chord-sheet-cache/
│   │   ├── index.ts            # Main exports
│   │   ├── cache-class.ts      # Main cache class
│   │   ├── operations/         # Save, delete, update operations
│   │   └── queries/            # Get, search operations
│   └── search-cache/
│       ├── index.ts
│       ├── cache-class.ts
│       └── operations/
├── coordinators/
│   └── cache-coordinator.ts    # Unified cache coordination
├── utils/
│   ├── debug.ts                # Cache debugging
│   └── testing/                # Test utilities
└── index.ts                    # Main cache exports
```

## Benefits of Unified Structure

1. **Single Source of Truth**: All cache logic in `/src/cache/`
2. **Clear Separation**: Storage layer, implementation layer, coordination layer
3. **Consistent Patterns**: All operations use path-based methods
4. **Easy to Find**: One place to look for cache functionality
5. **Better Testing**: Centralized test utilities

## Migration Strategy

### **Phase 1: Move Storage Files**
- Move all storage-related files from `/src/storage/` to `/src/cache/storage/`
- Update imports in affected files
- Keep functionality exactly the same, just change locations

### **Phase 2: Remove Legacy Utils**
- Delete `/src/utils/chord-sheet-storage/` entirely
- Update any remaining imports to use proper cache implementations
- Remove all legacy conversion functions

### **Phase 3: Consolidate Cache Implementations**
- Consolidate cache implementations under `/src/cache/implementations/`
- Ensure all operations use path-based methods only
- Remove duplicate functionality

### **Phase 4: Update All Imports**
- Update all imports throughout the codebase to use the new unified structure
- Ensure consistent import patterns
- Update documentation

### **Phase 5: Clean Up and Test**
- Remove any remaining duplicate functionality
- Ensure all operations are path-based only
- Update tests to match new structure
- Verify everything works correctly

## Key Principles for Refactoring

1. **Path-Based Operations Only**: All cache operations must use `Song.path` from API response as the key
2. **No Artist/Title Methods**: Remove all methods that take artist and title parameters
3. **Single Source of Truth**: ChordSheet objects from backend are the authoritative data source
4. **No Conversions**: Eliminate unnecessary ChordSheet ↔ Song conversions
5. **Clean Separation**: Clear boundaries between storage, cache, and UI layers

## Current Status

- ✅ Removed artist/title-based repository methods
- ✅ Removed legacy path generation functions  
- ✅ Updated ChordViewer to use ChordSheetViewer
- ✅ Removed path property from ChordSheet interface
- ✅ Deleted unused service functions
- 🔄 **Next**: Begin Phase 1 of migration strategy

## Notes

- The current repository already uses path as IndexedDB key (correct design)
- Schema and core IndexedDB structure should NOT be changed
- Only method signatures and file organization need to be updated
- Preserve all the TTL, retention, and dual behavior logic
