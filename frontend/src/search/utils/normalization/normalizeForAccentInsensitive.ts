/**
 * Normalizes text for accent-insensitive search.
 * 
 * Performs the following transformations:
 * 1. Converts to lowercase
 * 2. Removes diacritics/accents (á -> a, é -> e, etc.)
 * 3. Normalizes Unicode characters
 * 4. Removes special characters
 * 5. Normalizes whitespace
 * 
 * This allows users to search for "cafe" and match "Café" or 
 * search for "do lado de ca" and match "Do Lado de Cá".
 * 
 * @param text - The text to normalize
 * @returns The normalized text with accents removed
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
