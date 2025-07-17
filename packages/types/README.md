# @chordium/types

TypeScript types and interfaces shared between the Chordium frontend and backend.

## Installation

```bash
npm install @chordium/types
```

## Usage

```typescript
import { Song, Artist, ChordSheet } from '@chordium/types';

const song: Song = {
  // ... your song data
};
```

## Development

```bash
# Build the package
npm run build

# Watch for changes during development
npm run dev

# Clean build artifacts
npm run clean
```

## Types Included

- **Domain Types**: Core business entities like `Song`, `Artist`, `ChordSheet`
- **API Types**: Request/response types for API endpoints
- **UI Types**: Types for UI components and state
- **Internal Types**: Internal data structures and utilities
- **Metadata Types**: Guitar tuning, notes, and other metadata
- **Error Types**: Error handling and validation types
