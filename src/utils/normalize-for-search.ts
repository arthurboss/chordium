/**
 * Normalizes text for search by:
 * 1. Converting to lowercase
 * 2. Removing special characters (except digits and letters)
 * 3. Removing extra spaces
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
