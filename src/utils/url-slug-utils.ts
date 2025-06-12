/**
 * Generic URL slug utilities
 * Can be reused anywhere URL slug manipulation is needed
 * Follows SRP: Single responsibility of URL slug operations
 */

/**
 * Converts a string to URL-friendly slug format
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function toSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
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
