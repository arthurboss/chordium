/**
 * Chord sheet cleanup priority calculation
 * CRITICAL: Saved items are NEVER automatically removed
 */

import type { StoredChordSheet } from '../../../types';
import type { CleanupStrategy } from './types';

/**
 * Calculates cleanup priority for a chord sheet
 * CRITICAL: Saved items are NEVER automatically removed (user does it manually)
 */
export function calculateChordSheetCleanupPriority(item: StoredChordSheet): CleanupStrategy {
  // ABSOLUTE RULE: Never remove saved items
  if (item.saved) {
    return {
      priority: 1000,
      reason: 'User saved - never auto-remove',
      canRemove: false
    };
  }

  // Delegate to unsaved item calculation
  return calculateUnsavedChordSheetPriority(item);
}

/**
 * Calculates priority for unsaved chord sheets only
 */
function calculateUnsavedChordSheetPriority(item: StoredChordSheet): CleanupStrategy {
  let priority = 0;
  const reasons: string[] = [];

  // Recently accessed items get higher priority
  const daysSinceAccess = (Date.now() - item.timestamp) / (1000 * 60 * 60 * 24);
  if (daysSinceAccess < 1) {
    priority += 50;
    reasons.push('accessed today');
  } else if (daysSinceAccess < 7) {
    priority += 25;
    reasons.push('accessed this week');
  }

  return {
    priority,
    reason: reasons.join(', ') || 'low usage',
    canRemove: true
  };
}
