/**
 * Periodic cleanup interval management
 */

/**
 * Sets up periodic cleanup interval
 */
export function setupPeriodicCleanup(
  callback: () => Promise<void>, 
  intervalMs: number = 24 * 60 * 60 * 1000
): NodeJS.Timeout {
  return setInterval(callback, intervalMs);
}

/**
 * Stops periodic cleanup interval
 */
export function stopPeriodicCleanup(interval: NodeJS.Timeout): void {
  clearInterval(interval);
}
