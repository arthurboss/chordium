/**
 * Time-based priority calculation
 */

/**
 * Calculates priority bonus based on recency
 */
export function calculateTimePriority(daysSinceAccess: number): {
  priority: number;
  reason: string;
} {
  if (daysSinceAccess < 3) {
    return { priority: 10, reason: 'recent' };
  }
  
  return { priority: 0, reason: '' };
}
