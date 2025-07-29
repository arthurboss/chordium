# Storage System

IndexedDB-based storage for Chordium PWA.

## Why IndexedDB?

- **PWA Ready**: Works offline, essential for chord sheet access
- **Large Storage**: 150MB+ capacity vs localStorage's 5-10MB limits
- **Structured**: Proper database with indexes and efficient queries
- **Performance**: Async operations with background cleanup
- **Smart Management**: Intelligent TTL and priority-based cleanup

## Database: `Chordium` (Version 1)

**Object Stores:**

- `chordSheets` - Individual chord sheet storage with metadata
- `searchCache` - Search results with 30-day TTL

**Storage Limits (IndexedDB Optimized):**

- Search Cache: 1000 items, 50MB
- Chord Sheets: 500 items, 100MB
- Total Target: 150MB with 80% cleanup threshold

## Architecture

### Core Infrastructure ✅

```text
core/
├── config/        # Database configuration
├── ttl/          # TTL policies and utilities
└── schema.ts     # Aggregated schema exports
```

### Smart Cleanup System ✅

```text
services/cleanup/
├── strategy/     # Priority calculation (protects saved items)
├── monitor/      # Storage usage monitoring
├── service/      # Size estimation and result handling
└── triggers/     # Automated cleanup triggers
```

### Type System ✅

```text
types/
├── chord-sheet.ts    # StoredChordSheet interface
├── search-cache.ts   # SearchCacheEntry interface  
└── schema.ts         # Database schema definition
```

### Utilities ✅

```text
utils/keys/
├── formats.ts        # Key format definitions
└── validation.ts     # Key validation functions
```

## Key Features

### **User Intent Protection**

- **CRITICAL RULE**: Saved chord sheets (`saved: true`) are NEVER automatically removed
- Users must manually delete saved items
- Smart cleanup respects user preferences

### **Priority-Based Cleanup with LRU**

```typescript
// High Priority (kept longer)
- Saved items (never removed)
- Recently accessed items (storage.lastAccessed field)
- Frequently used items (storage.accessCount field)

// Low Priority (removed first)  
- Old, rarely accessed cache (based on storage.lastAccessed, not storage.timestamp)
- Expired search results
```

**Key Improvement**: Uses `storage.lastAccessed` timestamp instead of `storage.timestamp` (creation time) for proper LRU eviction. This ensures recently used items are kept even if they were cached long ago.

### **Consistent Key Format**

```typescript
// All storage types use 'path' for consistency with domain objects
// Chord sheets: "artist-path/song-path" (from Song.path)
// Artist search: "artist-path" (from Artist.path)  
// Song search: "artist-path/song-path" (from Song.path)
// Note: Path is IndexedDB key only, not duplicated in stored value
```

### **Data Model**

- **Optimized Structure**: StoredChordSheet extends ChordSheet with organized storage metadata
- **Direct Access**: Content fields accessible directly (`record.songChords`, `record.title`)
- **Organized Metadata**: Storage fields grouped under `storage` namespace (`record.storage.saved`)
- **Domain Alignment**: Perfect alignment with @chordium/types ChordSheet interface
- **Efficient Indexing**: Indexes on `artist`, `title`, and `storage.*` fields
- **LRU Tracking**: `storage.lastAccessed` field enables proper cache eviction based on actual usage
- **No Redundancy**: Eliminated duplicate path storage (IndexedDB key provides this)

## Usage (When Complete)

```typescript
import { storage } from "@/storage";

// Direct content access (optimized structure)
const chords = record.songChords;        // ✅ Direct access
const title = record.title;             // ✅ Clean access  
const artist = record.artist;           // ✅ Simple access

// Organized storage metadata
const isSaved = record.storage.saved;           // ✅ Clear intent
const lastAccessed = record.storage.lastAccessed; // ✅ LRU tracking

// Smart cleanup (respects saved items)
const result = await cleanup.performCleanup();

// TTL utilities
const expired = isExpired(item.storage.expiresAt);
const expiresAt = calculateExpirationTime(TTL_CONFIG.CHORD_SHEET_UNSAVED);

// Key utilities
const isValid = validateKeyFormat(key, "chordSheet");
```

## Code Structure

- **Modular Design**: Each file handles a specific responsibility
- **Clean APIs**: Barrel exports provide simple import paths
- **Type Safety**: Full TypeScript coverage with domain type integration

## Status

✅ **Phase 1**: Setup & Discovery  
✅ **Phase 2**: Core Infrastructure (42 modular files)  
✅ **Phase 3**: Structure Optimization (flattened StoredChordSheet with organized metadata)
🚧 **Phase 4**: IndexedDB Manager (Next)

**Current**: Foundation complete with optimized data structure, ready for IndexedDB manager implementation.
