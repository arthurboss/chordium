# Music Module

This module contains all music-related functionality for the Chordium application.

## Structure

```
src/music/
├── constants/          # Musical constants and data
│   └── musicalKeys.ts  # All possible key names generated from @tonaljs
├── types/              # TypeScript type definitions
│   └── index.ts        # Musical types and interfaces
├── utils/              # Utility functions
│   ├── transposition.ts # Key transposition utilities
│   └── keyAnalysis.ts   # Key analysis utilities
├── hooks/              # React hooks for music functionality
│   └── index.ts        # Hook exports
├── components/         # Music-related React components
│   └── index.ts        # Component exports
└── index.ts            # Main module exports
```

## Usage

```typescript
// Import from the music module
import { ALL_POSSIBLE_KEY_NAMES, isMajorKey, getNextKey } from '@music';

// Use musical constants
const allKeys = ALL_POSSIBLE_KEY_NAMES; // ['C', 'Db', 'D', ..., 'Bm']

// Use utility functions
const isMajor = isMajorKey('C'); // true
const nextKey = getNextKey('C'); // 'Db'
```

## Key Features

- **Musical Keys**: All 24 possible key names (12 major + 12 minor) generated from @tonaljs
- **Transposition**: Utilities for key transposition and navigation
- **Key Analysis**: Functions to analyze key properties (major/minor, root note, etc.)
- **Type Safety**: Full TypeScript support with proper type definitions

## Generated Data

The `musicalKeys.ts` file contains key names generated from @tonaljs:

- **Major Keys**: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B
- **Minor Keys**: Cm, Dbm, Dm, Ebm, Em, Fm, F#m, Gm, Abm, Am, Bbm, Bm

This ensures consistency with the @tonaljs library used throughout the application.
