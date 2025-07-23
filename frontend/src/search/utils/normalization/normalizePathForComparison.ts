/**
 * Normalizes path format for comparison with search terms:
 * 1. Converting to lowercase
 * 2. Removing hyphens (replacing with empty string)
 * 
 * This allows users to search for "acdc" and match "ac-dc" in the path
 * 
 * @param path - The path to normalize
 * @returns Normalized path suitable for path comparison
 */
export function normalizePathForComparison(path: string): string {
  if (!path) return '';
  return path
    .toLowerCase()
    .replace(/-/g, ''); // Remove hyphens entirely to match raw input
}
