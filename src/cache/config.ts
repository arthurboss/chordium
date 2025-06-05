/**
 * Cache system configuration constants
 */

import { CacheConfig } from './types';

// Environment-based logging utility
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
export const shouldLog = !isTestEnvironment && !isVitestRunning;

// Debug logging functions
export const debugLog = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.log(message, ...args);
  }
};

export const debugError = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.error(message, ...args);
  }
};

// Cache configurations
export const SEARCH_CACHE_CONFIG: CacheConfig = {
  key: 'chordium-search-cache',
  maxItems: 100,
  expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxSizeBytes: 4 * 1024 * 1024 // 4MB
};

export const ARTIST_CACHE_CONFIG: CacheConfig = {
  key: 'chordium-artist-songs-cache',
  maxItems: 20,
  expirationTime: 4 * 60 * 60 * 1000 // 4 hours
};

export const CHORD_SHEET_CACHE_CONFIG: CacheConfig = {
  key: 'chordium-chord-sheet-cache',
  maxItems: 50,
  expirationTime: 72 * 60 * 60 * 1000 // 72 hours
};

// Background refresh threshold (24 hours)
export const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000;
