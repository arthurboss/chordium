/**
 * Normalizes text for search by:
 * 1. Converting to lowercase
 * 2. Removing special characters (except digits and letters)
 * 3. Removing extra spaces
 * 
 * ⚠️ DEPRECATED: This function uses legacy regex that strips accented characters.
 * Use `normalizeForSearchUnicode` for Unicode-aware normalization.
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for case-insensitive, special-character-insensitive search
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\d\s]/g, '') // Remove special chars but keep digits and letters
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .trim();
}

/**
 * Normalizes text for search with Unicode awareness by:
 * 1. Converting to lowercase
 * 2. Removing special characters but preserving Unicode letters and numbers
 * 3. Normalizing Unicode characters for consistency
 * 4. Handling separators (slashes, dashes) by converting to spaces
 * 5. Removing extra spaces
 * 
 * This function uses Unicode property escapes to preserve accented characters
 * like "Hänni", "José", "Café", etc. while still removing punctuation.
 * 
 * @param text - The text to normalize
 * @returns Normalized text suitable for Unicode-aware search
 */
export function normalizeForSearchUnicode(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFC') // Normalize Unicode characters for consistency
    .replace(/[/\\-]+/g, ' ') // Replace slashes and dashes with spaces
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Keep Unicode letters, numbers, and whitespace
    .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
    .trim();
}
