/**
 * IndexedDB schema for all cache storage
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
  };
}

export const CHORD_SHEET_DB_SCHEMA: ChordSheetDBSchema = {
  name: 'Chordium',
  version: 9, // Test number saved field (0/1)
  stores: {
    chordSheets: {
      name: 'chordSheets',
      keyPath: 'id',
      indexes: [
        { name: 'artist', keyPath: 'artist', unique: false },
        { name: 'title', keyPath: 'title', unique: false },
        { name: 'saved', keyPath: 'saved', unique: false }, // Number values: 0 | 1 for IndexedDB compatibility
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        // Future-ready indexes for S3 integration
        { name: 'dataSource', keyPath: 'dataSource', unique: false },
        { name: 'version', keyPath: 'version', unique: false }
      ]
    },
    searchCache: {
      name: 'searchCache',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        // Future-ready indexes for different search types
        { name: 'searchType', keyPath: 'searchType', unique: false },
        { name: 'dataSource', keyPath: 'dataSource', unique: false }
      ]
    }
  }
} as const;
