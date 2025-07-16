/**
 * Generic URL slug utilities
 * Can be reused anywhere URL slug manipulation is needed
 * Follows SRP: Single responsibility of URL slug operations
 */

/**
 * Converts a string to URL-friendly slug format compatible with CifraClub URLs
 * Removes diacritics (accents) to match CifraClub's URL normalization (ê → e, ç → c, etc.)
 * @param text - Text to convert to slug
 * @returns URL-friendly slug with diacritics removed to match CifraClub format
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose Unicode characters (ê → e + combining accent)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters, numbers, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
}

/**
 * Converts a URL slug back to readable text
 * @param slug - URL slug to convert
 * @returns Readable text with spaces
 */
export function fromSlug(slug: string): string {
  return decodeURIComponent(slug.replace(/-/g, " "));
}

/**
 * Checks if two slugs represent the same content
 * @param slug1 - First slug to compare
 * @param slug2 - Second slug to compare
 * @returns True if slugs represent the same content
 */
export function slugsMatch(slug1: string, slug2: string): boolean {
  return toSlug(fromSlug(slug1)) === toSlug(fromSlug(slug2));
}
