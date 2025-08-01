/**
 * Text normalization for chord sheet paths
 */

/**
 * Normalizes a string by removing diacritics, converting to lowercase,
 * removing certain special characters, and replacing spaces with dashes
 */
export function normalizeNamePart(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[()[\]{}]/g, '') // Remove parentheses and brackets
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-{2,}/g, '-') // Replace multiple dashes with single dash
    .replace(/(^-+)|(-+$)/g, ''); // Remove leading/trailing dashes
}
