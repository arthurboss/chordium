/**
 * Normalizes text for accent-insensitive search by:
 * 1. Converting to lowercase
 * 2. Removing diacritics/accents (á -> a, é -> e, etc.)
 * 3. Normalizing Unicode characters
 * 4. Removing special characters
 * 5. Normalizing whitespace
 * 
 * This allows users to search for "cafe" and match "Café" or 
 * search for "do lado de ca" and match "Do Lado de Cá".
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for accent-insensitive search
 */
export function normalizeForAccentInsensitiveSearch(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose characters with diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[/\\-]+/g, ' ') // Replace slashes and dashes with spaces
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Keep Unicode letters, numbers, and whitespace
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Checks if the search text matches the target text using accent-insensitive comparison
 * @param searchText - The text being searched for
 * @param targetText - The text to search in
 * @returns True if searchText is found in targetText (accent-insensitive)
 */
export function isAccentInsensitiveMatch(searchText: string, targetText: string): boolean {
  const normalizedSearch = normalizeForAccentInsensitiveSearch(searchText);
  const normalizedTarget = normalizeForAccentInsensitiveSearch(targetText);
  
  return normalizedTarget.includes(normalizedSearch);
}
