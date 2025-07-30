/**
 * Periodic cleanup interval management
 */

import { MILLISECONDS_PER_DAY } from '../../../utils/time-constants';

/**
 * Sets up periodic cleanup interval
 */
export function setupPeriodicCleanup(
  callback: () => Promise<void>, 
  intervalMs: number = MILLISECONDS_PER_DAY
): NodeJS.Timeout {
  return setInterval(callback, intervalMs);
}

/**
 * Stops periodic cleanup interval
 */
export function stopPeriodicCleanup(interval: NodeJS.Timeout): void {
  clearInterval(interval);
}
