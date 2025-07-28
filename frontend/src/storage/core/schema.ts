/**
 * IndexedDB Schema aggregator for Chordium PWA Storage System
 * Re-exports all schema-related definitions from modular files
 * Built from scratch - no backward compatibility with previous implementation
 */

// Re-export all types from the modular type system
export type {
  StoredChordSheet,
  SearchCacheEntry,
  ChordiumDBSchema,
  ChordSheetStore,
  SearchCacheStore,
} from '../types';

// Re-export configuration constants
export {
  DB_NAME,
  DB_VERSION,
  STORES,
  INDEXES,
} from './config';

// Re-export TTL configuration and utilities
export {
  TTL_CONFIG,
  LIMITS,
  calculateExpirationTime,
  isExpired,
} from './ttl';

// Re-export key utilities
export {
  KEY_FORMATS,
  validateKeyFormat,
  extractArtistPath,
  extractSongPath,
} from '../utils/keys';
