/**
 * Empty cleanup result factory
 */

import type { CleanupResult } from './types';

/**
 * Creates empty cleanup result
 */
export function createEmptyResult(): CleanupResult {
  return {
    chordSheetsRemoved: 0,
    searchCacheRemoved: 0,
    totalItemsRemoved: 0,
    estimatedSpaceFreed: 0,
    strategy: 'No cleanup needed',
    protectedItems: 0
  };
}
