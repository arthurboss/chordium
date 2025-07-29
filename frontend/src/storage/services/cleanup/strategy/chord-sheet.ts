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
  // Never remove saved items
  if (item.storage.saved) {
    return {
      canRemove: false,
      priority: 0,
      reason: 'item is saved by user'
    };
  }

  // For cached items, use LRU logic with lastAccessed
  return calculateUnsavedChordSheetPriority(item);
}

/**
 * Calculates priority for unsaved chord sheets only
 * Uses lastAccessed for proper LRU (Least Recently Used) logic
 */
function calculateUnsavedChordSheetPriority(item: StoredChordSheet): CleanupStrategy {
  let priority = 0;
  const reasons: string[] = [];

  // LRU Logic: Recently accessed items get higher priority (kept longer)
  const daysSinceLastAccess = (Date.now() - item.storage.lastAccessed) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastAccess < 1) {
    priority += 50;
    reasons.push('accessed today');
  } else if (daysSinceLastAccess < 3) {
    priority += 30;
    reasons.push('accessed recently');
  } else if (daysSinceLastAccess < 7) {
    priority += 15;
    reasons.push('accessed this week');
  } else if (daysSinceLastAccess < 30) {
    priority += 5;
    reasons.push('accessed this month');
  }
  // Items not accessed in 30+ days get priority 0 (first to be removed)

  // Access frequency bonus: Frequently used items get higher priority
  if (item.storage.accessCount > 10) {
    priority += 20;
    reasons.push('frequently used');
  } else if (item.storage.accessCount > 5) {
    priority += 10;
    reasons.push('regularly used');
  } else if (item.storage.accessCount > 2) {
    priority += 5;
    reasons.push('multiple uses');
  }

  return {
    priority,
    reason: reasons.join(', ') || 'rarely used',
    canRemove: true
  };
}
