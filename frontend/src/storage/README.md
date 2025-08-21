# Storage System

Offline-first storage for Chordium that keeps your chord sheets available without internet.

## What It Does

The storage system ensures users can access their chord sheets anytime, even offline. It intelligently manages limited browser storage to keep the most important content available.

## Key Benefits

- **Always Available**: Chord sheets work offline once loaded
- **Large Capacity**: Stores 500+ chord sheets (150MB total)
- **Smart Management**: Automatically removes old, unused content to make room for new saves
- **Respects User Intent**: Never removes chord sheets you explicitly saved
- **Development Samples**: Includes sample chord sheets for development mode
- **React 19 Optimized**: Uses modern React features for optimal performance

## How It Works

### User Protection

- **Saved chord sheets are permanent** - only you can delete them
- Recently viewed songs stay available longer
- Frequently accessed content gets priority
- Old search results and rarely used cache gets cleaned up first

### Storage Limits

- **Chord Sheets**: Up to 500 saved sheets
- **Search Cache**: Up to 1,000 recent searches (30-day expiration)
- **Total Capacity**: 150MB (equivalent to thousands of chord sheets)

When storage gets full (80% capacity), the system automatically removes:

1. Expired search results first
2. Old, rarely accessed cached content
3. Never touches your saved chord sheets

## For Users

### What Gets Saved Forever

- Any chord sheet you mark as "saved"
- These persist across browser sessions and devices (if using the same browser)

### What Gets Cleaned Up

- Search results older than 30 days
- Chord sheets you viewed but didn't save (after being unused for weeks)
- Temporary cache files

### Storage Indicators

Users can see:

- How many chord sheets they have saved
- Storage usage levels
- When cleanup happens (transparent, non-disruptive)

## Technical Implementation

### Technology Choice

Uses **IndexedDB** (browser's built-in database) because:

- Works offline with large storage capacity (150MB vs 5MB for basic storage)
- Structured database with efficient searching
- Handles thousands of chord sheets without performance issues

### Core Components

- **Chord Sheet Storage**: Saves user's chord sheets with metadata (title, artist, when last accessed)
- **Search Cache**: Temporarily stores search results to avoid re-fetching
- **Smart Cleanup**: Automatically manages storage space without user intervention
- **Offline Support**: Everything works without internet connection
- **Sample Loading Service**: Provides development chord sheets for testing and demos
- **Modular Hooks**: React hooks with single responsibility and optimistic updates

### Developer Integration

```typescript
// Use the complete chord sheets hook (includes sample loading)
import { useChordSheets } from "@/storage/hooks";

function MyComponent() {
  const { myChordSheets, isLoading, error, refreshMyChordSheets } = useChordSheets();
  
  if (isLoading) return <div>Loading chord sheets...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>My Chord Sheets ({myChordSheets.length})</h3>
      {myChordSheets.map(sheet => (
        <div key={sheet.path}>{sheet.title} - {sheet.artist}</div>
      ))}
    </div>
  );
}

// Direct storage operations
import { ChordSheetStore } from "@/storage/stores/chord-sheets/store";

const store = new ChordSheetStore();

// Save a chord sheet permanently
await store.store(chordSheet, true, songPath);

// Get all user's saved sheets
const savedSheets = await store.getAllSaved();

// Sample loading service (development mode only)
import { SampleChordSheetsService, indexedDBStorage } from "@/storage/services/sample-chord-sheets";

const sampleService = new SampleChordSheetsService(indexedDBStorage);
await sampleService.loadSampleChordSheets();
```
