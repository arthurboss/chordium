/**
 * Access frequency priority calculation
 */

/**
 * Calculates priority bonus based on access frequency
 */
export function calculateAccessFrequencyPriority(accessCount: number): {
  priority: number;
  reason: string;
} {
  if (accessCount > 10) {
    return { priority: 40, reason: 'frequently used' };
  } else if (accessCount > 5) {
    return { priority: 25, reason: 'regularly used' };
  } else if (accessCount > 2) {
    return { priority: 15, reason: 'multiple uses' };
  }
  
  return { priority: 0, reason: '' };
}
