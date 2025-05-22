/**
 * Normalizes path for comparison by removing hyphens
 * @param {string} path - The path to normalize
 * @returns {string} - The normalized path
 */
export function normalizePathForComparison(path) {
  if (!path) return '';
  return path
    .toLowerCase()
    .replace(/-/g, ''); // Remove hyphens entirely to match raw input
}
