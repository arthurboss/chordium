/**
 * TTL validation utilities
 */

/**
 * Checks if a timestamp has expired
 * 
 * @param expiresAt - Timestamp when the item expires
 * @returns true if the item has expired, false otherwise
 */
export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
