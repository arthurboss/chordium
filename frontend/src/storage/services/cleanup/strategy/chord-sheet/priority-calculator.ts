/**
 * Priority calculator for chord sheet cleanup
 * 
 * Orchestrates the selection of appropriate cleanup strategy
 * based on whether the chord sheet is saved or cached.
 */

import type { StoredChordSheet } from '../../../../types';
import type { CleanupStrategy } from '../types';
import { calculateSavedChordSheetStrategy, isSavedChordSheet } from './saved-strategy';
import { calculateCachedChordSheetStrategy } from './cached-strategy';

/**
 * Calculates cleanup priority for a chord sheet
 * 
 * Routes to appropriate strategy based on whether item is saved or cached.
 * CRITICAL: Saved items are NEVER automatically removed (user does it manually)
 * 
 * @param item The stored chord sheet to evaluate
 * @returns Cleanup strategy with priority and removal permission
 */
export function calculateChordSheetCleanupPriority(item: StoredChordSheet): CleanupStrategy {
  // Saved items use simple strategy: never remove
  if (isSavedChordSheet(item)) {
    return calculateSavedChordSheetStrategy(item);
  }

  // Cached items use complex LRU strategy
  return calculateCachedChordSheetStrategy(item);
}
