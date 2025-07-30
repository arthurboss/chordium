/**
 * Cleanup strategy for saved chord sheets
 * 
 * Handles the simple rule: saved items are NEVER automatically removed.
 * User must manually remove saved items.
 */

import type { StoredChordSheet } from '../../../../types';
import type { CleanupStrategy } from '../types';

/**
 * Strategy for saved chord sheets
 * 
 * CRITICAL: Saved items are NEVER automatically removed (user does it manually)
 * 
 * @param item The stored chord sheet to evaluate
 * @returns Strategy indicating item cannot be removed
 */
export function calculateSavedChordSheetStrategy(item: StoredChordSheet): CleanupStrategy {
  if (!item.storage.saved) {
    throw new Error('calculateSavedChordSheetStrategy called on non-saved item');
  }

  return {
    canRemove: false,
    priority: 0,
    reason: 'item is saved by user'
  };
}

/**
 * Checks if a chord sheet is saved
 * 
 * @param item The stored chord sheet to check
 * @returns True if the item is saved by user
 */
export function isSavedChordSheet(item: StoredChordSheet): boolean {
  return item.storage.saved;
}
