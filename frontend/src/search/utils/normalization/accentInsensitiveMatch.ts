/**
 * Checks if the search text matches the target text using accent-insensitive comparison
 * Single responsibility: Accent-insensitive text matching
 */
import { normalizeForAccentInsensitiveSearch } from './normalizeForAccentInsensitive';

export function isAccentInsensitiveMatch(searchText: string, targetText: string): boolean {
  const normalizedSearch = normalizeForAccentInsensitiveSearch(searchText);
  const normalizedTarget = normalizeForAccentInsensitiveSearch(targetText);
  
  return normalizedTarget.includes(normalizedSearch);
}
