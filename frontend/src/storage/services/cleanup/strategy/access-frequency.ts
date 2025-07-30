/**
 * Access frequency priority calculation
 */

import type { PriorityResult } from './priority-result.types';

/**
 * Calculates priority bonus based on access frequency
 * 
 * @param accessCount - Number of times the item has been accessed
 * @returns Priority result with bonus points and reason
 */
export function calculateAccessFrequencyPriority(accessCount: number): PriorityResult {
  if (accessCount > 10) {
    return { priority: 40, reason: 'frequently used' };
  } else if (accessCount > 5) {
    return { priority: 25, reason: 'regularly used' };
  } else if (accessCount > 2) {
    return { priority: 15, reason: 'multiple uses' };
  }
  
  return { priority: 0, reason: '' };
}
