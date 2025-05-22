/**
 * Normalizes text for search by removing special characters, converting to lowercase, etc.
 * @param {string} text - The text to normalize
 * @returns {string} - The normalized text
 */
export function normalizeForSearch(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\d\s]/g, '') // Remove special chars but keep digits and letters
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .trim();
}
