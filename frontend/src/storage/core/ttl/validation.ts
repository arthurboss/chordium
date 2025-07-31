/**
 * Checks if an item has expired based on its expiration timestamp
 * @param expiresAt - Expiration timestamp or null for permanent items
 * @returns true if expired, false if still valid
 */
export function isExpired(expiresAt: number | null): boolean {
  return expiresAt !== null && Date.now() > expiresAt;
}
