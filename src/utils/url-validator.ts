/**
 * Validates URL format
 * Generic utility - can be reused anywhere URL validation is needed
 * Follows SRP: Single responsibility of URL validation
 */
export class URLValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'URLValidationError';
  }
}

/**
 * Validates if a string is a valid URL
 * @param url - The URL string to validate
 * @throws URLValidationError if URL is invalid
 */
export function validateURL(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new URLValidationError(
      "Invalid URL format. Please ensure the URL includes http:// or https://"
    );
  }
}
