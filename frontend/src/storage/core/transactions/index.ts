/**
 * Generic transaction utilities for IndexedDB operations
 * 
 * Shared utilities that can be used by any store (chord-sheets, search-cache, etc.)
 * to avoid code duplication while maintaining type safety and error handling.
 */

export { default as executeReadTransaction } from './read-transaction';
export { default as executeWriteTransaction } from './write-transaction';
