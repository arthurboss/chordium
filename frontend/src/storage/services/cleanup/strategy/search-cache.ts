/**
 * Search cache cleanup priority calculation
 */

import type { SearchCacheEntry } from '../../../types';
import { isExpired } from '../../../core/ttl/validation';
import type { CleanupStrategy } from './types';

/**
 * Calculates cleanup priority for search cache entries
 */
export function calculateSearchCacheCleanupPriority(item: SearchCacheEntry): CleanupStrategy {
  let priority = 0;
  const reasons: string[] = [];

  // Recently cached items
  const daysSinceCached = (Date.now() - item.timestamp) / (1000 * 60 * 60 * 24);
  if (daysSinceCached < 1) {
    priority += 30;
    reasons.push('cached today');
  } else if (daysSinceCached < 7) {
    priority += 15;
    reasons.push('cached this week');
  }

  // Check if expired
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
