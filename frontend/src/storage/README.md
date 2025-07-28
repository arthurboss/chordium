# Storage System

IndexedDB-based storage for Chordium PWA.

## Why IndexedDB?

- **PWA Ready**: Works offline, unlike localStorage
- **Large Storage**: No 5-10MB localStorage limits
- **Structured**: Proper database with indexes and queries
- **Performance**: Async operations don't block the UI

## Database: `Chordium`

Simple structure with four stores:

- `userPreferences` - Theme, settings
- `searchCache` - Search results with TTL
- `artistCache` - Artist song lists
- `chordSheets` - Individual chord data

## Usage

```typescript
import { storage } from '@/storage';

// User preferences
await storage.setTheme('dark');
const theme = await storage.getTheme();

// Search cache
await storage.cacheSearch(query, results);
const cached = await storage.getSearch(query);
```

## Status

🚧 **In Development** - Replacing localStorage cache system
