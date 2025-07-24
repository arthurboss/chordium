/**
 * Checks if the search text matches the target text using accent-insensitive comparison.
 * 
 * Both texts are normalized to remove accents before comparison, allowing
 * matches like "Jose" to find "José" and vice versa.
 * 
 * @param searchText - The search term to look for
 * @param targetText - The text to search within
 * @returns True if the search text is found within the target text (accent-insensitive)
 */
import { normalizeForAccentInsensitiveSearch } from './normalizeForAccentInsensitive';

export function isAccentInsensitiveMatch(searchText: string, targetText: string): boolean {
  const normalizedSearch = normalizeForAccentInsensitiveSearch(searchText);
  const normalizedTarget = normalizeForAccentInsensitiveSearch(targetText);
  
  return normalizedTarget.includes(normalizedSearch);
}
