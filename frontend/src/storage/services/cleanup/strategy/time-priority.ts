/**
 * Time-based priority calculation
 */

import type { PriorityResult } from './priority-result.types';

/**
 * Calculates priority bonus based on recency
 * 
 * @param daysSinceAccess - Days since the item was last accessed
 * @returns Priority result with bonus points and reason
 */
export function calculateTimePriority(daysSinceAccess: number): PriorityResult {
  if (daysSinceAccess < 3) {
    return { priority: 10, reason: 'recent' };
  }
  
  return { priority: 0, reason: '' };
}
