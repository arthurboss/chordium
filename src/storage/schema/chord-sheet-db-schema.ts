/**
 * IndexedDB database schema for all cache storage
 * Follows SRP: Single responsibility for database schema definition
 */
export interface ChordSheetDBSchema {
  readonly name: string;
  readonly version: number;
  readonly stores: {
    readonly chordSheets: {
      readonly name: string;
      readonly keyPath: string;
      readonly indexes: readonly {
        readonly name: string;
        readonly keyPath: string;
        readonly unique: boolean;
      }[];
    };
    readonly searchCache: {
      readonly name: string;
      readonly keyPath: string;
      readonly indexes: readonly {
        readonly name: string;
        readonly keyPath: string;
        readonly unique: boolean;
      }[];
    };
    readonly artistCache: {
      readonly name: string;
      readonly keyPath: string;
      readonly indexes: readonly {
        readonly name: string;
        readonly keyPath: string;
        readonly unique: boolean;
      }[];
    };
  };
}

export const CHORD_SHEET_DB_SCHEMA: ChordSheetDBSchema = {
  name: 'ChordiumCaches',
  version: 2,
  stores: {
    chordSheets: {
      name: 'chordSheets',
      keyPath: 'id',
      indexes: [
        { name: 'artist', keyPath: 'artist', unique: false },
        { name: 'title', keyPath: 'title', unique: false },
        { name: 'saved', keyPath: 'metadata.saved', unique: false }
      ]
    },
    searchCache: {
      name: 'searchCache',
      keyPath: 'id',
      indexes: [
        { name: 'query', keyPath: 'query', unique: false },
        { name: 'expiresAt', keyPath: 'metadata.expiresAt', unique: false }
      ]
    },
    artistCache: {
      name: 'artistCache',
      keyPath: 'id',
      indexes: [
        { name: 'artistPath', keyPath: 'artistPath', unique: false },
        { name: 'expiresAt', keyPath: 'metadata.expiresAt', unique: false }
      ]
    }
  }
} as const;
