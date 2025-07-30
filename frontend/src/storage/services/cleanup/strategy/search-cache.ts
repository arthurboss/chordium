/**
 * Search cache cleanup priority calculation
 */

import type { SearchCacheEntry } from '../../../types';
import { isExpired } from '../../../core/ttl/validation';
import type { CleanupStrategy } from './types';
import { daysSince } from '../../../utils/time-constants';

/**
 * Calculates cleanup priority for search cache entries
 * 
 * Prioritizes recent cache entries and deprioritizes expired ones.
 * All search cache entries can be safely removed when storage is full.
 * 
 * @param item - The search cache entry to evaluate
 * @returns Cleanup strategy with priority and removal permission
 */
export function calculateSearchCacheCleanupPriority(item: SearchCacheEntry): CleanupStrategy {
  let priority = 0;
  const reasons: string[] = [];

  // Recently cached items
  const daysSinceCached = daysSince(item.timestamp);
  if (daysSinceCached < 1) {
    priority += 30;
    reasons.push('cached today');
  } else if (daysSinceCached < 7) {
    priority += 15;
    reasons.push('cached this week');
  }

  // Expired items have lower priority for retention
  const expired = isExpired(item.metadata.expiresAt);
  if (expired) {
    priority -= 20;
    reasons.push('expired');
  }

  return {
    priority,
    reason: reasons.join(', ') || 'old search cache',
    canRemove: true
  };
}
