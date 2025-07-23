/**
 * Normalizes text for search with Unicode awareness.
 * 
 * Performs the following transformations:
 * 1. Converts to lowercase
 * 2. Normalizes Unicode characters for consistency
 * 3. Converts separators (slashes, dashes) to spaces
 * 4. Removes special characters while preserving Unicode letters and numbers
 * 5. Normalizes whitespace
 * 
 * Preserves accented characters like "Hänni", "José", "Café", etc.
 * 
 * @param text - The text to normalize
 * @returns The normalized text suitable for search matching
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFC') // Normalize Unicode characters for consistency
    .replace(/[/\\-]+/g, ' ') // Replace slashes and dashes with spaces
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Keep Unicode letters, numbers, and whitespace
    .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
    .trim();
}
